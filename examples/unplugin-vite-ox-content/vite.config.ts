import { defineConfig } from "vite-plus";
import oxContent, {
  defineMdastPlugin,
  type OxContentPlugin,
} from "@ox-content/unplugin/vite";

const annotateHeadings = defineMdastPlugin("annotate-headings", (tree) => {
  for (const node of tree.children) {
    if (node.type !== "heading") {
      continue;
    }

    node.children ??= [];
    node.children.push({
      type: "text",
      value: " (via mdast plugin)",
    });
  }
});

// Example: Custom ox-content plugin that wraps content in a div
const wrapInArticle: OxContentPlugin = (html) => {
  return `<article class="ox-content">${html}</article>`;
};

// Example: Custom ox-content plugin that adds reading time
const addReadingTime: OxContentPlugin = (html) => {
  const wordCount = html.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `<p class="reading-time">Reading time: ${minutes} min</p>\n${html}`;
};

export default defineConfig({
  plugins: [
    oxContent({
      toc: true,
      plugin: {
        mdast: [annotateHeadings],
        oxContent: [addReadingTime, wrapInArticle],
      },
    }),
  ],
});
