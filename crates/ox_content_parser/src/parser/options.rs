/// Parser options.
///
/// `Default::default()` keeps optional Markdown extensions disabled but
/// still bounds nesting. Use [`ParserOptions::gfm`] to enable the GitHub
/// Flavored Markdown profile.
#[derive(Debug, Clone)]
pub struct ParserOptions {
    /// Enable the GFM convenience profile.
    ///
    /// When set through [`ParserOptions::gfm`], this also enables footnotes,
    /// task lists, tables, strikethrough, and autolinks.
    ///
    /// Default: `false`; [`ParserOptions::gfm`] sets this to `true`.
    pub gfm: bool,

    /// Enable footnote references and definitions.
    ///
    /// Default: `false`; [`ParserOptions::gfm`] sets this to `true`.
    pub footnotes: bool,

    /// Enable GFM task-list item markers such as `- [x]`.
    ///
    /// Default: `false`; [`ParserOptions::gfm`] sets this to `true`.
    pub task_lists: bool,

    /// Enable GFM pipe tables.
    ///
    /// Default: `false`; [`ParserOptions::gfm`] sets this to `true`.
    pub tables: bool,

    /// Enable GFM strikethrough spans.
    ///
    /// Default: `false`; [`ParserOptions::gfm`] sets this to `true`.
    pub strikethrough: bool,

    /// Enable GFM autolinks.
    ///
    /// Default: `false`; [`ParserOptions::gfm`] sets this to `true`.
    pub autolinks: bool,

    /// Enable superscript spans such as `^x^`.
    ///
    /// Default: `false`; not enabled by [`ParserOptions::gfm`].
    pub superscript: bool,

    /// Enable subscript spans such as `~x~`.
    ///
    /// Default: `false`; not enabled by [`ParserOptions::gfm`].
    pub subscript: bool,

    /// Enable typographic punctuation replacement in text nodes.
    ///
    /// Default: `false`; not enabled by [`ParserOptions::gfm`].
    pub smart_punctuation: bool,

    /// Enable `$...$` inline math and `$$...$$` display math as AST nodes.
    ///
    /// Default: `false`; not enabled by [`ParserOptions::gfm`].
    pub math: bool,

    /// Enable PHP Markdown Extra / mdBook-style definition lists as AST nodes.
    ///
    /// Default: `false`; not enabled by [`ParserOptions::gfm`].
    pub definition_lists: bool,

    /// Recognize emphasis whose delimiters sit against East Asian punctuation.
    ///
    /// CommonMark decides whether a `*`/`_` run may open or close from the
    /// characters on either side, and punctuation on the outside blocks the
    /// run. The rule reads Unicode punctuation as a whole, so East Asian
    /// punctuation blocks it too — and because CJK text sets punctuation
    /// directly against the words it follows, `A**強調。**B` leaves the
    /// delimiters as literal text. Latin text rarely hits this, since a space
    /// usually separates the punctuation from the delimiter.
    ///
    /// With this enabled, East Asian punctuation is classified as an ordinary
    /// character for flanking purposes only, which lets those runs pair. It is
    /// off by default because it is a deliberate deviation: the parser renders
    /// every CommonMark 0.31.2 example per spec with it off.
    ///
    /// Default: `false`.
    pub cjk_emphasis: bool,

    /// Enable MDX. Off by default.
    ///
    /// When set, PascalCase and member-name JSX elements, fragments, spreads,
    /// JSX comments, `{expression}` children, and document-level
    /// `{expression}` constructs parse as MDX AST nodes.
    /// Module-level `import` / `export` parse as [`ox_content_ast::MdxjsEsm`].
    /// Expression and ESM source is stored, not evaluated. Lowercase HTML
    /// stays HTML.
    ///
    /// Default: `false`.
    pub mdx: bool,

    /// Maximum nesting depth for block elements.
    ///
    /// Every construct that re-enters the parser on a sub-source — block
    /// quotes, list items, footnote definitions, and JSX children — counts
    /// one level, so the cap bounds the recursion depth of a parse no
    /// matter how the constructs are combined.
    ///
    /// `0` means unlimited, which lets a deeply nested document exhaust the
    /// stack and take the host process down with it. Prefer a finite cap on
    /// any input you did not write yourself.
    ///
    /// Default: `100`, including [`ParserOptions::gfm`] and
    /// [`ParserOptions::mdx`].
    pub max_nesting_depth: usize,
}

impl Default for ParserOptions {
    fn default() -> Self {
        Self {
            gfm: false,
            footnotes: false,
            task_lists: false,
            tables: false,
            strikethrough: false,
            autolinks: false,
            superscript: false,
            subscript: false,
            smart_punctuation: false,
            math: false,
            definition_lists: false,
            cjk_emphasis: false,
            mdx: false,
            // Not `0`: an unbounded parse of hostile input overflows the
            // stack, and a stack overflow aborts rather than unwinds, so
            // no caller can recover from it.
            max_nesting_depth: DEFAULT_MAX_NESTING_DEPTH,
        }
    }
}

/// Block nesting levels allowed before a parse fails with
/// [`ParseError::NestingTooDeep`](crate::ParseError::NestingTooDeep).
///
/// Deep enough that no hand-written document reaches it, shallow enough
/// that the recursion it permits fits in a default thread stack.
const DEFAULT_MAX_NESTING_DEPTH: usize = 100;

impl ParserOptions {
    /// Creates new parser options with GFM extensions enabled.
    #[must_use]
    pub fn gfm() -> Self {
        Self {
            gfm: true,
            footnotes: true,
            task_lists: true,
            tables: true,
            strikethrough: true,
            autolinks: true,
            superscript: false,
            subscript: false,
            smart_punctuation: false,
            math: false,
            definition_lists: false,
            // Not part of GFM: GitHub renders these runs per CommonMark too.
            cjk_emphasis: false,
            mdx: false,
            max_nesting_depth: DEFAULT_MAX_NESTING_DEPTH,
        }
    }

    /// Creates parser options with MDX enabled and GFM left off.
    #[must_use]
    pub fn mdx() -> Self {
        Self { mdx: true, ..Self::default() }
    }
}
