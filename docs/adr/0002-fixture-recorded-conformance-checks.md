# 2. Check the admin client against fixtures recorded in-process from a containerised Ghost on MySQL

- Status: accepted
- Date: 2026-10-26
- Context: spec the-leonat/ts-ghost#1 ("Solution", "Implementation Decisions", "Testing Decisions"), ticket #2

## Context

Ghost versions the product, not the response shape, and adds fields in minor releases. The admin client's schemas are written by hand, and its existing tests feed hand-written bodies through a fetch mock that queues responses by call order and never looks at the request. Those tests cannot tell when the client has fallen behind Ghost, and they cannot catch a client that builds a path Ghost does not have.

## Decision

### Two checks over one committed artefact

A **fixture** is a request-to-response transcript recorded from a real Ghost: method, path and query (parameters sorted) on the request side, plus the body sent when two calls of the walk share all three (two variants of one `add`); status, a selected header subset (`content-version`, `location`) and body on the response side. Fixtures are committed in the admin package under a Ghost-minor-keyed path, `packages/ts-ghost-admin-api/fixtures/ghost-<minor>/`, one file per call. Supporting a second Ghost version later is a sibling directory.

- **The client check** (`packages/ts-ghost-admin-api/src/client-check/`) stubs global fetch with the fixtures and drives the real client through its public API. Requests are matched on method, path and sorted query, and fixtures that share those are told apart by their recorded body (two that share them without a body are refused at load); matching **fails closed**: an unmatched request rejects, and the test fails naming the request it received and the nearest recorded key. It needs no Ghost, no database and no container, and runs in the ordinary `pnpm test`.
- **The drift check** (`.github/workflows/drift.yml`, ticket #3) is a scheduled job of its own. It re-runs the recorder against the newest Ghost release into a scratch directory and diffs every file there against the committed directory of the pinned release (`scripts/drift/`), naming each differing route and field, and fails on any difference. The pinned release is the tag in `packages/ts-ghost-admin-api/fixtures/ghost-ref`; client checks load that release's fixtures, so ordinary pull requests are asserted against the pin only. When the newest release is not the pin, the job first opens a pull request that moves the pin and replaces the fixture directory with the re-recording, and dispatches the test workflow on it, because pull requests opened with the built-in token trigger no workflows. It needs no secrets.

Volatile values are stored as markers, `{{<matcher>}}`, named after Ghost's own e2e matchers (`anyUuid`, `anyISODateTime`, …) and detected with those matchers' patterns, so a re-recording differs only when a shape changed. Only genuinely non-deterministic values are markered; most of a body stays literal. Object ids need a rule of their own, because Ghost's seed data generates most of its ids at load (`ObjectId()` in `data-generator.js`) and every created record gets a fresh one: an id stays literal only when it appears literally in Ghost's seed source. Any other id becomes `{{anyObjectId}}`, or `{{anyObjectId:<name>}}` when the recorder follows it from a response into later request paths (`posts.created`, `labels.seeded`), so the client check can resolve one name to one id in both. Settings Ghost regenerates on every boot (`public_hash`) are markered with the pattern Ghost's own settings test uses, and so is the key of a member's signed unsubscribe URL (`{{unsubscribeKey}}`, an HMAC under a secret generated per boot). A timestamp Ghost answers from a domain object rather than the database keeps its milliseconds and is still markered `{{anyISODateTime}}`. Object keys are written sorted, since Ghost does not emit relations in a fixed order. Two recordings of the same release are byte-identical. The per-worker port in URLs is rewritten to Ghost's canonical test port 2369, as Ghost's own snapshot setup does. The client check substitutes a fixed sample per marker.

### The recorder runs in-process, inside Ghost's own e2e-api suite

The recorder (`recorder/ts-ghost-recorder.test.js`) is a file in Ghost's `test/e2e-api/admin/`, run through Ghost's database test configuration (`vitest.config.db.ts`, project `e2e-api`). That configuration reserves a port block (its setup throws without one), builds one migrated template database per run and restores each worker from it. Hand-rolling a runner would mean re-deriving all of that every release. In-process is also the only way to use Ghost's seed catalogue directly and its interception-based Stripe mock, which must share the process. The recording runs with that mock on: Ghost's test settings say Stripe is connected, so creating a tier or an offer makes Ghost call Stripe, and the mock answers in-process with the network cut. Paid members, tier prices and subscriptions come from Ghost's `members` seed; the one Stripe-side state it lacks, a price with no nickname, is put into the mock and ingested through Ghost's own webhook handler.

The recorder talks to Ghost through Ghost's own test agent, never through this library, so the client cannot define its own expected behaviour. It authenticates as a custom integration created through the integrations endpoint after an owner login, like a real consumer.

The walk (`recorder/walk.js`) is planned from the route spec the same run extracts, not from a route list: every browse, read, add, edit and destroy route of the in-scope resources is recorded, routes the integration-token allowlist excludes are recorded as refusals, and an in-scope route the walk has no recipe for fails the recording. It reads the seeded state, then creates, edits, re-reads and deletes records of its own; it never writes to a seeded record.

### It runs containerised, against MySQL 8

- **Containers only.** The recorder image (`recorder/Dockerfile`) holds a shallow Ghost checkout at the pinned tag and its filtered install. Nothing from Ghost is installed or executed on the host: Ghost's install runs third-party lifecycle scripts, and a bind-mounted `node_modules` is slow on Docker Desktop. Only the fixture output directory is bind-mounted.
- **MySQL 8, not SQLite.** MySQL 8 is the only database Ghost supports in production. The engines differ observably through Ghost's ORM (tied sort order, date precision and format, filter case sensitivity, aggregate types), and the fixtures exist to record what a real Ghost returns. A mixed SQLite/MySQL setup would surface engine differences as false drift.
- **Ghost's own compose definition.** MySQL comes from Ghost's `compose.dev.yaml` plus its `e2e/compose.e2e.tmpfs.yaml` overlay, copied out of the same pinned checkout in the image, so the database always matches the release being recorded. The recorder container joins that compose network. Local runs and the drift job use the same image and the same composition.

Everything that needs a container lives in `recorder/`. `recorder/record.sh` builds the image, starts MySQL, records into an empty staging directory, and tears MySQL down. Only a successful recording replaces the output directory, and it replaces it whole, so a fixture the recorder no longer writes is deleted instead of lingering as false evidence. The staged files are handed to the host user before they are copied, because the container writes as root.

### The client check compares keys both ways

At runtime unknown keys are stripped. The client check (`keyMismatches` in `src/client-check/evidence.ts`) compares every successful fixture's records with the schema the client parses them with, at every depth: a key a fixture sends that the schema does not model fails, and so does a required key a fixture omits (skipped for a request that selects `fields`). The first keeps the client from silently dropping data Ghost added; the second catches a schema that demands what Ghost does not send. A key the check surfaces is modelled from the fixture evidence, as an optional or nullable field; there is no allowlist.

### Evidence gaps

Some modelled fields carry values the recorded fixtures cannot vouch for (Ghost's seed, its in-process Stripe mock, network off, privacy tinfoil on), so a passing client check says nothing about them; they are typed from Ghost's source. `evidence.test.ts` reports every modelled field no fixture fills. On members:

- `avatar_image`: always null (Gravatar off); production sends a URL.
- `geolocation`, `note`, `last_seen_at`: always null. `geolocation` is GeoJS's answer as a JSON string, kept opaque.
- `email_suppression.info`: always null; Ghost records a suppression only from Mailgun events, so no member is suppressed.
- `email_recipients[].failed_at`: always null; Ghost's `members:emails` seed leaves its failed recipients out.
- `metafields`: never sent; no seed gives a member any, and Ghost leaves the key out for a member with none, even when included. Typed `unknown`: an object keyed by field, whose values depend on the field type.
- `subscriptions[].cancellation_reason` (free text), `.offer` and `.next_payment.discount`: always null; `.offer_redemptions`: always empty.
- `subscriptions[].status`: always `active`; `default_payment_card_last4` is the seed's `4242` or the stand-in `****`; `price.id` is the seed's 64-hex form, not Stripe's `price_…`; `customer` values are seed or mock literals.

## Consequences

- Recording needs Docker and about 2.3 GB of image. A rebuild at an unchanged tag reuses the clone and install layers and takes seconds.
- Ghost's compose file fixes the container name (`ghost-dev-mysql`) and publishes host port 3306, so recording cannot run beside a Ghost dev database or a host MySQL on 3306.
- Every recording runs with all writable labs flags on, because Ghost's seeding always enables them.
- The image is architecture-specific; CI must build it on the runner.
- The existing call-order fetch-mock tests in core-api are left as they are. New client checks use the fixture server.
