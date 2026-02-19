import { defineConfig } from "vite"
import oxContent from "@ox-content/unplugin/vite"
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
