import type { InitIslandsOptions } from "@ox-content/islands";

export type SolidHtmlHostClientDiagnosticCode =
  | "missing-island-name"
  | "missing-module-id"
  | "unknown-module"
  | "module-load-failed"
  | "runtime-load-failed"
  | "missing-export"
  | "render-failed";

export interface SolidHtmlHostClientError {
  code: SolidHtmlHostClientDiagnosticCode;
  message: string;
  element: HTMLElement;
  props: Record<string, unknown>;
  componentName?: string;
  moduleId?: string;
  exportName?: string;
  cause?: unknown;
}

export type SolidHtmlHostClientComponentValue = (...args: never[]) => unknown;
export type SolidHtmlHostClientModuleValue =
  | Record<string, unknown>
  | SolidHtmlHostClientComponentValue;

export type SolidHtmlHostClientModuleLoader<
  TModule extends object = SolidHtmlHostClientModuleValue,
> = () => TModule | PromiseLike<TModule>;

export type SolidHtmlHostClientModules =
  | Readonly<Record<string, SolidHtmlHostClientModuleLoader>>
  | ReadonlyMap<string, SolidHtmlHostClientModuleLoader>;

export interface SolidHtmlHostClientContext<TRuntime = undefined> {
  component: unknown;
  componentName: string;
  element: HTMLElement;
  exportName: string;
  moduleExports: unknown;
  moduleId: string;
  props: Record<string, unknown>;
  runtime: TRuntime | undefined;
  slotHtml: string | undefined;
}

export type SolidHtmlHostClientRenderer<TRuntime = undefined> = (
  context: SolidHtmlHostClientContext<TRuntime>,
) => void | (() => void) | PromiseLike<void | (() => void)>;

export type SolidHtmlHostClientRuntimeLoader<TRuntime = undefined> = () =>
  | TRuntime
  | Promise<TRuntime>;

export type SolidHtmlHostModuleIdResolver = (
  element: HTMLElement,
  context: { componentName: string; props: Record<string, unknown> },
) => string | undefined;

export type SolidHtmlHostExportNameResolver = (
  element: HTMLElement,
  context: { componentName: string; moduleId: string; props: Record<string, unknown> },
) => string | undefined;

export interface SolidHtmlHostClientBaseInput<TRuntime = undefined> {
  modules: SolidHtmlHostClientModules;
  loadRuntime?: SolidHtmlHostClientRuntimeLoader<TRuntime>;
  resolveModuleId?: SolidHtmlHostModuleIdResolver;
  resolveExportName?: SolidHtmlHostExportNameResolver;
  onError?: (error: SolidHtmlHostClientError) => void;
}

export interface CreateSolidHtmlHostLazyHydrateRenderInput<
  TRuntime = undefined,
> extends SolidHtmlHostClientBaseInput<TRuntime> {
  render: SolidHtmlHostClientRenderer<TRuntime>;
  mount?: never;
}

export interface CreateSolidHtmlHostLazyHydrateMountInput extends SolidHtmlHostClientBaseInput<SolidHtmlHostDomRuntime> {
  mount: SolidHtmlHostDomRendererInput;
  render?: never;
}

export type CreateSolidHtmlHostLazyHydrateInput<TRuntime = undefined> =
  | CreateSolidHtmlHostLazyHydrateRenderInput<TRuntime>
  | CreateSolidHtmlHostLazyHydrateMountInput;

export type SolidHtmlHostDomMode = "render" | "hydrate";

export interface SolidHtmlHostDomRendererInput {
  mode: SolidHtmlHostDomMode;
}

export interface SolidHtmlHostDomRuntime {
  createComponent: (
    component: SolidHtmlHostClientComponentValue,
    props: Record<string, unknown>,
  ) => unknown;
  render: (code: () => unknown, element: HTMLElement) => () => void;
  hydrate: (code: () => unknown, element: HTMLElement) => () => void;
}

export type SolidHtmlHostInitIslands<TController = unknown> = (
  hydrate: (element: HTMLElement, props: Record<string, unknown>) => void | (() => void),
  options?: InitIslandsOptions,
) => TController;

export type InitSolidHtmlHostInput<TRuntime = undefined> =
  CreateSolidHtmlHostLazyHydrateInput<TRuntime> & {
    initIslands: SolidHtmlHostInitIslands;
    options?: InitIslandsOptions;
  };
