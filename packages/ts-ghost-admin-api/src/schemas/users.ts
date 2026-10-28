import { z } from "zod";

import { adminAuthorsSchema } from "./authors";

// Ghost serializes /users/ and a post's authors the same way.
export const adminUsersSchema = adminAuthorsSchema;

export type User = z.infer<typeof adminUsersSchema>;
