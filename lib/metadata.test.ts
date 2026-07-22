import { describe, it, expect } from "vitest";
import { buildMetadata, SITE_NAME } from "./metadata";

describe("buildMetadata", () => {
  it("sets title and description verbatim", () => {
    const result = buildMetadata({ title: "Blog", description: "All posts.", path: "/blog" });
    expect(result.title).toBe("Blog");
    expect(result.description).toBe("All posts.");
  });

  it("builds an absolute canonical URL from the path", () => {
    const result = buildMetadata({ title: "Blog", description: "All posts.", path: "/blog" });
    expect(result.alternates?.canonical).toBe("https://personal-site-ecru-eta-23.vercel.app/blog");
  });

  it("handles the root path without a double slash", () => {
    const result = buildMetadata({ title: "Home", description: "Homepage.", path: "/" });
    expect(result.alternates?.canonical).toBe("https://personal-site-ecru-eta-23.vercel.app/");
  });

  it("mirrors title/description/url into openGraph", () => {
    const result = buildMetadata({ title: "Blog", description: "All posts.", path: "/blog" });
    expect(result.openGraph).toEqual({
      title: "Blog",
      description: "All posts.",
      url: "https://personal-site-ecru-eta-23.vercel.app/blog",
    });
  });

  it("exports the site name used for the title template", () => {
    expect(SITE_NAME).toBe("Sh3ll-M");
  });
});
