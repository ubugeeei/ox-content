import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  planCollectionAssets,
  type CollectionAssetInput,
  type CollectionAssetManifest,
} from "./collection-assets";
import {
  collectDocumentReferences,
  resolveDocumentReference,
  resolvePublicPaths,
  type ResolvedCollectionAssetDocument,
} from "./collection-asset-document-references";
import { isWithinOrEqual } from "./collection-asset-document-paths";
import { importNapiModule } from "./napi";
import type { MarkdownNode } from "./types";

const DEFAULT_REFERENCE_ATTRIBUTES = ["href", "src", "poster"] as const;

type MaybePromise<T> = T | Promise<T>;

/** One public Markdown or MDX document whose local references may publish files. */
export interface CollectionAssetDocumentInput {
  /** Markdown/MDX document path, relative to `root` or absolute within it. */
  documentPath: string;
  /** Public page path for resolving relative aliases such as `./cover.png`. */
  pagePath: string;
  /** Markdown/MDX source. When omitted, `documentPath` is read from disk. */
  source?: string;
  /** Parsed mdast-compatible tree. Takes precedence over `source` when present. */
  ast?: MarkdownNode;
}

/** A local document reference after resolving its source file and default alias. */
export interface CollectionAssetResolvedDocumentReference {
  documentPath: string;
  pagePath: string;
  sourcePath: string;
  publicPath: string;
  original: string;
  pathname: string;
  search: string;
  hash: string;
  nodeType: string;
  attribute?: string;
}

/** A local document reference included in the resulting asset plan. */
export interface CollectionAssetDocumentReference extends CollectionAssetResolvedDocumentReference {
  publicPaths: string[];
}

export type CollectionAssetDocumentDiagnosticCode =
  | "invalid-document"
  | "invalid-public-path"
  | "invalid-reference"
  | "missing-document"
  | "missing-file"
  | "outside-content-root"
  | "parse-error";

/** Actionable diagnostic scoped to one selected document and, when relevant, one reference. */
export interface CollectionAssetDocumentDiagnostic {
  code: CollectionAssetDocumentDiagnosticCode;
  documentPath: string;
  pagePath?: string;
  reference?: string;
  sourcePath?: string;
  message: string;
}

export interface PlanCollectionAssetsFromDocumentsInput {
  documents: readonly CollectionAssetDocumentInput[];
  root?: string;
  /** Containment root for selected documents and resolved local files. Defaults to `root`. */
  contentRoot?: string;
  /** Content-addressed public output directory. Defaults to `/assets/content`. */
  contentDir?: string;
  /** Extra assets that are not referenced by selected document bodies. */
  extraAssets?: readonly CollectionAssetInput[];
  /** HTML and MDX JSX attributes to inspect. Defaults to `href`, `src`, and `poster`. */
  attributes?: readonly string[];
  /** Override or add public aliases for a resolved document reference. */
  publicPath?: (
    reference: CollectionAssetResolvedDocumentReference,
  ) => MaybePromise<string | readonly string[] | undefined>;
}

export interface PlanCollectionAssetsFromDocumentsResult {
  manifest: CollectionAssetManifest;
  references: CollectionAssetDocumentReference[];
  diagnostics: CollectionAssetDocumentDiagnostic[];
}

/**
 * Plan content-addressed collection assets by following local references from
 * host-selected Markdown/MDX documents.
 */
export async function planCollectionAssetsFromDocuments(
  input: PlanCollectionAssetsFromDocumentsInput,
): Promise<PlanCollectionAssetsFromDocumentsResult> {
  const root = await fs.realpath(path.resolve(input.root ?? process.cwd()));
  const contentRoot = await resolveContentRoot(root, input.contentRoot);
  const attributes = new Set(input.attributes ?? DEFAULT_REFERENCE_ATTRIBUTES);
  const diagnostics: CollectionAssetDocumentDiagnostic[] = [];
  const references: CollectionAssetDocumentReference[] = [];
  const referenceKeys = new Set<string>();
  const groupedAssets = new Map<string, Set<string>>();

  for (const documentInput of input.documents) {
    const document = await resolveDocument(root, contentRoot, documentInput, diagnostics);
    if (!document) continue;

    const ast = document.ast ?? (await parseDocumentAst(document, diagnostics));
    if (!ast) continue;

    for (const rawReference of collectDocumentReferences(ast, attributes)) {
      const resolved = await resolveDocumentReference(
        document,
        rawReference,
        contentRoot,
        diagnostics,
      );
      if (!resolved) continue;

      const publicPaths = await resolvePublicPaths(resolved, input.publicPath, diagnostics);
      if (publicPaths.length === 0) continue;

      const referenceKey = `${resolved.sourcePath}\0${resolved.original}\0${publicPaths.join("\0")}`;
      if (!referenceKeys.has(referenceKey)) {
        references.push({ ...resolved, publicPaths });
        referenceKeys.add(referenceKey);
      }
      const sourceAssets = groupedAssets.get(resolved.sourcePath) ?? new Set<string>();
      for (const publicPath of publicPaths) sourceAssets.add(publicPath);
      groupedAssets.set(resolved.sourcePath, sourceAssets);
    }
  }

  const assets: CollectionAssetInput[] = [...(input.extraAssets ?? [])];
  for (const [sourcePath, publicPaths] of groupedAssets) {
    assets.push({ sourcePath, publicPath: [...publicPaths] });
  }

  return {
    manifest: await planCollectionAssets({ root, contentDir: input.contentDir, assets }),
    references,
    diagnostics,
  };
}

async function resolveContentRoot(root: string, contentRoot: string | undefined): Promise<string> {
  const candidate = path.resolve(root, contentRoot ?? ".");
  const resolved = await fs.realpath(candidate);
  if (!isWithinOrEqual(root, resolved)) {
    throw new Error(
      `Collection asset contentRoot ${JSON.stringify(contentRoot)} must stay within root.`,
    );
  }
  return resolved;
}

async function resolveDocument(
  root: string,
  contentRoot: string,
  input: CollectionAssetDocumentInput,
  diagnostics: CollectionAssetDocumentDiagnostic[],
): Promise<ResolvedCollectionAssetDocument | undefined> {
  if (!input.documentPath || input.documentPath.includes("\0")) {
    diagnostics.push({
      code: "invalid-document",
      documentPath: input.documentPath,
      pagePath: input.pagePath,
      message: "Collection asset documentPath must be a non-empty file path.",
    });
    return undefined;
  }

  const candidate = path.resolve(root, input.documentPath);
  if (!isWithinOrEqual(contentRoot, candidate)) {
    diagnostics.push(outsideRootDiagnostic(input, candidate));
    return undefined;
  }

  let documentPath: string;
  try {
    documentPath = await fs.realpath(candidate);
  } catch {
    diagnostics.push({
      code: "missing-document",
      documentPath: candidate,
      pagePath: input.pagePath,
      message: `Collection asset document ${JSON.stringify(input.documentPath)} does not exist.`,
    });
    return undefined;
  }

  if (!isWithinOrEqual(contentRoot, documentPath)) {
    diagnostics.push(outsideRootDiagnostic(input, documentPath));
    return undefined;
  }

  return { documentPath, pagePath: input.pagePath, source: input.source, ast: input.ast };
}

function outsideRootDiagnostic(
  input: CollectionAssetDocumentInput,
  sourcePath: string,
): CollectionAssetDocumentDiagnostic {
  return {
    code: "outside-content-root",
    documentPath: input.documentPath,
    pagePath: input.pagePath,
    sourcePath,
    message: `Collection asset document ${JSON.stringify(input.documentPath)} must stay within contentRoot.`,
  };
}

async function parseDocumentAst(
  document: ResolvedCollectionAssetDocument,
  diagnostics: CollectionAssetDocumentDiagnostic[],
): Promise<MarkdownNode | undefined> {
  let source = document.source;
  if (source === undefined) {
    source = await fs.readFile(document.documentPath, "utf8");
  }

  try {
    const napi = await importNapiModule();
    const parsed = napi.parse(source, { mdx: true, gfm: true });
    for (const error of parsed.errors) diagnostics.push(parseDiagnostic(document, error));
    return parsed.ast ? (JSON.parse(parsed.ast) as MarkdownNode) : undefined;
  } catch (error) {
    diagnostics.push(
      parseDiagnostic(document, error instanceof Error ? error.message : String(error)),
    );
    return undefined;
  }
}

function parseDiagnostic(
  document: ResolvedCollectionAssetDocument,
  message: string,
): CollectionAssetDocumentDiagnostic {
  return {
    code: "parse-error",
    documentPath: document.documentPath,
    pagePath: document.pagePath,
    message,
  };
}
