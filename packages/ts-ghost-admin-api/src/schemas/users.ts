import { z } from "zod";
import type { SchemaTarget } from "@ts-ghost/core-api";

import { adminAuthorsSchema, adminAuthorsSchemaFor } from "./authors";

// Ghost serializes /users/ and a post's authors the same way.
export const adminUsersSchemaFor = adminAuthorsSchemaFor;
export const adminUsersSchema = adminAuthorsSchema;

export type User<T extends SchemaTarget = "v6-compat"> = z.infer<ReturnType<typeof adminUsersSchemaFor<T>>>;
