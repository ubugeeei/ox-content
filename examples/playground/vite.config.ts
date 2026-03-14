import { defineConfig } from "vite-plus";

export default defineConfig({
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
});
