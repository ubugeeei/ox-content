/**
 * rehype/unified Plugin Example
 *
 * Demonstrates how to use Ox Content with the unified ecosystem
 * for HTML processing and transformation.
 */

import { unified } from "unified"
import rehypeParse from "rehype-parse"
import rehypeStringify from "rehype-stringify"
// In production:
// import { parseAndRender } from '@ox-content/napi';

/**
 * A unified plugin that uses Ox Content for Markdown to HTML conversion.
 *
 * This integrates Ox Content's high-performance parser into the unified
 * ecosystem, allowing you to use rehype plugins for post-processing.
 */
function oxContentToRehype() {
  return function (tree, _file) {
    // The tree is already HTML (from Ox Content)
    // This plugin can transform it further
    return tree
  }
}

/**
 * Custom rehype plugin for adding classes to headings.
 */
function rehypeAddHeadingClasses() {
  return function (tree) {
    function visit(node) {
      if (node.type === "element") {
        if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
          node.properties = node.properties || {}
          node.properties.className = [
            ...(node.properties.className || []),
            "ox-heading",
            `ox-${node.tagName}`,
          ]
        }

        if (node.children) {
          node.children.forEach(visit)
        }
      }
    }

    if (tree.children) {
      tree.children.forEach(visit)
    }

    return tree
  }
}

/**
 * Custom rehype plugin for syntax highlighting preparation.
 */
function rehypeCodeBlocks() {
  return function (tree) {
    function visit(node) {
      if (node.type === "element" && node.tagName === "pre") {
        node.properties = node.properties || {}
        node.properties.className = [
          ...(node.properties.className || []),
          "ox-code-block",
        ]
      }

      if (node.children) {
        node.children.forEach(visit)
      }
    }

    if (tree.children) {
      tree.children.forEach(visit)
    }

    return tree
  }
}

// Simulated Ox Content HTML output (in production, use parseAndRender)
const oxContentHtml = `
<h1>Hello from Ox Content + rehype</h1>
<p>This example shows integration with the <strong>unified ecosystem</strong>.</p>
<h2>Features</h2>
<ul>
<li>Parse Markdown with Ox Content</li>
<li>Transform HTML with rehype plugins</li>
<li>Full unified ecosystem compatibility</li>
</ul>
<pre><code class="language-javascript">const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(oxContentToRehype)
  .use(rehypeAddHeadingClasses)
  .use(rehypeStringify);
</code></pre>
`

// Process with unified/rehype
async function processWithRehype(html) {
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(oxContentToRehype)
    .use(rehypeAddHeadingClasses)
    .use(rehypeCodeBlocks)
    .use(rehypeStringify)

  const result = await processor.process(html)
  return String(result)
}

// Demo
console.log("Original HTML from Ox Content:")
console.log(oxContentHtml)
console.log("\n--- After rehype processing ---\n")

processWithRehype(oxContentHtml)
  .then((result) => {
    console.log("Processed HTML:")
    console.log(result)
  })
  .catch(console.error)
