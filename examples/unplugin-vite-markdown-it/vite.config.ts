import { defineConfig } from "vite"
import oxContent from "@ox-content/unplugin/vite"
import { full as emoji } from "markdown-it-emoji"

export default defineConfig({
  plugins: [
    oxContent({
      toc: true,
      plugin: {
        markdownIt: [emoji],
      },
    }),
  ],
})
