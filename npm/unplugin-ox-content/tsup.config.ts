import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/vite.ts',
    'src/webpack.ts',
    'src/rollup.ts',
    'src/esbuild.ts',
    'src/rspack.ts',
  ],
  format: ['esm'],
  dts: false,
  clean: true,
  splitting: false,
  external: ['vite', 'webpack', 'rollup', 'esbuild', '@ox-content/napi', 'unplugin'],
});
