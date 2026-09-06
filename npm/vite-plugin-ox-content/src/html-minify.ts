const HYDRATION_COMMENT = /^\s*[!/$#]/u;

const HTML_MINIFY_OPTIONS = {
  caseSensitive: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  ignoreCustomComments: [HYDRATION_COMMENT],
  minifyCSS: minifyCss,
  minifyJS: minifyJs,
  removeComments: true,
  removeRedundantAttributes: true,
  useShortDoctype: true,
} as const;

let cleanCssModule: Promise<typeof import("clean-css")> | undefined;
let htmlMinifierModule: Promise<typeof import("html-minifier-terser")> | undefined;
let terserModule: Promise<typeof import("terser")> | undefined;

export async function minifyHtmlOutput(html: string): Promise<string> {
  const { minify } = await loadHtmlMinifier();
  return minify(html, HTML_MINIFY_OPTIONS);
}

async function minifyJs(text: string, inline?: boolean): Promise<string> {
  const { minify: minifyJavaScript } = await loadTerser();
  const result = await minifyJavaScript(text, {
    parse: { bare_returns: inline === true },
  });
  return (result.code ?? "").replace(/;$/u, "");
}

async function minifyCss(text: string, type?: string): Promise<string> {
  const { default: CleanCss } = await loadCleanCss();
  const output = new CleanCss().minify(wrapCss(text, type));
  if (output.errors.length > 0) {
    throw new Error(`[ox-content] HTML CSS minification failed: ${output.errors.join("; ")}`);
  }
  return unwrapCss(output.styles, type);
}

function wrapCss(text: string, type?: string): string {
  if (type === "inline") {
    return `*{${text}}`;
  }
  if (type === "media") {
    return `@media ${text}{a{top:0}}`;
  }
  return text;
}

function unwrapCss(text: string, type?: string): string {
  const pattern =
    type === "inline"
      ? /^\*\{(?<css>[\s\S]*)\}$/u
      : type === "media"
        ? /^@media (?<css>[\s\S]*?)\s*\{[\s\S]*\}$/u
        : undefined;
  return pattern ? (text.match(pattern)?.groups?.css ?? text) : text;
}

function loadCleanCss(): Promise<typeof import("clean-css")> {
  return (cleanCssModule ??= import("clean-css"));
}

function loadHtmlMinifier(): Promise<typeof import("html-minifier-terser")> {
  return (htmlMinifierModule ??= import("html-minifier-terser"));
}

function loadTerser(): Promise<typeof import("terser")> {
  return (terserModule ??= import("terser"));
}
