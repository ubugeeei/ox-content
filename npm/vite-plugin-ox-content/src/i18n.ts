/**
 * i18n plugin for Ox Content.
 *
 * Provides:
 * - Dictionary loading and validation at build time
 * - Virtual module for i18n config
 * - Build-time i18n checking
 * - Locale-aware routing middleware for dev server
 */

import * as path from "path";
import * as fs from "fs";
import type { Plugin, ViteDevServer } from "vite";
import type { I18nOptions, ResolvedI18nOptions, LocaleConfig, ResolvedOptions } from "./types";

/**
 * Resolves i18n options with defaults.
 */
export function resolveI18nOptions(
  options: I18nOptions | false | undefined,
): ResolvedI18nOptions | false {
  if (options === false) return false;
  if (!options || !options.enabled) {
    return false;
  }

  const defaultLocale = options.defaultLocale ?? "en";
  const locales: LocaleConfig[] = options.locales ?? [{ code: defaultLocale, name: defaultLocale }];

  // Ensure default locale is in the locales list
  if (!locales.some((l) => l.code === defaultLocale)) {
    locales.unshift({ code: defaultLocale, name: defaultLocale });
  }

  return {
    enabled: true,
    dir: options.dir ?? "content/i18n",
    defaultLocale,
    locales,
    hideDefaultLocale: options.hideDefaultLocale ?? true,
    check: options.check ?? true,
    functionNames: options.functionNames ?? ["t", "$t"],
  };
}

/**
 * Creates the i18n sub-plugin for the Vite plugin array.
 */
export function createI18nPlugin(resolvedOptions: ResolvedOptions): Plugin {
  const i18nOptions = resolvedOptions.i18n;
  let root = process.cwd();

  return {
    name: "ox-content:i18n",

    configResolved(config) {
      root = config.root;
    },

    resolveId(id) {
      if (id === "virtual:ox-content/i18n") {
        return "\0virtual:ox-content/i18n";
      }
      return null;
    },

    load(id) {
      if (id === "\0virtual:ox-content/i18n") {
        if (!i18nOptions) {
          return `export const i18n = { enabled: false }; export default i18n;`;
        }

        return generateI18nModule(i18nOptions, root);
      }
      return null;
    },

    async buildStart() {
      if (!i18nOptions || !i18nOptions.check) return;

      const dictDir = path.resolve(root, i18nOptions.dir);
      if (!fs.existsSync(dictDir)) {
        console.warn(`[ox-content:i18n] Dictionary directory not found: ${dictDir}`);
        return;
      }

      try {
        const { loadDictionaries, checkI18n } = await import("@ox-content/napi");

        // Load and validate dictionaries
        const loadResult = loadDictionaries(dictDir);
        if (loadResult.errors.length > 0) {
          for (const error of loadResult.errors) {
            console.warn(`[ox-content:i18n] ${error}`);
          }
          return;
        }

        console.log(
          `[ox-content:i18n] Loaded ${loadResult.localeCount} locales: ${loadResult.locales.join(", ")}`,
        );

        // Note: Full key collection from source requires the checker crate.
        // For now, we validate dictionary syntax only.
        const checkResult = checkI18n(dictDir, []);
        if (checkResult.errorCount > 0 || checkResult.warningCount > 0) {
          for (const diag of checkResult.diagnostics) {
            if (diag.severity === "error") {
              console.error(`[ox-content:i18n] ${diag.message}`);
            } else if (diag.severity === "warning") {
              console.warn(`[ox-content:i18n] ${diag.message}`);
            }
          }
        }
      } catch {
        // NAPI binding not available; skip checks
      }
    },

    configureServer(server: ViteDevServer) {
      if (!i18nOptions) return;

      // Add locale routing middleware
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();

        // Parse locale from URL
        const url = req.url;
        const localeMatch = url.match(/^\/([a-z]{2}(?:-[a-zA-Z]+)?)(\/|$)/);

        if (localeMatch) {
          const localeCode = localeMatch[1];
          const isKnown = i18nOptions.locales.some((l) => l.code === localeCode);
          if (isKnown) {
            // Set locale header for downstream middleware
            (req as any).__oxLocale = localeCode;
          }
        } else if (i18nOptions.hideDefaultLocale) {
          // No locale prefix: use default locale
          (req as any).__oxLocale = i18nOptions.defaultLocale;
        }

        next();
      });
    },
  };
}

/**
 * Generates the virtual module for i18n configuration.
 */
function generateI18nModule(options: ResolvedI18nOptions, root: string): string {
  const dictDir = path.resolve(root, options.dir);
  const localesJson = JSON.stringify(options.locales);
  const defaultLocale = JSON.stringify(options.defaultLocale);

  // Load dictionaries synchronously for the virtual module
  let dictionariesCode = "{}";
  try {
    const dictData: Record<string, Record<string, string>> = {};

    for (const locale of options.locales) {
      const localeDir = path.join(dictDir, locale.code);
      if (!fs.existsSync(localeDir)) continue;

      const files = fs.readdirSync(localeDir);
      const localeDict: Record<string, string> = {};

      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const filePath = path.join(localeDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const namespace = path.basename(file, ".json");

        try {
          const data = JSON.parse(content);
          flattenObject(data, namespace, localeDict);
        } catch {
          // Skip invalid JSON files
        }
      }

      dictData[locale.code] = localeDict;
    }

    dictionariesCode = JSON.stringify(dictData);
  } catch {
    // Fallback to empty dictionaries
  }

  return `
export const i18nConfig = {
  enabled: true,
  defaultLocale: ${defaultLocale},
  locales: ${localesJson},
  hideDefaultLocale: ${JSON.stringify(options.hideDefaultLocale)},
};

export const dictionaries = ${dictionariesCode};

export function t(key, params, locale) {
  const dict = dictionaries[locale || i18nConfig.defaultLocale] || {};
  let message = dict[key];
  if (!message) {
    const fallback = dictionaries[i18nConfig.defaultLocale] || {};
    message = fallback[key] || key;
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      message = message.replace(new RegExp('\\\\{\\\\$' + k + '\\\\}', 'g'), String(v));
    }
  }
  return message;
}

export function getLocaleFromPath(pathname) {
  const match = pathname.match(/^\\/([a-z]{2}(?:-[a-zA-Z]+)?)(\\//|$)/);
  if (match) {
    const code = match[1];
    if (i18nConfig.locales.some(l => l.code === code)) {
      return code;
    }
  }
  return i18nConfig.defaultLocale;
}

export function localePath(pathname, locale) {
  const current = getLocaleFromPath(pathname);
  let clean = pathname;
  if (current !== i18nConfig.defaultLocale || !i18nConfig.hideDefaultLocale) {
    clean = pathname.replace(new RegExp('^/' + current + '(/|$)'), '/');
  }
  if (locale === i18nConfig.defaultLocale && i18nConfig.hideDefaultLocale) {
    return clean || '/';
  }
  return '/' + locale + (clean.startsWith('/') ? clean : '/' + clean);
}

export default { i18nConfig, dictionaries, t, getLocaleFromPath, localePath };
`;
}

/**
 * Flattens a nested object into dot-separated keys.
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix: string,
  result: Record<string, string>,
): void {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = `${prefix}.${key}`;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      flattenObject(value as Record<string, unknown>, fullKey, result);
    } else {
      result[fullKey] = String(value);
    }
  }
}
