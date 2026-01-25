import { defineConfig } from "vite"
import oxContent, { type OxContentPlugin } from "unplugin-ox-content/vite"

// Example: Custom ox-content plugin that wraps content in a div
const wrapInArticle: OxContentPlugin = (html) => {
  return `<article class="ox-content">${html}</article>`
}

// Example: Custom ox-content plugin that adds reading time
const addReadingTime: OxContentPlugin = (html) => {
  const wordCount = html.replace(/<[^>]*>/g, "").split(/\s+/).length
  const minutes = Math.ceil(wordCount / 200)
  return `<p class="reading-time">Reading time: ${minutes} min</p>\n${html}`
}

export default defineConfig({
  plugins: [
    oxContent({
      toc: true,
      plugin: {
        oxContent: [addReadingTime, wrapInArticle],
      },
    }),
  ],
})
