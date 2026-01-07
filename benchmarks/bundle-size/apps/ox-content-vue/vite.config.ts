import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { oxContent } from "vite-plugin-ox-content";
import { oxContentVue } from "vite-plugin-ox-content-vue";

export default defineConfig({
  plugins: [
    vue(),
    oxContent({
      srcDir: "../../content",
    }),
    oxContentVue(),
  ],
  build: {
    outDir: "dist",
    minify: true,
  },
});
