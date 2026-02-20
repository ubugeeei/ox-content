import content from "./content/index.md";

const app = document.getElementById("app");
if (app) {
  app.innerHTML = content.html;
}
