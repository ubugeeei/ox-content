import { defineConfig } from "vite"
import oxContent from "unplugin-ox-content/vite"
import rehypeSlug from "rehype-slug"

export default defineConfig({
  plugins: [
    oxContent({
      toc: true,
      plugin: {
        rehype: [rehypeSlug],
      },
    }),
  ],
})
