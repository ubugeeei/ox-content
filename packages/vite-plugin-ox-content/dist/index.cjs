"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createMarkdownEnvironment: () => createMarkdownEnvironment,
  extractDocs: () => extractDocs,
  generateMarkdown: () => generateMarkdown,
  oxContent: () => oxContent,
  resolveDocsOptions: () => resolveDocsOptions,
  transformMarkdown: () => transformMarkdown,
  writeDocs: () => writeDocs
});
module.exports = __toCommonJS(index_exports);
var path2 = __toESM(require("path"), 1);

// src/environment.ts
function createMarkdownEnvironment(options) {
  return {
    // Consumer type for this environment
    consumer: "server",
    // Build configuration
    build: {
      // Output to a separate directory
      outDir: `${options.outDir}/.markdown`,
      // Emit assets for SSG
      emitAssets: true,
      // Create manifest for asset tracking
      manifest: true,
      // SSR-like externalization
      rollupOptions: {
        external: [
          // Externalize Node.js built-ins
          /^node:/,
          // Externalize native modules
          /\.node$/
        ]
      }
    },
    // Resolve configuration
    resolve: {
      // Handle .md files
      extensions: [".md", ".markdown"],
      // Conditions for module resolution
      conditions: ["markdown", "node", "import"],
      // Don't dedupe - each environment gets its own modules
      dedupe: []
    },
    // Optimize dependencies
    optimizeDeps: {
      // Include ox-content dependencies
      include: [],
      // Exclude native modules
      exclude: ["@ox-content/napi"]
    }
  };
}

// src/highlight.ts
var import_unified = require("unified");
var import_rehype_parse = __toESM(require("rehype-parse"), 1);
var import_rehype_stringify = __toESM(require("rehype-stringify"), 1);
var import_shiki = require("shiki");
var highlighterPromise = null;
async function getHighlighter(theme) {
  if (!highlighterPromise) {
    highlighterPromise = (0, import_shiki.createHighlighter)({
      themes: [theme],
      langs: [
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "vue",
        "svelte",
        "html",
        "css",
        "scss",
        "json",
        "yaml",
        "markdown",
        "bash",
        "shell",
        "rust",
        "python",
        "go",
        "java",
        "c",
        "cpp",
        "sql",
        "graphql",
        "diff",
        "toml"
      ]
    });
  }
  return highlighterPromise;
}
function rehypeShikiHighlight(options) {
  const { theme } = options;
  return async (tree) => {
    const highlighter = await getHighlighter(theme);
    const visit = async (node) => {
      if ("children" in node) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child.type === "element" && child.tagName === "pre") {
            const codeElement = child.children.find(
              (c) => c.type === "element" && c.tagName === "code"
            );
            if (codeElement) {
              const className = codeElement.properties?.className;
              let lang = "text";
              if (Array.isArray(className)) {
                const langClass = className.find(
                  (c) => typeof c === "string" && c.startsWith("language-")
                );
                if (langClass && typeof langClass === "string") {
                  lang = langClass.replace("language-", "");
                }
              }
              const codeText = getTextContent(codeElement);
              try {
                const highlighted = highlighter.codeToHtml(codeText, {
                  lang,
                  theme
                });
                const parsed = (0, import_unified.unified)().use(import_rehype_parse.default, { fragment: true }).parse(highlighted);
                if (parsed.children[0]) {
                  node.children[i] = parsed.children[0];
                }
              } catch {
              }
            }
          } else if (child.type === "element") {
            await visit(child);
          }
        }
      }
    };
    await visit(tree);
  };
}
function getTextContent(node) {
  let text = "";
  if ("children" in node) {
    for (const child of node.children) {
      if (child.type === "text") {
        text += child.value;
      } else if (child.type === "element") {
        text += getTextContent(child);
      }
    }
  }
  return text;
}
async function highlightCode(html, theme = "github-dark") {
  const result = await (0, import_unified.unified)().use(import_rehype_parse.default, { fragment: true }).use(rehypeShikiHighlight, { theme }).use(import_rehype_stringify.default).process(html);
  return String(result);
}

// src/mermaid.ts
var import_unified2 = require("unified");
var import_rehype_parse2 = __toESM(require("rehype-parse"), 1);
var import_rehype_stringify2 = __toESM(require("rehype-stringify"), 1);
function getTextContent2(node) {
  let text = "";
  if ("children" in node) {
    for (const child of node.children) {
      if (child.type === "text") {
        text += child.value;
      } else if (child.type === "element") {
        text += getTextContent2(child);
      }
    }
  }
  return text;
}
function rehypeMermaid() {
  return (tree) => {
    const visit = (node) => {
      if ("children" in node) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child.type === "element" && child.tagName === "pre") {
            const codeElement = child.children.find(
              (c) => c.type === "element" && c.tagName === "code"
            );
            if (codeElement) {
              const className = codeElement.properties?.className;
              let isMermaid = false;
              if (Array.isArray(className)) {
                isMermaid = className.some(
                  (c) => typeof c === "string" && c.includes("mermaid")
                );
              }
              if (isMermaid) {
                const mermaidCode = getTextContent2(codeElement);
                const wrapper = {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: ["ox-mermaid"],
                    "data-mermaid": mermaidCode
                  },
                  children: [
                    {
                      type: "element",
                      tagName: "pre",
                      properties: {
                        className: ["ox-mermaid-source"]
                      },
                      children: [
                        {
                          type: "text",
                          value: mermaidCode
                        }
                      ]
                    }
                  ]
                };
                node.children[i] = wrapper;
              }
            }
          } else if (child.type === "element") {
            visit(child);
          }
        }
      }
    };
    visit(tree);
  };
}
async function transformMermaid(html) {
  const result = await (0, import_unified2.unified)().use(import_rehype_parse2.default, { fragment: true }).use(rehypeMermaid).use(import_rehype_stringify2.default).process(html);
  return String(result);
}

// src/transform.ts
var napiBindings;
var napiLoadAttempted = false;
async function loadNapiBindings() {
  if (napiLoadAttempted) {
    return napiBindings ?? null;
  }
  napiLoadAttempted = true;
  try {
    const mod = await import("@ox-content/napi");
    napiBindings = mod;
    return mod;
  } catch {
    napiBindings = null;
    return null;
  }
}
async function transformMarkdown(source, filePath, options) {
  const { content, frontmatter } = parseFrontmatter(source);
  const toc = options.toc ? generateToc(content, options.tocMaxDepth) : [];
  let html = await renderToHtml(content, options);
  if (options.highlight) {
    html = await highlightCode(html, options.highlightTheme);
  }
  if (options.mermaid) {
    html = await transformMermaid(html);
  }
  const code = generateModuleCode(html, frontmatter, toc, filePath, options);
  return {
    code,
    html,
    frontmatter,
    toc
  };
}
function parseFrontmatter(source) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = source.match(frontmatterRegex);
  if (!match) {
    return { content: source, frontmatter: {} };
  }
  const frontmatterStr = match[1];
  const content = source.slice(match[0].length);
  const frontmatter = {};
  const lines = frontmatterStr.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (!isNaN(Number(value)) && value !== "") value = Number(value);
      else if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }
  return { content, frontmatter };
}
function generateToc(content, maxDepth) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const entries = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    if (depth > maxDepth) continue;
    const text = match[2].trim();
    const slug = slugify(text);
    entries.push({
      depth,
      text,
      slug,
      children: []
    });
  }
  return buildTocTree(entries);
}
function buildTocTree(entries) {
  const root = [];
  const stack = [];
  for (const entry of entries) {
    while (stack.length > 0 && stack[stack.length - 1].depth >= entry.depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(entry);
    } else {
      stack[stack.length - 1].children.push(entry);
    }
    stack.push(entry);
  }
  return root;
}
function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}
async function renderToHtml(content, options) {
  const napi = await loadNapiBindings();
  if (napi) {
    const result = napi.parseAndRender(content, {
      gfm: options.gfm
    });
    if (result.errors.length > 0) {
      console.warn("[ox-content] Parse warnings:", result.errors);
    }
    return result.html;
  }
  console.warn("[ox-content] NAPI bindings not available, using fallback renderer");
  let html = content;
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : "";
    return `
<pre><code${langClass}>${escapeHtml(code.trim())}</code></pre>
`;
  });
  html = html.replace(/^\|(.+)\|\r?\n\|[-:| ]+\|\r?\n((?:\|.+\|\r?\n?)+)/gm, (_, header, body) => {
    const headerCells = header.split("|").map((c) => c.trim()).filter(Boolean);
    const headerRow = headerCells.map((c) => `<th>${c}</th>`).join("");
    const bodyRows = body.trim().split("\n").map((row) => {
      const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    }).join("\n");
    return `<table>
<thead><tr>${headerRow}</tr></thead>
<tbody>
${bodyRows}
</tbody>
</table>
`;
  });
  html = html.replace(/^#### (.+)$/gm, (_, text) => `<h4 id="${slugify(text)}">${text}</h4>`);
  html = html.replace(/^### (.+)$/gm, (_, text) => `<h3 id="${slugify(text)}">${text}</h3>`);
  html = html.replace(/^## (.+)$/gm, (_, text) => `<h2 id="${slugify(text)}">${text}</h2>`);
  html = html.replace(/^# (.+)$/gm, (_, text) => `<h1 id="${slugify(text)}">${text}</h1>`);
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, "<hr>");
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n");
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_([^_\n]+)_/g, "<em>$1</em>");
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^(\s*)- \[x\] (.+)$/gm, '$1<li class="task-list-item"><input type="checkbox" checked disabled> $2</li>');
  html = html.replace(/^(\s*)- \[ \] (.+)$/gm, '$1<li class="task-list-item"><input type="checkbox" disabled> $2</li>');
  html = html.replace(/^(\s*)- (.+)$/gm, "$1<li>$2</li>");
  html = html.replace(/^(\s*)\d+\. (.+)$/gm, "$1<li>$2</li>");
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, (match) => {
    if (match.includes("task-list-item")) {
      return `<ul class="task-list">
${match}</ul>
`;
    }
    return `<ul>
${match}</ul>
`;
  });
  const blocks = html.split(/\n\n+/);
  html = blocks.map((block) => {
    block = block.trim();
    if (!block) return "";
    if (/^<(h[1-6]|p|div|ul|ol|li|table|thead|tbody|tr|th|td|pre|blockquote|hr|img)[\s>]/i.test(block)) {
      return block;
    }
    if (/<\/(h[1-6]|p|div|ul|ol|table|pre|blockquote)>$/i.test(block)) {
      return block;
    }
    return `<p>${block}</p>`;
  }).join("\n\n");
  html = html.replace(/<p>([\s\S]*?)<\/p>/g, (_, content2) => {
    return `<p>${content2.replace(/\n/g, "<br>")}</p>`;
  });
  return `<div class="ox-content">${html}</div>`;
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function generateModuleCode(html, frontmatter, toc, filePath, _options) {
  const htmlJson = JSON.stringify(html);
  const frontmatterJson = JSON.stringify(frontmatter);
  const tocJson = JSON.stringify(toc);
  return `
// Generated by vite-plugin-ox-content
// Source: ${filePath}

/**
 * Rendered HTML content.
 */
export const html = ${htmlJson};

/**
 * Parsed frontmatter.
 */
export const frontmatter = ${frontmatterJson};

/**
 * Table of contents.
 */
export const toc = ${tocJson};

/**
 * Default export with all data.
 */
export default {
  html,
  frontmatter,
  toc,
};

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // Trigger re-render with new content
      import.meta.hot.invalidate();
    }
  });
}
`;
}

// src/docs.ts
var fs = __toESM(require("fs"), 1);
var path = __toESM(require("path"), 1);
var JSDOC_BLOCK = /\/\*\*\s*([\s\S]*?)\s*\*\//g;
var FUNCTION_DECL = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/;
var CONST_FUNC = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/;
var CLASS_DECL = /(?:export\s+)?class\s+(\w+)/;
var INTERFACE_DECL = /(?:export\s+)?interface\s+(\w+)/;
var TYPE_DECL = /(?:export\s+)?type\s+(\w+)/;
async function extractDocs(srcDirs, options) {
  const results = [];
  for (const srcDir of srcDirs) {
    const files = await findFiles(srcDir, options);
    for (const file of files) {
      const content = await fs.promises.readFile(file, "utf-8");
      const entries = extractFromContent(content, file, options);
      if (entries.length > 0) {
        results.push({ file, entries });
      }
    }
  }
  return results;
}
async function findFiles(dir, options) {
  const files = [];
  async function walk(currentDir) {
    let entries;
    try {
      entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!isExcluded(fullPath, options.exclude)) {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        if (isIncluded(fullPath, options.include) && !isExcluded(fullPath, options.exclude)) {
          files.push(fullPath);
        }
      }
    }
  }
  await walk(dir);
  return files;
}
function isIncluded(file, patterns) {
  return patterns.some((pattern) => {
    if (pattern.includes("**")) {
      const ext = pattern.split(".").pop();
      return file.endsWith(`.${ext}`);
    }
    return file.endsWith(pattern.replace("*", ""));
  });
}
function isExcluded(file, patterns) {
  return patterns.some((pattern) => {
    if (pattern.includes("node_modules")) {
      return file.includes("node_modules");
    }
    if (pattern.includes(".test.") || pattern.includes(".spec.")) {
      return file.includes(".test.") || file.includes(".spec.");
    }
    return false;
  });
}
function extractFromContent(content, file, options) {
  const entries = [];
  let match;
  JSDOC_BLOCK.lastIndex = 0;
  while ((match = JSDOC_BLOCK.exec(content)) !== null) {
    const jsdocContent = match[1];
    const jsdocEnd = match.index + match[0].length;
    const afterJsdoc = content.slice(jsdocEnd).trim();
    const lineNumber = content.slice(0, match.index).split("\n").length;
    const entry = parseJsdocBlock(jsdocContent, afterJsdoc, file, lineNumber);
    if (entry && (options.private || !entry.private)) {
      entries.push(entry);
    }
  }
  return entries;
}
function parseJsdocBlock(jsdoc, declaration, file, line) {
  const params = [];
  const examples = [];
  const tags = {};
  let description = "";
  let returns;
  let isPrivate = false;
  const cleanedLines = jsdoc.split("\n").map((l) => l.replace(/^\s*\*\s?/, "").trim()).filter((l) => l);
  let currentExample = "";
  let inExample = false;
  for (const lineText of cleanedLines) {
    if (lineText.startsWith("@")) {
      if (inExample) {
        examples.push(currentExample.trim());
        currentExample = "";
        inExample = false;
      }
      const tagMatch = /@(\w+)\s*(?:\{([^}]*)\})?(.*)/.exec(lineText);
      if (tagMatch) {
        const [, tagName, tagType, tagRest] = tagMatch;
        switch (tagName) {
          case "param":
            const paramMatch = /(\w+)\s*-?\s*(.*)/.exec(tagRest.trim());
            if (paramMatch) {
              params.push({
                name: paramMatch[1],
                type: tagType || "unknown",
                description: paramMatch[2]
              });
            }
            break;
          case "returns":
          case "return":
            returns = {
              type: tagType || "unknown",
              description: tagRest.trim()
            };
            break;
          case "example":
            inExample = true;
            break;
          case "private":
            isPrivate = true;
            break;
          default:
            tags[tagName] = tagRest.trim();
        }
      }
    } else if (inExample) {
      currentExample += lineText + "\n";
    } else if (!description) {
      description = lineText;
    } else {
      description += " " + lineText;
    }
  }
  if (inExample && currentExample) {
    examples.push(currentExample.trim());
  }
  let name = "";
  let kind = "function";
  let declMatch;
  if (declMatch = FUNCTION_DECL.exec(declaration)) {
    name = declMatch[1];
    kind = "function";
  } else if (declMatch = CONST_FUNC.exec(declaration)) {
    name = declMatch[1];
    kind = "function";
  } else if (declMatch = CLASS_DECL.exec(declaration)) {
    name = declMatch[1];
    kind = "class";
  } else if (declMatch = INTERFACE_DECL.exec(declaration)) {
    name = declMatch[1];
    kind = "interface";
  } else if (declMatch = TYPE_DECL.exec(declaration)) {
    name = declMatch[1];
    kind = "type";
  }
  if (!name) return null;
  return {
    name,
    kind,
    description,
    params: params.length > 0 ? params : void 0,
    returns,
    examples: examples.length > 0 ? examples : void 0,
    tags: Object.keys(tags).length > 0 ? tags : void 0,
    private: isPrivate,
    file,
    line
  };
}
function generateMarkdown(docs, options) {
  const result = {};
  if (options.groupBy === "file") {
    for (const doc of docs) {
      const fileName = path.basename(doc.file, path.extname(doc.file));
      const markdown = generateFileMarkdown(doc, options);
      result[`${fileName}.md`] = markdown;
    }
    result["index.md"] = generateIndex(docs);
  } else {
    const byKind = /* @__PURE__ */ new Map();
    for (const doc of docs) {
      for (const entry of doc.entries) {
        const existing = byKind.get(entry.kind) || [];
        existing.push(entry);
        byKind.set(entry.kind, existing);
      }
    }
    for (const [kind, entries] of byKind) {
      result[`${kind}s.md`] = generateCategoryMarkdown(kind, entries, options);
    }
    result["index.md"] = generateCategoryIndex(byKind);
  }
  return result;
}
function generateFileMarkdown(doc, options) {
  const fileName = path.basename(doc.file);
  let md = `# ${fileName}

`;
  if (options.toc && doc.entries.length > 1) {
    md += "## Table of Contents\n\n";
    for (const entry of doc.entries) {
      md += `- [${entry.name}](#${entry.name.toLowerCase()})
`;
    }
    md += "\n---\n\n";
  }
  for (const entry of doc.entries) {
    md += generateEntryMarkdown(entry);
  }
  return md;
}
function generateEntryMarkdown(entry) {
  let md = `## ${entry.name}

`;
  md += `\`${entry.kind}\`

`;
  if (entry.description) {
    md += `${entry.description}

`;
  }
  if (entry.params && entry.params.length > 0) {
    md += "### Parameters\n\n";
    md += "| Name | Type | Description |\n";
    md += "|------|------|-------------|\n";
    for (const param of entry.params) {
      md += `| \`${param.name}\` | \`${param.type}\` | ${param.description} |
`;
    }
    md += "\n";
  }
  if (entry.returns) {
    md += "### Returns\n\n";
    md += `\`${entry.returns.type}\` - ${entry.returns.description}

`;
  }
  if (entry.examples && entry.examples.length > 0) {
    md += "### Examples\n\n";
    for (const example of entry.examples) {
      md += "```ts\n";
      md += example.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
      md += "\n```\n\n";
    }
  }
  md += "---\n\n";
  return md;
}
function generateIndex(docs) {
  let md = "# API Documentation\n\n";
  md += "Generated by [Ox Content](https://github.com/ubugeeei/ox-content)\n\n";
  md += "## Modules\n\n";
  for (const doc of docs) {
    const fileName = path.basename(doc.file, path.extname(doc.file));
    md += `### [${fileName}](./${fileName}.md)

`;
    for (const entry of doc.entries) {
      const desc = entry.description?.slice(0, 80) || "";
      const ellipsis = entry.description && entry.description.length > 80 ? "..." : "";
      md += `- \`${entry.kind}\` **${entry.name}** - ${desc}${ellipsis}
`;
    }
    md += "\n";
  }
  return md;
}
function generateCategoryMarkdown(kind, entries, options) {
  let md = `# ${kind.charAt(0).toUpperCase() + kind.slice(1)}s

`;
  if (options.toc) {
    md += "## Table of Contents\n\n";
    for (const entry of entries) {
      md += `- [${entry.name}](#${entry.name.toLowerCase()})
`;
    }
    md += "\n---\n\n";
  }
  for (const entry of entries) {
    md += generateEntryMarkdown(entry);
  }
  return md;
}
function generateCategoryIndex(byKind) {
  let md = "# API Documentation\n\n";
  md += "Generated by [Ox Content](https://github.com/ubugeeei/ox-content)\n\n";
  for (const [kind, entries] of byKind) {
    const kindTitle = kind.charAt(0).toUpperCase() + kind.slice(1) + "s";
    md += `## [${kindTitle}](./${kind}s.md)

`;
    for (const entry of entries) {
      const desc = entry.description?.slice(0, 60) || "";
      md += `- **${entry.name}** - ${desc}...
`;
    }
    md += "\n";
  }
  return md;
}
async function writeDocs(docs, outDir) {
  await fs.promises.mkdir(outDir, { recursive: true });
  for (const [fileName, content] of Object.entries(docs)) {
    const filePath = path.join(outDir, fileName);
    await fs.promises.writeFile(filePath, content, "utf-8");
  }
}
function resolveDocsOptions(options) {
  if (options === false) {
    return false;
  }
  const opts = options || {};
  return {
    enabled: opts.enabled ?? true,
    src: opts.src ?? ["./src"],
    out: opts.out ?? "docs/api",
    include: opts.include ?? ["**/*.ts", "**/*.tsx"],
    exclude: opts.exclude ?? ["**/*.test.*", "**/*.spec.*", "node_modules"],
    format: opts.format ?? "markdown",
    private: opts.private ?? false,
    toc: opts.toc ?? true,
    groupBy: opts.groupBy ?? "file"
  };
}

// src/index.ts
function oxContent(options = {}) {
  const resolvedOptions = resolveOptions(options);
  let config;
  let _server;
  const mainPlugin = {
    name: "ox-content",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer(devServer) {
      _server = devServer;
      devServer.middlewares.use(async (req, res, next) => {
        const url = req.url;
        if (!url || !url.endsWith(".md")) {
          return next();
        }
        next();
      });
    },
    resolveId(id) {
      if (id.startsWith("virtual:ox-content/")) {
        return "\0" + id;
      }
      if (id.endsWith(".md")) {
        return id;
      }
      return null;
    },
    async load(id) {
      if (id.startsWith("\0virtual:ox-content/")) {
        const path3 = id.slice("\0virtual:ox-content/".length);
        return generateVirtualModule(path3, resolvedOptions);
      }
      return null;
    },
    async transform(code, id) {
      if (!id.endsWith(".md")) {
        return null;
      }
      const result = await transformMarkdown(code, id, resolvedOptions);
      return {
        code: result.code,
        map: null
      };
    },
    // Hot Module Replacement support
    async handleHotUpdate({ file, server }) {
      if (file.endsWith(".md")) {
        server.ws.send({
          type: "custom",
          event: "ox-content:update",
          data: { file }
        });
        const modules = server.moduleGraph.getModulesByFile(file);
        return modules ? Array.from(modules) : [];
      }
    }
  };
  const environmentPlugin = {
    name: "ox-content:environment",
    config() {
      return {
        environments: {
          // Markdown processing environment
          markdown: createMarkdownEnvironment(resolvedOptions)
        }
      };
    }
  };
  const docsPlugin = {
    name: "ox-content:docs",
    async buildStart() {
      const docsOptions = resolvedOptions.docs;
      if (!docsOptions || !docsOptions.enabled) {
        return;
      }
      const root = config?.root || process.cwd();
      const srcDirs = docsOptions.src.map((src) => path2.resolve(root, src));
      const outDir = path2.resolve(root, docsOptions.out);
      try {
        const extracted = await extractDocs(srcDirs, docsOptions);
        if (extracted.length > 0) {
          const generated = generateMarkdown(extracted, docsOptions);
          await writeDocs(generated, outDir);
          console.log(
            `[ox-content] Generated ${Object.keys(generated).length} documentation files to ${docsOptions.out}`
          );
        }
      } catch (err) {
        console.warn("[ox-content] Failed to generate documentation:", err);
      }
    },
    configureServer(devServer) {
      const docsOptions = resolvedOptions.docs;
      if (!docsOptions || !docsOptions.enabled) {
        return;
      }
      const root = config?.root || process.cwd();
      const srcDirs = docsOptions.src.map((src) => path2.resolve(root, src));
      for (const srcDir of srcDirs) {
        devServer.watcher.add(srcDir);
      }
      devServer.watcher.on("change", async (file) => {
        const isSourceFile = srcDirs.some(
          (srcDir) => file.startsWith(srcDir) && (file.endsWith(".ts") || file.endsWith(".tsx"))
        );
        if (isSourceFile) {
          const outDir = path2.resolve(root, docsOptions.out);
          try {
            const extracted = await extractDocs(srcDirs, docsOptions);
            if (extracted.length > 0) {
              const generated = generateMarkdown(extracted, docsOptions);
              await writeDocs(generated, outDir);
            }
          } catch {
          }
        }
      });
    }
  };
  return [mainPlugin, environmentPlugin, docsPlugin];
}
function resolveOptions(options) {
  return {
    srcDir: options.srcDir ?? "docs",
    outDir: options.outDir ?? "dist",
    base: options.base ?? "/",
    gfm: options.gfm ?? true,
    footnotes: options.footnotes ?? true,
    tables: options.tables ?? true,
    taskLists: options.taskLists ?? true,
    strikethrough: options.strikethrough ?? true,
    highlight: options.highlight ?? false,
    highlightTheme: options.highlightTheme ?? "github-dark",
    mermaid: options.mermaid ?? false,
    frontmatter: options.frontmatter ?? true,
    toc: options.toc ?? true,
    tocMaxDepth: options.tocMaxDepth ?? 3,
    ogImage: options.ogImage ?? false,
    ogImageOptions: options.ogImageOptions ?? {},
    transformers: options.transformers ?? [],
    docs: resolveDocsOptions(options.docs)
  };
}
function generateVirtualModule(path3, options) {
  if (path3 === "config") {
    return `export default ${JSON.stringify(options)};`;
  }
  if (path3 === "runtime") {
    return `
      export function useMarkdown() {
        return {
          render: (content) => {
            // Client-side rendering if needed
            return content;
          },
        };
      }
    `;
  }
  return "export default {};";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createMarkdownEnvironment,
  extractDocs,
  generateMarkdown,
  oxContent,
  resolveDocsOptions,
  transformMarkdown,
  writeDocs
});
//# sourceMappingURL=index.cjs.map