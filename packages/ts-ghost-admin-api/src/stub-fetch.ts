import { onTestFinished, vi } from "vitest";

/**
 * Replaces global fetch inside a test: request n gets a fresh `answers[n]()`, or the last answer once they run
 * out when `repeat` is set. Any other request fails the test, even if the client turns it into an error result.
 */
export function stubFetch(answers: (() => Response)[], { repeat = false } = {}) {
  const unexpected: string[] = [];
  let calls = 0;
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    const answer = answers[calls++] ?? (repeat ? answers.at(-1) : undefined);
    if (answer) return answer();
    unexpected.push(String(input));
    throw new Error(`Unexpected fetch of ${String(input)}`);
  });
  vi.stubGlobal("fetch", fetch);
  onTestFinished(() => {
    vi.unstubAllGlobals();
    if (unexpected.length) throw new Error(`Unexpected fetch of ${unexpected.join(", ")}`);
  });
  return fetch;
}

/** A JSON response of `body`, built anew for each request. */
export const json =
  (body: unknown, init?: ResponseInit): (() => Response) =>
  () =>
    new Response(JSON.stringify(body), init);
