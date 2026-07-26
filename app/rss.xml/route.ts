import { getAllPosts } from "@/lib/content/posts";
import { buildRssFeed } from "@/lib/rss";

export function GET() {
  const xml = buildRssFeed(getAllPosts());

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
