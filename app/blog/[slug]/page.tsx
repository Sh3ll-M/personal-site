import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getAdjacentPosts, getPostsByTags } from "@/lib/content/posts";
import { PostMarkdown } from "@/lib/content/markdown";
import { Timeline } from "@/components/Timeline";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return buildMetadata({
      title: "Not Found",
      description: "This post doesn't exist.",
      path: `/blog/${params.slug}`,
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const { previous, next } = getAdjacentPosts(post.slug);
  const relatedPosts = getPostsByTags(post.tags).filter((p) => p.slug !== post.slug);

  return (
    <article>
      <div className="font-mono text-xs text-muted">
        {post.date} &nbsp;{post.git.hash} &nbsp;
        <span className="text-diff-add">+{post.git.added}</span>{" "}
        <span className="text-diff-remove">-{post.git.removed}</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">{post.title}</h1>
      <div className="prose-content mt-6 text-ink">
        <PostMarkdown content={post.content} />
      </div>
      {(previous || next) && (
        <nav className="mt-10 flex justify-between gap-4 font-mono text-sm text-diff-add">
          {previous ? (
            <Link href={`/blog/${previous.slug}`} className="hover:underline">
              ← {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/blog/${next.slug}`} className="hover:underline">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
      {relatedPosts.length > 0 && (
        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Related posts</h2>
          <div className="mt-4">
            <Timeline items={relatedPosts} basePath="/blog" />
          </div>
        </section>
      )}
    </article>
  );
}
