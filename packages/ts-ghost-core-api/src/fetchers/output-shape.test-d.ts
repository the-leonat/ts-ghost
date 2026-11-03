import { describe, expectTypeOf, test } from "vitest";
import { z } from "zod";

import { HTTPClient } from "../helpers/http-client";
import { ReadFetcher } from "./read-fetcher";

const relation = z.object({ id: z.string() });
const schema = z.object({
  id: z.string(),
  authors: z.array(relation).optional(),
  tags: z.array(relation).optional(),
  primary_author: relation.optional(),
  primary_tag: relation.nullish(),
});
const include = z.object({ authors: z.literal(true).optional(), tags: z.literal(true).optional() });
const fetcher = new ReadFetcher(
  "posts",
  { schema, output: schema, include },
  { identity: { id: "1" } },
  new HTTPClient({ url: "https://ghost.org", key: "1", version: "v6.0", endpoint: "content" }),
);
type Data<F extends { fetch(): Promise<unknown> }> =
  Extract<Awaited<ReturnType<F["fetch"]>>, { success: true }> extends { data: infer D } ? D : never;

describe("primary keys follow their relation", () => {
  test("optional without the include", () => {
    expectTypeOf<Data<typeof fetcher>["primary_author"]>().toEqualTypeOf<{ id: string } | undefined>();
  });

  test("including authors requires primary_author, and leaves primary_tag optional", () => {
    const included = fetcher.include({ authors: true });
    expectTypeOf<Data<typeof included>["primary_author"]>().toEqualTypeOf<{ id: string }>();
    expectTypeOf<Data<typeof included>["primary_tag"]>().toEqualTypeOf<{ id: string } | null | undefined>();
  });

  test("including tags requires primary_tag, still nullable", () => {
    const included = fetcher.include({ tags: true });
    expectTypeOf<Data<typeof included>["primary_tag"]>().toEqualTypeOf<{ id: string } | null>();
  });
});
