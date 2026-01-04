import type { EnvironmentOptions } from 'vite';
import type { ResolvedSvelteOptions } from './types';

export function createSvelteMarkdownEnvironment(
  mode: 'ssr' | 'client',
  options: ResolvedSvelteOptions
): EnvironmentOptions {
  const isSSR = mode === 'ssr';

  return {
    build: {
      outDir: isSSR
        ? `${options.outDir}/.ox-content/ssr`
        : `${options.outDir}/.ox-content/client`,
      ssr: isSSR,
      rollupOptions: {
        output: {
          format: 'esm',
          entryFileNames: isSSR ? '[name].js' : '[name].[hash].js',
        },
      },
      ...(isSSR && { target: 'node18', minify: false }),
    },
    resolve: {
      conditions: isSSR ? ['node', 'import'] : ['browser', 'import'],
    },
    optimizeDeps: {
      include: isSSR ? [] : ['svelte'],
      exclude: ['vite-plugin-ox-content', 'vite-plugin-ox-content-svelte'],
    },
  };
}
