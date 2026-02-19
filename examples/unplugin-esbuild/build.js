import * as esbuild from "esbuild"
import oxContent from "@ox-content/unplugin/esbuild"

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/bundle.js",
  format: "esm",
  platform: "node",
  plugins: [
    oxContent({
      gfm: true,
      toc: true,
    }),
  ],
})

console.log("Build complete!")
