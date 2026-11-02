// Unit tests only, no Docker; the live suite and the manifest test have their own configs.

/// <reference types="vitest/config" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.live.test.ts", "src/**/*.docker.test.ts"],
    // Only type tests: runtime files are type-checked by `tsc` and would otherwise be reported twice.
    typecheck: {
      include: ["src/**/*.test-d.ts"],
      tsconfig: "./tsconfig.json",
    },
  },
});
