// Ox Content Playground
// This is a placeholder implementation until the NAPI bindings are ready

// Simple markdown parser (placeholder until ox_content_napi is ready)
function parseMarkdown(source: string): { html: string ast: string } {
  // Very basic markdown parsing for demo purposes
  // TODO: Replace with actual ox_content_napi bindings

  let html = source
    // Headers
    .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    // Code blocks
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      '<pre><code class="language-$1">$2</code></pre>',
    )
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Horizontal rules
    .replace(/^---$/gm, "<hr>")
    // Blockquotes
    .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>")
    // Unordered lists
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    // Wrap paragraphs
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim()
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<hr")
      ) {
        // Wrap list items
        if (trimmed.startsWith("<li")) {
          return `<ul>${trimmed}</ul>`
        }
        return trimmed
      }
      if (trimmed) {
        return `<p>${trimmed}</p>`
      }
      return ""
    })
    .join("\n")

  // Generate a simple AST representation
  const ast = JSON.stringify(
    {
      type: "document",
      children: [
        {
          type: "paragraph",
          note: "Placeholder AST - NAPI bindings coming soon",
        },
      ],
    },
    null,
    2,
  )

  return { html, ast }
}

// DOM Elements
const markdownInput = document.getElementById(
  "markdown-input",
) as HTMLTextAreaElement
const previewContent = document.getElementById(
  "preview-content",
) as HTMLDivElement
const htmlContent = document.getElementById("html-content") as HTMLPreElement
const astContent = document.getElementById("ast-content") as HTMLPreElement

const previewTab = document.getElementById("preview-tab") as HTMLButtonElement
const htmlTab = document.getElementById("html-tab") as HTMLButtonElement
const astTab = document.getElementById("ast-tab") as HTMLButtonElement

const previewView = document.getElementById("preview-view") as HTMLDivElement
const htmlView = document.getElementById("html-view") as HTMLDivElement
const astView = document.getElementById("ast-view") as HTMLDivElement

// Update preview
function updatePreview() {
  const source = markdownInput.value
  const { html, ast } = parseMarkdown(source)

  previewContent.innerHTML = html
  htmlContent.textContent = html
  astContent.textContent = ast
}

// Tab switching
function switchTab(activeTab: HTMLButtonElement, activeView: HTMLDivElement) {
  // Remove active class from all tabs
  ;[previewTab, htmlTab, astTab].forEach((tab) =>
    tab.classList.remove("active"),
  )
  ;[previewView, htmlView, astView].forEach((view) =>
    view.classList.remove("active"),
  )

  // Add active class to selected tab and view
  activeTab.classList.add("active")
  activeView.classList.add("active")
}

// Event listeners
markdownInput.addEventListener("input", updatePreview)

previewTab.addEventListener("click", () => switchTab(previewTab, previewView))
htmlTab.addEventListener("click", () => switchTab(htmlTab, htmlView))
astTab.addEventListener("click", () => switchTab(astTab, astView))

// Initial render
updatePreview()

// Log version info
console.log(
  "%c Ox Content Playground ",
  "background: #e94560; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
)
console.log("Ready for NAPI bindings integration")
