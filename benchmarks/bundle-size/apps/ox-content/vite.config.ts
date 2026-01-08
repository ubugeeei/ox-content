import { defineConfig } from "vite";
import { oxContent } from "vite-plugin-ox-content";

export default defineConfig({
  plugins: [
    oxContent({
      srcDir: "../../content",
    }),
  ],
  build: {
    outDir: "dist",
    minify: true,
  },
});
