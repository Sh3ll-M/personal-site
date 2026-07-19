import { describe, it, expect } from "vitest";
import { frontmatterSchema, parseFrontmatter } from "./schema";

describe("parseFrontmatter", () => {
  it("accepts valid frontmatter", () => {
    const result = parseFrontmatter(
      frontmatterSchema,
      { title: "Hello", date: "2026-07-19", tags: ["git"], excerpt: "An intro post" },
      "content/posts/hello.md"
    );
    expect(result.title).toBe("Hello");
    expect(result.tags).toEqual(["git"]);
  });

  it("defaults tags to an empty array when omitted", () => {
    const result = parseFrontmatter(
      frontmatterSchema,
      { title: "Hello", date: "2026-07-19", excerpt: "An intro post" },
      "content/posts/hello.md"
    );
    expect(result.tags).toEqual([]);
  });

  it("throws with the source path when date is malformed", () => {
    expect(() =>
      parseFrontmatter(
        frontmatterSchema,
        { title: "Hello", date: "19-07-2026", excerpt: "An intro post" },
        "content/posts/hello.md"
      )
    ).toThrow(/content\/posts\/hello\.md/);
  });

  it("throws when title is missing", () => {
    expect(() =>
      parseFrontmatter(
        frontmatterSchema,
        { date: "2026-07-19", excerpt: "An intro post" },
        "content/posts/hello.md"
      )
    ).toThrow(/title/);
  });
});
