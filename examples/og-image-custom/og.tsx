/**
 * React Server Component OG Image Template
 *
 * Receives page metadata as props and renders JSX for OG image generation.
 * Rendered via React SSR (renderToReadableStream) at build time.
 *
 * Supports async Server Components (React 19+).
 */

interface OgImageProps {
  title: string;
  description?: string;
  siteName?: string;
  author?: string;
  tags?: string[];
  category?: string;
  coverColor?: string;
}

export default function OgTemplate(props: OgImageProps) {
  const {
    title,
    description,
    siteName,
    author,
    tags,
    category,
    coverColor = "#6366f1",
  } = props;

  return (
    <>
      <style>{`
        .og {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .accent-bar {
          height: 8px;
        }
        .body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 64px;
          gap: 20px;
        }
        .category {
          display: inline-block;
          color: #fff;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          align-self: flex-start;
        }
        .title {
          font-size: 52px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          margin: 0;
        }
        .description {
          font-size: 22px;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }
        .tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tag {
          font-size: 14px;
          font-weight: 500;
        }
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 64px;
          border-top: 1px solid #e2e8f0;
        }
        .author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 18px;
        }
        .author-name {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
        }
        .site-name {
          font-size: 16px;
          color: #94a3b8;
          font-weight: 600;
        }
      `}</style>
      <div className="og">
        <div
          className="accent-bar"
          style={{ background: `linear-gradient(90deg, ${coverColor}, ${coverColor}cc)` }}
        />
        <div className="body">
          {category && (
            <span className="category" style={{ background: coverColor }}>
              {category}
            </span>
          )}
          <h1 className="title">{title}</h1>
          {description && <p className="description">{description}</p>}
          {tags && tags.length > 0 && (
            <div className="tags">
              {tags.map((tag) => (
                <span key={tag} className="tag" style={{ color: coverColor }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="footer">
          {author && (
            <div className="author">
              <div className="avatar" style={{ background: coverColor }}>
                {author[0].toUpperCase()}
              </div>
              <span className="author-name">{author}</span>
            </div>
          )}
          {siteName && <span className="site-name">{siteName}</span>}
        </div>
      </div>
    </>
  );
}
