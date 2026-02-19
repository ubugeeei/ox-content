/**
 * Vite SSG Example - Main Entry
 *
 * Demonstrates importing Markdown files and rendering them.
 */

// Import Markdown content directly
// The @ox-content/vite-plugin transforms this into a module
import content from "./content/index.md"

// Render the content
const app = document.getElementById("app")
if (app) {
  app.innerHTML = `
    <nav class="toc">
      <h2>Table of Contents</h2>
      <ul>
        ${content.toc
          .map(
            (entry: any) => `
          <li>
            <a href="#${entry.slug}">${entry.text}</a>
            ${
              entry.children.length > 0
                ? `
              <ul>
                ${entry.children
                  .map(
                    (child: any) => `
                  <li><a href="#${child.slug}">${child.text}</a></li>
                `,
                  )
                  .join("")}
              </ul>
            `
                : ""
            }
          </li>
        `,
          )
          .join("")}
      </ul>
    </nav>
    <main class="content">
      ${content.html}
    </main>
  `
}

// HMR support
if (import.meta.hot) {
  import.meta.hot.on("ox-content:update", (data) => {
    console.log("Markdown updated:", data.file)
    // Reload to get new content
    import.meta.hot?.invalidate()
  })
}
