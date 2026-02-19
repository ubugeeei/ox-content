import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { oxContent } from "@ox-content/vite-plugin"
import { oxContentVue } from "@ox-content/vite-plugin-vue"

/**
 * Vite configuration for the Source Documentation Generator example.
 *
 * This example demonstrates dogfooding - using ox-content's own tools
 * to generate documentation for the example source files, with Vue
 * components embedded for interactive documentation.
 */
export default defineConfig({
  plugins: [
    vue(),

    // Base ox-content plugin with docs generation enabled (builtin)
    oxContent({
      srcDir: "docs",
      docs: {
        enabled: true,
        src: ["./src"],
        out: "docs/api",
        include: ["**/*.ts"],
        exclude: ["**/*.test.*", "node_modules"],
        format: "markdown",
        toc: true,
        groupBy: "file",
      },
    }),

    // Vue integration for embedding components in generated docs
    // Using glob pattern to auto-discover components
    oxContentVue({
      srcDir: "docs",
      components: "./src/components/*.vue",
    }),
  ],
})
