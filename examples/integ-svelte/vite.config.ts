import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { oxContentSvelte } from 'vite-plugin-ox-content-svelte';

export default defineConfig({
  plugins: [
    svelte(),
    oxContentSvelte({
      srcDir: 'docs',
      components: {
        Counter: './src/components/Counter.svelte',
        Alert: './src/components/Alert.svelte',
      },
    }),
  ],
});
