import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "./src/vite/index.ts",
  },
  outDir: "vite",
  format: ["esm", "cjs"],
  sourcemap: true,
  dts: true,
});
