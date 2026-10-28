import type { TestProject } from "vitest/node";

import { bootstrapGhost, type GhostCredentials } from "../ghost/bootstrap.ts";
import { startGhost } from "../ghost/instance.ts";
import { ghostLeg, type GhostLeg } from "../ghost/pin.ts";
import { applySqlSeeds } from "../seeds/sql-seeds.ts";

declare module "vitest" {
  export interface ProvidedContext {
    ghost: GhostCredentials & { url: string; version: string; composeProject: string; leg: GhostLeg };
  }
}

/** One fresh, bootstrapped Ghost per live run, of the GHOST_LEG's version; torn down afterwards. */
export default async function setup(project: TestProject) {
  const leg = ghostLeg();
  const instance = await startGhost({ name: "ts-ghost-live", version: leg.ghost });
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
    await instance.stop();
    throw error;
  }
  return () => instance.stop();
}
