import type { OxContentAssetManifest } from "./assets";
import type { CollectionAssetManifest } from "./collection-assets";
import type {
  DocumentAssetManifest,
  DocumentStyleDescriptor,
  RenderDocumentAssetsInput,
  RenderDocumentAssetsResult,
} from "./document-assets";
import type { RenderThemeTokenCssOptions, ThemeTokenSource } from "./theme-tokens";
import type { FeedItemInput, OxContentOptions, ResolvedOptions } from "./types";

export type MaybePromise<T> = T | Promise<T>;

export interface OxContentCustomHostOptions {
  /**
   * Host module loaded through Vite SSR. The module may default-export the host
   * object, export `host`, or be the host object itself.
   */
  host: string | OxContentCustomHostModule;
  /** Ox Content options shared with output writers and asset helpers. */
  oxContent?: OxContentOptions;
  /** Build lifecycle controls. */
  build?: OxContentCustomHostBuildOptions;
  /** Development middleware and cache controls. */
  dev?: OxContentCustomHostDevOptions;
  /** Optional framework-owned theme token stylesheet. */
  themeTokens?: false | OxContentCustomHostThemeTokensOptions;
  /** Optional custom-host-owned collection assets. */
  collectionAssets?: false | OxContentCustomHostCollectionAssetsOptions;
}

export interface OxContentCustomHostBuildOptions {
  /** Disable only the custom-host build writer. */
  enabled?: boolean;
  /** Run during `vite build --mode test`. Disabled by default. */
  runInTest?: boolean;
  /** Apply Vite `transformIndexHtml` to HTML outputs. */
  transformHtml?: boolean;
  /**
   * Minify production HTML outputs immediately before writing them.
   *
   * Defaults to `oxContent.ssg.minifyHtml`.
   */
  minifyHtml?: boolean;
}

export interface OxContentCustomHostDevOptions {
  /** Disable only the custom-host development middleware. */
  enabled?: boolean;
  /** Apply Vite `transformIndexHtml` to HTML responses. */
  transformHtml?: boolean;
  /** Debounce for full reloads after dependency invalidation. */
  reloadDebounceMs?: number;
  /** Dependencies that invalidate every cached route response in development. */
  dependencies?: readonly OxContentCustomHostDependency[];
  /** Dependencies that invalidate the route catalogue in development. */
  routeDependencies?: readonly OxContentCustomHostDependency[];
}

export interface OxContentCustomHostThemeTokensOptions extends RenderThemeTokenCssOptions {
  theme: ThemeTokenSource | ThemeTokenSource[];
  /**
   * Public stylesheet path. Build writes this file and dev serves the same href.
   *
   * @default "__ox_theme_tokens__/theme-tokens.css"
   */
  href?: string;
}

export type OxContentCustomHostDependency = string | OxContentCustomHostDependencyDescriptor;

export interface OxContentCustomHostDependencyDescriptor {
  path: string;
  kind?: "file" | "directory" | "glob";
}

export interface OxContentCustomHostCollectionAssetsOptions {
  manifest:
    | CollectionAssetManifest
    | ((
        context: OxContentCustomHostCollectionAssetsContext,
      ) => MaybePromise<CollectionAssetManifest>);
  /** Extra sources that should re-plan collection assets in development. */
  watch?: readonly OxContentCustomHostDependency[];
  /** URL prefixes owned by the asset middleware even when a file is absent. */
  ownedPrefixes?: readonly string[];
  /** Write collection assets during custom-host builds. */
  write?: boolean;
}

export interface OxContentCustomHostModule {
  routes:
    | readonly OxContentCustomHostRoute[]
    | ((
        context: OxContentCustomHostRoutesContext,
      ) => MaybePromise<readonly OxContentCustomHostRoute[]>);
  /**
   * Build-only data for coordinated outputs such as feeds.
   *
   * This hook is not called in development and is skipped when `feeds` is off.
   */
  outputs?:
    | OxContentCustomHostOutputData
    | ((
        context: OxContentCustomHostOutputsContext,
      ) => MaybePromise<OxContentCustomHostOutputData | undefined | void>);
  notFound?: (
    context: OxContentCustomHostNotFoundContext,
  ) => MaybePromise<OxContentCustomHostRenderResult | Response | undefined | void>;
}

export interface OxContentCustomHostOutputData {
  /** Default feed items for a programmatic single-feed source. */
  items?: readonly FeedItemInput[];
  /** Named feed collections keyed by collection name. */
  collections?: Record<string, readonly FeedItemInput[]>;
  /** Collection order used by default feed collection resolution. */
  collectionNames?: readonly string[];
  /** Site description shared with feed documents and crawl manifests. */
  siteDescription?: string;
}

export interface OxContentCustomHostRoute {
  path: string;
  render: (
    context: OxContentCustomHostRenderContext,
  ) => MaybePromise<OxContentCustomHostRenderResult | Response | undefined | void>;
  /** Source file used for resource resolution, Markdown companions, and git lastmod. */
  inputPath?: string;
  /** Additional files or directories used only for git lastmod freshness. */
  lastUpdatedPaths?: readonly string[];
  /** Source bytes used for Markdown companion output. */
  source?: string;
  title?: string;
  description?: string;
  aliases?: readonly string[];
  redirect?: string;
  draft?: boolean;
  unlisted?: boolean;
  frontmatter?: Record<string, unknown>;
  dependencies?: readonly OxContentCustomHostDependency[];
}

export interface OxContentCustomHostRenderResult {
  body?: string | Uint8Array;
  html?: string;
  text?: string;
  status?: number;
  statusText?: string;
  contentType?: string;
  headers?: HeadersInit;
  outputPath?: string;
  inputPath?: string;
  source?: string;
  title?: string;
  description?: string;
  loc?: string;
  lastUpdated?: number;
  /** Additional files or directories used only for git lastmod freshness. */
  lastUpdatedPaths?: readonly string[];
  aliases?: readonly string[];
  redirect?: string;
  draft?: boolean;
  unlisted?: boolean;
  frontmatter?: Record<string, unknown>;
  dependencies?: readonly OxContentCustomHostDependency[];
}

export interface OxContentCustomHostAssetsContext {
  selfHosted: OxContentAssetManifest;
  clientManifest?: DocumentAssetManifest;
  themeTokens?: ResolvedThemeTokens;
  /**
   * Configured custom-host collection asset manifest, when collection assets
   * are enabled. The build writer and development middleware consume this same
   * lifecycle snapshot.
   */
  collectionManifest(): Promise<CollectionAssetManifest | undefined>;
  stylesheets(input: OxContentCustomHostStylesheetsInput): OxContentCustomHostStylesheetsResult;
  stylesheetContent(
    input: OxContentCustomHostStylesheetContentInput,
  ): Promise<OxContentCustomHostStylesheetContentResult>;
  document(input?: RenderDocumentAssetsInput): RenderDocumentAssetsResult;
}

export interface OxContentCustomHostStylesheetsInput {
  /** Route-rendered browser module identities, for example island client modules. */
  modules: readonly string[];
  /** Override the custom host base path for returned stylesheet hrefs. */
  base?: string;
}

export interface OxContentCustomHostStylesheet extends DocumentStyleDescriptor {
  kind: "style";
  href: string;
  /** Module id that requested this stylesheet. */
  moduleId: string;
  /** Build artifact path relative to the custom-host outDir. */
  outputPath?: string;
}

export interface OxContentCustomHostStylesheetDiagnostic {
  code: "missing-module" | "missing-resolver";
  moduleId: string;
  message: string;
}

export interface OxContentCustomHostStylesheetsResult {
  stylesheets: OxContentCustomHostStylesheet[];
  diagnostics: OxContentCustomHostStylesheetDiagnostic[];
  /** Dev-only source files that should be merged into route dependencies. */
  dependencies: string[];
}

export interface OxContentCustomHostStylesheetContentInput {
  /** Stylesheet descriptors returned by `ctx.assets.stylesheets()`. */
  stylesheets: readonly OxContentCustomHostStylesheet[];
}

export interface OxContentCustomHostStylesheetContent {
  stylesheet: OxContentCustomHostStylesheet;
  href: string;
  moduleId: string;
  content: string;
}

export interface OxContentCustomHostStylesheetContentDiagnostic {
  code: "unavailable" | "missing-artifact";
  href: string;
  moduleId: string;
  message: string;
}

export interface OxContentCustomHostStylesheetContentResult {
  stylesheets: OxContentCustomHostStylesheetContent[];
  diagnostics: OxContentCustomHostStylesheetContentDiagnostic[];
}

export interface OxContentCustomHostBaseContext {
  mode: "build" | "serve";
  root: string;
  outDir: string;
  base: string;
  options: ResolvedOptions;
  loadModule(moduleId: string): Promise<unknown>;
  assets: OxContentCustomHostAssetsContext;
}

export interface OxContentCustomHostMemo {
  <T>(key: string, load: () => MaybePromise<T>): Promise<T>;
}

export interface OxContentCustomHostRoutesContext extends OxContentCustomHostBaseContext {
  /**
   * Memoize expensive route-catalogue work for this build or route-catalogue
   * generation pass. Failed loaders are evicted so the next call can retry.
   */
  memo: OxContentCustomHostMemo;
}

export interface OxContentCustomHostOutputsContext extends OxContentCustomHostBaseContext {
  routes: readonly OxContentCustomHostRoute[];
  /**
   * Shares the same memo store as `routes(context)` during production builds.
   */
  memo: OxContentCustomHostMemo;
}

export interface OxContentCustomHostCollectionAssetsContext extends OxContentCustomHostBaseContext {}

export interface OxContentCustomHostRenderContext extends OxContentCustomHostBaseContext {
  route: OxContentCustomHostRoute;
  request: Request;
  url: URL;
}

export interface OxContentCustomHostNotFoundContext extends OxContentCustomHostBaseContext {
  request: Request;
  url: URL;
}

export interface ResolvedThemeTokens {
  href: string;
  outputPath: string;
  css: string;
}

export interface SerializedResponse {
  status: number;
  statusText?: string;
  headers: [string, string][];
  body: Uint8Array;
  dependencies: OxContentCustomHostDependency[];
}

export interface DevCacheEntry {
  promise: Promise<SerializedResponse | undefined>;
}

export interface RenderedBuildRoute {
  route: OxContentCustomHostRoute;
  routePath: string;
  outputPath: string;
  contentType: string;
  body: string | Uint8Array;
  result: OxContentCustomHostRenderResult;
}
