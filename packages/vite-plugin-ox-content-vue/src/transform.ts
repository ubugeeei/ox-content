/**
 * Markdown to Vue SFC transformation.
 */

import type { ResolvedVueOptions, VueTransformResult, ComponentSlot } from './types';

// Regex to match Vue-like component tags in Markdown
const COMPONENT_REGEX = /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)\s*\/?>(?:<\/\1>)?/g;

// Regex to parse component props
const PROP_REGEX = /(?::|v-bind:)?([a-zA-Z0-9-]+)(?:=(?:"([^"]*)"|'([^']*)'|{([^}]*)}|\[([^\]]*)\]))?/g;

/**
 * Transforms Markdown content with Vue component support.
 */
export async function transformMarkdownWithVue(
  code: string,
  id: string,
  options: ResolvedVueOptions & { components: Map<string, string> }
): Promise<VueTransformResult> {
  const { components } = options;
  const usedComponents: string[] = [];
  const slots: ComponentSlot[] = [];
  let slotIndex = 0;

  // Extract frontmatter
  const { content: markdownContent, frontmatter } = extractFrontmatter(code);

  // Find and extract component usages
  let processedContent = markdownContent;
  let match: RegExpExecArray | null;

  while ((match = COMPONENT_REGEX.exec(markdownContent)) !== null) {
    const [fullMatch, componentName, propsString] = match;

    // Check if component is registered
    if (components.has(componentName)) {
      if (!usedComponents.includes(componentName)) {
        usedComponents.push(componentName);
      }

      // Parse props
      const props = parseProps(propsString);

      // Create slot placeholder
      const slotId = `__ox_slot_${slotIndex++}__`;
      slots.push({
        name: componentName,
        props,
        position: match.index,
        id: slotId,
      });

      // Replace component with slot marker
      processedContent = processedContent.replace(
        fullMatch,
        `<div data-ox-slot="${slotId}"></div>`
      );
    }
  }

  // Generate Vue SFC code
  const sfcCode = generateVueSFC(
    processedContent,
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
 * Generates a Vue SFC from the processed Markdown.
 */
function generateVueSFC(
  content: string,
  usedComponents: string[],
  slots: ComponentSlot[],
  frontmatter: Record<string, unknown>,
  options: ResolvedVueOptions & { components: Map<string, string> },
  id: string
): string {
  const componentImports = usedComponents
    .map((name) => {
      const path = options.components.get(name);
      return `import ${name} from '${path}';`;
    })
    .join('\n');

  const componentRegistrations = usedComponents.join(',\n    ');

  // Generate slot rendering logic
  const slotRenderCases = slots
    .map(
      (slot) => `
      case '${slot.id}':
        return h(${slot.name}, ${JSON.stringify(slot.props)});`
    )
    .join('');

  return `
<script setup lang="ts">
import { h, ref, onMounted, VNode } from 'vue';
${componentImports}

// Frontmatter
const frontmatter = ${JSON.stringify(frontmatter)};

// Component registry
const components = {
  ${componentRegistrations}
};

// Markdown content
const rawHtml = ${JSON.stringify(content)};

// Slots data
const slots = ${JSON.stringify(slots)};

// Mounted state for hydration
const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});

// Render slot component
function renderSlot(slotId: string): VNode | null {
  switch (slotId) {${slotRenderCases}
    default:
      return null;
  }
}

// Expose frontmatter and toc
defineExpose({
  frontmatter,
});
</script>

<template>
  <div class="ox-content" v-if="!mounted" v-html="rawHtml" />
  <div class="ox-content" v-else>
    <template v-for="slot in slots" :key="slot.id">
      <component :is="renderSlot(slot.id)" />
    </template>
  </div>
</template>
`;
}
