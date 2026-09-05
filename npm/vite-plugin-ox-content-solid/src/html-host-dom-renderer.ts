import type {
  SolidHtmlHostClientComponentValue,
  SolidHtmlHostClientRenderer,
  SolidHtmlHostDomMode,
  SolidHtmlHostDomRendererInput,
  SolidHtmlHostDomRuntime,
} from "./html-host-client-types";

const DOM_RENDERER_MODE = Symbol("solid-html-host-dom-renderer-mode");

export type SolidHtmlHostDomRenderer = SolidHtmlHostClientRenderer<SolidHtmlHostDomRuntime>;

type ModeTaggedSolidHtmlHostDomRenderer = SolidHtmlHostDomRenderer & {
  readonly [DOM_RENDERER_MODE]: SolidHtmlHostDomMode;
};

export async function loadSolidHtmlHostDomRuntime(): Promise<SolidHtmlHostDomRuntime> {
  const [{ render, hydrate }, { createComponent }] = await Promise.all([
    import("@solidjs/web"),
    import("solid-js"),
  ]);

  return {
    createComponent: createComponent as SolidHtmlHostDomRuntime["createComponent"],
    hydrate: hydrate as SolidHtmlHostDomRuntime["hydrate"],
    render: render as SolidHtmlHostDomRuntime["render"],
  };
}

export function createSolidHtmlHostDomRenderer(
  input: SolidHtmlHostDomRendererInput,
): SolidHtmlHostDomRenderer {
  const renderer = ((context) => {
    const runtime = context.runtime;
    if (!runtime) {
      throw new Error("Solid HTML host DOM renderer requires a Solid runtime.");
    }
    const component = solidComponent(context.component);
    const componentProps = componentPropsWithSlot(context.element, context.props, context.slotHtml);
    const create = () => runtime.createComponent(component, componentProps);
    return input.mode === "hydrate"
      ? runtime.hydrate(create, context.element)
      : runtime.render(create, context.element);
  }) as ModeTaggedSolidHtmlHostDomRenderer;

  Object.defineProperty(renderer, DOM_RENDERER_MODE, { value: input.mode });
  return renderer;
}

export function solidHtmlHostDomRendererMode(
  renderer: SolidHtmlHostClientRenderer<unknown>,
): SolidHtmlHostDomMode | undefined {
  return (renderer as Partial<ModeTaggedSolidHtmlHostDomRenderer>)[DOM_RENDERER_MODE];
}

function componentPropsWithSlot(
  element: HTMLElement,
  props: Record<string, unknown>,
  slotHtml: string | undefined,
): Record<string, unknown> {
  if (!slotHtml) return props;
  return { ...props, children: slotHtmlToChildren(element, slotHtml) };
}

function slotHtmlToChildren(element: HTMLElement, slotHtml: string): unknown {
  const template = element.ownerDocument.createElement("template");
  template.innerHTML = slotHtml;
  const children = Array.from(template.content.childNodes);
  return children.length === 1 ? children[0] : children;
}

function solidComponent(component: unknown): SolidHtmlHostClientComponentValue {
  if (typeof component !== "function") {
    throw new Error("Solid HTML host DOM renderer requires a component function.");
  }
  return component as SolidHtmlHostClientComponentValue;
}
