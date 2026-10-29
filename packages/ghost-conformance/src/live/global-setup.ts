import type { TestProject } from "vitest/node";

import { bootstrapGhost, type GhostCredentials } from "../ghost/bootstrap.ts";
import { removeLeakedGhosts, removeOwnedGhostsSync, RUN_PID_ENV, startGhost } from "../ghost/instance.ts";
import { ghostLeg, type GhostLeg } from "../ghost/pin.ts";
import { applySqlSeeds } from "../seeds/sql-seeds.ts";

declare module "vitest" {
  export interface ProvidedContext {
    ghost: GhostCredentials & { url: string; version: string; composeProject: string; leg: GhostLeg };
  }
}

/**
 * One fresh, bootstrapped Ghost per live run, of the GHOST_LEG's version; torn down afterwards, also when the run
 * is interrupted. Ghosts that killed runs or timed-out hooks left behind are removed before and after.
 */
export default async function setup(project: TestProject) {
  const leg = ghostLeg();
  await removeLeakedGhosts();
  process.env[RUN_PID_ENV] = String(process.pid);
  // Vitest exits on SIGINT/SIGTERM without teardown or stopping its workers; `exit` handlers still run.
  const stopOnExit = () => removeOwnedGhostsSync(process.pid);
  process.once("exit", stopOnExit);
  const instance = await startGhost({ name: "ts-ghost-live", version: leg.ghost });
  const teardown = async () => {
    process.off("exit", stopOnExit);
    // Also a Ghost a timed-out hook started after giving up on it.
    removeOwnedGhostsSync(process.pid);
    await removeLeakedGhosts();
  };
  try {
    const ghost = {
      ...(await bootstrapGhost(instance.url)),
      url: instance.url,
      version: instance.version,
      composeProject: instance.project,
      leg,
    };
    await applySqlSeeds(ghost);
    project.provide("ghost", ghost);
  } catch (error) {
    await teardown();
    throw error;
  }
  return teardown;
}
