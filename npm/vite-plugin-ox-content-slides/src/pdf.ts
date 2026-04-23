import * as fs from "node:fs/promises";
import * as http from "node:http";
import * as path from "node:path";

export interface SlidePdfOptions {
  enabled?: boolean;
  fileName?: string;
  pageWidth?: string;
  pageHeight?: string;
  scale?: number;
}

export interface ResolvedSlidePdfOptions {
  enabled: boolean;
  fileName: string;
  pageWidth: string;
  pageHeight: string;
  scale: number;
}

export interface DeckPdfTask {
  htmlPath: string;
  pdfPath: string;
}

export interface DeckPdfResult {
  files: string[];
  errors: string[];
}

const DEFAULT_FILE_NAME = "deck.pdf";
const DEFAULT_PAGE_WIDTH = "13.333in";
const DEFAULT_PAGE_HEIGHT = "7.5in";
const DEFAULT_SCALE = 1;

function normalizeScale(input: number | undefined): number {
  if (input === undefined) {
    return DEFAULT_SCALE;
  }

  if (!Number.isFinite(input)) {
    return DEFAULT_SCALE;
  }

  return Math.min(2, Math.max(0.1, input));
}

export function resolveSlidePdfOptions(
  options: SlidePdfOptions | boolean | undefined,
): ResolvedSlidePdfOptions {
  if (options === false || options === undefined) {
    return {
      enabled: false,
      fileName: DEFAULT_FILE_NAME,
      pageWidth: DEFAULT_PAGE_WIDTH,
      pageHeight: DEFAULT_PAGE_HEIGHT,
      scale: DEFAULT_SCALE,
    };
  }

  if (options === true) {
    return {
      enabled: true,
      fileName: DEFAULT_FILE_NAME,
      pageWidth: DEFAULT_PAGE_WIDTH,
      pageHeight: DEFAULT_PAGE_HEIGHT,
      scale: DEFAULT_SCALE,
    };
  }

  return {
    enabled: options.enabled ?? true,
    fileName: options.fileName?.trim() || DEFAULT_FILE_NAME,
    pageWidth: options.pageWidth?.trim() || DEFAULT_PAGE_WIDTH,
    pageHeight: options.pageHeight?.trim() || DEFAULT_PAGE_HEIGHT,
    scale: normalizeScale(options.scale),
  };
}

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html";
    case ".js":
      return "application/javascript";
    case ".css":
      return "text/css";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".json":
      return "application/json";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    case ".ttf":
      return "font/ttf";
    default:
      return "application/octet-stream";
  }
}

async function resolveServedPath(rootDir: string, pathname: string): Promise<string> {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = decodedPath.replace(/^\/+/, "");
  const candidate = path.resolve(rootDir, normalizedPath);

  if (!candidate.startsWith(rootDir)) {
    throw new Error(`Refusing to serve path outside root: ${pathname}`);
  }

  if (path.extname(candidate)) {
    return candidate;
  }

  return path.join(candidate, "index.html");
}

async function startStaticServer(
  rootDir: string,
): Promise<{ origin: string; close: () => Promise<void> }> {
  const server = http.createServer(async (req, res) => {
    const requestUrl = req.url ?? "/";
    const pathname = requestUrl.split("?")[0] ?? "/";

    try {
      const filePath = await resolveServedPath(rootDir, pathname);
      const body = await fs.readFile(filePath);
      res.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
      res.end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("not found");
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to determine local server address for slide PDF export.");
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    },
  };
}

function relativeUrlPath(rootDir: string, filePath: string): string {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

export async function generateDeckPdfs(
  tasks: DeckPdfTask[],
  rootDir: string,
  options: ResolvedSlidePdfOptions,
): Promise<DeckPdfResult> {
  const files: string[] = [];
  const errors: string[] = [];

  if (!options.enabled || tasks.length === 0) {
    return { files, errors };
  }

  try {
    const { chromium } = await import("playwright");
    const server = await startStaticServer(rootDir);
    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    try {
      const page = await browser.newPage();
      try {
        for (const task of tasks) {
          const urlPath = relativeUrlPath(rootDir, task.htmlPath);
          await page.goto(`${server.origin}/${urlPath}`, { waitUntil: "networkidle" });
          await page.waitForFunction(() => document.fonts.status === "loaded");
          await fs.mkdir(path.dirname(task.pdfPath), { recursive: true });
          await page.pdf({
            path: task.pdfPath,
            width: options.pageWidth,
            height: options.pageHeight,
            scale: options.scale,
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
              top: "0",
              right: "0",
              bottom: "0",
              left: "0",
            },
          });
          files.push(task.pdfPath);
        }
      } finally {
        await page.close();
      }
    } finally {
      await browser.close();
      await server.close();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`PDF export skipped because Chromium was not available: ${message}`);
  }

  return { files, errors };
}
