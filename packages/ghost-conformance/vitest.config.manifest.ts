// Manifest generation against a throwaway Ghost (Docker); apart from the live suite so the two never overlap.

/// <reference types="vitest/config" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["src/**/*.docker.test.ts"],
    globalSetup: ["./src/manifest/global-setup.ts"],
    hookTimeout: 600_000,
  },
});
