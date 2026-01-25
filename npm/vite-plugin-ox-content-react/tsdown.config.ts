import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  hash: false,
  external: ["vite", "react", "react-dom", "vite-plugin-ox-content"],
})
