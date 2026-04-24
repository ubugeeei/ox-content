import type {
  NapiDeckPrintRenderData,
  NapiModule,
  NapiSlideRenderData,
  ResolvedSlidesPluginOptions,
  SlideDeckData,
  SlideRouteData,
} from "./internal-types";

/**
 * Renders the print HTML used as the PDF export source.
 */
export function renderDeckPrintHtml(
  options: ResolvedSlidesPluginOptions,
  deck: SlideDeckData,
  napi: NapiModule,
): string {
  const data: NapiDeckPrintRenderData = {
    deckTitle: deck.title,
    deckDescription: deck.description,
    pageWidth: options.pdf.pageWidth,
    pageHeight: options.pdf.pageHeight,
    slides: deck.slides.map((slide) => ({
      slideTitle: slide.title,
      slideContentHtml: slide.contentHtml,
      slideNumber: slide.slideNumber,
      slideCount: slide.slideCount,
    })),
  };

  return napi.generateDeckPrintHtml(data, options.napiTheme);
}

/**
 * Injects the Vite HMR client used by the dev-time slide shell.
 */
export function injectViteHmrClient(html: string): string {
  const hmrScript = `<script type="module" src="/@vite/client"></script>
<script type="module">
if (import.meta.hot) {
  const reexecuteBodyScripts = () => {
    const scripts = Array.from(document.body.querySelectorAll('script'));
    for (const script of scripts) {
      const nextScript = document.createElement('script');
      for (const attr of script.attributes) nextScript.setAttribute(attr.name, attr.value);
      nextScript.textContent = script.textContent;
      script.replaceWith(nextScript);
    }
  };

  import.meta.hot.on('ox-content:slides:update', async () => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('__ox_slides_hmr', String(Date.now()));
    const response = await fetch(nextUrl.toString(), { cache: 'no-store' });
    if (!response.ok) return location.reload();
    const nextHtml = await response.text();
    const nextDocument = new DOMParser().parseFromString(nextHtml, 'text/html');
    document.title = nextDocument.title;
    document.body.innerHTML = nextDocument.body.innerHTML;
    reexecuteBodyScripts();
  });
}
</script>`;

  return html.replace("</head>", `${hmrScript}\n</head>`);
}

/**
 * Renders a slide or presenter route using the Rust-backed HTML shells.
 */
export async function renderRouteHtml(
  options: ResolvedSlidesPluginOptions,
  route: SlideRouteData,
  napi: NapiModule,
): Promise<string> {
  const current = route.slide;
  const previous = route.deck.slides[current.slideNumber - 2];
  const next = route.deck.slides[current.slideNumber];
  const data: NapiSlideRenderData = {
    deckTitle: route.deck.title,
    slideTitle: current.title,
    slideDescription: current.description ?? route.deck.description,
    slideContentHtml: current.contentHtml,
    slideNotesHtml: current.notesHtml,
    slideNumber: current.slideNumber,
    slideCount: current.slideCount,
    homeHref: options.baseHref,
    slideHref: current.href,
    presenterHref: current.presenterHref,
    previousHref: route.presenter ? previous?.presenterHref : previous?.href,
    nextHref: route.presenter ? next?.presenterHref : next?.href,
    nextSlideHref: next?.href,
  };

  let html = route.presenter
    ? napi.generatePresenterHtml(data, options.napiTheme)
    : napi.generateSlideHtml(data, options.napiTheme);

  const generatedOgImage = current.href.replace(/index\.html$/i, "og-image.png");
  const pageOgImage = options.ssg.generateOgImage
    ? options.ssg.siteUrl
      ? `${options.ssg.siteUrl.replace(/\/$/, "")}${generatedOgImage}`
      : generatedOgImage
    : options.ssg.ogImage;

  if (!route.presenter && pageOgImage) {
    html = html.replace(
      "</head>",
      `<meta property="og:image" content="${pageOgImage}">\n<meta name="twitter:image" content="${pageOgImage}">\n</head>`,
    );
  }

  return html;
}
