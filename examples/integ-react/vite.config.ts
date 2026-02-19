import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { oxContentReact } from "@ox-content/vite-plugin-react"

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
