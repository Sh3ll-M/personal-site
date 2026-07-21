import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjectTags, getProjectsByTag } from "@/lib/content/projects";
import { ProjectCard } from "@/components/ProjectCard";

export function generateStaticParams() {
  return getAllProjectTags().map(({ tag }) => ({ tag }));
}

export default function ProjectTagPage({ params }: { params: { tag: string } }) {
  const projects = getProjectsByTag(params.tag);

  if (projects.length === 0) {
    notFound();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Projects tagged{" "}
        <Link href="/projects" className="text-diff-add hover:underline" title="Clear filter">
          {params.tag}
        </Link>
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            slug={project.slug}
            title={project.title}
            excerpt={project.excerpt}
            tags={project.tags}
          />
        ))}
      </div>
    </div>
  );
}
