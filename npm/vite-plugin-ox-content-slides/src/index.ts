import * as fs from "node:fs/promises";
import * as path from "node:path";
import { glob } from "glob";
import type { Plugin } from "vite";
import type { LanguageRegistration, ThemeRegistration } from "@ox-content/vite-plugin";
import {
  transformMarkdown,
  resolveSsgOptions,
  resolveOgImageOptions,
  generateOgImages,
  type OgImageOptions,
  type ResolvedOgImageOptions,
  type ResolvedOptions,
  type ResolvedSsgOptions,
  type SsgOptions,
} from "@ox-content/vite-plugin";

export interface SlideThemeConfig {
  aspectRatio?: string;
  maxWidth?: string;
  maxHeight?: string;
  padding?: string;
  canvasBackground?: string;
  surfaceBackground?: string;
  surfaceBorder?: string;
  surfaceShadow?: string;
  presenterSidebarBackground?: string;
  fontSans?: string;
  fontMono?: string;
  colorText?: string;
  colorTextMuted?: string;
  colorPrimary?: string;
  colorBorder?: string;
}

export interface SlideSourceRenderResult {
  html: string;
  title?: string;
  description?: string;
  frontmatter?: Record<string, unknown>;
  notes?: string | string[];
}

export interface SlideSourceRendererContext {
  filePath: string;
  root: string;
  options: ResolvedSlidesPluginOptions;
}

export type SlideSourceRenderer = (
  source: string,
  context: SlideSourceRendererContext,
) => SlideSourceRenderResult | Promise<SlideSourceRenderResult>;

export interface OxContentSlidesOptions {
  srcDir?: string;
  outDir?: string;
  base?: string;
  routeBase?: string;
  presenter?: boolean;
  separator?: string;
  ssg?: SsgOptions | boolean;
  ogImageOptions?: OgImageOptions;
  theme?: SlideThemeConfig;
  extensions?: string[];
  renderers?: Record<string, SlideSourceRenderer>;
  gfm?: boolean;
  footnotes?: boolean;
  tables?: boolean;
  taskLists?: boolean;
  strikethrough?: boolean;
  highlight?: boolean;
  highlightTheme?: string | ThemeRegistration;
  highlightLangs?: LanguageRegistration[];
  mermaid?: boolean;
}

export interface ResolvedSlidesPluginOptions {
  srcDir: string;
  outDir: string;
  base: string;
  baseHref: string;
  routeBase: string;
  routePrefix: string;
  presenter: boolean;
  separator: string;
  extensions: string[];
  renderers: Record<string, SlideSourceRenderer>;
  ssg: ResolvedSsgOptions;
  ogImageOptions: ResolvedOgImageOptions;
  theme: SlideThemeConfig;
  napiTheme: NapiSlideTheme;
  markdown: ResolvedOptions;
  gfm: boolean;
  footnotes: boolean;
  tables: boolean;
  taskLists: boolean;
  strikethrough: boolean;
  highlight: boolean;
  highlightTheme: string | ThemeRegistration;
  highlightLangs: LanguageRegistration[];
  mermaid: boolean;
}

interface NapiSlideComments {
  content: string;
  notes: string[];
}

interface NapiSlideDeck {
  frontmatter: string;
  slides: Array<{ content: string; notes: string[] }>;
}

interface NapiModule {
  extractSlideComments(source: string): NapiSlideComments;
  parseMarkdownSlideDeck(source: string, separator?: string): NapiSlideDeck;
  generateSlideHtml(data: NapiSlideRenderData, theme?: NapiSlideTheme): string;
  generatePresenterHtml(data: NapiSlideRenderData, theme?: NapiSlideTheme): string;
}

interface NapiSlideTheme {
  aspectRatio?: string;
  maxWidth?: string;
  maxHeight?: string;
  padding?: string;
  canvasBackground?: string;
  surfaceBackground?: string;
  surfaceBorder?: string;
  surfaceShadow?: string;
  presenterSidebarBackground?: string;
  fontSans?: string;
  fontMono?: string;
  colorText?: string;
  colorTextMuted?: string;
  colorPrimary?: string;
  colorBorder?: string;
}

interface NapiSlideRenderData {
  deckTitle: string;
  slideTitle: string;
  slideDescription?: string;
  slideContentHtml: string;
  slideNotesHtml?: string;
  slideNumber: number;
  slideCount: number;
  homeHref: string;
  slideHref: string;
  presenterHref?: string;
  previousHref?: string;
  nextHref?: string;
  nextSlideHref?: string;
}

interface SlideFileEntry {
  filePath: string;
}

interface SlidePageData {
  title: string;
  description?: string;
  contentHtml: string;
  notesHtml?: string;
  notes: string[];
  frontmatter: Record<string, unknown>;
  sourcePath: string;
  slideNumber: number;
  slideCount: number;
  href: string;
  outputPath: string;
  presenterHref?: string;
  presenterOutputPath?: string;
}

interface SlideDeckData {
  slug: string;
  title: string;
  description?: string;
  href: string;
  outputPath: string;
  presenterHref?: string;
  presenterOutputPath?: string;
  slides: SlidePageData[];
}

interface SlideRouteData {
  deck: SlideDeckData;
  slide: SlidePageData;
  presenter: boolean;
}

interface SlideBuildArtifacts {
  routes: Map<string, SlideRouteData>;
}

const DEFAULT_EXTENSIONS = [".md", ".markdown", ".html"];
let napiModulePromise: Promise<NapiModule> | undefined;

async function loadNapiModule(): Promise<NapiModule> {
  napiModulePromise ??= import("@ox-content/napi").then(
    (module) => module as unknown as NapiModule,
  );
  return napiModulePromise;
}

function normalizeExtension(ext: string): string {
  return ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
}

function normalizeRouteSegment(value: string): string {
  return value
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/{2,}/g, "/");
}

function formatTitle(name: string): string {
  return name
    .replace(/[-_]([a-zA-Z0-9])/g, (_, char: string) => ` ${char.toUpperCase()}`)
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

function extractTitle(
  contentHtml: string,
  frontmatter: Record<string, unknown>,
  fallback: string,
): string {
  if (typeof frontmatter.title === "string" && frontmatter.title.trim()) {
    return frontmatter.title.trim();
  }

  const match = contentHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (match) {
    return match[1].replace(/<[^>]+>/g, "").trim();
  }

  return fallback;
}

function normalizeNotes(notes: string | string[] | undefined): string[] {
  if (!notes) return [];
  const values = Array.isArray(notes) ? notes : [notes];
  return values.map((note) => note.trim()).filter(Boolean);
}

function resolveOptions(options: OxContentSlidesOptions): ResolvedSlidesPluginOptions {
  const base = options.base ?? "/";
  const routeBase = normalizeRouteSegment(options.routeBase ?? "slides") || "slides";
  const resolved = {
    srcDir: options.srcDir ?? "slides",
    outDir: options.outDir ?? "dist",
    base,
    baseHref: base.endsWith("/") ? base : `${base}/`,
    routeBase,
    routePrefix: `/${routeBase}`,
    presenter: options.presenter ?? true,
    separator: options.separator ?? "---",
    extensions: [
      ...new Set([...(options.extensions ?? DEFAULT_EXTENSIONS)].map(normalizeExtension)),
    ],
    renderers: options.renderers ?? {},
    ssg: resolveSsgOptions(options.ssg ?? true),
    ogImageOptions: resolveOgImageOptions(options.ogImageOptions),
    theme: options.theme ?? {},
    napiTheme: toNapiTheme(options.theme ?? {}),
    markdown: {} as ResolvedOptions,
    gfm: options.gfm ?? true,
    footnotes: options.footnotes ?? true,
    tables: options.tables ?? true,
    taskLists: options.taskLists ?? true,
    strikethrough: options.strikethrough ?? true,
    highlight: options.highlight ?? false,
    highlightTheme: options.highlightTheme ?? "github-dark",
    highlightLangs: options.highlightLangs ?? [],
    mermaid: options.mermaid ?? false,
  } satisfies ResolvedSlidesPluginOptions;

  resolved.markdown = createMarkdownOptions(resolved);
  return resolved;
}

function createMarkdownOptions(options: ResolvedSlidesPluginOptions): ResolvedOptions {
  return {
    srcDir: options.srcDir,
    outDir: options.outDir,
    base: options.base,
    ssg: options.ssg,
    gfm: options.gfm,
    footnotes: options.footnotes,
    tables: options.tables,
    taskLists: options.taskLists,
    strikethrough: options.strikethrough,
    highlight: options.highlight,
    highlightTheme: options.highlightTheme,
    highlightLangs: options.highlightLangs,
    codeAnnotations: {
      enabled: false,
      notation: "attribute",
      metaKey: "annotate",
      defaultLineNumbers: false,
    },
    mermaid: options.mermaid,
    frontmatter: true,
    toc: true,
    tocMaxDepth: 3,
    ogImage: false,
    ogImageOptions: options.ogImageOptions,
    transformers: [],
    docs: false,
    search: {
      enabled: false,
      limit: 10,
      prefix: true,
      placeholder: "Search",
      hotkey: "k",
    },
    ogViewer: false,
    i18n: false,
  };
}

async function renderNotesHtml(
  notes: string[],
  sourcePath: string,
  markdownOptions: ResolvedOptions,
): Promise<string | undefined> {
  if (notes.length === 0) {
    return undefined;
  }

  const transformed = await transformMarkdown(notes.join("\n\n"), `${sourcePath}#notes.md`, markdownOptions);
  return transformed.html;
}

async function collectSlideFiles(
  options: ResolvedSlidesPluginOptions,
  root: string,
): Promise<SlideFileEntry[]> {
  const extensions = [
    ...new Set([...options.extensions, ...Object.keys(options.renderers).map(normalizeExtension)]),
  ];
  const slidesDir = path.resolve(root, options.srcDir);
  const pattern = path.join(
    slidesDir,
    `**/*.{${extensions.map((ext) => ext.replace(/^\./, "")).join(",")}}`,
  );
  const files = await glob(pattern, {
    nodir: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
  });

  return files.sort().map((filePath) => ({ filePath }));
}

function classifyDecks(
  entries: SlideFileEntry[],
  slidesDir: string,
): Map<string, SlideFileEntry[]> {
  const decks = new Map<string, SlideFileEntry[]>();
  const numericName = /^\d+$/;

  for (const entry of entries) {
    const ext = path.extname(entry.filePath);
    const basename = path.basename(entry.filePath, ext);
    const relativeDir = normalizeRouteSegment(
      path.relative(slidesDir, path.dirname(entry.filePath)),
    );

    if (numericName.test(basename)) {
      const items = decks.get(relativeDir) ?? [];
      items.push(entry);
      decks.set(relativeDir, items);
      continue;
    }

    const slug = normalizeRouteSegment(
      path.join(relativeDir, basename === "index" ? "" : basename),
    );
    decks.set(slug, [entry]);
  }

  return decks;
}

function getDeckHref(base: string, routeBase: string, slug: string, extension: string): string {
  const segments = [normalizeRouteSegment(base), normalizeRouteSegment(routeBase), slug]
    .filter(Boolean)
    .join("/");
  return `/${segments ? `${segments}/` : ""}index${extension}`.replace(/\/{2,}/g, "/");
}

function getSlideHref(
  base: string,
  routeBase: string,
  slug: string,
  slideNumber: number,
  extension: string,
): string {
  const segments = [
    normalizeRouteSegment(base),
    normalizeRouteSegment(routeBase),
    slug,
    String(slideNumber),
  ]
    .filter(Boolean)
    .join("/");
  return `/${segments}/index${extension}`.replace(/\/{2,}/g, "/");
}

function getPresenterHref(
  base: string,
  routeBase: string,
  slug: string,
  slideNumber: number,
  extension: string,
): string {
  const segments = [
    normalizeRouteSegment(base),
    normalizeRouteSegment(routeBase),
    slug,
    "presenter",
    String(slideNumber),
  ]
    .filter(Boolean)
    .join("/");
  return `/${segments}/index${extension}`.replace(/\/{2,}/g, "/");
}

function getDeckOutputPath(
  outDir: string,
  routeBase: string,
  slug: string,
  extension: string,
): string {
  return path.join(outDir, routeBase, slug, `index${extension}`);
}

function getSlideOutputPath(
  outDir: string,
  routeBase: string,
  slug: string,
  slideNumber: number,
  extension: string,
): string {
  return path.join(outDir, routeBase, slug, String(slideNumber), `index${extension}`);
}

function getPresenterOutputPath(
  outDir: string,
  routeBase: string,
  slug: string,
  slideNumber: number,
  extension: string,
): string {
  return path.join(outDir, routeBase, slug, "presenter", String(slideNumber), `index${extension}`);
}

function toNapiTheme(theme: SlideThemeConfig): NapiSlideTheme {
  return {
    aspectRatio: theme.aspectRatio,
    maxWidth: theme.maxWidth,
    maxHeight: theme.maxHeight,
    padding: theme.padding,
    canvasBackground: theme.canvasBackground,
    surfaceBackground: theme.surfaceBackground,
    surfaceBorder: theme.surfaceBorder,
    surfaceShadow: theme.surfaceShadow,
    presenterSidebarBackground: theme.presenterSidebarBackground,
    fontSans: theme.fontSans,
    fontMono: theme.fontMono,
    colorText: theme.colorText,
    colorTextMuted: theme.colorTextMuted,
    colorPrimary: theme.colorPrimary,
    colorBorder: theme.colorBorder,
  };
}

async function renderMarkdownSlide(
  source: string,
  sourcePath: string,
  notes: string[],
  deckFrontmatter: Record<string, unknown>,
  fallbackTitle: string,
  markdownOptions: ResolvedOptions,
): Promise<
  Pick<
    SlidePageData,
    "title" | "description" | "contentHtml" | "notesHtml" | "notes" | "frontmatter" | "sourcePath"
  >
> {
  const transformed = await transformMarkdown(source, sourcePath, markdownOptions);
  const frontmatter = {
    ...deckFrontmatter,
    ...transformed.frontmatter,
  };
  const title = extractTitle(transformed.html, frontmatter, fallbackTitle);
  const description =
    typeof frontmatter.description === "string" ? frontmatter.description : undefined;

  return {
    title,
    description,
    contentHtml: transformed.html,
    notesHtml: await renderNotesHtml(notes, sourcePath, markdownOptions),
    notes,
    frontmatter,
    sourcePath,
  };
}

async function renderHtmlSlide(
  source: string,
  sourcePath: string,
  options: ResolvedSlidesPluginOptions,
  deckFrontmatter: Record<string, unknown>,
  fallbackTitle: string,
): Promise<
  Pick<
    SlidePageData,
    "title" | "description" | "contentHtml" | "notesHtml" | "notes" | "frontmatter" | "sourcePath"
  >
> {
  const napi = await loadNapiModule();
  const extracted = napi.extractSlideComments(source);
  const title = extractTitle(extracted.content, deckFrontmatter, fallbackTitle);
  const description =
    typeof deckFrontmatter.description === "string" ? deckFrontmatter.description : undefined;

  return {
    title,
    description,
    contentHtml: extracted.content,
    notesHtml: await renderNotesHtml(extracted.notes, sourcePath, options.markdown),
    notes: extracted.notes,
    frontmatter: { ...deckFrontmatter },
    sourcePath,
  };
}

async function renderCustomSlide(
  source: string,
  sourcePath: string,
  root: string,
  options: ResolvedSlidesPluginOptions,
  fallbackTitle: string,
): Promise<
  Pick<
    SlidePageData,
    "title" | "description" | "contentHtml" | "notesHtml" | "notes" | "frontmatter" | "sourcePath"
  >
> {
  const ext = normalizeExtension(path.extname(sourcePath));
  const renderer = options.renderers[ext];
  if (!renderer) {
    throw new Error(
      `No slide renderer is registered for '${ext}'. Configure one via renderers to support this source type.`,
    );
  }

  const result = await renderer(source, {
    filePath: sourcePath,
    root,
    options,
  });
  const frontmatter = result.frontmatter ?? {};
  const title = extractTitle(result.html, frontmatter, result.title ?? fallbackTitle);
  const description =
    result.description ??
    (typeof frontmatter.description === "string" ? frontmatter.description : undefined);
  const notes = normalizeNotes(result.notes);

  return {
    title,
    description,
    contentHtml: result.html,
    notesHtml: await renderNotesHtml(notes, sourcePath, options.markdown),
    notes,
    frontmatter,
    sourcePath,
  };
}

async function buildSlideDecks(
  options: ResolvedSlidesPluginOptions,
  root: string,
): Promise<SlideDeckData[]> {
  const slidesDir = path.resolve(root, options.srcDir);
  try {
    await fs.access(slidesDir);
  } catch {
    return [];
  }

  const entries = await collectSlideFiles(options, root);
  const decks = classifyDecks(entries, slidesDir);
  const outDir = path.resolve(root, options.outDir);
  const napi = await loadNapiModule();
  const results: SlideDeckData[] = [];
  const markdownOptions = options.markdown;

  for (const [slug, deckEntries] of decks) {
    const sortedEntries = [...deckEntries].sort((a, b) => a.filePath.localeCompare(b.filePath));
    const firstEntry = sortedEntries[0];
    if (!firstEntry) continue;

    const firstExt = normalizeExtension(path.extname(firstEntry.filePath));
    let deckFrontmatter: Record<string, unknown> = {};
    const renderedSlides: Array<
      Pick<
        SlidePageData,
        | "title"
        | "description"
        | "contentHtml"
        | "notesHtml"
        | "notes"
        | "frontmatter"
        | "sourcePath"
      >
    > = [];

    if (
      sortedEntries.length === 1 &&
      (firstExt === ".md" || firstExt === ".markdown") &&
      !/^\d+$/.test(path.basename(firstEntry.filePath, firstExt))
    ) {
      const source = await fs.readFile(firstEntry.filePath, "utf-8");
      const parsed = napi.parseMarkdownSlideDeck(source, options.separator);
      deckFrontmatter = JSON.parse(parsed.frontmatter || "{}") as Record<string, unknown>;
      renderedSlides.push(
        ...(await Promise.all(
          parsed.slides.map((slide, index) =>
            renderMarkdownSlide(
              slide.content,
              firstEntry.filePath,
              slide.notes,
              deckFrontmatter,
              `Slide ${index + 1}`,
              markdownOptions,
            ),
          ),
        )),
      );
    } else {
      renderedSlides.push(
        ...(await Promise.all(
          sortedEntries.map(async (entry, index) => {
            const source = await fs.readFile(entry.filePath, "utf-8");
            const ext = normalizeExtension(path.extname(entry.filePath));

            if (ext === ".md" || ext === ".markdown") {
              const extracted = napi.extractSlideComments(source);
              return renderMarkdownSlide(
                extracted.content,
                entry.filePath,
                extracted.notes,
                {},
                `Slide ${index + 1}`,
                markdownOptions,
              );
            }

            if (ext === ".html") {
              return renderHtmlSlide(source, entry.filePath, options, {}, `Slide ${index + 1}`);
            }

            return renderCustomSlide(source, entry.filePath, root, options, `Slide ${index + 1}`);
          }),
        )),
      );
    }

    const deckTitle =
      (typeof deckFrontmatter.title === "string" && deckFrontmatter.title) ||
      (typeof deckFrontmatter.deckTitle === "string" && deckFrontmatter.deckTitle) ||
      renderedSlides[0]?.title ||
      formatTitle(slug || "slides");
    const deckDescription =
      (typeof deckFrontmatter.description === "string" && deckFrontmatter.description) ||
      (typeof deckFrontmatter.deckDescription === "string" && deckFrontmatter.deckDescription) ||
      renderedSlides.find((slide) => slide.description)?.description;
    const slideCount = renderedSlides.length;

    const slides = renderedSlides.map((slide, index) => {
      const slideNumber = index + 1;
      return {
        ...slide,
        slideNumber,
        slideCount,
        href: getSlideHref(
          options.base,
          options.routeBase,
          slug,
          slideNumber,
          options.ssg.extension,
        ),
        outputPath: getSlideOutputPath(
          outDir,
          options.routeBase,
          slug,
          slideNumber,
          options.ssg.extension,
        ),
        presenterHref: options.presenter
          ? getPresenterHref(
              options.base,
              options.routeBase,
              slug,
              slideNumber,
              options.ssg.extension,
            )
          : undefined,
        presenterOutputPath: options.presenter
          ? getPresenterOutputPath(
              outDir,
              options.routeBase,
              slug,
              slideNumber,
              options.ssg.extension,
            )
          : undefined,
      } satisfies SlidePageData;
    });

    results.push({
      slug,
      title: deckTitle,
      description: deckDescription,
      href: getDeckHref(options.base, options.routeBase, slug, options.ssg.extension),
      outputPath: getDeckOutputPath(outDir, options.routeBase, slug, options.ssg.extension),
      presenterHref: slides[0]?.presenterHref,
      presenterOutputPath: slides[0]?.presenterOutputPath
        ? path.join(outDir, options.routeBase, slug, "presenter", `index${options.ssg.extension}`)
        : undefined,
      slides,
    });
  }

  return results.sort((a, b) => a.slug.localeCompare(b.slug));
}

function createRouteLookupKey(route: string): string {
  const withoutQuery = route.split("?")[0]?.split("#")[0] ?? route;
  return withoutQuery.endsWith("/") ? withoutQuery.slice(0, -1) || "/" : withoutQuery;
}

function stripBaseFromRoute(route: string, baseHref: string): string {
  if (baseHref !== "/" && route.startsWith(baseHref)) {
    return `/${route.slice(baseHref.length)}`;
  }
  return route;
}

function getSlideRouteLookupKey(
  options: ResolvedSlidesPluginOptions,
  routeUrl: string,
): string | null {
  const normalizedRoute = createRouteLookupKey(stripBaseFromRoute(routeUrl, options.baseHref));
  const withoutIndex = normalizedRoute.endsWith("/index.html")
    ? normalizedRoute.slice(0, -"/index.html".length) || "/"
    : normalizedRoute;

  if (
    !(withoutIndex === options.routePrefix || withoutIndex.startsWith(`${options.routePrefix}/`))
  ) {
    return null;
  }

  return withoutIndex;
}

function buildSlideArtifacts(
  options: ResolvedSlidesPluginOptions,
  decks: SlideDeckData[],
): SlideBuildArtifacts {
  const routes = new Map<string, SlideRouteData>();

  for (const deck of decks) {
    for (const slide of deck.slides) {
      const slideKey = getSlideRouteLookupKey(options, slide.href);
      if (slideKey) {
        routes.set(slideKey, { deck, slide, presenter: false });
      }

      if (slide.presenterHref) {
        const presenterKey = getSlideRouteLookupKey(options, slide.presenterHref);
        if (presenterKey) {
          routes.set(presenterKey, { deck, slide, presenter: true });
        }
      }
    }
  }

  return { routes };
}

function injectViteHmrClient(html: string): string {
  const hmrScript = `<script type="module" src="/@vite/client"></script>
<script type="module">
if (import.meta.hot) {
  const reexecuteBodyScripts = () => {
    const scripts = Array.from(document.body.querySelectorAll('script'));
    for (const script of scripts) {
      const nextScript = document.createElement('script');
      for (const attr of script.attributes) {
        nextScript.setAttribute(attr.name, attr.value);
      }
      nextScript.textContent = script.textContent;
      script.replaceWith(nextScript);
    }
  };

  import.meta.hot.on('ox-content:slides:update', async () => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('__ox_slides_hmr', String(Date.now()));
    const response = await fetch(nextUrl.toString(), { cache: 'no-store' });
    if (!response.ok) {
      location.reload();
      return;
    }
    const nextHtml = await response.text();
    const nextDocument = new DOMParser().parseFromString(nextHtml, 'text/html');
    document.title = nextDocument.title;
    document.body.innerHTML = nextDocument.body.innerHTML;
    reexecuteBodyScripts();
  });
}
</script>`;

  return html.replace("</head>", `${hmrScript}\n</head>`);
}

async function renderRouteHtml(
  options: ResolvedSlidesPluginOptions,
  route: SlideRouteData,
  napi: NapiModule,
): Promise<string> {
  const current = route.slide;
  const previous = route.deck.slides[current.slideNumber - 2];
  const next = route.deck.slides[current.slideNumber];
  const data: NapiSlideRenderData = {
    deckTitle: route.deck.title,
    slideTitle: current.title,
    slideDescription: current.description ?? route.deck.description,
    slideContentHtml: current.contentHtml,
    slideNotesHtml: current.notesHtml,
    slideNumber: current.slideNumber,
    slideCount: current.slideCount,
    homeHref: options.baseHref,
    slideHref: current.href,
    presenterHref: current.presenterHref,
    previousHref: route.presenter ? previous?.presenterHref : previous?.href,
    nextHref: route.presenter ? next?.presenterHref : next?.href,
    nextSlideHref: next?.href,
  };

  let html = route.presenter
    ? napi.generatePresenterHtml(data, options.napiTheme)
    : napi.generateSlideHtml(data, options.napiTheme);

  const generatedOgImage = current.href.replace(/index\.html$/i, "og-image.png");
  const pageOgImage = options.ssg.generateOgImage
    ? options.ssg.siteUrl
      ? `${options.ssg.siteUrl.replace(/\/$/, "")}${generatedOgImage}`
      : generatedOgImage
    : options.ssg.ogImage;

  if (!route.presenter && pageOgImage) {
    html = html.replace(
      "</head>",
      `<meta property="og:image" content="${pageOgImage}">\n<meta name="twitter:image" content="${pageOgImage}">\n</head>`,
    );
  }

  return html;
}

async function writeGeneratedHtml(outputPath: string, html: string): Promise<string> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, "utf-8");
  return outputPath;
}

async function buildOutput(
  options: ResolvedSlidesPluginOptions,
  root: string,
): Promise<{ files: string[]; errors: string[] }> {
  const files: string[] = [];
  const errors: string[] = [];
  const outDir = path.resolve(root, options.outDir);
  const routeOutDir = path.join(outDir, options.routeBase);
  const decks = await buildSlideDecks(options, root);
  const napi = await loadNapiModule();

  if (options.ssg.clean) {
    await fs.rm(routeOutDir, { recursive: true, force: true });
  }

  const ogEntries: Array<{ slide: SlidePageData; deck: SlideDeckData }> = [];
  if (options.ssg.generateOgImage) {
    for (const deck of decks) {
      for (const slide of deck.slides) {
        ogEntries.push({ slide, deck });
      }
    }
  }

  if (ogEntries.length > 0) {
    const results = await generateOgImages(
      ogEntries.map(({ slide, deck }) => ({
        props: {
          title: slide.title,
          description: slide.description ?? deck.description,
          siteName: deck.title,
        },
        outputPath: path.join(path.dirname(slide.outputPath), "og-image.png"),
      })),
      options.ogImageOptions,
      root,
    );

    for (const result of results) {
      if (result.error) {
        errors.push(`OG image failed for ${result.outputPath}: ${result.error}`);
      } else {
        files.push(result.outputPath);
      }
    }
  }

  for (const deck of decks) {
    const deckFiles = await Promise.all(
      deck.slides.map(async (slide) => {
        const generatedFiles: string[] = [];
        const slideHtml = await renderRouteHtml(options, { deck, slide, presenter: false }, napi);
        generatedFiles.push(await writeGeneratedHtml(slide.outputPath, slideHtml));

        if (slide.slideNumber === 1) {
          generatedFiles.push(await writeGeneratedHtml(deck.outputPath, slideHtml));
        }

        if (options.presenter && slide.presenterOutputPath) {
          const presenterHtml = await renderRouteHtml(
            options,
            {
              deck,
              slide,
              presenter: true,
            },
            napi,
          );
          generatedFiles.push(await writeGeneratedHtml(slide.presenterOutputPath, presenterHtml));

          if (slide.slideNumber === 1 && deck.presenterOutputPath) {
            generatedFiles.push(
              await writeGeneratedHtml(deck.presenterOutputPath, presenterHtml),
            );
          }
        }

        return generatedFiles;
      }),
    );

    files.push(...deckFiles.flat());
  }

  return { files, errors };
}

export function oxContentSlides(rawOptions: OxContentSlidesOptions = {}): Plugin {
  const options = resolveOptions(rawOptions);
  const pageCache = new Map<string, string>();
  let artifactsPromise: Promise<SlideBuildArtifacts> | undefined;
  let root = process.cwd();

  const watchExtensions = new Set([
    ...options.extensions,
    ...Object.keys(options.renderers).map(normalizeExtension),
  ]);
  const isSlideFile = (file: string) =>
    file.startsWith(path.resolve(root, options.srcDir)) &&
    watchExtensions.has(normalizeExtension(path.extname(file)));
  const getArtifacts = () =>
    (artifactsPromise ??= buildSlideDecks(options, root).then((decks) =>
      buildSlideArtifacts(options, decks),
    ));
  const invalidateArtifacts = () => {
    artifactsPromise = undefined;
    pageCache.clear();
  };

  return {
    name: "ox-content:slides",

    configResolved(config) {
      root = config.root;
    },

    configureServer(server) {
      if (!options.ssg.enabled) {
        return;
      }

      const slidesDir = path.resolve(root, options.srcDir);
      server.watcher.add(slidesDir);

      server.middlewares.use(async (req, res, next) => {
        const url = req.url;
        if (!url) return next();
        const routeKey = getSlideRouteLookupKey(options, url);
        if (!routeKey) return next();

        const cached = pageCache.get(routeKey);
        if (cached) {
          res.setHeader("Content-Type", "text/html");
          res.end(cached);
          return;
        }

        const artifacts = await getArtifacts();
        const route = artifacts.routes.get(routeKey);
        if (!route) return next();

        const html = injectViteHmrClient(
          await renderRouteHtml(options, route, await loadNapiModule()),
        );
        pageCache.set(routeKey, html);
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      });

      const invalidate = (file: string) => {
        if (isSlideFile(file)) {
          invalidateArtifacts();
          server.ws.send({
            type: "custom",
            event: "ox-content:slides:update",
            data: { file },
          });
        }
      };

      server.watcher.on("add", invalidate);
      server.watcher.on("unlink", invalidate);
      server.watcher.on("change", invalidate);
    },

    handleHotUpdate({ file }) {
      if (isSlideFile(file)) {
        invalidateArtifacts();
      }
    },

    async closeBundle() {
      if (!options.ssg.enabled) {
        return;
      }

      const result = await buildOutput(options, root);
      if (result.files.length > 0) {
        console.log(`[ox-content:slides] Generated ${result.files.length} output files`);
      }
      for (const error of result.errors) {
        console.warn(`[ox-content:slides] ${error}`);
      }
    },
  };
}

export default oxContentSlides;
