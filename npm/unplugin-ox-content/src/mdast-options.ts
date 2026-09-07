export interface NapiBindings {
  parseTransferRaw: (
    source: string,
    kind: string,
    options?: {
      gfm?: boolean;
      mdx?: boolean;
      footnotes?: boolean;
      taskLists?: boolean;
      tables?: boolean;
      strikethrough?: boolean;
      autolinks?: boolean;
      superscript?: boolean;
      subscript?: boolean;
      smartPunctuation?: boolean;
      math?: boolean;
      definitionLists?: boolean;
      headingAttributes?: boolean;
    },
  ) => Uint8Array;
}

/**
 * Parser options for the Ox Content mdast unified plugin.
 */
export interface OxContentMdastOptions {
  /**
   * Enable GitHub Flavored Markdown extensions.
   * @default true
   */
  gfm?: boolean;

  /**
   * Enable MDX JSX, ESM, and expression nodes.
   * @default false
   */
  mdx?: boolean;

  /**
   * Enable footnotes.
   * @default true
   */
  footnotes?: boolean;

  /**
   * Enable task lists.
   * @default true
   */
  taskLists?: boolean;

  /**
   * Enable tables.
   * @default true
   */
  tables?: boolean;

  /**
   * Enable strikethrough.
   * @default true
   */
  strikethrough?: boolean;

  /**
   * Enable autolinks.
   * @default true
   */
  autolinks?: boolean;

  /**
   * Enable `^text^` superscript spans.
   * @default false
   */
  superscript?: boolean;

  /**
   * Enable `~text~` subscript spans.
   * @default false
   */
  subscript?: boolean;

  /**
   * Enable smart punctuation replacement.
   * @default false
   */
  smartPunctuation?: boolean;

  /**
   * Enable `$...$` inline math and `$$...$$` block math.
   * @default false
   */
  math?: boolean;

  /**
   * Enable definition list blocks.
   * @default false
   */
  definitionLists?: boolean;

  /**
   * Enable Pandoc-style heading attribute blocks.
   * @default false
   */
  headingAttributes?: boolean;
}

const DEFAULT_MDAST_OPTIONS: Required<OxContentMdastOptions> = {
  gfm: true,
  mdx: false,
  footnotes: true,
  taskLists: true,
  tables: true,
  strikethrough: true,
  autolinks: true,
  superscript: false,
  subscript: false,
  smartPunctuation: false,
  math: false,
  definitionLists: false,
  headingAttributes: false,
};

export function resolveMdastOptions(
  options: OxContentMdastOptions,
): Required<OxContentMdastOptions> {
  return {
    gfm: options.gfm ?? DEFAULT_MDAST_OPTIONS.gfm,
    mdx: options.mdx ?? DEFAULT_MDAST_OPTIONS.mdx,
    footnotes: options.footnotes ?? DEFAULT_MDAST_OPTIONS.footnotes,
    taskLists: options.taskLists ?? DEFAULT_MDAST_OPTIONS.taskLists,
    tables: options.tables ?? DEFAULT_MDAST_OPTIONS.tables,
    strikethrough: options.strikethrough ?? DEFAULT_MDAST_OPTIONS.strikethrough,
    autolinks: options.autolinks ?? DEFAULT_MDAST_OPTIONS.autolinks,
    superscript: options.superscript ?? DEFAULT_MDAST_OPTIONS.superscript,
    subscript: options.subscript ?? DEFAULT_MDAST_OPTIONS.subscript,
    smartPunctuation: options.smartPunctuation ?? DEFAULT_MDAST_OPTIONS.smartPunctuation,
    math: options.math ?? DEFAULT_MDAST_OPTIONS.math,
    definitionLists: options.definitionLists ?? DEFAULT_MDAST_OPTIONS.definitionLists,
    headingAttributes: options.headingAttributes ?? DEFAULT_MDAST_OPTIONS.headingAttributes,
  };
}
