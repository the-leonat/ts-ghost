// Drift: how a fresh recording differs from the committed artefacts.
//
// Generic over whatever the recorder writes into a Ghost-minor-keyed directory:
// every file is compared, JSON structurally. A fixture (a request-to-response
// transcript) is labelled by its route; any other file, such as the route spec,
// by its path.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

function listFiles(root, dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(root, full);
    return [relative(root, full).split(sep).join("/")];
  });
}

function read(root, file) {
  const text = readFileSync(join(root, file), "utf8");
  if (!file.endsWith(".json")) return { text };
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text };
  }
}

function routeOf(json) {
  const request = json && typeof json === "object" ? json.request : undefined;
  if (!request || typeof request.method !== "string" || typeof request.path !== "string") {
    return undefined;
  }
  const search = new URLSearchParams(Object.entries(request.query ?? {})).toString();
  return `${request.method} ${request.path}${search ? `?${search}` : ""}`;
}

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function fieldPath(parent, key) {
  if (typeof key === "number") return `${parent}[${key}]`;
  const segment = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
  return parent === ""
    ? segment
    : /^[A-Za-z_$]/.test(segment)
      ? `${parent}.${segment}`
      : `${parent}[${segment}]`;
}

/** Field-level differences between two JSON values, as `{ field, change, before, after }`. */
export function diffJson(before, after, at = "") {
  if (Array.isArray(before) && Array.isArray(after)) {
    const changes = [];
    for (let i = 0; i < Math.max(before.length, after.length); i++) {
      if (i >= after.length) changes.push({ field: fieldPath(at, i), change: "removed", before: before[i] });
      else if (i >= before.length)
        changes.push({ field: fieldPath(at, i), change: "added", after: after[i] });
      else changes.push(...diffJson(before[i], after[i], fieldPath(at, i)));
    }
    return changes;
  }
  if (isObject(before) && isObject(after)) {
    const changes = [];
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
      const field = fieldPath(at, key);
      if (!(key in after)) changes.push({ field, change: "removed", before: before[key] });
      else if (!(key in before)) changes.push({ field, change: "added", after: after[key] });
      else changes.push(...diffJson(before[key], after[key], field));
    }
    return changes;
  }
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  return [{ field: at === "" ? "(whole file)" : at, change: "changed", before, after }];
}

/**
 * Compares the committed artefacts with a fresh recording. Returns one entry per
 * file that differs: `{ file, label, status: "changed" | "added" | "removed", changes }`.
 * "added" is a file only the recording has; "removed" one only the commit has.
 */
export function diffArtefacts(committedDir, recordedDir) {
  const committedFiles = new Set(listFiles(committedDir));
  const recordedFiles = new Set(listFiles(recordedDir));
  const files = [...new Set([...committedFiles, ...recordedFiles])].sort();

  return files.flatMap((file) => {
    const before = committedFiles.has(file) ? read(committedDir, file) : undefined;
    const after = recordedFiles.has(file) ? read(recordedDir, file) : undefined;
    const label = routeOf((after ?? before).json) ?? file;
    if (!before) return [{ file, label, status: "added", changes: [] }];
    if (!after) return [{ file, label, status: "removed", changes: [] }];
    if (before.text === after.text) return [];
    const changes =
      before.json !== undefined && after.json !== undefined
        ? diffJson(before.json, after.json)
        : [{ field: "(whole file)", change: "changed" }];
    if (changes.length === 0) return [];
    return [{ file, label, status: "changed", changes }];
  });
}

const show = (value) => {
  const text = JSON.stringify(value);
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
};

function describeChange({ field, change, before, after }) {
  if (change === "added") return `- \`${field}\` added: \`${show(after)}\``;
  if (change === "removed") return `- \`${field}\` removed (was \`${show(before)}\`)`;
  if (before === undefined && after === undefined) return `- \`${field}\` differs`;
  return `- \`${field}\` changed: \`${show(before)}\` → \`${show(after)}\``;
}

/** Markdown report of a drift, for the job log, the run summary and the pull request body. */
export function renderReport(drift, { committedLabel = "committed", recordedLabel = "recorded" } = {}) {
  if (drift.length === 0) return `No drift: the recording matches the ${committedLabel} artefacts.\n`;
  const lines = [
    `Drift: ${drift.length} artefact(s) differ between ${committedLabel} and ${recordedLabel}.`,
    "",
  ];
  for (const entry of drift) {
    const where =
      entry.label === entry.file ? `\`${entry.file}\`` : `\`${entry.label}\` (\`${entry.file}\`)`;
    if (entry.status === "added") lines.push(`### ${where}: new, not committed`, "");
    else if (entry.status === "removed") lines.push(`### ${where}: committed, no longer recorded`, "");
    else lines.push(`### ${where}`, "", ...entry.changes.map(describeChange), "");
  }
  return `${lines.join("\n")}\n`;
}
