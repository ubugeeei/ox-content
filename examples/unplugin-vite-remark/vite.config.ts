import { defineConfig } from "vite"
import oxContent from "unplugin-ox-content/vite"
import remarkGfm from "remark-gfm"

export default defineConfig({
  plugins: [
    oxContent({
      toc: true,
      plugin: {
        remark: [remarkGfm],
      },
    }),
  ],
})
