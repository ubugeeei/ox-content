/// <reference types="vite/client" />

declare module "*.md" {
  const content: {
    html: string
    frontmatter: Record<string, unknown>
    toc: Array<{
      depth: number
      text: string
      slug: string
      children: Array<{
        depth: number
        text: string
        slug: string
        children: any[]
      }>
    }>
  }
  export default content
  export const html: string
  export const frontmatter: Record<string, unknown>
  export const toc: Array<any>
}
