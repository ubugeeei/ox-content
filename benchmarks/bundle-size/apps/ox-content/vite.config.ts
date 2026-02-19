import { defineConfig } from "vite"
import { oxContent } from "@ox-content/vite-plugin"

export default defineConfig({
  plugins: [
    oxContent({
      srcDir: "../../content",
    }),
  ],
  build: {
    outDir: "dist",
    minify: true,
  },
})
