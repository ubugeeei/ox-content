// src/index.ts
import { createUnplugin } from "unplugin";
import { createFilter } from "@rollup/pluginutils";

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
  const html = await renderToHtml(content, options);
  const code = generateModuleCode(html, frontmatter, toc, filePath);
  return { code, html, frontmatter, toc };
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
    entries.push({ depth, text, slug, children: [] });
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
    const result = napi.parseAndRender(content, { gfm: options.gfm });
    if (result.errors.length > 0) {
      console.warn("[ox-content] Parse warnings:", result.errors);
    }
    return result.html;
  }
  let html = content;
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : "";
    return `
<pre><code${langClass}>${escapeHtml(code.trim())}</code></pre>
`;
  });
  html = html.replace(
    /^\|(.+)\|\r?\n\|[-:| ]+\|\r?\n((?:\|.+\|\r?\n?)+)/gm,
    (_, header, body) => {
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
    }
  );
  html = html.replace(
    /^#### (.+)$/gm,
    (_, text) => `<h4 id="${slugify(text)}">${text}</h4>`
  );
  html = html.replace(
    /^### (.+)$/gm,
    (_, text) => `<h3 id="${slugify(text)}">${text}</h3>`
  );
  html = html.replace(
    /^## (.+)$/gm,
    (_, text) => `<h2 id="${slugify(text)}">${text}</h2>`
  );
  html = html.replace(
    /^# (.+)$/gm,
    (_, text) => `<h1 id="${slugify(text)}">${text}</h1>`
  );
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
  html = html.replace(
    /^(\s*)- \[x\] (.+)$/gm,
    '$1<li class="task-list-item"><input type="checkbox" checked disabled> $2</li>'
  );
  html = html.replace(
    /^(\s*)- \[ \] (.+)$/gm,
    '$1<li class="task-list-item"><input type="checkbox" disabled> $2</li>'
  );
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
    if (/^<(h[1-6]|p|div|ul|ol|li|table|thead|tbody|tr|th|td|pre|blockquote|hr|img)[\s>]/i.test(
      block
    )) {
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
function generateModuleCode(html, frontmatter, toc, filePath) {
  const htmlJson = JSON.stringify(html);
  const frontmatterJson = JSON.stringify(frontmatter);
  const tocJson = JSON.stringify(toc);
  return `
// Generated by unplugin-ox-content
// Source: ${filePath}

export const html = ${htmlJson};
export const frontmatter = ${frontmatterJson};
export const toc = ${tocJson};

export default {
  html,
  frontmatter,
  toc,
};
`;
}

// src/index.ts
function resolveOptions(options) {
  const extensions = options.extensions ?? [".md", ".markdown"];
  return {
    srcDir: options.srcDir ?? "docs",
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
    extensions,
    include: Array.isArray(options.include) ? options.include : options.include ? [options.include] : [],
    exclude: Array.isArray(options.exclude) ? options.exclude : options.exclude ? [options.exclude] : []
  };
}
function isMarkdownFile(id, options) {
  return options.extensions.some((ext) => id.endsWith(ext));
}
var unpluginFactory = (rawOptions = {}) => {
  const options = resolveOptions(rawOptions);
  const filter = createFilter(
    options.include.length > 0 ? options.include : void 0,
    options.exclude.length > 0 ? options.exclude : void 0
  );
  return {
    name: "unplugin-ox-content",
    resolveId(id) {
      if (id.startsWith("virtual:ox-content/")) {
        return "\0" + id;
      }
      return null;
    },
    loadInclude(id) {
      return id.startsWith("\0virtual:ox-content/");
    },
    load(id) {
      if (id.startsWith("\0virtual:ox-content/")) {
        const path = id.slice("\0virtual:ox-content/".length);
        if (path === "config") {
          return `export default ${JSON.stringify(options)};`;
        }
        if (path === "runtime") {
          return `
            export function useMarkdown() {
              return {
                render: (content) => content,
              };
            }
          `;
        }
        return "export default {};";
      }
      return null;
    },
    transformInclude(id) {
      return isMarkdownFile(id, options) && filter(id);
    },
    async transform(code, id) {
      if (!isMarkdownFile(id, options)) {
        return null;
      }
      if (!filter(id)) {
        return null;
      }
      const result = await transformMarkdown(code, id, options);
      return {
        code: result.code,
        map: null
      };
    }
  };
};
var unplugin = /* @__PURE__ */ createUnplugin(unpluginFactory);
var index_default = unplugin;

// src/vite.ts
var vite_default = index_default.vite;
export {
  vite_default as default,
  index_default as unplugin
};
