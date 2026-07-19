import { describe, it, expect } from "vitest";
import { getAllPosts, getPostBySlug } from "./posts";

const fakeGitMeta = () => ({ hash: "abc123", date: "2026-07-01", added: 10, removed: 0 });

const fakeFs = {
  readdirSync: () => ["b-post.md", "a-post.md"],
  readFileSync: (filePath: string) =>
    filePath.includes("a-post")
      ? `---\ntitle: A Post\ndate: "2026-07-01"\nexcerpt: First\n---\nBody A`
      : `---\ntitle: B Post\ndate: "2026-07-15"\nexcerpt: Second\n---\nBody B`,
};

describe("getAllPosts", () => {
  it("returns posts sorted newest first", () => {
    const posts = getAllPosts("content/posts", fakeFs, fakeGitMeta);
    expect(posts.map((p) => p.slug)).toEqual(["b-post", "a-post"]);
  });

  it("attaches git metadata to each post", () => {
    const posts = getAllPosts("content/posts", fakeFs, fakeGitMeta);
    expect(posts[0].git.hash).toBe("abc123");
  });

  it("derives slug from filename", () => {
    const posts = getAllPosts("content/posts", fakeFs, fakeGitMeta);
    expect(posts.find((p) => p.title === "A Post")?.slug).toBe("a-post");
  });
});

describe("getPostBySlug", () => {
  it("finds a post by slug", () => {
    expect(getPostBySlug("a-post", "content/posts", fakeFs, fakeGitMeta)?.title).toBe("A Post");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getPostBySlug("missing", "content/posts", fakeFs, fakeGitMeta)).toBeUndefined();
  });
});
