/**
 * markdown-it Plugin Example
 *
 * Demonstrates how to use Ox Content as a markdown-it plugin
 * for high-performance parsing with custom rendering.
 */

import MarkdownIt from "markdown-it"
// In production, use the actual package:
// import { parseMarkdown } from '@ox-content/napi';

/**
 * Creates a markdown-it plugin that uses Ox Content for parsing.
 *
 * This plugin replaces markdown-it's parser with Ox Content's
 * high-performance Rust-based parser while keeping markdown-it's
 * rendering and plugin ecosystem.
 */
function oxContentPlugin(md, options = {}) {
  const { useOxParser = true, gfm = true } = options

  if (!useOxParser) {
    return // Use default markdown-it parser
  }

  // Store original parse function
  const originalParse = md.parse.bind(md)

  // Override parse to use Ox Content
  md.parse = function (src, env) {
    try {
      // In production, parse with Ox Content:
      // const ast = parseMarkdown(src, { gfm });
      // return convertOxAstToMarkdownItTokens(ast);

      // For demo, use original parser with logging
      console.log("[ox-content] Parsing with options:", { gfm })
      return originalParse(src, env)
    } catch (error) {
      console.warn(
        "[ox-content] Parse error, falling back to markdown-it:",
        error,
      )
      return originalParse(src, env)
    }
  }

  // Add custom rendering rules
  md.renderer.rules.ox_content_highlight = function (tokens, idx) {
    const token = tokens[idx]
    return `<div class="ox-highlight">${token.content}</div>`
  }
}

/**
 * Converts Ox Content AST to markdown-it token stream.
 * This enables using Ox Content's fast parser with markdown-it's plugins.
 */
function _convertOxAstToMarkdownItTokens(ast) {
  const tokens = []

  function processNode(node, tokens) {
    switch (node.type) {
      case "heading":
        tokens.push({
          type: `heading_open`,
          tag: `h${node.depth}`,
          nesting: 1,
        })
        if (node.children) {
          node.children.forEach((child) => processNode(child, tokens))
        }
        tokens.push({
          type: `heading_close`,
          tag: `h${node.depth}`,
          nesting: -1,
        })
        break

      case "paragraph":
        tokens.push({ type: "paragraph_open", tag: "p", nesting: 1 })
        if (node.children) {
          node.children.forEach((child) => processNode(child, tokens))
        }
        tokens.push({ type: "paragraph_close", tag: "p", nesting: -1 })
        break

      case "text":
        tokens.push({
          type: "text",
          content: node.value || "",
          nesting: 0,
        })
        break

      case "code_block":
        tokens.push({
          type: "fence",
          tag: "code",
          info: node.lang || "",
          content: node.value || "",
          nesting: 0,
        })
        break

      // Add more node types as needed
    }
  }

  if (ast.children) {
    ast.children.forEach((child) => processNode(child, tokens))
  }

  return tokens
}

// Demo usage
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// Apply Ox Content plugin
md.use(oxContentPlugin, {
  useOxParser: true,
  gfm: true,
})

const markdown = `
# Hello from markdown-it + Ox Content

This example shows how to integrate **Ox Content** with markdown-it.

## Features

- Use Ox Content's fast parser
- Keep markdown-it's plugin ecosystem
- Fallback to markdown-it if needed

\`\`\`javascript
const result = md.render(markdown);
console.log(result);
\`\`\`

## Task List (GFM)

- [x] Create plugin
- [x] Test integration
- [ ] Deploy to production
`

const result = md.render(markdown)
console.log("Rendered HTML:")
console.log(result)
