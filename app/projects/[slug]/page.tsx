import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllProjects, getProjectBySlug } from "@/lib/content/projects";

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <article>
      <div className="font-mono text-xs text-muted">
        {project.date} &nbsp;{project.git.hash} &nbsp;
        <span className="text-diff-add">+{project.git.added}</span>{" "}
        <span className="text-diff-remove">-{project.git.removed}</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">{project.title}</h1>
      <div className="mt-4 flex gap-4 font-mono text-sm text-diff-add">
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noreferrer">
            repo
          </a>
        )}
        {project.demoUrl && (
          <a href={project.demoUrl} target="_blank" rel="noreferrer">
            demo
          </a>
        )}
      </div>
      <div className="prose-content mt-6 text-ink">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content}</ReactMarkdown>
      </div>
    </article>
  );
}
