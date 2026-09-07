import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Element, Root } from "hast";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { isWithinOrEqual, normalizePublicPath } from "./collection-asset-document-paths";
import type {
  CollectionAssetDocumentDiagnostic,
  CollectionAssetResolvedDocumentReference,
  PlanCollectionAssetsFromDocumentsInput,
} from "./collection-asset-documents";
import type { MarkdownNode } from "./types";

const URL_SCHEME = /^[a-zA-Z][a-zA-Z\d+.-]*:/u;

export interface ResolvedCollectionAssetDocument {
  documentPath: string;
  pagePath: string;
  source?: string;
  ast?: MarkdownNode;
}

export interface RawCollectionAssetDocumentReference {
  original: string;
  nodeType: string;
  attribute?: string;
}

interface ParsedReference {
  pathname: string;
  search: string;
  hash: string;
}

export function collectDocumentReferences(
  ast: MarkdownNode,
  attributes: ReadonlySet<string>,
): RawCollectionAssetDocumentReference[] {
  const references: RawCollectionAssetDocumentReference[] = [];
  walkMarkdown(ast, (node) => {
    const url = typeof node.url === "string" ? node.url : undefined;
    if (url && (node.type === "image" || node.type === "link" || node.type === "definition")) {
      references.push({ original: url, nodeType: node.type, attribute: "url" });
    }
    if (node.type === "html" && typeof node.value === "string") {
      references.push(...collectHtmlReferences(node.value, attributes));
    }
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      references.push(...collectMdxJsxReferences(node, attributes));
    }
  });
  return references;
}

export async function resolveDocumentReference(
  document: ResolvedCollectionAssetDocument,
  rawReference: RawCollectionAssetDocumentReference,
  contentRoot: string,
  diagnostics: CollectionAssetDocumentDiagnostic[],
): Promise<CollectionAssetResolvedDocumentReference | undefined> {
  const parsed = parseLocalReference(rawReference.original, document, diagnostics);
  if (!parsed) return undefined;

  const relativePath = decodeReferencePath(parsed.pathname, document, rawReference, diagnostics);
  if (!relativePath) return undefined;

  const candidate = path.resolve(path.dirname(document.documentPath), relativePath);
  if (!isWithinOrEqual(contentRoot, candidate)) {
    diagnostics.push(
      referenceDiagnostic("outside-content-root", document, rawReference, candidate),
    );
    return undefined;
  }

  let sourcePath: string;
  try {
    sourcePath = await fs.realpath(candidate);
  } catch {
    diagnostics.push(referenceDiagnostic("missing-file", document, rawReference, candidate));
    return undefined;
  }

  const stats = await fs.stat(sourcePath);
  if (!stats.isFile()) {
    diagnostics.push({
      code: "invalid-reference",
      documentPath: document.documentPath,
      pagePath: document.pagePath,
      reference: rawReference.original,
      sourcePath,
      message: `Collection asset reference ${JSON.stringify(rawReference.original)} is not a file.`,
    });
    return undefined;
  }

  if (!isWithinOrEqual(contentRoot, sourcePath)) {
    diagnostics.push(
      referenceDiagnostic("outside-content-root", document, rawReference, sourcePath),
    );
    return undefined;
  }

  return {
    ...rawReference,
    documentPath: document.documentPath,
    pagePath: document.pagePath,
    sourcePath,
    publicPath: publicPathFor(document.pagePath, parsed.pathname),
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
  };
}

export async function resolvePublicPaths(
  reference: CollectionAssetResolvedDocumentReference,
  publicPath: PlanCollectionAssetsFromDocumentsInput["publicPath"] | undefined,
  diagnostics: CollectionAssetDocumentDiagnostic[],
): Promise<string[]> {
  let value: string | readonly string[] | undefined;
  try {
    value = await publicPath?.(reference);
  } catch (error) {
    diagnostics.push(
      publicPathDiagnostic(reference, error instanceof Error ? error.message : String(error)),
    );
    return [];
  }

  const publicPaths = value === undefined ? [reference.publicPath] : valuesToArray(value);
  if (publicPaths.length === 0) {
    diagnostics.push(
      publicPathDiagnostic(
        reference,
        "Collection asset publicPath must contain at least one URL path.",
      ),
    );
    return [];
  }

  const normalized = new Set<string>();
  for (const candidate of publicPaths) {
    try {
      normalized.add(normalizePublicPath(candidate));
    } catch (error) {
      diagnostics.push(
        publicPathDiagnostic(reference, error instanceof Error ? error.message : String(error)),
      );
    }
  }
  return [...normalized];
}

function walkMarkdown(node: MarkdownNode, visit: (node: MarkdownNode) => void): void {
  visit(node);
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) walkMarkdown(child, visit);
}

function collectHtmlReferences(
  html: string,
  attributes: ReadonlySet<string>,
): RawCollectionAssetDocumentReference[] {
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html) as Root;
  const references: RawCollectionAssetDocumentReference[] = [];
  visitElements(tree, (node) => {
    for (const attribute of attributes) {
      const value = node.properties?.[attribute];
      if (typeof value === "string") {
        references.push({ original: value, nodeType: "html", attribute });
      }
    }
  });
  return references;
}

function visitElements(node: Root | Element, visit: (node: Element) => void): void {
  if (node.type === "element") visit(node);
  if (!("children" in node)) return;
  for (const child of node.children) {
    if (child.type === "element") visitElements(child, visit);
  }
}

function collectMdxJsxReferences(
  node: MarkdownNode,
  attributes: ReadonlySet<string>,
): RawCollectionAssetDocumentReference[] {
  const entries = Array.isArray(node.attributes) ? node.attributes : [];
  const references: RawCollectionAssetDocumentReference[] = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const attribute = entry as { type?: unknown; name?: unknown; value?: unknown };
    if (
      attribute.type === "mdxJsxAttribute" &&
      typeof attribute.name === "string" &&
      attributes.has(attribute.name) &&
      typeof attribute.value === "string"
    ) {
      references.push({
        original: attribute.value,
        nodeType: node.type,
        attribute: attribute.name,
      });
    }
  }
  return references;
}

function parseLocalReference(
  value: string,
  document: ResolvedCollectionAssetDocument,
  diagnostics: CollectionAssetDocumentDiagnostic[],
): ParsedReference | undefined {
  const reference = value.trim();
  if (
    !reference ||
    reference.startsWith("#") ||
    reference.startsWith("?") ||
    reference.startsWith("/") ||
    reference.startsWith("//") ||
    URL_SCHEME.test(reference)
  ) {
    return undefined;
  }

  const hashIndex = reference.indexOf("#");
  const queryIndex = reference.indexOf("?");
  const endIndex = minPositive(hashIndex, queryIndex) ?? reference.length;
  const pathname = reference.slice(0, endIndex);
  if (!pathname) return undefined;
  if (pathname.includes("\0")) {
    diagnostics.push({
      code: "invalid-reference",
      documentPath: document.documentPath,
      pagePath: document.pagePath,
      reference: value,
      message: `Collection asset reference ${JSON.stringify(value)} contains an invalid path.`,
    });
    return undefined;
  }

  return {
    pathname,
    search:
      queryIndex >= 0 && (hashIndex < 0 || queryIndex < hashIndex)
        ? reference.slice(queryIndex, hashIndex >= 0 ? hashIndex : undefined)
        : "",
    hash: hashIndex >= 0 ? reference.slice(hashIndex) : "",
  };
}

function minPositive(first: number, second: number): number | undefined {
  const values = [first, second].filter((value) => value >= 0);
  return values.length === 0 ? undefined : Math.min(...values);
}

function decodeReferencePath(
  pathname: string,
  document: ResolvedCollectionAssetDocument,
  rawReference: RawCollectionAssetDocumentReference,
  diagnostics: CollectionAssetDocumentDiagnostic[],
): string | undefined {
  try {
    return pathname
      .split("/")
      .map((segment) => decodeReferenceSegment(segment, rawReference.original))
      .join(path.sep);
  } catch (error) {
    diagnostics.push({
      code: "invalid-reference",
      documentPath: document.documentPath,
      pagePath: document.pagePath,
      reference: rawReference.original,
      message: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}

function decodeReferenceSegment(segment: string, reference: string): string {
  const decoded = decodeURIComponent(segment);
  if (decoded.includes("/") || decoded.includes("\\") || hasControlCharacter(decoded)) {
    throw new Error(
      `Collection asset reference ${JSON.stringify(reference)} contains an unsafe path segment.`,
    );
  }
  return decoded;
}

function publicPathFor(pagePath: string, pathname: string): string {
  const pageBase = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  const basePath = pageBase.endsWith("/") ? pageBase : `${pageBase}/`;
  const url = new URL(pathname, `https://ox-content.local${basePath}`);
  return normalizePublicPath(url.pathname);
}

function valuesToArray(value: string | readonly string[]): string[] {
  return typeof value === "string" ? [value] : [...value];
}

function publicPathDiagnostic(
  reference: CollectionAssetResolvedDocumentReference,
  message: string,
): CollectionAssetDocumentDiagnostic {
  return {
    code: "invalid-public-path",
    documentPath: reference.documentPath,
    pagePath: reference.pagePath,
    reference: reference.original,
    sourcePath: reference.sourcePath,
    message,
  };
}

function referenceDiagnostic(
  code: "missing-file" | "outside-content-root",
  document: ResolvedCollectionAssetDocument,
  reference: RawCollectionAssetDocumentReference,
  sourcePath: string,
): CollectionAssetDocumentDiagnostic {
  return {
    code,
    documentPath: document.documentPath,
    pagePath: document.pagePath,
    reference: reference.original,
    sourcePath,
    message:
      code === "missing-file"
        ? `Collection asset reference ${JSON.stringify(reference.original)} does not exist.`
        : `Collection asset reference ${JSON.stringify(reference.original)} must stay within contentRoot.`,
  };
}

function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code < 32 || code === 127) return true;
  }
  return false;
}
