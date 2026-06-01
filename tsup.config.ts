import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"], // dist/index.js (CJS) + dist/index.mjs (ESM)
  dts: true, // dist/index.d.ts + dist/index.d.mts
  sourcemap: true,
  clean: true,
  target: "node18",
  splitting: false,
  treeshake: true,
});
