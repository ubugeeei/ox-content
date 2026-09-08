import { afterEach, describe, expect, it } from "vite-plus/test";
import { build as viteBuild, createServer } from "vite";
import {
  cleanupCustomHostSsrFixtures,
  createProject,
  hasMarker,
  listen,
  read,
  readDistJs,
  readLinkedCss,
  readOutput,
  resourcePaths,
  serveDist,
  trackDevServer,
  viteConfig,
  wait,
  writeProjectFile,
} from "./custom-host-ssr-stylesheets.fixture";

afterEach(cleanupCustomHostSsrFixtures);

describe("custom host SSR stylesheets", () => {
  it("emits route-specific SSR styles without browser-bundling server modules", async () => {
    const root = await createProject("ox-custom-host-ssr-style-build-");

    await viteBuild(viteConfig(root));

    const home = await readOutput(root, "home/index.html");
    const work = await readOutput(root, "work/index.html");
    expect(hasMarker(home, "src-layout")).toBe(true);
    expect(hasMarker(home, "src-pages-home-page")).toBe(true);
    expect(hasMarker(home, "island")).toBe(true);
    expect(hasMarker(home, "src-pages-work-page")).toBe(false);
    expect(hasMarker(work, "src-layout")).toBe(true);
    expect(hasMarker(work, "src-pages-work-page")).toBe(true);
    expect(hasMarker(work, "island")).toBe(true);
    expect(hasMarker(work, "src-pages-home-page")).toBe(false);
    expect(home).toMatch(/href="\/docs\/assets\/src-layout-[^"]+\.css"/u);
    expect(home).toMatch(/href="\/docs\/assets\/src-pages-home-page-[^"]+\.css"/u);
    expect(home.indexOf('rel="stylesheet"')).toBeLessThan(home.indexOf('<script type="module"'));
    expect(home).not.toContain("server-only");

    const homeCss = await readLinkedCss(root, home);
    const homeTitleClass = elementClass(home, "main");
    const layoutClass = elementClass(home, "div");
    expect(homeTitleClass).not.toBe("homeTitle");
    expect(layoutClass).not.toBe("layoutScoped");
    expect(homeCss).toContain(cssClassSelector(homeTitleClass));
    expect(homeCss).toContain(cssClassSelector(layoutClass));
    expect(homeCss).not.toContain(".homeTitle{");
    expect(homeCss).not.toContain(".layoutScoped{");
    expect(homeCss).not.toContain(":global");
    expect(homeCss).toMatch(/body\[data-page-style=home\]/u);
    expect(home).toContain(cssClassSelector(homeTitleClass));
    expect(home).toContain(cssClassSelector(layoutClass));
    expect(homeCss).toContain(".layout");
    expect(homeCss).toContain(".nested");
    expect(homeCss).toContain(".home");
    expect(homeCss).toContain(".prose");
    expect(homeCss).toContain(".fixture-package");
    expect(homeCss).not.toContain("@import");
    expect(homeCss).not.toContain(".work");
    expect(home).toContain('data-style-content-diagnostics=""');
    expect(home).toContain("data-critical");
    expect(home).toContain(".fixture-package");
    expect(home).not.toContain("@import");

    const staticServer = await serveDist(root);
    for (const resource of resourcePaths(home, homeCss)) {
      expect((await read(staticServer.port, resource)).status, resource).toBe(200);
    }

    const workCss = await readLinkedCss(root, work);
    expect(workCss).toContain(".work");
    expect(workCss).not.toContain(".home");

    const scripts = await readDistJs(root);
    expect(scripts).not.toContain("server-only");
  });

  it("serves blocking dev styles and invalidates nested import changes", async () => {
    const root = await createProject("ox-custom-host-ssr-style-dev-");
    const server = await trackDevServer(createServer(viteConfig(root, { reloadDebounceMs: 1 })));
    const listener = await listen(server);

    const home = await read(listener.port, "/docs/home");
    expect(home.text).toContain('data-render="1"');
    expect(home.text).toContain('href="/docs/src/layout.css"');
    expect(home.text).toContain('href="/docs/src/components/nested.css"');
    expect(home.text).toContain('href="/docs/src/pages/home/home.css"');
    expect(home.text).not.toContain('href="/docs/src/pages/work/work.css"');
    expect(home.text.indexOf('href="/docs/src/layout.css"')).toBeLessThan(
      home.text.indexOf('src="/docs/src/main.ts"'),
    );

    await writeProjectFile(
      root,
      "src/components/Nested.ts",
      'import "./nested.css";\nimport "./nested-extra.css";\nexport const nested = "nested";\n',
    );
    await writeProjectFile(root, "src/components/nested-extra.css", ".extra{}\n");
    server.watcher.emit("change", `${root}/src/components/Nested.ts`);
    await wait(30);

    const updated = await read(listener.port, "/docs/home");
    expect(updated.text).toContain('data-render="2"');
    expect(updated.text).toContain('href="/docs/src/components/nested-extra.css"');
  });

  it("keeps shared static dev SSR styles in every root descriptor", async () => {
    const root = await createProject("ox-custom-host-ssr-style-shared-dev-");
    const server = await trackDevServer(createServer(viteConfig(root, { reloadDebounceMs: 1 })));
    const listener = await listen(server);

    const response = await read(listener.port, "/docs/shared");
    expect(response.status).toBe(200);
    const result = JSON.parse(response.text);

    expect(result.stylesheets).toEqual(["/docs/src/shared.css"]);
    expect(result.descriptors).toEqual([
      { moduleId: "/src/shared-a.ts", stylesheets: ["/docs/src/shared.css"] },
      { moduleId: "/src/shared-b.ts", stylesheets: ["/docs/src/shared.css"] },
    ]);
  });

  it("reports unsupported local dynamic SSR imports", async () => {
    const root = await createProject("ox-custom-host-ssr-style-diagnostic-");
    await writeProjectFile(
      root,
      "src/pages/home/page.ts",
      'import("./late.css");\nimport "./home.css";\nexport const marker = "home server-only";\n',
    );
    await writeProjectFile(root, "src/pages/home/late.css", ".late{}\n");

    await viteBuild(viteConfig(root));

    const home = await readOutput(root, "home/index.html");
    expect(home).toContain('data-diagnostics="unsupported-import"');
    expect(await readLinkedCss(root, home)).not.toContain(".late");
  });
});

function elementClass(html: string, tag: "div" | "main"): string {
  const match =
    tag === "div"
      ? /<div class="([^"]+) nested">/u.exec(html)
      : /<main class="([^"]+)">/u.exec(html);
  const value = match?.[1]?.split(/\s+/u)[0];
  if (!value) {
    throw new Error(`Missing ${tag} class in ${html}`);
  }
  return value;
}

function cssClassSelector(className: string): string {
  return `.${className}`;
}
