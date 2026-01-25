import content from "./content.md"

document.getElementById("app")!.innerHTML = `
  <h1>ox-content native plugin example</h1>
  <pre>${JSON.stringify(content.frontmatter, null, 2)}</pre>
  <div>${content.html}</div>
`
