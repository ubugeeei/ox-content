import type {
  CreateSolidHtmlHostLazyHydrateInput,
  InitSolidHtmlHostInput,
  SolidHtmlHostClientModuleLoader,
  SolidHtmlHostClientModules,
  SolidHtmlHostClientRenderer,
  SolidHtmlHostClientRuntimeLoader,
} from "./html-host-client-types";
import {
  createSolidHtmlHostDomRenderer,
  loadSolidHtmlHostDomRuntime,
  solidHtmlHostDomRendererMode,
} from "./html-host-dom-renderer";
import { clientError, reportError } from "./html-host-client-errors";

export type {
  CreateSolidHtmlHostLazyHydrateInput,
  InitSolidHtmlHostInput,
  SolidHtmlHostClientContext,
  SolidHtmlHostClientDiagnosticCode,
  SolidHtmlHostClientError,
  SolidHtmlHostClientComponentValue,
  SolidHtmlHostClientModuleLoader,
  SolidHtmlHostClientModules,
  SolidHtmlHostClientModuleValue,
  SolidHtmlHostClientRenderer,
  SolidHtmlHostClientRuntimeLoader,
  SolidHtmlHostDomMode,
  SolidHtmlHostDomRendererInput,
  SolidHtmlHostDomRuntime,
  SolidHtmlHostExportNameResolver,
  SolidHtmlHostInitIslands,
  SolidHtmlHostModuleIdResolver,
} from "./html-host-client-types";
export {
  createSolidHtmlHostDomRenderer,
  loadSolidHtmlHostDomRuntime,
  type SolidHtmlHostDomRenderer,
} from "./html-host-dom-renderer";

const ISLAND_JSON_SCRIPT = /^\s*<script type="application\/json">[\s\S]*?<\/script>/;

export function initSolidHtmlHost<TRuntime = undefined>(
  input: InitSolidHtmlHostInput<TRuntime>,
): ReturnType<InitSolidHtmlHostInput<TRuntime>["initIslands"]> {
  return input.initIslands(createSolidHtmlHostLazyHydrate(input), input.options);
}

export function createSolidHtmlHostLazyHydrate<TRuntime = undefined>(
  input: CreateSolidHtmlHostLazyHydrateInput<TRuntime>,
): (element: HTMLElement, props: Record<string, unknown>) => () => void {
  const render = resolveRenderer(input);
  const load = resolveRuntimeLoader(input, render);
  const moduleCache = new Map<string, Promise<unknown>>();
  let runtimeCache: Promise<TRuntime> | undefined;

  return (element, props) => {
    const componentName = element.dataset.oxIsland;
    if (!componentName) {
      reportError(input, clientError("missing-island-name", element, props));
      return noop;
    }

    const moduleId =
      input.resolveModuleId?.(element, { componentName, props }) ?? element.dataset.oxModule;
    if (!moduleId) {
      reportError(input, clientError("missing-module-id", element, props, { componentName }));
      return noop;
    }
    if (!moduleLoader(input.modules, moduleId)) {
      reportError(
        input,
        clientError("unknown-module", element, props, {
          componentName,
          moduleId,
        }),
      );
      return noop;
    }

    const exportName =
      input.resolveExportName?.(element, { componentName, moduleId, props }) ??
      element.dataset.oxExport ??
      "default";
    const slotHtml = readSolidHtmlHostSlot(element);
    let disposed = false;
    let disposeMounted: (() => void) | undefined;

    const dispose = () => {
      if (disposed) return;
      disposed = true;
      disposeMounted?.();
      disposeMounted = undefined;
    };

    void (async () => {
      let moduleExports: unknown;
      let runtime: TRuntime | undefined;
      try {
        moduleExports = await loadClientModule(input.modules, moduleId, moduleCache);
      } catch (cause) {
        if (!disposed) {
          reportError(
            input,
            clientError("module-load-failed", element, props, {
              componentName,
              moduleId,
              exportName,
              cause,
            }),
          );
        }
        return;
      }

      if (disposed) return;

      try {
        runtime = await loadRuntime(
          load,
          () => runtimeCache,
          (pending) => {
            runtimeCache = pending;
          },
        );
      } catch (cause) {
        if (!disposed) {
          reportError(
            input,
            clientError("runtime-load-failed", element, props, {
              componentName,
              moduleId,
              exportName,
              cause,
            }),
          );
        }
        return;
      }

      if (disposed) return;

      const component = exportedValue(moduleExports, exportName);
      if (component == null) {
        reportError(
          input,
          clientError("missing-export", element, props, {
            componentName,
            moduleId,
            exportName,
            cause: new Error(`Export "${exportName}" was not found.`),
          }),
        );
        return;
      }

      if (!preservesElementContents(input, render)) {
        element.innerHTML = "";
      }
      try {
        const cleanup = await render({
          component,
          componentName,
          element,
          exportName,
          moduleExports,
          moduleId,
          props,
          runtime,
          slotHtml,
        });
        disposeMounted = cleanup ? once(cleanup) : undefined;
        if (disposed) {
          disposeMounted?.();
          disposeMounted = undefined;
        }
      } catch (cause) {
        if (!disposed) {
          reportError(
            input,
            clientError("render-failed", element, props, {
              componentName,
              moduleId,
              exportName,
              cause,
            }),
          );
        }
      }
    })();

    return dispose;
  };
}

export function readSolidHtmlHostSlot(
  element: Pick<HTMLElement, "dataset" | "innerHTML">,
): string | undefined {
  const fromAttr = element.dataset.oxContent;
  if (fromAttr) return fromAttr;
  if (element.dataset.oxSsr === "true") return undefined;

  const slotHtml = element.innerHTML.replace(ISLAND_JSON_SCRIPT, "");
  return slotHtml || undefined;
}

async function loadClientModule(
  modules: SolidHtmlHostClientModules,
  moduleId: string,
  cache: Map<string, Promise<unknown>>,
): Promise<unknown> {
  const cached = cache.get(moduleId);
  if (cached) return cached;

  const loader = moduleLoader(modules, moduleId);
  if (!loader) {
    throw new Error(`Unknown module "${moduleId}".`);
  }

  const pending = Promise.resolve()
    .then(loader)
    .catch((cause: unknown) => {
      cache.delete(moduleId);
      throw cause;
    });
  cache.set(moduleId, pending);
  return pending;
}

async function loadRuntime<TRuntime>(
  load: SolidHtmlHostClientRuntimeLoader<TRuntime> | undefined,
  getCached: () => Promise<TRuntime> | undefined,
  setCached: (pending: Promise<TRuntime> | undefined) => void,
): Promise<TRuntime | undefined> {
  if (!load) return undefined;

  const cached = getCached();
  if (cached) return cached;

  const pending = Promise.resolve()
    .then(load)
    .catch((cause: unknown) => {
      setCached(undefined);
      throw cause;
    });
  setCached(pending);
  return pending;
}

function resolveRenderer<TRuntime>(
  input: CreateSolidHtmlHostLazyHydrateInput<TRuntime>,
): SolidHtmlHostClientRenderer<TRuntime> {
  if (input.render) return input.render;
  if (input.mount) {
    return createSolidHtmlHostDomRenderer(input.mount) as SolidHtmlHostClientRenderer<TRuntime>;
  }
  throw new Error("initSolidHtmlHost requires either render or mount.");
}

function resolveRuntimeLoader<TRuntime>(
  input: CreateSolidHtmlHostLazyHydrateInput<TRuntime>,
  render: SolidHtmlHostClientRenderer<TRuntime>,
): SolidHtmlHostClientRuntimeLoader<TRuntime> | undefined {
  if (input.loadRuntime) {
    return input.loadRuntime as SolidHtmlHostClientRuntimeLoader<TRuntime>;
  }
  if (input.mount || solidHtmlHostDomRendererMode(render as SolidHtmlHostClientRenderer<unknown>)) {
    return loadSolidHtmlHostDomRuntime as SolidHtmlHostClientRuntimeLoader<TRuntime>;
  }
  return undefined;
}

function preservesElementContents<TRuntime>(
  input: CreateSolidHtmlHostLazyHydrateInput<TRuntime>,
  render: SolidHtmlHostClientRenderer<TRuntime>,
): boolean {
  const mode =
    input.mount?.mode ??
    solidHtmlHostDomRendererMode(render as unknown as SolidHtmlHostClientRenderer<unknown>);
  return mode === "hydrate";
}

function moduleLoader(
  modules: SolidHtmlHostClientModules,
  moduleId: string,
): SolidHtmlHostClientModuleLoader | undefined {
  return isReadonlyMap(modules) ? modules.get(moduleId) : modules[moduleId];
}

function isReadonlyMap(
  value: SolidHtmlHostClientModules,
): value is ReadonlyMap<string, SolidHtmlHostClientModuleLoader> {
  return typeof (value as ReadonlyMap<string, SolidHtmlHostClientModuleLoader>).get === "function";
}

function exportedValue(moduleExports: unknown, exportName: string): unknown {
  if (exportName === "default" && typeof moduleExports === "function") {
    return moduleExports;
  }
  if (!moduleExports || typeof moduleExports !== "object") {
    return undefined;
  }
  return (moduleExports as Record<string, unknown>)[exportName];
}

function once(cleanup: () => void): () => void {
  let called = false;
  return () => {
    if (called) return;
    called = true;
    cleanup();
  };
}

function noop(): void {}
