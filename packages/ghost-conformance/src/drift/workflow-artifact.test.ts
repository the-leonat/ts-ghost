// Checks the drift workflow: the pr job downloads the drift state to where the drift job uploaded it.

import { readFileSync } from "node:fs";
import { dirname, join, posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const REPO = fileURLToPath(new URL("../../../..", import.meta.url));
const workflow = readFileSync(join(REPO, ".github/workflows/conformance-drift.yml"), "utf8");

/** The `path:` of the step using `action`, as a list of lines. */
function stepPaths(action: string): string[] {
  const step = workflow.slice(workflow.indexOf(action));
  const block = /\n\s+path: (\|\n((?:\s{12}\S.*\n)+)|(.*)\n)/.exec(step)!;
  return (block[2] ?? block[3]!)
    .split("\n")
    .map((line) => line.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

test("the pr job finds the drift state where the drift job left it", () => {
  const uploaded = stepPaths("actions/upload-artifact");
  // upload-artifact stores paths relative to their least common ancestor directory.
  let root = dirname(uploaded[0]!);
  while (!uploaded.every((p) => p.startsWith(`${root}/`))) root = posix.dirname(root);
  const downloadTo = stepPaths("actions/download-artifact")[0]!;
  const landed = uploaded.map((p) => posix.join(downloadTo, relative(root, p)));
  expect(landed).toEqual(uploaded);
  expect(landed).toContain("packages/ghost-conformance/.drift");
});
