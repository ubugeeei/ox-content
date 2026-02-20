/**
 * Chromium browser session with automatic cleanup via Explicit Resource Management.
 *
 * Usage:
 *   await using session = await openBrowser();
 *   const png = await session.renderPage(html, 1200, 630);
 *   // browser.close() is called automatically when session goes out of scope
 */

import type { Page } from "playwright";
import { renderHtmlToPng } from "./renderer";

/**
 * A browser session that can render HTML pages to PNG.
 * Implements AsyncDisposable for automatic cleanup via `await using`.
 */
export interface OgBrowserSession extends AsyncDisposable {
  renderPage(html: string, width: number, height: number): Promise<Buffer>;
}

/**
 * Opens a Chromium browser and returns a session for rendering OG images.
 * Returns null if Playwright/Chromium is not available.
 *
 * The session implements AsyncDisposable — use `await using` for automatic cleanup:
 * ```ts
 * await using session = await openBrowser();
 * if (!session) return;
 * const png = await session.renderPage(html, 1200, 630);
 * ```
 */
export async function openBrowser(): Promise<OgBrowserSession | null> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    return {
      async renderPage(html: string, width: number, height: number): Promise<Buffer> {
        const page: Page = await browser.newPage();
        try {
          return await renderHtmlToPng(page, html, width, height);
        } finally {
          await page.close();
        }
      },

      async [Symbol.asyncDispose]() {
        try {
          await browser.close();
        } catch {
          // Ignore close errors
        }
      },
    };
  } catch (err) {
    console.warn(
      "[ox-content:og-image] Chromium not available, skipping OG image generation.",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
