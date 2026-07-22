import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/content/posts";
import { PostMarkdown } from "@/lib/content/markdown";
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
    </article>
  );
}
