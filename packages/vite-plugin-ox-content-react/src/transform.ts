import type { ResolvedReactOptions, ReactTransformResult, ComponentSlot } from './types';

const COMPONENT_REGEX = /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)\s*\/?>(?:<\/\1>)?/g;
const PROP_REGEX = /([a-zA-Z0-9-]+)(?:=(?:"([^"]*)"|'([^']*)'|{([^}]*)}))?/g;

export async function transformMarkdownWithReact(
  code: string,
  id: string,
  options: ResolvedReactOptions & { components: Map<string, string> }
): Promise<ReactTransformResult> {
  const { components } = options;
  const usedComponents: string[] = [];
  const slots: ComponentSlot[] = [];
  let slotIndex = 0;

  const { content: markdownContent, frontmatter } = extractFrontmatter(code);

  let processedContent = markdownContent;
  let match: RegExpExecArray | null;

  while ((match = COMPONENT_REGEX.exec(markdownContent)) !== null) {
    const [fullMatch, componentName, propsString] = match;

    if (components.has(componentName)) {
      if (!usedComponents.includes(componentName)) {
        usedComponents.push(componentName);
      }

      const props = parseProps(propsString);
      const slotId = `__ox_slot_${slotIndex++}__`;

      slots.push({
        name: componentName,
        props,
        position: match.index,
        id: slotId,
      });

      processedContent = processedContent.replace(
        fullMatch,
        `<div data-ox-slot="${slotId}"></div>`
      );
    }
  }

  const jsxCode = generateReactModule(
    processedContent,
    usedComponents,
    slots,
    frontmatter,
    options
  );

  return {
    code: jsxCode,
    map: null,
    usedComponents,
    frontmatter,
  };
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

  for (const line of frontmatterStr.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();
      try {
        value = JSON.parse(value as string);
      } catch {
        if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
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

  let match: RegExpExecArray | null;
  while ((match = PROP_REGEX.exec(propsString)) !== null) {
    const [, name, doubleQuoted, singleQuoted, braceValue] = match;
    if (name) {
      if (doubleQuoted !== undefined) props[name] = doubleQuoted;
      else if (singleQuoted !== undefined) props[name] = singleQuoted;
      else if (braceValue !== undefined) {
        try { props[name] = JSON.parse(braceValue); }
        catch { props[name] = braceValue; }
      } else props[name] = true;
    }
  }
  return props;
}

function generateReactModule(
  content: string,
  usedComponents: string[],
  slots: ComponentSlot[],
  frontmatter: Record<string, unknown>,
  options: ResolvedReactOptions & { components: Map<string, string> }
): string {
  const imports = usedComponents
    .map((name) => `import ${name} from '${options.components.get(name)}';`)
    .join('\n');

  return `
import React, { useState, useEffect } from 'react';
${imports}

const frontmatter = ${JSON.stringify(frontmatter)};
const rawHtml = ${JSON.stringify(content)};
const slots = ${JSON.stringify(slots)};

const components = { ${usedComponents.join(', ')} };

export default function MarkdownContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="ox-content" dangerouslySetInnerHTML={{ __html: rawHtml }} />;
  }

  return (
    <div className="ox-content">
      {slots.map((slot) => {
        const Component = components[slot.name];
        return Component ? <Component key={slot.id} {...slot.props} /> : null;
      })}
    </div>
  );
}

export { frontmatter };
`;
}
