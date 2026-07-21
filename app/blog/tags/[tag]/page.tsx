import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/content/posts";
import { Timeline } from "@/components/Timeline";

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export default function BlogTagPage({ params }: { params: { tag: string } }) {
  const posts = getPostsByTag(params.tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Posts tagged{" "}
        <Link href="/blog" className="text-diff-add hover:underline" title="Clear filter">
          {params.tag}
        </Link>
      </h1>
      <div className="mt-6">
        <Timeline items={posts} basePath="/blog" />
      </div>
    </div>
  );
}
