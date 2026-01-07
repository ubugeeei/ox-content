import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { oxContent } from 'vite-plugin-ox-content';

/**
 * Ox Content Documentation Site
 *
 * Dogfooding: Using ox-content to build ox-content's own documentation.
 * Uses the base oxContent plugin which transforms .md to JavaScript modules.
 */
export default defineConfig({
  // Site base path (for GitHub Pages)
  base: '/ox-content/',

  plugins: [
    vue(),

    oxContent({
      srcDir: '.',
      outDir: 'dist/docs',
      base: '/ox-content/',

      // SSG options
      ssg: {
        siteName: 'Ox Content',
        ogImage: 'https://ubugeeei.github.io/ox-content/og-image.png',
      },

      // Enable syntax highlighting with Shiki
      highlight: true,
      highlightTheme: 'vitesse-dark',

      // Mermaid diagrams disabled (using SVG instead)
      mermaid: false,

      // API documentation generation (like cargo doc)
      docs: {
        enabled: true,
        src: ['../packages/vite-plugin-ox-content/src'],
        out: 'api',
        include: ['**/*.ts'],
        exclude: ['**/*.test.*'],
        toc: true,
        groupBy: 'file',
        githubUrl: 'https://github.com/ubugeeei/ox-content',
        generateNav: true,
      },
    }),
  ],

  build: {
    outDir: 'dist/docs',
  },
});
