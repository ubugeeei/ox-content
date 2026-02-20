/**
 * Custom OG Image Template
 *
 * This file is bundled by rolldown at build time and used to render
 * OG images for each page. It receives all frontmatter data as props.
 *
 * The default export must be a function: (props) => string (HTML)
 */

interface OgImageProps {
  title: string;
  description?: string;
  siteName?: string;
  author?: string;
  tags?: string[];
  category?: string;
  coverColor?: string;
  [key: string]: unknown;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function ogTemplate(props: OgImageProps): string {
  const {
    title,
    description,
    siteName,
    author,
    tags,
    category,
    coverColor = "#6366f1",
  } = props;

  const categoryBadge = category
    ? `<span style="display:inline-block;background:${coverColor};color:#fff;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">${escapeHtml(category)}</span>`
    : "";

  const tagsHtml = tags?.length
    ? `<div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${tags.map((tag) => `<span style="color:${coverColor};font-size:14px;font-weight:500;">#${escapeHtml(tag)}</span>`).join("")}
      </div>`
    : "";

  const authorHtml = author
    ? `<div style="display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:${coverColor};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;">${escapeHtml(author[0].toUpperCase())}</div>
        <span style="font-size:16px;color:#64748b;font-weight:500;">${escapeHtml(author)}</span>
      </div>`
    : "";

  return `<div style="width:100%;height:100%;display:flex;flex-direction:column;background:#ffffff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="height:8px;background:linear-gradient(90deg,${coverColor},${coverColor}cc);"></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:48px 64px;gap:20px;">
    <div style="display:flex;align-items:center;gap:12px;">
      ${categoryBadge}
    </div>
    <h1 style="font-size:52px;font-weight:800;color:#0f172a;line-height:1.2;margin:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml(title)}</h1>
    ${description ? `<p style="font-size:22px;color:#475569;line-height:1.5;margin:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml(description)}</p>` : ""}
    ${tagsHtml}
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;padding:24px 64px;border-top:1px solid #e2e8f0;">
    ${authorHtml}
    ${siteName ? `<span style="font-size:16px;color:#94a3b8;font-weight:600;">${escapeHtml(siteName)}</span>` : ""}
  </div>
</div>`;
}
