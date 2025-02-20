import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  sourcemap: true,
  clean: true,
  format: ["esm"], // Ensure you're targeting CommonJS
  platform: "node",
  target: "node18",
  bundle: true,
  splitting: true, // Add this for better code splitting
  dts: true, // Generate declaration files
  external: [],
});
