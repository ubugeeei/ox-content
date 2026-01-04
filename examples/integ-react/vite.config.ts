import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { oxContentReact } from 'vite-plugin-ox-content-react';

export default defineConfig({
  plugins: [
    react(),
    oxContentReact({
      srcDir: 'docs',
      components: {
        Counter: './src/components/Counter.tsx',
        Alert: './src/components/Alert.tsx',
      },
    }),
  ],
});
