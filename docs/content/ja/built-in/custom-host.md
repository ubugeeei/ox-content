---
title: 独自ホスト lifecycle
description: 独自 HTML ホスト向けに、Vite loading、development routing、cache invalidation、出力書き出しを Ox Content が持つ。
---

# 独自ホスト lifecycle

サイトが layout と公開ポリシーを持ちつつ、Vite lifecycle は Ox Content に任せたい
場合は `oxContentCustomHost()` を使います。

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { oxContentCustomHost } from "@ox-content/vite-plugin";

export default defineConfig({
  appType: "custom",
  plugins: [
    oxContentCustomHost({
      host: "./src/site-host.ts",
      oxContent: {
        srcDir: "content",
        redirects: { provider: "netlify" },
        ssg: {
          markdownSource: true,
          siteUrl: "https://example.com",
          siteName: "Example",
        },
      },
      themeTokens: {
        theme: colorScheme,
        include: (name) => name.startsWith("syntax-"),
      },
    }),
  ],
});
```

この factory は `oxContent({ ssg: { enabled: false } })` と独自ホスト plugin を
一緒に登録します。すでに `oxContent()` を自分で入れているホスト向けには、
低レベルの `createOxContentCustomHostPlugin()` もあります。

## ホスト module

ホスト module は route を export します。route は通常の `Response`、または
`html`、`text`、`contentType`、metadata、dependencies を持つ plain object を
返せます。

```ts
// src/site-host.ts
export default {
  routes: [
    {
      path: "/",
      inputPath: "content/index.md",
      source: "# Home\n",
      aliases: ["/old-home"],
      dependencies: ["src/data.ts"],
      async render(ctx) {
        const data = await ctx.loadModule("/src/data.ts");
        const assets = ctx.assets.document({
          head: "<title>" + data.title + "</title>",
          sharedStyles: [ctx.assets.themeTokens?.href].filter(Boolean),
          clientEntries: ["src/main.ts"],
          crossorigin: true,
        });

        return {
          html: `<!doctype html><html><head>${assets.headHtml}</head><body>${data.html}</body></html>`,
          title: data.title,
        };
      },
    },
  ],
  async outputs(ctx) {
    const content = await ctx.memo("content", () => ctx.loadModule("/src/content.ts"));
    return {
      siteDescription: content.siteDescription,
      collectionNames: ["blog", "media"],
      collections: {
        blog: content.blogFeedItems,
        media: content.mediaFeedItems,
      },
    };
  },
};
```

development では Ox Content が Vite 経由で host を SSR load し、route を dispatch
します。status と content type を保ち、HTML だけに `transformIndexHtml()` を適用し、
route も custom 404 もなければ fallthrough します。route response は promise として
cache され、宣言した dependency の変更で該当 response だけ invalidation されます。
reload は debounce され、失敗した render は次回 retry され、古い in-flight render が
新しい cache entry を消すこともありません。

production では Vite が client asset と `.vite/manifest.json` を出したあと、
`closeBundle` から一度だけ走ります。host と site module を SSR load するためだけに
一時的な middleware-mode Vite server を開き、raw server ではなく `ctx.loadModule` を
渡し、`finally` で必ず閉じます。
`outputs(ctx)` は build 専用で、`feeds` が有効なときだけ呼ばれます。

`ctx.memo(key, load)` は、1 回の build または development route catalogue 生成中に
高価な読み込みを共有します。`routes(ctx)` と `outputs(ctx)` で同じ key を使えば、
module-global mutable state なしで host-owned content artifact を再利用できます。
失敗した loader は memo から消えるので次回 retry できます。

## 協調する出力

ホストが描画した HTML route は、既定 SSG と同じ公開 writer に接続されます。

- `writeResourceFiles()` による resource fingerprint と HTML URL 書き換え。
- `writeSelfHostedAssets()` による font と Iconify CSS。
- route `source` からの `writeMarkdownCompanions()`。
- route `aliases` / `redirect` からの `writeRedirectOutputs()`。
- 選択された route metadata からの `writeFeedFiles()` と `writeSiteMapFiles()`。

route metadata は route または render result に置きます。`title`、`description`、
`source`、`aliases`、`redirect`、`lastUpdatedPaths`、publish-state field はその HTML
page を説明します。page ではない site-output data は `outputs(ctx)` に置きます。
programmatic default `items`、名前付き feed `collections`、`collectionNames`、
`siteDescription` がそれです。Ox Content はその data を `planSsgOutputs()` と既存の
feed writer に流すので、publish-state filtering、validation、output path、diagnostic は
組み込み SSG と共有されます。

組み込み SSG page には `ssg.minifyHtml: true`、独自ホスト plugin には
`build.minifyHtml: true` を指定すると production HTML を minify します。独自ホストの
build option を省略したときは `oxContent.ssg.minifyHtml` に従います。minify は
`transformIndexHtml()` と resource URL rewrite のあと、HTML file を書く直前に走ります。
XML feed、JSON feed、Markdown companion、text output、binary asset は変換しません。

route の出力 path が重複すると、どの route 同士が衝突したかを示して build を
失敗させます。公開対象の選択はホストが持ち、Ox Content はホストが返した route
だけを書きます。

## コレクションアセット

collection に付随する project image や download file を host が所有し、それを同じ manifest で
Ox Content に dev 配信 / build 書き出しさせたい場合は `collectionAssets` を使います。

```ts
oxContentCustomHost({
  host: "./src/site-host.ts",
  collectionAssets: {
    manifest: async (ctx) =>
      planCollectionAssets({
        root: ctx.root,
        assets: [
          {
            sourcePath: "content/projects/cover.jpg",
            publicPath: "/projects/cover.jpg",
          },
        ],
      }),
    watch: [{ path: "content/projects", kind: "directory" }],
    ownedPrefixes: ["/assets/content"],
  },
});
```

development では middleware が route rendering より前に alias と content-addressed target を
配信します。owned prefix 配下で file が見つからない URL は host router に fallthrough せず
404 になります。watch 対象 file や manifest source file が変わると、Ox Content は manifest を
re-plan し、成功した plan のあとで cached route response を消して reload します。失敗した
re-plan は retry 可能で、最後に成功した manifest を置き換えません。production では
`collectionAssets.write` が `false` でない限り、collection asset は協調 output file と一緒に
書き出されます。

route、render、output hook は、同じ configured snapshot を
`ctx.assets.collectionManifest()` から読めます。HTML rewrite や structured page data の alias
解決が必要な場合に使います。writer と development middleware はその resolved manifest を
再利用するため、`collectionAssets.manifest` を二度呼びません。

```ts
const manifest = await ctx.assets.collectionManifest();
const body = manifest
  ? rewriteCollectionAssetUrls({
      html,
      pagePath: ctx.url.pathname,
      manifest,
    }).html
  : html;
```

既に公開する Markdown / MDX document の集合が決まっているなら、拡張子 allowlist や広い glob
ではなく `planCollectionAssetsFromDocuments()` を使えます。

```ts
collectionAssets: {
  manifest: async (ctx) => {
    const result = await planCollectionAssetsFromDocuments({
      root: ctx.root,
      contentRoot: "content",
      documents: [{ documentPath: "content/posts/hello.mdx", pagePath: "/posts/hello" }],
      extraAssets: [{ sourcePath: "content/posts/og.png", publicPath: "/og/hello.png" }],
      publicPath: (reference) => [reference.publicPath, `/legacy${reference.publicPath}`],
    });
    if (result.diagnostics.length > 0) {
      throw new Error(result.diagnostics.map((diagnostic) => diagnostic.message).join("\n"));
    }
    return result.manifest;
  },
}
```

この helper は選択された document だけから、relative な Markdown image/link URL と、
literal な HTML / MDX JSX の `href`、`src`、`poster` 属性を見つけます。file は実際の
document path から解決し、既存の `CollectionAssetManifest` を返します。外部 URL、
root-absolute URL、data/blob、fragment-only link などの non-local URL は対象外です。
missing file と `contentRoot` 外への参照は document-scoped diagnostic になり、query
string と fragment は後続の `rewriteCollectionAssetUrls()` で保持できます。

Solid HTML-string host は、同じ選択済み route / document set から browser island registry を
生成できます。`@ox-content/vite-plugin-solid` の
`createSolidHtmlHostIslandRegistry()` を使い、client entry では directory 全体の
`import.meta.glob()` の代わりに `virtual:ox-content-solid/html-host/modules` を
import します。生成 module には選択された island dynamic-import root だけが入り、
Vite はその transitive dependency を保持します。

## Island stylesheet

描画済み route が SSR-visible island の browser module id を知っている場合は、
blocking CSS を `ctx.assets.stylesheets()` から解決します。

```ts
const islandStyles = ctx.assets.stylesheets({
  modules: rendered.clientModules.map((module) => module.moduleId),
});

const assets = ctx.assets.document({
  islandStyles: islandStyles.stylesheets,
  clientEntries: ["src/main.ts"],
});

return {
  html: `<!doctype html><html><head>${assets.headHtml}</head><body>${rendered.html}</body></html>`,
  dependencies: islandStyles.dependencies,
};
```

development では、host が `ctx.loadModule()` で island を描画したあと、描画済み browser module id
に対応する内部 Vite module graph を辿り、direct / transitive CSS を依存順に返します。
CSS query string は保持され、source file dependency も返るため cached route を invalidation
できます。build では Vite manifest を使い、同じ module identity から emitted hashed stylesheet
href を返します。entry が見つからない場合は style を黙って落とさず diagnostic に出ます。
返された style は `ctx.assets.document()` に渡すと、document-level dedupe、nonce、base、
shared CSS、page CSS と同じ場所で合成できます。

critical CSS を明示的に inline したい build host は、public href から filesystem path を
逆算せず、同じ resolved descriptor から emitted bytes を読めます。

```ts
const islandStyles = ctx.assets.stylesheets({
  modules: rendered.clientModules.map((module) => module.moduleId),
});
const critical = await ctx.assets.stylesheetContent({
  stylesheets: islandStyles.stylesheets,
});

const assets = ctx.assets.document({
  inlineStyles: critical.stylesheets.map((style) => ({
    key: `critical:${style.href}`,
    content: style.content,
  })),
});
```

`stylesheetContent()` は Vite が emit した stylesheet 向けの build-only API です。
development では `unavailable` diagnostic を返し、build では descriptor に artifact がない、
または file を読めない場合に `missing-artifact` diagnostic を返します。順序は input
descriptor に従うため、home-only inline、linked stylesheet、dedupe の policy は host 側で
維持できます。

## テーマトークン stylesheet

`themeTokens` は小さな stylesheet を書き出して dev でも配信します。既定 href は
`/__ox_theme_tokens__/theme-tokens.css` です。`ctx.assets.themeTokens.href` を
`ctx.assets.document()` に渡せば、local Vite transform なしで syntax token CSS を
使えます。

## 関連

- [Document assets](./document-assets.md)
- [SSG 出力プリミティブ](./ssg-output.md)
- [テーマ](../theming.md)
- 追跡: [#1281](https://github.com/ubugeeei-prod/ox-content/issues/1281)
