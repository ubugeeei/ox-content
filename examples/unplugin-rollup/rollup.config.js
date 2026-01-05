import oxContent from 'unplugin-ox-content/rollup';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
  },
  plugins: [
    oxContent({
      gfm: true,
      toc: true,
    }),
    typescript(),
  ],
};
