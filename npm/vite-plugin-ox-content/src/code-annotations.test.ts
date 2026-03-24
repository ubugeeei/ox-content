import { describe, expect, it } from "vite-plus/test";
import { highlightCode } from "./highlight";

describe("code annotations", () => {
  it("preserves pre and line classes after syntax highlighting", async () => {
    const html = `<pre class="ox-code-block ox-code-block--annotated"><code class="language-ts"><span class="line ox-code-line ox-code-line--highlight" data-line="1">const first = 1;</span>
<span class="line ox-code-line ox-code-line--warning" data-line="2">const second = 2;</span>
<span class="line ox-code-line ox-code-line--error" data-line="3">throw new Error("boom");</span>
</code></pre>`;

    const highlighted = await highlightCode(html, "github-dark");

    expect(highlighted).toContain(
      'class="shiki github-dark ox-code-block ox-code-block--annotated"',
    );
    expect(highlighted).toContain(
      'class="line ox-code-line ox-code-line--highlight" data-line="1"',
    );
    expect(highlighted).toContain('class="line ox-code-line ox-code-line--warning" data-line="2"');
    expect(highlighted).toContain('class="line ox-code-line ox-code-line--error" data-line="3"');
    expect(highlighted).toContain('class="language-ts"');
  });

  it("keeps non-annotated highlighted blocks unchanged", async () => {
    const html = `<pre><code class="language-ts">const value = 1;
const next = 2;
</code></pre>`;

    const highlighted = await highlightCode(html, "github-dark");

    expect(highlighted).not.toContain("ox-code-line--warning");
    expect(highlighted).not.toContain("ox-code-block--annotated");
    expect(highlighted).toContain('data-language="ts"');
  });
});
