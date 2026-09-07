import { toSolidHtmlHostClientModuleId } from "./html-host-registry-paths";
import {
  renderSolidHtmlHost,
  type RenderSolidHtmlHostResult,
  type SolidClientModuleResolver,
  type SolidHtmlComponentRenderer,
  type SolidHtmlHostDiagnostic,
  type SolidServerModuleLoader,
} from "./html-host";
import type { MdxImport } from "@ox-content/vite-plugin";
import type { ComponentsMap } from "./types";

export type SolidHtmlHostRendererDiagnosticPolicy = "throw" | "collect";

export interface CreateSolidHtmlHostRendererInput {
  root?: string;
  srcDir?: string;
  contentRoot?: string;
  components?: ComponentsMap;
  loadModule: SolidServerModuleLoader;
  renderComponent?: SolidHtmlComponentRenderer;
  resolveClientModule?: SolidClientModuleResolver;
  diagnostics?: SolidHtmlHostRendererDiagnosticPolicy;
}

export interface SolidHtmlHostRendererContext {
  documentPath: string;
  imports?: readonly MdxImport[];
  root?: string;
  srcDir?: string;
  contentRoot?: string;
  components?: ComponentsMap;
  renderComponent?: SolidHtmlComponentRenderer;
  resolveClientModule?: SolidClientModuleResolver;
}

export type SolidHtmlHostRenderer = (
  html: string,
  context: SolidHtmlHostRendererContext,
) => Promise<RenderSolidHtmlHostResult>;

export class SolidHtmlHostRenderError extends Error {
  readonly diagnostics: SolidHtmlHostDiagnostic[];

  constructor(diagnostics: readonly SolidHtmlHostDiagnostic[]) {
    super(formatSolidHtmlHostDiagnostics(diagnostics));
    this.name = "SolidHtmlHostRenderError";
    this.diagnostics = [...diagnostics];
  }
}

export function createSolidHtmlHostRenderer(
  input: CreateSolidHtmlHostRendererInput,
): SolidHtmlHostRenderer {
  const policy = input.diagnostics ?? "throw";

  return async (html, context) => {
    const root = context.root ?? input.root;
    const result = await renderSolidHtmlHost({
      html,
      documentPath: context.documentPath,
      root,
      srcDir: context.srcDir ?? input.srcDir,
      contentRoot: context.contentRoot ?? input.contentRoot,
      imports: context.imports,
      components: context.components ?? input.components,
      loadModule: input.loadModule,
      renderComponent: context.renderComponent ?? input.renderComponent,
      resolveClientModule:
        context.resolveClientModule ??
        input.resolveClientModule ??
        ((module) => toSolidHtmlHostClientModuleId(module.serverModuleId, root)),
    });

    if (policy === "throw" && result.diagnostics.length > 0) {
      throw new SolidHtmlHostRenderError(result.diagnostics);
    }

    return result;
  };
}

function formatSolidHtmlHostDiagnostics(diagnostics: readonly SolidHtmlHostDiagnostic[]): string {
  if (diagnostics.length === 0) {
    return "Solid HTML host rendering failed.";
  }
  return diagnostics
    .map((diagnostic) => {
      const details = [
        diagnostic.documentPath,
        diagnostic.component && `component ${diagnostic.component}`,
        diagnostic.moduleId && `module ${diagnostic.moduleId}`,
      ].filter(Boolean);
      return `${diagnostic.code}: ${diagnostic.message}${
        details.length > 0 ? ` (${details.join(", ")})` : ""
      }`;
    })
    .join("\n");
}
