import { getAllProjects } from "@/lib/content/projects";
import { ProjectCard } from "@/components/ProjectCard";

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Projects</h1>
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
