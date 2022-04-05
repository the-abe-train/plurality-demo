/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: { __MONGO_URL__: `'${process.env.MONGO_URL}'` },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
    include: ["./app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    watchIgnore: [".*\\/node_modules\\/.*", ".*\\/build\\/.*", ".*\\/api\\/.*"],
  },
});
