/**
 * Vite Plugin for Ox Content Vue Integration
 *
 * Uses Vite's Environment API to enable embedding Vue components in Markdown.
 * Provides SSR and client environments for proper hydration.
 */

import type { Plugin, PluginOption, Environment, DevEnvironment, BuildEnvironment } from 'vite';
import { oxContent, type OxContentOptions } from 'vite-plugin-ox-content';
import { transformMarkdownWithVue } from './transform';
import { createVueMarkdownEnvironment } from './environment';
import type { VueIntegrationOptions, ResolvedVueOptions } from './types';

export type { VueIntegrationOptions } from './types';

/**
 * Creates the Ox Content Vue integration plugin with Environment API support.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import vue from '@vitejs/plugin-vue';
 * import { oxContentVue } from 'vite-plugin-ox-content-vue';
 *
 * export default defineConfig({
 *   plugins: [
 *     vue(),
 *     oxContentVue({
 *       srcDir: 'docs',
 *       components: {
 *         Counter: './src/components/Counter.vue',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export function oxContentVue(options: VueIntegrationOptions = {}): PluginOption[] {
  const resolved = resolveVueOptions(options);
  const componentMap = new Map(Object.entries(resolved.components));

  // Main Vue transformation plugin
  const vueTransformPlugin: Plugin = {
    name: 'ox-content:vue-transform',
    enforce: 'pre',

    async transform(code, id) {
      if (!id.endsWith('.md')) {
        return null;
      }

      const result = await transformMarkdownWithVue(code, id, {
        components: componentMap,
        ...resolved,
      });

      return {
        code: result.code,
        map: result.map,
      };
    },
  };

  // Environment API plugin for Vue-specific SSR/client handling
  const vueEnvironmentPlugin: Plugin = {
    name: 'ox-content:vue-environment',

    config() {
      return {
        environments: {
          // SSR environment for Vue component rendering
          'ox-content-ssr': createVueMarkdownEnvironment('ssr', resolved),
          // Client environment for hydration
          'ox-content-client': createVueMarkdownEnvironment('client', resolved),
        },
      };
    },

    // Environment-specific module resolution
    resolveId: {
      order: 'pre',
      async handler(id, importer, options) {
        // Handle virtual modules for Vue markdown runtime
        if (id === 'virtual:ox-content-vue/runtime') {
          return '\0virtual:ox-content-vue/runtime';
        }

        if (id === 'virtual:ox-content-vue/components') {
          return '\0virtual:ox-content-vue/components';
        }

        return null;
      },
    },

    load: {
      order: 'pre',
      async handler(id) {
        if (id === '\0virtual:ox-content-vue/runtime') {
          return generateRuntimeModule(resolved);
        }

        if (id === '\0virtual:ox-content-vue/components') {
          return generateComponentsModule(componentMap);
        }

        return null;
      },
    },

    // Per-environment build hooks
    applyToEnvironment(environment: Environment) {
      return (
        environment.name === 'ox-content-ssr' ||
        environment.name === 'ox-content-client' ||
        environment.name === 'client' ||
        environment.name === 'ssr'
      );
    },
  };

  // HMR plugin for component updates
  const vueHmrPlugin: Plugin = {
    name: 'ox-content:vue-hmr',
    apply: 'serve',

    handleHotUpdate({ file, server, modules }) {
      // Check if updated file is a registered component
      const isComponent = Array.from(componentMap.values()).some((path) =>
        file.endsWith(path.replace(/^\.\//, ''))
      );

      if (isComponent) {
        // Invalidate all Markdown modules that might use this component
        const mdModules = Array.from(
          server.moduleGraph.idToModuleMap.values()
        ).filter((mod) => mod.file?.endsWith('.md'));

        if (mdModules.length > 0) {
          server.ws.send({
            type: 'custom',
            event: 'ox-content:vue-update',
            data: { file },
          });
          return [...modules, ...mdModules];
        }
      }

      return modules;
    },
  };

  // Get base ox-content plugins (environment plugin only)
  const basePlugins = oxContent(options);
  const environmentPlugin = basePlugins.find((p) => p.name === 'ox-content:environment');

  return [
    vueTransformPlugin,
    vueEnvironmentPlugin,
    vueHmrPlugin,
    ...(environmentPlugin ? [environmentPlugin] : []),
  ];
}

/**
 * Resolves Vue integration options with defaults.
 */
function resolveVueOptions(options: VueIntegrationOptions): ResolvedVueOptions {
  return {
    srcDir: options.srcDir ?? 'docs',
    outDir: options.outDir ?? 'dist',
    base: options.base ?? '/',
    gfm: options.gfm ?? true,
    frontmatter: options.frontmatter ?? true,
    toc: options.toc ?? true,
    tocMaxDepth: options.tocMaxDepth ?? 3,
    components: options.components ?? {},
    // Vue-specific options
    reactivityTransform: options.reactivityTransform ?? false,
    customBlocks: options.customBlocks ?? true,
  };
}

/**
 * Generates the runtime module for Vue markdown rendering.
 */
function generateRuntimeModule(options: ResolvedVueOptions): string {
  return `
import { h, defineComponent, ref, onMounted } from 'vue';

export const OxContentRenderer = defineComponent({
  name: 'OxContentRenderer',
  props: {
    content: { type: Object, required: true },
    components: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const mounted = ref(false);

    onMounted(() => {
      mounted.value = true;
    });

    return () => {
      if (!props.content) return null;

      const { html, frontmatter, toc, slots } = props.content;

      // Render static HTML with component slots
      return h('div', {
        class: 'ox-content',
        innerHTML: mounted.value ? undefined : html,
      }, mounted.value ? renderWithSlots(html, slots, props.components) : undefined);
    };
  },
});

function renderWithSlots(html, slots, components) {
  // Parse and render slots with Vue components
  // This is a simplified version - full implementation would use proper parsing
  return h('div', { innerHTML: html });
}

export function useOxContent() {
  return {
    OxContentRenderer,
  };
}
`;
}

/**
 * Generates the components registration module.
 */
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

// Re-export
export { oxContent } from 'vite-plugin-ox-content';
