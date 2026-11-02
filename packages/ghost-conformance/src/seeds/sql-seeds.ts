// Applies every SQL seed to a bootstrapped Ghost.

import { adminApi, type LiveGhost } from "../ghost/admin-client.ts";
import { emailSeed } from "./emails.ts";
import { mysqlExec, type SqlSeed } from "./sql.ts";
import { stripeSeed } from "./stripe.ts";

/** Every SQL seed; each is independent of the others. Add new ones here. */
export const SQL_SEEDS: SqlSeed[] = [emailSeed, stripeSeed];

/** Applies every SQL seed to a bootstrapped Ghost, after the bootstrap. */
export async function applySqlSeeds(ghost: LiveGhost) {
  const admin = adminApi(ghost, ghost.leg);
  const exec = (statements: string[]) => mysqlExec(ghost.composeProject, statements);
  await Promise.all(
    SQL_SEEDS.map((seed) =>
      seed.run({ admin, exec, version: ghost.version }).catch((error: unknown) => {
        throw new Error(`SQL seed "${seed.name}" failed`, { cause: error });
      }),
    ),
  );
}
