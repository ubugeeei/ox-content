import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { oxContentReact } from "vite-plugin-ox-content-react"

export default defineConfig({
  plugins: [
    react(),
    oxContentReact({
      srcDir: "docs",
      // Auto-discover components using glob pattern
      components: "./src/components/*.tsx",
    }),
  ],
})
