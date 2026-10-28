import { assert, vi } from "vitest";

export type RecordedResponse = {
  method: string;
  url: string;
  status: number;
  body: unknown;
};

export type ResponseRecorder = {
  all(): RecordedResponse[];
  /** Raw JSON body of the latest response whose URL path contains `pathPart`. */
  last(pathPart: string): unknown;
  restore(): void;
};

/** Spies on global fetch on the test side to keep each raw JSON body; the client gets no hooks. */
export function recordResponses(): ResponseRecorder {
  // spyOn would hand back an existing mock, and wrapping it would call itself.
  assert(!vi.isMockFunction(globalThis.fetch), "recordResponses() needs an unmocked fetch to wrap");
  const original = globalThis.fetch;
  const recorded: RecordedResponse[] = [];
  const spy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const fetched = await original(input, init);
    const url = input instanceof Request ? input.url : input.toString();
    const method = init?.method ?? (input instanceof Request ? input.method : "GET");
    // Read once and hand back a copy: under load, undici's clone() intermittently leaves the original unreadable.
    const text = await fetched.text();
    const empty = text === "" && [204, 205, 304].includes(fetched.status);
    const response = new Response(empty ? null : text, fetched);
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = undefined;
    }
    recorded.push({ method, url, status: response.status, body });
    return response;
  });
  return {
    all: () => [...recorded],
    last(pathPart) {
      const hit = recorded.findLast((r) => new URL(r.url).pathname.includes(pathPart));
      if (!hit) throw new Error(`No response recorded for a path containing "${pathPart}"`);
      return hit.body;
    },
    restore: () => spy.mockRestore(),
  };
}

/**
 * Paths, as `posts[].key`, of the keys a strict client's results failed on because its schema lacks them.
 * A successful result, or one failing for another reason, adds nothing.
 */
export function undeclaredKeys(...results: unknown[]): string[] {
  const found = new Set<string>();
  for (const result of results) {
    const errors = (result as { errors?: { kind?: string; path?: string }[] } | undefined)?.errors ?? [];
    for (const { kind, path } of errors)
      if (kind === "undeclared" && path) found.add(path.replace(/\[\d+\]/g, "[]"));
  }
  return [...found].sort();
}
