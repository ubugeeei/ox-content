import type { LanguageRegistration, ThemeRegistration } from "@ox-content/vite-plugin";
import type { OgImageOptions, SsgOptions } from "@ox-content/vite-plugin";
import type { SlidePdfOptions } from "./pdf-options";
import type { ResolvedSlidesPluginOptions } from "./internal-types";

/**
 * Theme tokens applied to slide, presenter, and print shells.
 */
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

/**
 * Result returned from a custom slide source renderer.
 */
export interface SlideSourceRenderResult {
  html: string;
  title?: string;
  description?: string;
  frontmatter?: Record<string, unknown>;
  notes?: string | string[];
}

/**
 * Context passed to a custom slide source renderer.
 */
export interface SlideSourceRendererContext {
  filePath: string;
  root: string;
  options: ResolvedSlidesPluginOptions;
}

/**
 * Renderer used to support non-Markdown slide source files.
 */
export type SlideSourceRenderer = (
  source: string,
  context: SlideSourceRendererContext,
) => SlideSourceRenderResult | Promise<SlideSourceRenderResult>;

/**
 * Public configuration for `@ox-content/vite-plugin-slides`.
 */
export interface OxContentSlidesOptions {
  srcDir?: string;
  outDir?: string;
  base?: string;
  routeBase?: string;
  presenter?: boolean;
  separator?: string;
  ssg?: SsgOptions | boolean;
  ogImageOptions?: OgImageOptions;
  pdf?: SlidePdfOptions | boolean;
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
