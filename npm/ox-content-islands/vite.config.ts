import { defineConfig } from "vite-plus";
import { defineConfig as definePackConfig } from "vite-plus/pack";

export default defineConfig({
  fmt: {
    ignorePatterns: ["dist/**"],
  },
  pack: definePackConfig({
    entry: ["src/index.ts", "src/runtime.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    hash: false,
  }),
});
