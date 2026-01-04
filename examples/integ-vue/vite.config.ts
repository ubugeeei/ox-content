import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { oxContentVue } from 'vite-plugin-ox-content-vue';

export default defineConfig({
  plugins: [
    vue(),
    oxContentVue({
      srcDir: 'docs',
      components: {
        // Register components to use in Markdown
        Counter: './src/components/Counter.vue',
        Alert: './src/components/Alert.vue',
        CodeDemo: './src/components/CodeDemo.vue',
      },
    }),
  ],
});
