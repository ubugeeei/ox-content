/**
 * Vite Plugin for Ox Content Svelte Integration
 *
 * Uses Vite's Environment API to enable embedding Svelte components in Markdown.
 */

import type { Plugin, PluginOption, Environment } from 'vite';
import { oxContent, type OxContentOptions } from 'vite-plugin-ox-content';
import { transformMarkdownWithSvelte } from './transform';
import { createSvelteMarkdownEnvironment } from './environment';
import type { SvelteIntegrationOptions, ResolvedSvelteOptions } from './types';

export type { SvelteIntegrationOptions } from './types';

/**
 * Creates the Ox Content Svelte integration plugin.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import { svelte } from '@sveltejs/vite-plugin-svelte';
 * import { oxContentSvelte } from 'vite-plugin-ox-content-svelte';
 *
 * export default defineConfig({
 *   plugins: [
 *     svelte(),
 *     oxContentSvelte({
 *       srcDir: 'docs',
 *       components: {
 *         Counter: './src/components/Counter.svelte',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export function oxContentSvelte(options: SvelteIntegrationOptions = {}): PluginOption[] {
  const resolved = resolveSvelteOptions(options);
  const componentMap = new Map(Object.entries(resolved.components));

  const svelteTransformPlugin: Plugin = {
    name: 'ox-content:svelte-transform',
    enforce: 'pre',

    async transform(code, id) {
      if (!id.endsWith('.md')) {
        return null;
      }

      const result = await transformMarkdownWithSvelte(code, id, {
        components: componentMap,
        ...resolved,
      });

      return {
        code: result.code,
        map: result.map,
      };
    },
  };

  const svelteEnvironmentPlugin: Plugin = {
    name: 'ox-content:svelte-environment',

    config() {
      return {
        environments: {
          'ox-content-ssr': createSvelteMarkdownEnvironment('ssr', resolved),
          'ox-content-client': createSvelteMarkdownEnvironment('client', resolved),
        },
      };
    },

    resolveId(id) {
      if (id === 'virtual:ox-content-svelte/runtime') {
        return '\0virtual:ox-content-svelte/runtime';
      }
      if (id === 'virtual:ox-content-svelte/components') {
        return '\0virtual:ox-content-svelte/components';
      }
      return null;
    },

    load(id) {
      if (id === '\0virtual:ox-content-svelte/runtime') {
        return generateRuntimeModule();
      }
      if (id === '\0virtual:ox-content-svelte/components') {
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

  const svelteHmrPlugin: Plugin = {
    name: 'ox-content:svelte-hmr',
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
            event: 'ox-content:svelte-update',
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
    svelteTransformPlugin,
    svelteEnvironmentPlugin,
    svelteHmrPlugin,
    ...(environmentPlugin ? [environmentPlugin] : []),
  ];
}

function resolveSvelteOptions(options: SvelteIntegrationOptions): ResolvedSvelteOptions {
  return {
    srcDir: options.srcDir ?? 'docs',
    outDir: options.outDir ?? 'dist',
    base: options.base ?? '/',
    gfm: options.gfm ?? true,
    frontmatter: options.frontmatter ?? true,
    toc: options.toc ?? true,
    tocMaxDepth: options.tocMaxDepth ?? 3,
    components: options.components ?? {},
    runes: options.runes ?? true,
  };
}

function generateRuntimeModule(): string {
  return `
// Svelte 5 runtime for ox-content
export { mount, unmount } from 'svelte';
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
