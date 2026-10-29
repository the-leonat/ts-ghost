import { describe, expect, test } from "vitest";

import { leakedProjects, ownedProjects, projectName } from "./instance.ts";

describe("leaked Ghost projects", () => {
  const alive = (pid: number) => pid === 100;

  test("a project whose owning process is gone is leaked; a live owner's is not", () => {
    const live = projectName("ts-ghost-live", 100);
    const leaked = projectName("ts-ghost-manifest-test", 200);
    expect(leakedProjects([live, leaked], alive)).toEqual([leaked]);
  });

  test("a run owns the projects named for its process, its test workers' included", () => {
    const names = [projectName("ts-ghost-live", 100), projectName("ts-ghost-other", 200)];
    expect(ownedProjects(names, 100)).toEqual([names[0]]);
  });

  test("projects this code didn't name, other suites' included, are left alone", () => {
    expect(leakedProjects(["ts-ghost-live-1a2b3c4d", "other-p200-1a2b3c4d", "ghost"], alive)).toEqual([]);
  });
});
