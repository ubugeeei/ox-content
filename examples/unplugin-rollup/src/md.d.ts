declare module '*.md' {
  export const html: string;
  export const frontmatter: Record<string, unknown>;
  export const toc: Array<{
    depth: number;
    text: string;
    slug: string;
    children: unknown[];
  }>;
  const content: {
    html: string;
    frontmatter: Record<string, unknown>;
    toc: typeof toc;
  };
  export default content;
}
