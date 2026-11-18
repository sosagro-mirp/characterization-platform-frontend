import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    // Keep process isolation: tests such as lib/dateOnly.test.ts change
    // process.env.TZ at runtime, which worker threads do not apply.
    pool: "forks",
    include: ["**/*.test.ts"],
  },
});
