import content from "./content.md";

document.getElementById("app")!.innerHTML = `
  <h1>ox-content mdast js plugin example</h1>
  <pre>${JSON.stringify(content.frontmatter, null, 2)}</pre>
  <div>${content.html}</div>
`;
