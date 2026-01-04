/**
 * Vite Plugin for Ox Content React Integration
 *
 * Uses Vite's Environment API to enable embedding React components in Markdown.
 */

import type { Plugin, PluginOption, Environment } from 'vite';
import { oxContent, type OxContentOptions } from 'vite-plugin-ox-content';
import { transformMarkdownWithReact } from './transform';
import { createReactMarkdownEnvironment } from './environment';
import type { ReactIntegrationOptions, ResolvedReactOptions } from './types';

export type { ReactIntegrationOptions } from './types';

/**
 * Creates the Ox Content React integration plugin.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import react from '@vitejs/plugin-react';
 * import { oxContentReact } from 'vite-plugin-ox-content-react';
 *
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     oxContentReact({
 *       srcDir: 'docs',
 *       components: {
 *         Counter: './src/components/Counter.tsx',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export function oxContentReact(options: ReactIntegrationOptions = {}): PluginOption[] {
  const resolved = resolveReactOptions(options);
  const componentMap = new Map(Object.entries(resolved.components));

  const reactTransformPlugin: Plugin = {
    name: 'ox-content:react-transform',
    enforce: 'pre',

    async transform(code, id) {
      if (!id.endsWith('.md')) {
        return null;
      }

      const result = await transformMarkdownWithReact(code, id, {
        components: componentMap,
        ...resolved,
      });

      return {
        code: result.code,
        map: result.map,
      };
    },
  };

  const reactEnvironmentPlugin: Plugin = {
    name: 'ox-content:react-environment',

    config() {
      return {
        environments: {
          'ox-content-ssr': createReactMarkdownEnvironment('ssr', resolved),
          'ox-content-client': createReactMarkdownEnvironment('client', resolved),
        },
      };
    },

    resolveId(id) {
      if (id === 'virtual:ox-content-react/runtime') {
        return '\0virtual:ox-content-react/runtime';
      }
      if (id === 'virtual:ox-content-react/components') {
        return '\0virtual:ox-content-react/components';
      }
      return null;
    },

    load(id) {
      if (id === '\0virtual:ox-content-react/runtime') {
        return generateRuntimeModule();
      }
      if (id === '\0virtual:ox-content-react/components') {
        return generateComponentsModule(componentMap);
      }
      return null;
    },

    applyToEnvironment(environment: Environment) {
      return ['ox-content-ssr', 'ox-content-client', 'client', 'ssr'].includes(
        environment.name
      );
    },
  };

  const reactHmrPlugin: Plugin = {
    name: 'ox-content:react-hmr',
    apply: 'serve',

    handleHotUpdate({ file, server, modules }) {
      const isComponent = Array.from(componentMap.values()).some((path) =>
        file.endsWith(path.replace(/^\.\//, ''))
      );

      if (isComponent) {
        const mdModules = Array.from(
          server.moduleGraph.idToModuleMap.values()
        ).filter((mod) => mod.file?.endsWith('.md'));

        if (mdModules.length > 0) {
          server.ws.send({
            type: 'custom',
            event: 'ox-content:react-update',
            data: { file },
          });
          return [...modules, ...mdModules];
        }
      }

      return modules;
    },
  };

  const basePlugins = oxContent(options);
  const environmentPlugin = basePlugins.find((p) => p.name === 'ox-content:environment');

  return [
    reactTransformPlugin,
    reactEnvironmentPlugin,
    reactHmrPlugin,
    ...(environmentPlugin ? [environmentPlugin] : []),
  ];
}

function resolveReactOptions(options: ReactIntegrationOptions): ResolvedReactOptions {
  return {
    srcDir: options.srcDir ?? 'docs',
    outDir: options.outDir ?? 'dist',
    base: options.base ?? '/',
    gfm: options.gfm ?? true,
    frontmatter: options.frontmatter ?? true,
    toc: options.toc ?? true,
    tocMaxDepth: options.tocMaxDepth ?? 3,
    components: options.components ?? {},
    jsxRuntime: options.jsxRuntime ?? 'automatic',
  };
}

function generateRuntimeModule(): string {
  return `
import React, { useState, useEffect } from 'react';

export function OxContentRenderer({ content, components = {} }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!content) return null;

  const { html, frontmatter, slots } = content;

  if (!mounted) {
    return React.createElement('div', {
      className: 'ox-content',
      dangerouslySetInnerHTML: { __html: html },
    });
  }

  return React.createElement('div', { className: 'ox-content' },
    slots.map((slot) => {
      const Component = components[slot.name];
      return Component
        ? React.createElement(Component, { key: slot.id, ...slot.props })
        : null;
    })
  );
}

export function useOxContent() {
  return { OxContentRenderer };
}
`;
}

function generateComponentsModule(componentMap: Map<string, string>): string {
  const imports: string[] = [];
  const exports: string[] = [];

  componentMap.forEach((path, name) => {
    imports.push(`import ${name} from '${path}';`);
    exports.push(`  ${name},`);
  });

  return `
${imports.join('\n')}

export const components = {
${exports.join('\n')}
};

export default components;
`;
}

export { oxContent } from 'vite-plugin-ox-content';
