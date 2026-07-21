import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders an image tag with the expected src and alt", async () => {
    const html = await renderMarkdown("![A cat](/images/posts/hello-world/cat.png)");
    expect(html).toContain('<img src="/images/posts/hello-world/cat.png" alt="A cat">');
  });

  it("renders an image with empty alt text when omitted", async () => {
    const html = await renderMarkdown("![](/images/posts/hello-world/cat.png)");
    expect(html).toContain('<img src="/images/posts/hello-world/cat.png" alt="">');
  });

  it("still renders a paragraph for plain text", async () => {
    const html = await renderMarkdown("Just some text.");
    expect(html).toContain("<p>Just some text.</p>");
  });
});
