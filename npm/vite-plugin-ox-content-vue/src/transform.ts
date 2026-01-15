/**
 * Markdown to Vue SFC transformation.
 */

import * as path from 'path';
import { transformMarkdown as baseTransformMarkdown } from 'vite-plugin-ox-content';
import type { ResolvedVueOptions, VueTransformResult, ComponentSlot } from './types';

// Regex to match Vue-like component tags in Markdown
const COMPONENT_REGEX = /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)\s*(?:\/>|>([\s\S]*?)<\/\1>)/g;

// Regex to parse component props
const PROP_REGEX = /(?::|v-bind:)?([a-zA-Z0-9-]+)(?:=(?:"([^"]*)"|'([^']*)'|{([^}]*)}|\[([^\]]*)\]))?/g;

const SLOT_MARKER_PREFIX = 'OXCONTENT-SLOT-';
const SLOT_MARKER_SUFFIX = '-PLACEHOLDER';

interface Range {
  start: number;
  end: number;
}

/**
 * Options for transformMarkdownWithVue.
 */
interface TransformOptions extends Omit<ResolvedVueOptions, 'components'> {
  components: Map<string, string>;
  root?: string;
}

/**
 * Transforms Markdown content with Vue component support.
 */
export async function transformMarkdownWithVue(
  code: string,
  id: string,
  options: TransformOptions
): Promise<VueTransformResult> {
  const { components } = options;
  const usedComponents: string[] = [];
  const slots: ComponentSlot[] = [];
  let slotIndex = 0;

  // Extract frontmatter
  const { content: markdownContent, frontmatter } = extractFrontmatter(code);

  // Find and extract component usages
  const fenceRanges = collectFenceRanges(markdownContent);
  let processedContent = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  COMPONENT_REGEX.lastIndex = 0;
  while ((match = COMPONENT_REGEX.exec(markdownContent)) !== null) {
    const [fullMatch, componentName, propsString, rawSlotContent] = match;
    const matchStart = match.index;
    const matchEnd = matchStart + fullMatch.length;

    // Check if component is registered
    if (!components.has(componentName) || isInRanges(matchStart, matchEnd, fenceRanges)) {
      processedContent += markdownContent.slice(lastIndex, matchEnd);
      lastIndex = matchEnd;
      continue;
    }

    if (!usedComponents.includes(componentName)) {
      usedComponents.push(componentName);
    }

    // Parse props
    const props = parseProps(propsString);

    // Create slot placeholder
    const slotId = `__ox_slot_${slotIndex++}__`;
    const slotContent =
      typeof rawSlotContent === 'string' ? rawSlotContent.trim() : undefined;
    slots.push({
      name: componentName,
      props,
      position: matchStart,
      id: slotId,
      content: slotContent,
    });

    // Replace component with slot marker text
    processedContent +=
      markdownContent.slice(lastIndex, matchStart) + createSlotMarker(slotId);
    lastIndex = matchEnd;
  }
  processedContent += markdownContent.slice(lastIndex);

  // Transform Markdown to HTML using ox-content
  const transformed = await baseTransformMarkdown(processedContent, id, {
    srcDir: options.srcDir,
    outDir: options.outDir,
    base: options.base,
    ssg: { enabled: false, extension: '.html', clean: false, bare: false, generateOgImage: false },
    gfm: options.gfm,
    frontmatter: false, // Already extracted
    toc: options.toc,
    tocMaxDepth: options.tocMaxDepth,
    footnotes: true,
    tables: true,
    taskLists: true,
    strikethrough: true,
    highlight: false,
    highlightTheme: 'github-dark',
    mermaid: false,
    ogImage: false,
    ogImageOptions: {},
    transformers: [],
    docs: false,
    search: { enabled: false, limit: 10, prefix: true, placeholder: 'Search...', hotkey: 'k' },
  });

  // Generate Vue SFC code
  const htmlWithSlots = injectSlotMarkers(transformed.html, slots);
  const sfcCode = generateVueSFC(
    htmlWithSlots,
    usedComponents,
    slots,
    frontmatter,
    options,
    id
  );

  return {
    code: sfcCode,
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
  let fenceChar = '';
  let fenceLength = 0;
  let fenceStart = 0;
  let pos = 0;

  while (pos < content.length) {
    const lineEnd = content.indexOf('\n', pos);
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
        fenceChar = '';
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
    output = output.replaceAll(
      `<p>${marker}</p>`,
      `<div data-ox-slot="${slot.id}"></div>`
    );
    output = output.replaceAll(
      marker,
      `<span data-ox-slot="${slot.id}"></span>`
    );
  }

  return output;
}

/**
 * Extracts frontmatter from Markdown content.
 */
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

  // Simple YAML-like parsing
  for (const line of frontmatterStr.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();

      // Try to parse as JSON for complex values
      try {
        value = JSON.parse(value as string);
      } catch {
        // Keep as string if not valid JSON
        // Remove quotes if present
        if (
          typeof value === 'string' &&
          ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")))
        ) {
          value = value.slice(1, -1);
        }
      }

      frontmatter[key] = value;
    }
  }

  return {
    content: content.slice(match[0].length),
    frontmatter,
  };
}

/**
 * Parses component props from a string.
 */
function parseProps(propsString: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  if (!propsString) return props;

  let match: RegExpExecArray | null;
  while ((match = PROP_REGEX.exec(propsString)) !== null) {
    const [, name, doubleQuoted, singleQuoted, braceValue, bracketValue] = match;

    if (name) {
      if (doubleQuoted !== undefined) {
        props[name] = doubleQuoted;
      } else if (singleQuoted !== undefined) {
        props[name] = singleQuoted;
      } else if (braceValue !== undefined) {
        // Try to parse as JSON
        try {
          props[name] = JSON.parse(`{${braceValue}}`);
        } catch {
          props[name] = braceValue;
        }
      } else if (bracketValue !== undefined) {
        try {
          props[name] = JSON.parse(`[${bracketValue}]`);
        } catch {
          props[name] = bracketValue;
        }
      } else {
        // Boolean prop
        props[name] = true;
      }
    }
  }

  return props;
}

/**
 * Generates a Vue component as JavaScript module from the processed Markdown.
 */
function generateVueSFC(
  content: string,
  usedComponents: string[],
  slots: ComponentSlot[],
  frontmatter: Record<string, unknown>,
  options: TransformOptions,
  id: string
): string {
  const mdDir = path.dirname(id);
  const root = options.root || process.cwd();

  const componentImports = usedComponents
    .map((name) => {
      const componentPath = options.components.get(name);
      if (!componentPath) return '';
      // Convert relative-to-root path to relative-to-md-file path
      const absolutePath = path.resolve(root, componentPath.replace(/^\.\//, ''));
      const relativePath = path.relative(mdDir, absolutePath).replace(/\\/g, '/');
      // Ensure the path starts with ./ or ../
      const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      return `import ${name} from '${importPath}';`;
    })
    .filter(Boolean)
    .join('\n');

  const componentMap = usedComponents.map((name) => `  ${name},`).join('\n');

  return `
import { h, ref, onMounted, onBeforeUnmount, defineComponent, render } from 'vue';
${componentImports}

export const frontmatter = ${JSON.stringify(frontmatter)};

const rawHtml = ${JSON.stringify(content)};
const slots = ${JSON.stringify(slots)};
const components = {
${componentMap}
};

function renderSlot(slot, slotContent) {
  const component = components[slot.name];
  if (!component) return null;
  const children = slotContent
    ? { default: () => h('div', { innerHTML: slotContent }) }
    : undefined;
  return h(component, slot.props, children);
}

function mountSlots(container) {
  const mountedTargets = [];

  for (const slot of slots) {
    const target = container.querySelector('[data-ox-slot="' + slot.id + '"]');
    if (!target) continue;
    const slotContent = slot.content ?? target.innerHTML;
    const vnode = renderSlot(slot, slotContent);
    if (vnode) {
      render(vnode, target);
      mountedTargets.push(target);
    }
  }

  return () => {
    for (const target of mountedTargets) {
      render(null, target);
    }
  };
}

export default defineComponent({
  name: 'MarkdownContent',
  setup(_, { expose }) {
    const container = ref(null);
    let cleanup;

    onMounted(() => {
      if (container.value) {
        cleanup = mountSlots(container.value);
      }
    });

    onBeforeUnmount(() => {
      if (cleanup) cleanup();
    });

    expose({ frontmatter });

    return () =>
      h('div', {
        class: 'ox-content',
        ref: container,
        innerHTML: rawHtml,
      });
  },
});
`;
}
