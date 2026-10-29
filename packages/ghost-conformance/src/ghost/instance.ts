import { execFile, execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const COMPOSE_FILE = fileURLToPath(new URL("../../docker/compose.yaml", import.meta.url));

export type GhostInstance = {
  url: string;
  project: string;
  version: string;
  stop(): Promise<void>;
  /** Runs `docker compose <args>` against this instance's project. */
  compose(...args: string[]): Promise<{ stdout: string; stderr: string }>;
};

/**
 * Starts a fresh official Ghost + MySQL 8 under its own compose project and waits until Ghost answers.
 * Every call gets a new project, so the live suite and a throwaway manifest instance never share state.
 */
export async function startGhost(opts: { name: string; version: string }): Promise<GhostInstance> {
  const version = opts.version;
  const project = projectName(opts.name);
  const port = await freePort();
  const env = { ...process.env, GHOST_VERSION: version, GHOST_PORT: String(port) };
  const compose = (...args: string[]) =>
    run("docker", ["compose", "-p", project, "-f", COMPOSE_FILE, ...args], {
      env,
      maxBuffer: 64 * 1024 * 1024,
    });

  const stop = async () => {
    await compose("down", ...DOWN_ARGS);
  };
  try {
    await compose("up", "--detach", "--wait", "--wait-timeout", "300");
  } catch (error) {
    const logs = await compose("logs", "--no-color", "--tail", "80").catch(() => ({ stdout: "" }));
    await stop().catch(() => undefined);
    throw new Error(`Ghost ${version} did not become healthy (project ${project}):\n${logs.stdout}`, {
      cause: error,
    });
  }
  return { url: `http://localhost:${port}`, project, version, stop, compose };
}

const DOWN_ARGS = ["--volumes", "--remove-orphans", "--timeout", "5"];
// Names carry the owning run's process, so a later run can tell a leaked project from a running one.
const PROJECT_NAME = /^ts-ghost-[a-z0-9-]+-p(\d+)-[0-9a-f]{8}$/;
/** Set by the live run's global setup, so Ghosts its test workers start belong to the run, not the worker. */
export const RUN_PID_ENV = "TS_GHOST_RUN_PID";

/** A compose project name for `name` owned by process `pid` (the live run, else this process). */
export function projectName(name: string, pid = Number(process.env[RUN_PID_ENV]) || process.pid): string {
  return `${name}-p${pid}-${randomBytes(4).toString("hex")}`;
}

const ownerOf = (name: string) => {
  const pid = PROJECT_NAME.exec(name)?.[1];
  return pid === undefined ? undefined : Number(pid);
};

/** The projects among `names` that startGhost created for a process that is gone. */
export function leakedProjects(names: string[], isAlive: (pid: number) => boolean): string[] {
  return names.filter((name) => {
    const pid = ownerOf(name);
    return pid !== undefined && !isAlive(pid);
  });
}

/** The projects among `names` that startGhost created for process `pid`. */
export function ownedProjects(names: string[], pid: number): string[] {
  return names.filter((name) => ownerOf(name) === pid);
}

/** Removes every Ghost a killed or timed-out run left behind; returns their project names. */
export async function removeLeakedGhosts(): Promise<string[]> {
  const { stdout } = await run("docker", ["compose", "ls", "--all", "--format", "json"]);
  const leaked = leakedProjects(projectNames(stdout), processAlive);
  for (const project of leaked) await run("docker", ["compose", "-p", project, "down", ...DOWN_ARGS]);
  return leaked;
}

/** Removes every Ghost process `pid` owns, synchronously, for an `exit` handler where nothing async runs. */
export function removeOwnedGhostsSync(pid: number) {
  const stdout = execFileSync("docker", ["compose", "ls", "--all", "--format", "json"], {
    encoding: "utf8",
  });
  for (const project of ownedProjects(projectNames(stdout), pid))
    execFileSync("docker", ["compose", "-p", project, "down", ...DOWN_ARGS], { stdio: "ignore" });
}

const projectNames = (lsJson: string) =>
  (JSON.parse(lsJson || "[]") as { Name: string }[]).map((p) => p.Name);

function processAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM: the process exists but belongs to someone else.
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => (typeof address === "object" && address ? resolve(address.port) : reject()));
    });
  });
}
