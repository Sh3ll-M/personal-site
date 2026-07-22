import { describe, it, expect } from "vitest";
import { buildSitemap } from "./sitemap";
import type { Post } from "@/lib/content/posts";
import type { Project } from "@/lib/content/projects";

const fakeGit = { hash: "abc123", date: "2026-07-01", added: 10, removed: 0 };

const fakePosts: Post[] = [
  { slug: "a-post", title: "A Post", date: "2026-07-01", tags: [], excerpt: "A", content: "", git: fakeGit },
];

const fakeProjects: Project[] = [
  { slug: "a-project", title: "A Project", date: "2026-07-02", tags: [], excerpt: "A", content: "", git: fakeGit },
];

describe("buildSitemap", () => {
  it("includes the static routes", () => {
    const urls = buildSitemap(fakePosts, fakeProjects).map((entry) => entry.url);
    expect(urls).toEqual(
      expect.arrayContaining([
        "https://personal-site-ecru-eta-23.vercel.app/",
        "https://personal-site-ecru-eta-23.vercel.app/cv",
        "https://personal-site-ecru-eta-23.vercel.app/blog",
        "https://personal-site-ecru-eta-23.vercel.app/projects",
      ])
    );
  });

  it("includes one entry per post, using its date as lastModified", () => {
    const sitemap = buildSitemap(fakePosts, fakeProjects);
    const entry = sitemap.find((e) => e.url === "https://personal-site-ecru-eta-23.vercel.app/blog/a-post");
    expect(entry?.lastModified).toBe("2026-07-01");
  });

  it("includes one entry per project, using its date as lastModified", () => {
    const sitemap = buildSitemap(fakePosts, fakeProjects);
    const entry = sitemap.find((e) => e.url === "https://personal-site-ecru-eta-23.vercel.app/projects/a-project");
    expect(entry?.lastModified).toBe("2026-07-02");
  });

  it("excludes tag pages", () => {
    const urls = buildSitemap(fakePosts, fakeProjects).map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/tags"))).toBe(false);
  });
});
