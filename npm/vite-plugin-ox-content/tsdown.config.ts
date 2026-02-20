import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "es2022",
  dts: true,
  clean: true,
  sourcemap: true,
  hash: false,
  external: [
    "vite",
    "@ox-content/napi",
    "playwright",
    "rolldown",
    // Vue SFC support
    "vue",
    "vue/server-renderer",
    "@vue/compiler-sfc",
    "@vizejs/vite-plugin",
    // Svelte SFC support
    "svelte",
    "svelte/compiler",
    "svelte/server",
    "svelte/internal",
    "svelte/internal/server",
    // React Server Component support
    "react",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "react-dom",
    "react-dom/server",
  ],
})
