/**
 * HTML → PNG renderer using Chromium screenshots via Playwright.
 */

import type { Page } from "playwright";

/**
 * Wraps template HTML in a minimal document with viewport locked to given dimensions.
 */
function wrapHtml(bodyHtml: string, width: number, height: number): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

/**
 * Renders an HTML string to a PNG buffer using Chromium.
 *
 * @param page - Playwright page instance
 * @param html - HTML string from template function
 * @param width - Image width
 * @param height - Image height
 * @returns PNG buffer
 */
export async function renderHtmlToPng(
  page: Page,
  html: string,
  width: number,
  height: number,
): Promise<Buffer> {
  await page.setViewportSize({ width, height });

  const fullHtml = wrapHtml(html, width, height);
  await page.setContent(fullHtml, { waitUntil: "networkidle" });

  const screenshot = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width, height },
  });

  return Buffer.from(screenshot);
}
