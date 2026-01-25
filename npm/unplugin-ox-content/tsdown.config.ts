import { defineConfig } from "tsdown"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/vite.ts",
    "src/webpack.ts",
    "src/rollup.ts",
    "src/esbuild.ts",
    "src/rspack.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  hash: false,
  external: [
    "vite",
    "webpack",
    "rollup",
    "esbuild",
    "@ox-content/napi",
    "unplugin",
  ],
})
