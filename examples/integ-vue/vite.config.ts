import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { oxContentVue } from "@ox-content/vite-plugin-vue"

export default defineConfig({
  plugins: [
    vue(),
    oxContentVue({
      srcDir: "docs",
      // Auto-discover components using glob pattern
      components: "./src/components/*.vue",
    }),
  ],
})
