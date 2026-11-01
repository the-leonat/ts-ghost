// Finds the newest Ghost release with an official image and plans whether the pin moves to it.

import { compareVersions } from "../ghost/versions.ts";

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;
type GitHubRelease = { tag_name: string; html_url: string; prerelease: boolean; draft: boolean };

export type GhostRelease = { version: string; url: string };
/** `digest` is the official image's, which the pin records next to the version. */
export type NewestGhost = { version: string; digest: string; releases: GhostRelease[] };
export type DriftPlan = { bump: boolean; from: string; to: string };

const RELEASES_URL = "https://api.github.com/repos/TryGhost/Ghost/releases?per_page=100";
const imageUrl = (version: string) =>
  `https://hub.docker.com/v2/repositories/library/ghost/tags/${version}/`;

/**
 * Newest stable Ghost release (or `target`) whose official Docker image exists, plus every release
 * after the pin up to it, oldest first, for the reviewer's release-note reading.
 */
export async function resolveNewestGhost(opts: {
  pin: string;
  fetch?: Fetch;
  target?: string;
  githubToken?: string;
}): Promise<NewestGhost> {
  const fetchFn: Fetch = opts.fetch ?? fetch;
  // A token lifts GitHub's shared 60-requests-per-hour limit on CI runners.
  const auth = opts.githubToken ? { authorization: `Bearer ${opts.githubToken}` } : undefined;
  const response = await fetchFn(RELEASES_URL, {
    headers: { accept: "application/vnd.github+json", ...auth },
  });
  if (!response.ok) throw new Error(`GitHub releases for TryGhost/Ghost answered ${response.status}`);
  const stable = ((await response.json()) as GitHubRelease[])
    .filter((r) => !r.draft && !r.prerelease && /^v\d+\.\d+\.\d+$/.test(r.tag_name))
    .map((r): GhostRelease => ({ version: r.tag_name.slice(1), url: r.html_url }))
    .sort((a, b) => compareVersions(b.version, a.version));

  /** The digest of the official image of `version`, or undefined when there is none. */
  const imageDigest = async (version: string) => {
    const response = await fetchFn(imageUrl(version));
    if (!response.ok) return undefined;
    const { digest } = (await response.json()) as { digest?: string };
    if (!digest?.startsWith("sha256:")) throw new Error(`Docker Hub gave no digest for ghost:${version}`);
    return digest;
  };

  let version = opts.target;
  let digest: string | undefined;
  if (version !== undefined) {
    // Comes from the manual dispatch input; it ends up in the pin file and step outputs.
    if (!/^\d+\.\d+\.\d+$/.test(version))
      throw new Error(`${JSON.stringify(version)} is not a Ghost version like 6.73.0`);
    digest = await imageDigest(version);
    if (!digest) throw new Error(`There is no official Docker image ghost:${version}`);
  } else {
    for (const candidate of stable) {
      digest = await imageDigest(candidate.version);
      if (digest) {
        version = candidate.version;
        break;
      }
    }
  }
  if (!version || !digest) throw new Error("No stable Ghost release has an official Docker image");
  const target = version;
  const releases = stable
    .filter((r) => compareVersions(r.version, opts.pin) > 0 && compareVersions(r.version, target) <= 0)
    .reverse();
  return { version: target, digest, releases };
}

/** Bump only when the newest release is ahead of the pin. */
export function planDrift(pin: string, newest: string): DriftPlan {
  return { bump: compareVersions(newest, pin) > 0, from: pin, to: newest };
}
