# Ox Content for Zed

This extension wires Zed buffers to `ox-content-lsp`.

Recommended Zed settings:

```json
{
  "file_types": {
    "Markdown": ["md", "markdown", "mdc"]
  },
  "lsp": {
    "ox-content-lsp": {
      "binary": {
        "path": "/absolute/path/to/ox-content-lsp"
      },
      "initialization_options": {
        "frontmatterSchema": "./content/frontmatter.schema.json"
      }
    }
  }
}
```

Once `.mdc` is associated with `Markdown`, you get Zed's native Markdown preview/highlighting together with Ox Content frontmatter completion and diagnostics from the language server.
