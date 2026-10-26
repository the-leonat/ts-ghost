#!/usr/bin/env node
// Drift check CLI: diffs a fresh recording against the committed artefacts.
//
//   node scripts/drift/check.mjs --committed <dir> --recorded <dir> [--report <file>]
//
// Prints a Markdown report naming each differing route (or file) and field, and
// writes it to --report when given. Exits 0 on no drift, 1 on drift, 2 on misuse.
import { statSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

import { diffArtefacts, renderReport } from "./drift.mjs";

let values;
try {
  ({ values } = parseArgs({
    options: {
      committed: { type: "string" },
      recorded: { type: "string" },
      report: { type: "string" },
    },
  }));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}
if (!values.committed || !values.recorded) {
  console.error("usage: check.mjs --committed <dir> --recorded <dir> [--report <file>]");
  process.exit(2);
}
for (const name of ["committed", "recorded"]) {
  if (!statSync(values[name], { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`--${name} ${values[name]} is not a directory`);
    process.exit(2);
  }
}

const drift = diffArtefacts(values.committed, values.recorded);
const report = renderReport(drift);
process.stdout.write(report);
if (values.report) writeFileSync(values.report, report);
process.exit(drift.length === 0 ? 0 : 1);
