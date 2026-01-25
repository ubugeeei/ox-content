import * as path from "path";
import { transformMarkdown as baseTransformMarkdown } from "vite-plugin-ox-content";
import { compile } from "svelte/compiler";
import type {
  ResolvedSvelteOptions,
  SvelteTransformResult,
  ComponentSlot,
  ComponentsMap,
} from "./types";

const COMPONENT_REGEX = /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)\s*(?:\/>|>([\s\S]*?)<\/\1>)/g;
const PROP_REGEX = /([a-zA-Z0-9-]+)(?:=(?:"([^"]*)"|'([^']*)'|{([^}]*)}|\[([^\]]*)\]))?/g;

const SLOT_MARKER_PREFIX = "OXCONTENT-SLOT-";
const SLOT_MARKER_SUFFIX = "-PLACEHOLDER";

interface Range {
  start: number;
  end: number;
}

export async function transformMarkdownWithSvelte(
  code: string,
  id: string,
  options: ResolvedSvelteOptions,
): Promise<SvelteTransformResult> {
  const components: ComponentsMap = options.components;
  const usedComponents: string[] = [];
  const slots: ComponentSlot[] = [];
  let slotIndex = 0;

  const { content: markdownContent, frontmatter } = extractFrontmatter(code);
  const fenceRanges = collectFenceRanges(markdownContent);
  let processedContent = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  COMPONENT_REGEX.lastIndex = 0;
  while ((match = COMPONENT_REGEX.exec(markdownContent)) !== null) {
    const [fullMatch, componentName, propsString, rawSlotContent] = match;
    const matchStart = match.index;
    const matchEnd = matchStart + fullMatch.length;

    if (
      !Object.prototype.hasOwnProperty.call(components, componentName) ||
      isInRanges(matchStart, matchEnd, fenceRanges)
    ) {
      processedContent += markdownContent.slice(lastIndex, matchEnd);
      lastIndex = matchEnd;
      continue;
    }

    if (!usedComponents.includes(componentName)) {
      usedComponents.push(componentName);
    }

    const props = parseProps(propsString);
    const slotId = `ox-slot-${slotIndex++}`;
    const slotContent = typeof rawSlotContent === "string" ? rawSlotContent.trim() : undefined;

    slots.push({
      name: componentName,
      props,
      position: matchStart,
      id: slotId,
      content: slotContent,
    });

    processedContent += markdownContent.slice(lastIndex, matchStart) + createSlotMarker(slotId);
    lastIndex = matchEnd;
  }
  processedContent += markdownContent.slice(lastIndex);

  const transformed = await baseTransformMarkdown(processedContent, id, {
    srcDir: options.srcDir,
    outDir: options.outDir,
    base: options.base,
    ssg: {
      enabled: false,
      extension: ".html",
      clean: false,
      bare: false,
      generateOgImage: false,
    },
    gfm: options.gfm,
    frontmatter: false,
    toc: options.toc,
    tocMaxDepth: options.tocMaxDepth,
    footnotes: true,
    tables: true,
    taskLists: true,
    strikethrough: true,
    highlight: false,
    highlightTheme: "github-dark",
    mermaid: false,
    ogImage: false,
    ogImageOptions: {},
    transformers: [],
    docs: false,
    search: {
      enabled: false,
      limit: 10,
      prefix: true,
      placeholder: "Search...",
      hotkey: "k",
    },
  });

  const htmlWithSlots = injectSlotMarkers(transformed.html, slots);
  const svelteCode = generateSvelteModule(
    htmlWithSlots,
    usedComponents,
    slots,
    frontmatter,
    options,
    id,
  );

  const compiled = compile(svelteCode, {
    filename: id,
    generate: "client",
    runes: true,
  });

  const finalCode = `${compiled.js.code}\nexport const frontmatter = ${JSON.stringify(frontmatter)};`;

  return {
    code: finalCode,
    map: null,
    usedComponents,
    frontmatter,
  };
}

function createSlotMarker(slotId: string): string {
  return `${SLOT_MARKER_PREFIX}${slotId}${SLOT_MARKER_SUFFIX}`;
}

function collectFenceRanges(content: string): Range[] {
  const ranges: Range[] = [];
  let inFence = false;
  let fenceChar = "";
  let fenceLength = 0;
  let fenceStart = 0;
  let pos = 0;

  while (pos < content.length) {
    const lineEnd = content.indexOf("\n", pos);
    const next = lineEnd === -1 ? content.length : lineEnd + 1;
    const line = content.slice(pos, lineEnd === -1 ? content.length : lineEnd);
    const fenceMatch = line.match(/^\s{0,3}([`~]{3,})/);

    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceChar = marker[0];
        fenceLength = marker.length;
        fenceStart = pos;
      } else if (marker[0] === fenceChar && marker.length >= fenceLength) {
        inFence = false;
        ranges.push({ start: fenceStart, end: next });
        fenceChar = "";
        fenceLength = 0;
      }
    }

    pos = next;
  }

  if (inFence) {
    ranges.push({ start: fenceStart, end: content.length });
  }

  return ranges;
}

function isInRanges(start: number, end: number, ranges: Range[]): boolean {
  for (const range of ranges) {
    if (start < range.end && end > range.start) {
      return true;
    }
  }
  return false;
}

function injectSlotMarkers(html: string, slots: ComponentSlot[]): string {
  let output = html;

  for (const slot of slots) {
    const marker = createSlotMarker(slot.id);
    output = output.replaceAll(`<p>${marker}</p>`, `<div data-ox-slot="${slot.id}"></div>`);
    output = output.replaceAll(marker, `<span data-ox-slot="${slot.id}"></span>`);
  }

  return output;
}

function extractFrontmatter(content: string): {
  content: string;
  frontmatter: Record<string, unknown>;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = frontmatterRegex.exec(content);

  if (!match) {
    return { content, frontmatter: {} };
  }

  const frontmatterStr = match[1];
  const frontmatter: Record<string, unknown> = {};

  for (const line of frontmatterStr.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();
      try {
        value = JSON.parse(value as string);
      } catch {
        if (
          typeof value === "string" &&
          ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")))
        ) {
          value = value.slice(1, -1);
        }
      }
      frontmatter[key] = value;
    }
  }

  return { content: content.slice(match[0].length), frontmatter };
}

function parseProps(propsString: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (!propsString) return props;

  PROP_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PROP_REGEX.exec(propsString)) !== null) {
    const [, name, doubleQuoted, singleQuoted, braceValue, bracketValue] = match;
    if (name) {
      if (doubleQuoted !== undefined) props[name] = doubleQuoted;
      else if (singleQuoted !== undefined) props[name] = singleQuoted;
      else if (braceValue !== undefined) {
        try {
          props[name] = JSON.parse(braceValue);
        } catch {
          props[name] = braceValue;
        }
      } else if (bracketValue !== undefined) {
        try {
          props[name] = JSON.parse(`[${bracketValue}]`);
        } catch {
          props[name] = bracketValue;
        }
      } else props[name] = true;
    }
  }
  return props;
}

function generateSvelteModule(
  content: string,
  usedComponents: string[],
  slots: ComponentSlot[],
  frontmatter: Record<string, unknown>,
  options: ResolvedSvelteOptions & { root?: string },
  id: string,
): string {
  const mdDir = path.dirname(id);
  const root = options.root || process.cwd();

  const imports = usedComponents
    .map((name) => {
      const componentPath = options.components[name];
      if (!componentPath) return "";
      const absolutePath = path.resolve(root, componentPath.replace(/^\.\//, ""));
      const relativePath = path.relative(mdDir, absolutePath).replace(/\\/g, "/");
      const importPath = relativePath.startsWith(".") ? relativePath : "./" + relativePath;
      return `import ${name} from '${importPath}';`;
    })
    .filter(Boolean)
    .join("\n");

  const componentMap = usedComponents.map((name) => `  ${name},`).join("\n");

  return `
<script>
  import { createRawSnippet, onMount, mount, unmount } from 'svelte';
  ${imports}

  const frontmatter = ${JSON.stringify(frontmatter)};
  const rawHtml = ${JSON.stringify(content)};
  const slots = ${JSON.stringify(slots)};
  const components = {
${componentMap}
  };

  let container;

  function renderSlot(slot, slotContent) {
    const component = components[slot.name];
    if (!component) return null;
    const props = { ...slot.props };
    if (slotContent) {
      props.children = createRawSnippet(() => ({
        render: () => \`<div>\${slotContent}</div>\`,
      }));
    }
    return { component, props };
  }

  function mountSlots(target) {
    const mounted = [];

    for (const slot of slots) {
      const el = target.querySelector('[data-ox-slot="' + slot.id + '"]');
      if (!el) continue;
      const slotContent = slot.content ?? el.innerHTML;
      const entry = renderSlot(slot, slotContent);
      if (!entry) continue;
      const instance = mount(entry.component, { target: el, props: entry.props });
      mounted.push(instance);
    }

    return () => {
      for (const instance of mounted) {
        unmount(instance);
      }
    };
  }

  onMount(() => {
    if (!container) return;
    return mountSlots(container);
  });
</script>

<div class="ox-content" bind:this={container}>
  {@html rawHtml}
</div>

<style>
  .ox-content {
    line-height: 1.6;
  }
</style>
`;
}
