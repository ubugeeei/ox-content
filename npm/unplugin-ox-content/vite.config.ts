import { defineConfig } from "vite-plus";
import { defineConfig as definePackConfig } from "vite-plus/pack";

export default defineConfig({
  pack: definePackConfig({
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
    external: ["vite", "webpack", "rollup", "esbuild", "@ox-content/napi", "unplugin"],
  }),
});
