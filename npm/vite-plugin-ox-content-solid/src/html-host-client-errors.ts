import type {
  CreateSolidHtmlHostLazyHydrateInput,
  SolidHtmlHostClientDiagnosticCode,
  SolidHtmlHostClientError,
} from "./html-host-client-types";

export function reportError(
  input: Pick<CreateSolidHtmlHostLazyHydrateInput, "onError">,
  error: SolidHtmlHostClientError,
): void {
  error.element.classList?.add("ox-island-error");
  error.element.dataset.oxError = error.message;
  input.onError?.(error);

  if (typeof CustomEvent === "function" && typeof error.element.dispatchEvent === "function") {
    error.element.dispatchEvent(
      new CustomEvent("ox-content-solid-html-host:error", { detail: error }),
    );
  }
}

export function clientError(
  code: SolidHtmlHostClientDiagnosticCode,
  element: HTMLElement,
  props: Record<string, unknown>,
  context: {
    componentName?: string;
    moduleId?: string;
    exportName?: string;
    cause?: unknown;
  } = {},
): SolidHtmlHostClientError {
  return {
    code,
    element,
    props,
    ...context,
    message: clientErrorMessage(code, context),
  };
}

function clientErrorMessage(
  code: SolidHtmlHostClientDiagnosticCode,
  context: { componentName?: string; moduleId?: string; exportName?: string; cause?: unknown },
): string {
  const component = context.componentName
    ? `Solid island "${context.componentName}"`
    : "Solid island";
  const reason = causeMessage(context.cause);
  switch (code) {
    case "missing-island-name":
      return "Solid island element is missing data-ox-island.";
    case "missing-module-id":
      return `${component} is missing data-ox-module.`;
    case "unknown-module":
      return `${component} references unknown module "${context.moduleId ?? ""}".`;
    case "module-load-failed":
      return `${component} module "${context.moduleId ?? ""}" failed to load: ${reason}`;
    case "runtime-load-failed":
      return `Solid runtime failed to load: ${reason}`;
    case "missing-export":
      return `${component} module "${context.moduleId ?? ""}" is missing export "${context.exportName ?? "default"}".`;
    case "render-failed":
      return `${component} failed to render: ${reason}`;
  }
}

function causeMessage(cause: unknown): string {
  if (cause == null) return "";
  if (cause instanceof Error) return cause.message;
  if (typeof cause === "string") return cause;
  if (typeof cause === "number" || typeof cause === "boolean") return cause.toString();
  try {
    return JSON.stringify(cause);
  } catch {
    return Object.prototype.toString.call(cause);
  }
}
