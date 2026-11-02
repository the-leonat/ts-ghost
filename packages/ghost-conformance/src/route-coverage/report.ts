// Prints the latest client's coverage of the pinned manifest and adds it to the job summary.

import { appendFile, readFile } from "node:fs/promises";

import { recordSourceClientCalls } from "../client-routes/record-from-source.ts";
import { MANIFEST_FILE, parseManifest } from "../manifest/manifest.ts";
import { measureCoverage, renderCoverage } from "./coverage.ts";

const manifest = parseManifest(await readFile(MANIFEST_FILE, "utf8"));
const coverage = renderCoverage([measureCoverage(manifest, await recordSourceClientCalls("latest"))]);
const markdown = `## Client coverage of the Admin API\n\n${coverage}`;
console.log(markdown);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
