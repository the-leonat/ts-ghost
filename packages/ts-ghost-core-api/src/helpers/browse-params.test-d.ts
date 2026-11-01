import { describe, expectTypeOf, test } from "vitest";

import type { BrowseFilter } from "./browse-params";

type Shape = { id: string; email: string; name: string; status: string; published_at: string; tags: string };
// Whether `browse({ filter: S })` type-checks: the filter type must keep S as is.
type Accepts<S extends string> = [S] extends [BrowseFilter<S, Shape>] ? true : false;

describe("BrowseFilter", () => {
  test("accepts single clauses: unquoted, quoted, operator, set, negated set and sub-field", () => {
    expectTypeOf<Accepts<"status:draft">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"name:'Jane Doe'">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"email:'a+b@x.com'">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"published_at:>'2020-01-01'">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"email:[a@x.com,b@x.com]">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"email:['a@x.com','b@x.com']">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"id:-[1,2]">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"tags.slug:news">>().toEqualTypeOf<true>();
  });

  test("accepts a quoted value after an unquoted clause", () => {
    expectTypeOf<Accepts<"status:draft+name:'x'">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"email:[a@x.com,b@x.com]+name:'x'">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"email:['a@x.com','b@x.com']+name:'Query 1 c'">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"id:-[1,2],name:'x'">>().toEqualTypeOf<true>();
  });

  test("accepts clauses after a quoted value, including one holding a separator", () => {
    expectTypeOf<Accepts<"name:'x'+status:draft">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"name:'x',email:'y'">>().toEqualTypeOf<true>();
    expectTypeOf<Accepts<"email:'a+b@x.com',status:draft">>().toEqualTypeOf<true>();
  });

  test("rejects an unknown field anywhere in the filter", () => {
    expectTypeOf<Accepts<"nope:x">>().toEqualTypeOf<false>();
    expectTypeOf<Accepts<"nope:'x'">>().toEqualTypeOf<false>();
    expectTypeOf<Accepts<"status:draft+nope:'x'">>().toEqualTypeOf<false>();
    expectTypeOf<Accepts<"email:[a,b]+nope:'x'">>().toEqualTypeOf<false>();
    expectTypeOf<Accepts<"name:'x'+nope:y">>().toEqualTypeOf<false>();
    expectTypeOf<Accepts<"nope.slug:x">>().toEqualTypeOf<false>();
  });

  test("rejects a clause without a field", () => {
    expectTypeOf<Accepts<"draft">>().toEqualTypeOf<false>();
  });
});
