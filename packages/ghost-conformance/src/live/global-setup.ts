// Vitest global setup of the live suite: starts, bootstraps and SQL-seeds one Ghost of the leg.

import type { TestProject } from "vitest/node";

import type { LiveGhost } from "../ghost/admin-client.ts";
import { bootstrapGhost } from "../ghost/bootstrap.ts";
import { claimRunGhosts, startGhost } from "../ghost/docker-compose.ts";
import { ghostLeg } from "../ghost/versions.ts";
import { applySqlSeeds } from "../seeds/sql-seeds.ts";

declare module "vitest" {
  export interface ProvidedContext {
    ghost: LiveGhost;
  }
}

/**
 * One fresh, bootstrapped Ghost per live run, of the GHOST_LEG's version; torn down afterwards, also when the run
 * is interrupted. Ghosts that killed runs or timed-out hooks left behind are removed before and after.
 */
export default async function setup(project: TestProject) {
  const leg = ghostLeg();
  const teardown = await claimRunGhosts();
  try {
    const instance = await startGhost({ name: "ts-ghost-live", version: leg.ghost });
    const ghost: LiveGhost = {
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
