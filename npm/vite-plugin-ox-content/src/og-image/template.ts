/**
 * Default OG image template.
 *
 * Uses inline HTML/CSS for a gradient background with title, description,
 * siteName, and tags. No external dependencies required.
 */

import type { OgImageTemplateFn, OgImageTemplateProps } from "./types";

/**
 * Escapes HTML special characters.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Returns the built-in default template function.
 */
export function getDefaultTemplate(): OgImageTemplateFn {
  return function defaultTemplate(props: OgImageTemplateProps): string {
    const { title, description, siteName, tags } = props;

    const tagsHtml = tags?.length
      ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;">
          ${tags.map((tag) => `<span style="background:rgba(255,255,255,0.15);color:#e2e8f0;padding:4px 12px;border-radius:16px;font-size:14px;">${escapeHtml(tag)}</span>`).join("")}
        </div>`
      : "";

    return `<div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:60px 80px;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="display:flex;flex-direction:column;gap:16px;flex:1;justify-content:center;">
    <h1 style="font-size:56px;font-weight:700;color:#ffffff;line-height:1.2;margin:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">${escapeHtml(title)}</h1>
    ${description ? `<p style="font-size:24px;color:#94a3b8;line-height:1.5;margin:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml(description)}</p>` : ""}
  </div>
  <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:auto;">
    ${siteName ? `<span style="font-size:20px;color:#64748b;font-weight:500;">${escapeHtml(siteName)}</span>` : ""}
    ${tagsHtml}
  </div>
</div>`;
  };
}
