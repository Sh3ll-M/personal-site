import { describe, it, expect } from "vitest";
import { buildRssFeed } from "./rss";
import type { Post } from "./content/posts";

const fakeGit = { hash: "abc123", date: "2026-07-01", added: 10, removed: 0 };

const fakePosts: Post[] = [
  {
    slug: "a-post",
    title: "A Post",
    date: "2026-07-01",
    tags: [],
    excerpt: "First post",
    content: "",
    git: fakeGit,
  },
  {
    slug: "b-post",
    title: "B & <C>",
    date: "2026-07-15",
    tags: [],
    excerpt: 'Second "post"',
    content: "",
    git: fakeGit,
  },
];

describe("buildRssFeed", () => {
  it("includes channel-level fields", () => {
    const xml = buildRssFeed(fakePosts);
    expect(xml).toContain("<title>Sh3ll-M</title>");
    expect(xml).toContain("<language>en-gb</language>");
    expect(xml).toContain("<link>https://personal-site-ecru-eta-23.vercel.app</link>");
  });

  it("includes one item per post", () => {
    const xml = buildRssFeed(fakePosts);
    expect(xml.match(/<item>/g)).toHaveLength(2);
  });

  it("builds an absolute link and permalink guid from the site URL and slug", () => {
    const xml = buildRssFeed(fakePosts);
    expect(xml).toContain(
      "<link>https://personal-site-ecru-eta-23.vercel.app/blog/a-post</link>"
    );
    expect(xml).toContain(
      '<guid isPermaLink="true">https://personal-site-ecru-eta-23.vercel.app/blog/a-post</guid>'
    );
  });

  it("escapes XML special characters in title and excerpt", () => {
    const xml = buildRssFeed(fakePosts);
    expect(xml).toContain("<title>B &amp; &lt;C&gt;</title>");
    expect(xml).toContain("Second &quot;post&quot;");
  });

  it("formats pubDate as an RFC 822 string derived from the frontmatter date", () => {
    const xml = buildRssFeed(fakePosts);
    expect(xml).toContain(`<pubDate>${new Date("2026-07-01T00:00:00Z").toUTCString()}</pubDate>`);
  });

  it("falls back to the current date instead of emitting 'Invalid Date' for an invalid calendar date", () => {
    const invalidDatePost: Post = {
      ...fakePosts[0],
      slug: "invalid-date-post",
      date: "2026-13-45",
    };
    const xml = buildRssFeed([invalidDatePost]);
    const pubDateMatch = xml.match(/<pubDate>(.*?)<\/pubDate>/);
    expect(pubDateMatch?.[1]).not.toContain("Invalid");
  });
});
