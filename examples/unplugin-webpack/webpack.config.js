import path from "path"
import { fileURLToPath } from "url"
import oxContent from "unplugin-ox-content/webpack"
import { full as emoji } from "markdown-it-emoji"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".ts", ".js", ".md"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    oxContent({
      gfm: true,
      toc: true,
      // Example: Using markdown-it plugins
      plugin: {
        markdownIt: [emoji],
      },
    }),
  ],
}
