import { defineConfig } from "vite"
import { oxContent, defineTheme, defaultTheme } from "vite-plugin-ox-content"

/**
 * Ox Content Documentation Site
 *
 * Dogfooding: Using ox-content to build ox-content's own documentation.
 * Uses SSG to generate static HTML from Markdown files.
 */
export default defineConfig(({ mode }) => {
  const isProd = mode === "production"
  const base = isProd ? "/ox-content/" : "/"

  return {
    // Site base path (for GitHub Pages in prod, root for dev)
    base,

    plugins: [
      oxContent({
        srcDir: ".",
        outDir: "dist/docs",
        base,

        // SSG options with theme customization
        ssg: {
          siteName: "Ox Content",
          ogImage: "https://ubugeeei.github.io/ox-content/og-image.png",
          theme: defineTheme({
            extends: defaultTheme,
            footer: {
              message: 'Released under the <a href="https://opensource.org/licenses/MIT">MIT License</a>.',
              copyright: `Copyright © 2024-${new Date().getFullYear()} ubugeeei`,
            },
          }),
        },

        // Enable syntax highlighting with Shiki
        highlight: true,
        highlightTheme: "vitesse-dark",

        // Mermaid diagrams disabled (using SVG instead)
        mermaid: false,

        // API documentation generation (like cargo doc)
        docs: {
          enabled: true,
          src: ["../npm/vite-plugin-ox-content/src"],
          out: "api",
          include: ["**/*.ts"],
          exclude: ["**/*.test.*"],
          toc: true,
          groupBy: "file",
          githubUrl: "https://github.com/ubugeeei/ox-content",
          generateNav: true,
        },
      }),
    ],

    build: {
      outDir: "dist/docs",
    },
  }
})
