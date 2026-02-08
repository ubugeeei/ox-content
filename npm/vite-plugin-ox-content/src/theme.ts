/**
 * Theme API for ox-content SSG
 *
 * Provides VitePress-like theming with default theme + customization.
 */

/**
 * Theme color configuration.
 */
export interface ThemeColors {
  /** Primary accent color */
  primary?: string;
  /** Primary color on hover */
  primaryHover?: string;
  /** Background color */
  background?: string;
  /** Alternative background color (sidebar, code blocks) */
  backgroundAlt?: string;
  /** Main text color */
  text?: string;
  /** Muted/secondary text color */
  textMuted?: string;
  /** Border color */
  border?: string;
  /** Code block background color */
  codeBackground?: string;
  /** Code block text color */
  codeText?: string;
}

/**
 * Theme layout configuration.
 */
export interface ThemeLayout {
  /** Sidebar width (CSS value, e.g., "260px") */
  sidebarWidth?: string;
  /** Header height (CSS value, e.g., "60px") */
  headerHeight?: string;
  /** Maximum content width (CSS value, e.g., "960px") */
  maxContentWidth?: string;
}

/**
 * Theme font configuration.
 */
export interface ThemeFonts {
  /** Sans-serif font stack */
  sans?: string;
  /** Monospace font stack */
  mono?: string;
}

/**
 * Theme header configuration.
 */
export interface ThemeHeader {
  /** Logo image URL */
  logo?: string;
  /** Logo width in pixels */
  logoWidth?: number;
  /** Logo height in pixels */
  logoHeight?: number;
}

/**
 * Theme footer configuration.
 */
export interface ThemeFooter {
  /** Footer message (supports HTML) */
  message?: string;
  /** Copyright text (supports HTML) */
  copyright?: string;
}

/**
 * Social links configuration.
 */
export interface SocialLinks {
  /** GitHub URL */
  github?: string;
  /** Twitter/X URL */
  twitter?: string;
  /** Discord URL */
  discord?: string;
}

/**
 * Embedded HTML content for specific positions in the page layout.
 */
export interface ThemeEmbed {
  /** Content to embed into <head> */
  head?: string;
  /** Content before header */
  headerBefore?: string;
  /** Content after header */
  headerAfter?: string;
  /** Content before sidebar navigation */
  sidebarBefore?: string;
  /** Content after sidebar navigation */
  sidebarAfter?: string;
  /** Content before main content */
  contentBefore?: string;
  /** Content after main content */
  contentAfter?: string;
  /** Content before footer */
  footerBefore?: string;
  /** Custom footer content (replaces default footer) */
  footer?: string;
}

/**
 * Complete theme configuration.
 */
export interface ThemeConfig {
  /** Theme name for identification */
  name?: string;
  /** Base theme to extend */
  extends?: ThemeConfig;
  /** Light mode colors (maps to CSS variables) */
  colors?: ThemeColors;
  /** Dark mode colors (maps to CSS variables) */
  darkColors?: ThemeColors;
  /** Font configuration (maps to CSS variables) */
  fonts?: ThemeFonts;
  /** Layout configuration (maps to CSS variables) */
  layout?: ThemeLayout;
  /** Header configuration */
  header?: ThemeHeader;
  /** Footer configuration */
  footer?: ThemeFooter;
  /** Social links configuration */
  socialLinks?: SocialLinks;
  /** Embedded HTML content at specific positions */
  embed?: ThemeEmbed;
  /** Additional custom CSS */
  css?: string;
  /** Additional custom JavaScript */
  js?: string;
}

/**
 * Resolved theme configuration (after merging with defaults).
 */
export interface ResolvedThemeConfig {
  name: string;
  colors: ThemeColors;
  darkColors: ThemeColors;
  fonts: ThemeFonts;
  layout: ThemeLayout;
  header: ThemeHeader;
  footer: ThemeFooter;
  socialLinks: SocialLinks;
  embed: ThemeEmbed;
  css: string;
  js: string;
}

/**
 * Default theme configuration.
 * Based on the current ox-content SSG styles.
 */
export const defaultTheme: ThemeConfig = {
  name: "default",
  colors: {
    primary: "#e04d0a",
    primaryHover: "#f5602a",
    background: "#ffffff",
    backgroundAlt: "#f8f9fa",
    text: "#1a1a1a",
    textMuted: "#666666",
    border: "#e5e7eb",
    codeBackground: "#1e293b",
    codeText: "#e2e8f0",
  },
  darkColors: {
    primary: "#f5714a",
    primaryHover: "#ff8a66",
    background: "#141414",
    backgroundAlt: "#141414",
    text: "#e5e5e5",
    textMuted: "#a3a3a3",
    border: "#2a2a2a",
    codeBackground: "#1a1a1a",
    codeText: "#e5e5e5",
  },
  fonts: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  layout: {
    sidebarWidth: "260px",
    headerHeight: "60px",
    maxContentWidth: "960px",
  },
  header: {
    logo: undefined,
    logoWidth: 28,
    logoHeight: 28,
  },
  footer: {
    message: undefined,
    copyright: undefined,
  },
  socialLinks: {},
  embed: {},
  css: "",
  js: "",
};

/**
 * Deep merge two objects.
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== undefined &&
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T];
    }
  }

  return result;
}

/**
 * Defines a theme configuration with type checking.
 *
 * @example
 * ```ts
 * const myTheme = defineTheme({
 *   extends: defaultTheme,
 *   colors: {
 *     primary: '#3498db',
 *   },
 *   footer: {
 *     copyright: '2025 My Company',
 *   },
 * });
 * ```
 */
export function defineTheme(config: ThemeConfig): ThemeConfig {
  return config;
}

/**
 * Merges multiple theme configurations.
 * Later themes override earlier ones.
 *
 * @example
 * ```ts
 * const merged = mergeThemes(defaultTheme, customTheme, overrides);
 * ```
 */
export function mergeThemes(...themes: ThemeConfig[]): ThemeConfig {
  if (themes.length === 0) {
    return { ...defaultTheme };
  }

  let result: ThemeConfig = {};

  for (const theme of themes) {
    result = deepMerge(result as Record<string, unknown>, theme as Record<string, unknown>) as ThemeConfig;
  }

  return result;
}

/**
 * Resolves a theme configuration by merging with its extends chain and defaults.
 */
export function resolveTheme(config?: ThemeConfig): ResolvedThemeConfig {
  if (!config) {
    return resolveTheme(defaultTheme);
  }

  // Build the extends chain
  const chain: ThemeConfig[] = [];
  let current: ThemeConfig | undefined = config;

  while (current) {
    chain.unshift(current);
    current = current.extends;
  }

  // Always start with default theme
  if (chain[0] !== defaultTheme && chain[0]?.name !== "default") {
    chain.unshift(defaultTheme);
  }

  // Merge all themes in the chain
  const merged = mergeThemes(...chain);

  // Return resolved config with all required fields
  return {
    name: merged.name ?? "custom",
    colors: merged.colors ?? defaultTheme.colors!,
    darkColors: merged.darkColors ?? defaultTheme.darkColors!,
    fonts: merged.fonts ?? defaultTheme.fonts!,
    layout: merged.layout ?? defaultTheme.layout!,
    header: merged.header ?? defaultTheme.header!,
    footer: merged.footer ?? defaultTheme.footer!,
    socialLinks: merged.socialLinks ?? defaultTheme.socialLinks!,
    embed: merged.embed ?? {},
    css: merged.css ?? "",
    js: merged.js ?? "",
  };
}

/**
 * Converts resolved theme to the format expected by Rust NAPI.
 */
export function themeToNapi(theme: ResolvedThemeConfig): NapiThemeConfig {
  return {
    colors: theme.colors.primary
      ? {
          primary: theme.colors.primary,
          primaryHover: theme.colors.primaryHover,
          background: theme.colors.background,
          backgroundAlt: theme.colors.backgroundAlt,
          text: theme.colors.text,
          textMuted: theme.colors.textMuted,
          border: theme.colors.border,
          codeBackground: theme.colors.codeBackground,
          codeText: theme.colors.codeText,
        }
      : undefined,
    darkColors: theme.darkColors.primary
      ? {
          primary: theme.darkColors.primary,
          primaryHover: theme.darkColors.primaryHover,
          background: theme.darkColors.background,
          backgroundAlt: theme.darkColors.backgroundAlt,
          text: theme.darkColors.text,
          textMuted: theme.darkColors.textMuted,
          border: theme.darkColors.border,
          codeBackground: theme.darkColors.codeBackground,
          codeText: theme.darkColors.codeText,
        }
      : undefined,
    fonts: theme.fonts.sans
      ? {
          sans: theme.fonts.sans,
          mono: theme.fonts.mono,
        }
      : undefined,
    layout: theme.layout.sidebarWidth
      ? {
          sidebarWidth: theme.layout.sidebarWidth,
          headerHeight: theme.layout.headerHeight,
          maxContentWidth: theme.layout.maxContentWidth,
        }
      : undefined,
    header: theme.header.logo
      ? {
          logo: theme.header.logo,
          logoWidth: theme.header.logoWidth,
          logoHeight: theme.header.logoHeight,
        }
      : undefined,
    footer:
      theme.footer.message || theme.footer.copyright
        ? {
            message: theme.footer.message,
            copyright: theme.footer.copyright,
          }
        : undefined,
    socialLinks:
      theme.socialLinks.github || theme.socialLinks.twitter || theme.socialLinks.discord
        ? {
            github: theme.socialLinks.github,
            twitter: theme.socialLinks.twitter,
            discord: theme.socialLinks.discord,
          }
        : undefined,
    embed: Object.keys(theme.embed).length > 0 ? theme.embed : undefined,
    css: theme.css || undefined,
    js: theme.js || undefined,
  };
}

/**
 * NAPI-compatible theme colors type.
 */
export interface NapiThemeColors {
  primary?: string;
  primaryHover?: string;
  background?: string;
  backgroundAlt?: string;
  text?: string;
  textMuted?: string;
  border?: string;
  codeBackground?: string;
  codeText?: string;
}

/**
 * NAPI-compatible theme fonts type.
 */
export interface NapiThemeFonts {
  sans?: string;
  mono?: string;
}

/**
 * NAPI-compatible theme layout type.
 */
export interface NapiThemeLayout {
  sidebarWidth?: string;
  headerHeight?: string;
  maxContentWidth?: string;
}

/**
 * NAPI-compatible theme header type.
 */
export interface NapiThemeHeader {
  logo?: string;
  logoWidth?: number;
  logoHeight?: number;
}

/**
 * NAPI-compatible theme footer type.
 */
export interface NapiThemeFooter {
  message?: string;
  copyright?: string;
}

/**
 * NAPI-compatible social links type.
 */
export interface NapiSocialLinks {
  github?: string;
  twitter?: string;
  discord?: string;
}

/**
 * NAPI-compatible theme embed type.
 */
export interface NapiThemeEmbed {
  head?: string;
  headerBefore?: string;
  headerAfter?: string;
  sidebarBefore?: string;
  sidebarAfter?: string;
  contentBefore?: string;
  contentAfter?: string;
  footerBefore?: string;
  footer?: string;
}

/**
 * NAPI-compatible theme configuration type.
 */
export interface NapiThemeConfig {
  colors?: NapiThemeColors;
  darkColors?: NapiThemeColors;
  fonts?: NapiThemeFonts;
  layout?: NapiThemeLayout;
  header?: NapiThemeHeader;
  footer?: NapiThemeFooter;
  socialLinks?: NapiSocialLinks;
  embed?: NapiThemeEmbed;
  css?: string;
  js?: string;
}
