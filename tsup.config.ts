import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
  },
  outDir: "dist",
  format: ["esm", "cjs"],
  sourcemap: true,
  dts: true,
});
