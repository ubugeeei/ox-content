import { describe, expect, it } from "vite-plus/test";
import {
  createSolidHtmlHostDomRenderer,
  createSolidHtmlHostLazyHydrate,
  initSolidHtmlHost,
  type SolidHtmlHostClientError,
  type SolidHtmlHostDomRuntime,
} from "./html-host-client";

describe("Solid HTML host DOM renderer", () => {
  it("fresh-mounts nested slot markup as Solid children with props", async () => {
    const calls = runtimeCalls();
    const hydrate = createSolidHtmlHostLazyHydrate({
      modules: { "./Card.tsx": () => ({ default: echoComponent(calls) }) },
      loadRuntime: () => fakeRuntime(calls),
      render: createSolidHtmlHostDomRenderer({ mode: "render" }),
    });
    const host = element(
      {
        oxIsland: "Card",
        oxModule: "./Card.tsx",
        oxContent: '<strong data-kind="slot"><em>slot child</em></strong>',
      },
      "<section>SSR output</section>",
      calls,
    );

    hydrate(host, { tone: "info" });
    await settle();

    expect(calls.renders).toEqual([""]);
    expect(calls.hydrates).toEqual([]);
    expect(calls.slotParses).toEqual(['<strong data-kind="slot"><em>slot child</em></strong>']);
    expect(calls.props[0]).toMatchObject({ tone: "info" });
    expect(slotChildren(calls.props[0])).toEqual([
      {
        nodeType: 1,
        outerHTML: '<strong data-kind="slot"><em>slot child</em></strong>',
        textContent: "slot child",
      },
    ]);
  });

  it("uses initSolidHtmlHost mount mode without downstream Solid glue", async () => {
    const calls = runtimeCalls();
    let received:
      | ((element: HTMLElement, props: Record<string, unknown>) => void | (() => void))
      | undefined;
    initSolidHtmlHost({
      initIslands(hydrate) {
        received = hydrate;
        return { destroy() {} };
      },
      modules: { "./Badge.tsx": () => ({ default: echoComponent(calls) }) },
      loadRuntime: () => fakeRuntime(calls),
      mount: { mode: "render" },
    });

    received?.(element({ oxIsland: "Badge", oxModule: "./Badge.tsx" }, "", calls), {
      label: "ok",
    });
    await settle();

    expect(calls.props).toEqual([{ label: "ok" }]);
    expect(calls.createComponents).toBe(1);
    expect(calls.renders).toEqual([""]);
  });

  it("does not pass children to self-closing islands with SSR output", async () => {
    const calls = runtimeCalls();
    const hydrate = createSolidHtmlHostLazyHydrate({
      modules: { "./Self.tsx": () => ({ default: echoComponent(calls) }) },
      loadRuntime: () => fakeRuntime(calls),
      mount: { mode: "render" },
    });
    const host = element(
      { oxIsland: "Self", oxModule: "./Self.tsx", oxSsr: "true" },
      "<strong>rendered SSR</strong>",
      calls,
    );

    hydrate(host, { id: 1 });
    await settle();

    expect(calls.props).toEqual([{ id: 1 }]);
    expect(host.innerHTML).toBe("");
    expect(calls.slotParses).toEqual([]);
  });

  it("preserves SSR DOM and calls Solid hydrate in hydrate mode", async () => {
    const calls = runtimeCalls();
    const hydrate = createSolidHtmlHostLazyHydrate({
      modules: { "./Hydrated.tsx": () => ({ default: echoComponent(calls) }) },
      loadRuntime: () => fakeRuntime(calls),
      mount: { mode: "hydrate" },
    });
    const host = element(
      {
        oxIsland: "Hydrated",
        oxModule: "./Hydrated.tsx",
        oxSsr: "true",
        oxContent: "<span>authored</span>",
      },
      "<section>SSR output</section>",
      calls,
    );

    hydrate(host, {});
    await settle();

    expect(host.innerHTML).toBe("<section>SSR output</section>");
    expect(calls.renders).toEqual([]);
    expect(calls.hydrates).toEqual(["<section>SSR output</section>"]);
    expect(slotChildren(calls.props[0])).toEqual([
      { nodeType: 1, outerHTML: "<span>authored</span>", textContent: "authored" },
    ]);
  });

  it("keeps slot children stable across renderer re-entry", async () => {
    const calls = runtimeCalls({ repeatRenderFactory: true });
    const hydrate = createSolidHtmlHostLazyHydrate({
      modules: { "./Reactive.tsx": () => ({ default: echoComponent(calls) }) },
      loadRuntime: () => fakeRuntime(calls),
      mount: { mode: "render" },
    });

    hydrate(
      element(
        { oxIsland: "Reactive", oxModule: "./Reactive.tsx", oxContent: "<em>child</em>" },
        "<span>SSR</span>",
        calls,
      ),
      { count: 1 },
    );
    await settle();

    expect(calls.props).toHaveLength(2);
    expect(calls.props[0]?.children).toBe(calls.props[1]?.children);
    expect(calls.slotParses).toEqual(["<em>child</em>"]);
  });

  it("retains load, disposal and failure behavior with the standard renderer", async () => {
    const errors: SolidHtmlHostClientError[] = [];
    const pending = deferred<Record<string, unknown>>();
    const calls = runtimeCalls();
    const hydrate = createSolidHtmlHostLazyHydrate({
      modules: {
        "./Slow.tsx": () => pending.promise,
        "./Load.tsx": () => Promise.reject(new Error("module failed")),
        "./Runtime.tsx": () => ({ default: echoComponent(calls) }),
        "./Render.tsx": () => ({ default: echoComponent(calls) }),
      },
      loadRuntime: () => {
        if (calls.failRuntime) throw new Error("runtime failed");
        return fakeRuntime(calls);
      },
      render: createSolidHtmlHostDomRenderer({ mode: "render" }),
      onError: (error) => errors.push(error),
    });

    const staleDispose = hydrate(
      element({ oxIsland: "Slow", oxModule: "./Slow.tsx" }, "", calls),
      {},
    );
    staleDispose();
    pending.resolve({ default: echoComponent(calls) });
    hydrate(element({ oxIsland: "Load", oxModule: "./Load.tsx" }, "", calls), {});
    calls.failRuntime = true;
    hydrate(element({ oxIsland: "Runtime", oxModule: "./Runtime.tsx" }, "", calls), {});
    await settle();
    calls.failRuntime = false;
    calls.failRender = true;
    hydrate(element({ oxIsland: "Render", oxModule: "./Render.tsx" }, "", calls), {});
    await settle();

    expect(calls.renders).toEqual([]);
    expect(errors.map((error) => error.code).sort()).toEqual([
      "module-load-failed",
      "render-failed",
      "runtime-load-failed",
    ]);

    calls.failRender = false;
    const dispose = hydrate(element({ oxIsland: "Slow", oxModule: "./Slow.tsx" }, "", calls), {});
    await settle();
    dispose();
    dispose();
    expect(calls.disposals).toBe(1);
  });
});

interface RuntimeCalls {
  createComponents: number;
  disposals: number;
  failRender: boolean;
  failRuntime: boolean;
  hydrates: string[];
  props: Record<string, unknown>[];
  renders: string[];
  repeatRenderFactory: boolean;
  slotParses: string[];
}

function runtimeCalls(input: Partial<RuntimeCalls> = {}): RuntimeCalls {
  return {
    createComponents: 0,
    disposals: 0,
    failRender: false,
    failRuntime: false,
    hydrates: [],
    props: [],
    renders: [],
    repeatRenderFactory: false,
    slotParses: [],
    ...input,
  };
}

function fakeRuntime(calls: RuntimeCalls): SolidHtmlHostDomRuntime {
  return {
    createComponent(component, props) {
      calls.createComponents += 1;
      return component(props as never);
    },
    render(factory, target) {
      if (calls.failRender) throw new Error("render failed");
      calls.renders.push(target.innerHTML);
      factory();
      if (calls.repeatRenderFactory) factory();
      return () => {
        calls.disposals += 1;
      };
    },
    hydrate(factory, target) {
      calls.hydrates.push(target.innerHTML);
      factory();
      return () => {
        calls.disposals += 1;
      };
    },
  };
}

function echoComponent(calls: RuntimeCalls) {
  return (props: Record<string, unknown>) => {
    calls.props.push(props);
    return props.children;
  };
}

function slotChildren(props: Record<string, unknown> | undefined): unknown[] {
  const children = props?.children;
  return Array.isArray(children) ? children : children ? [children] : [];
}

function element(
  dataset: Record<string, string> = {},
  innerHTML = "",
  calls = runtimeCalls(),
): HTMLElement {
  const classes = new Set<string>();
  const host = {
    dataset: { ...dataset },
    innerHTML,
    classList: {
      add: (...names: string[]) => names.forEach((name) => classes.add(name)),
      remove: (...names: string[]) => names.forEach((name) => classes.delete(name)),
    },
    dispatchEvent() {
      return true;
    },
    ownerDocument: {
      createElement(tagName: string) {
        if (tagName !== "template") throw new Error(`Unexpected element "${tagName}".`);
        return template(calls);
      },
    },
  };
  return host as unknown as HTMLElement;
}

function template(calls: RuntimeCalls): HTMLTemplateElement {
  const item = { content: { childNodes: [] as unknown[] } };
  Object.defineProperty(item, "innerHTML", {
    get: () => "",
    set: (value: string) => {
      calls.slotParses.push(value);
      item.content.childNodes = parseHtml(value);
    },
  });
  return item as unknown as HTMLTemplateElement;
}

function parseHtml(value: string): unknown[] {
  if (!value) return [];
  const textContent = value.replace(/<[^>]*>/g, "");
  return [{ nodeType: 1, outerHTML: value, textContent }];
}

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}
