import { describe, it, expect } from "vitest";
import { getAllPosts, getPostBySlug, getAllTags, getPostsByTag, type Post } from "./posts";

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

const fakeGit = { hash: "abc123", date: "2026-07-01", added: 10, removed: 0 };

const fakePosts: Post[] = [
  { slug: "a-post", title: "A Post", date: "2026-07-01", tags: ["git", "meta"], excerpt: "A", content: "", git: fakeGit },
  { slug: "b-post", title: "B Post", date: "2026-07-15", tags: ["git"], excerpt: "B", content: "", git: fakeGit },
  { slug: "c-post", title: "C Post", date: "2026-07-20", tags: [], excerpt: "C", content: "", git: fakeGit },
];

describe("getAllTags", () => {
  it("counts each tag across all posts", () => {
    expect(getAllTags(fakePosts)).toEqual([
      { tag: "git", count: 2 },
      { tag: "meta", count: 1 },
    ]);
  });

  it("returns an empty array when no posts have tags", () => {
    expect(getAllTags([{ ...fakePosts[0], tags: [] }])).toEqual([]);
  });

  it("sorts tags alphabetically", () => {
    const posts = [
      { ...fakePosts[0], tags: ["zeta"] },
      { ...fakePosts[1], tags: ["alpha"] },
    ];
    expect(getAllTags(posts).map((t) => t.tag)).toEqual(["alpha", "zeta"]);
  });
});

describe("getPostsByTag", () => {
  it("returns only posts with the matching tag", () => {
    expect(getPostsByTag("meta", fakePosts).map((p) => p.slug)).toEqual(["a-post"]);
  });

  it("returns posts for a tag shared by multiple posts", () => {
    expect(getPostsByTag("git", fakePosts).map((p) => p.slug)).toEqual(["a-post", "b-post"]);
  });

  it("returns an empty array for an unknown tag", () => {
    expect(getPostsByTag("nonexistent", fakePosts)).toEqual([]);
  });
});
