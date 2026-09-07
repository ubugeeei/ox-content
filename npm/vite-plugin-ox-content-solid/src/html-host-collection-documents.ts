import fs from "node:fs/promises";
import path from "node:path";
import {
  buildCollectionManifest,
  customHostOxContentOptions,
  normalizeMarkdownExtensions,
  resolveCascadeOptions,
  resolveCollectionsOptions,
  resolvePermalinksOptions,
  type CollectionEntry,
  type OxContentOptions,
  type ResolvedCollectionsOptions,
  type ResolvedOptions,
} from "@ox-content/vite-plugin";
import type {
  SolidHtmlHostIslandDocument,
  SolidHtmlHostIslandRegistryContext,
} from "./html-host-registry";

type MaybePromise<T> = T | Promise<T>;

export interface SolidHtmlHostCollectionDocument extends SolidHtmlHostIslandDocument {
  collection: string;
  entry: CollectionEntry;
  frontmatter: Record<string, unknown>;
  path: string;
  source: string;
}

export interface SolidHtmlHostCollectionDocumentsOptions {
  oxContent?: OxContentOptions;
  collections?: string | readonly string[];
  select?: (
    document: SolidHtmlHostCollectionDocument,
    context: SolidHtmlHostIslandRegistryContext,
  ) => MaybePromise<boolean>;
}

export function createSolidHtmlHostCollectionDocuments(
  input: SolidHtmlHostCollectionDocumentsOptions = {},
): (
  context: SolidHtmlHostIslandRegistryContext,
) => Promise<readonly SolidHtmlHostCollectionDocument[]> {
  return (context) => resolveSolidHtmlHostCollectionDocuments(input, context);
}

export async function resolveSolidHtmlHostCollectionDocuments(
  input: SolidHtmlHostCollectionDocumentsOptions,
  context: SolidHtmlHostIslandRegistryContext,
): Promise<readonly SolidHtmlHostCollectionDocument[]> {
  const oxContent = customHostOxContentOptions(input.oxContent ?? {});
  const options = resolveCollectionManifestOptions(oxContent);
  if (!options.collections.enabled) return [];

  const manifest = await buildCollectionManifest(context.root, options);
  const names = resolveCollectionNames(input.collections, options.collections);
  const documents = new Map<string, SolidHtmlHostCollectionDocument>();

  for (const name of names) {
    for (const entry of manifest.collections[name] ?? []) {
      const document = await resolveCollectionDocument(context.root, options.srcDir, name, entry);
      if (!document) continue;
      if (input.select && !(await input.select(document, context))) continue;
      documents.set(document.documentPath, document);
    }
  }

  return [...documents.values()];
}

function resolveCollectionManifestOptions(oxContent: OxContentOptions): ResolvedOptions {
  const collections = withoutCollectionInclude(resolveCollectionsOptions(oxContent.collections));
  return {
    srcDir: oxContent.srcDir ?? "content",
    outDir: oxContent.outDir ?? "dist",
    base: oxContent.base ?? "/",
    extensions: normalizeMarkdownExtensions(oxContent.extensions),
    collections,
    permalinks: resolvePermalinksOptions(oxContent.permalinks),
    cascade: resolveCascadeOptions(oxContent.cascade),
    gfm: oxContent.gfm ?? true,
    mdx: oxContent.mdx,
    footnotes: oxContent.footnotes ?? true,
    semanticFootnotes: oxContent.semanticFootnotes ?? false,
    taskLists: oxContent.taskLists ?? true,
    tables: oxContent.tables ?? true,
    strikethrough: oxContent.strikethrough ?? true,
    autolinks: oxContent.autolinks ?? oxContent.gfm ?? true,
    superscript: oxContent.superscript ?? false,
    subscript: oxContent.subscript ?? false,
    smartPunctuation: oxContent.smartPunctuation ?? false,
    autolinkTargetBlank: oxContent.autolinkTargetBlank ?? true,
    linkTargetBlank: oxContent.linkTargetBlank ?? true,
    sourceSpans: oxContent.sourceSpans ?? false,
    frontmatter: oxContent.frontmatter ?? true,
    tocMaxDepth: oxContent.tocMaxDepth ?? 3,
    cjkEmphasis: oxContent.cjkEmphasis ?? false,
  } as ResolvedOptions;
}

function withoutCollectionInclude(
  collections: ResolvedCollectionsOptions,
): ResolvedCollectionsOptions {
  return {
    enabled: collections.enabled,
    collections: Object.fromEntries(
      Object.entries(collections.collections).map(([name, collection]) => [
        name,
        { ...collection, include: [] },
      ]),
    ),
  };
}

function resolveCollectionNames(
  input: string | readonly string[] | undefined,
  collections: ResolvedCollectionsOptions,
): string[] {
  const available = Object.keys(collections.collections);
  if (!input) return available;
  const selected = new Set(Array.isArray(input) ? input : [input]);
  return available.filter((name) => selected.has(name));
}

async function resolveCollectionDocument(
  root: string,
  srcDir: string,
  collection: string,
  entry: CollectionEntry,
): Promise<SolidHtmlHostCollectionDocument | undefined> {
  const candidate = path.resolve(root, srcDir, entry.source);
  let source: string;
  try {
    source = await fs.readFile(candidate, "utf8");
  } catch {
    return undefined;
  }
  return {
    collection,
    documentPath: candidate,
    entry,
    frontmatter: entry.frontmatter,
    path: entry.path,
    source,
  };
}
