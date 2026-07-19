import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug } from "@/lib/content/posts";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
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
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
