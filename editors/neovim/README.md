# Ox Content for Neovim

Neovim integration for Ox Content authoring.

Example with `lazy.nvim`:

```lua
{
  dir = "/absolute/path/to/ox-content/editors/neovim",
  config = function()
    require("ox-content").setup({
      frontmatter_schema = "./content/frontmatter.schema.json",
    })
  end,
}
```

Commands:

- `:OxContentInsertTable`
- `:OxContentInsertCodeFence`
- `:OxContentInsertCallout`
- `:OxContentPreview`

The plugin maps `*.mdc` to `markdown`, starts `ox-content-lsp`, and uses the LSP server for insertion commands and preview rendering.
