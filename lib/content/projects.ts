import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { frontmatterSchema, parseFrontmatter } from "./schema";
import { getGitMetaForFile, type GitMeta } from "./git-meta";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

const projectFrontmatterSchema = frontmatterSchema.extend({
  repoUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

export type Project = ProjectFrontmatter & {
  slug: string;
  content: string;
  git: GitMeta;
};

type FsLike = {
  readdirSync: (dir: string) => string[];
  readFileSync: (filePath: string) => string;
};

const defaultFs: FsLike = {
  readdirSync: (dir) => fs.readdirSync(dir),
  readFileSync: (filePath) => fs.readFileSync(filePath, "utf-8"),
};

export function getAllProjects(
  projectsDir: string = PROJECTS_DIR,
  fsImpl: FsLike = defaultFs,
  gitMeta: typeof getGitMetaForFile = getGitMetaForFile
): Project[] {
  const files = fsImpl.readdirSync(projectsDir).filter((f) => f.endsWith(".md"));

  const projects = files.map((file) => {
    const filePath = path.join(projectsDir, file);
    const raw = fsImpl.readFileSync(filePath);
    const { data, content } = matter(raw);
    const frontmatter = parseFrontmatter(projectFrontmatterSchema, data, filePath);
    const slug = file.replace(/\.md$/, "");
    const git = gitMeta(path.relative(process.cwd(), filePath));
    return { ...frontmatter, slug, content, git };
  });

  return projects.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getProjectBySlug(
  slug: string,
  projectsDir: string = PROJECTS_DIR,
  fsImpl: FsLike = defaultFs,
  gitMeta: typeof getGitMetaForFile = getGitMetaForFile
): Project | undefined {
  return getAllProjects(projectsDir, fsImpl, gitMeta).find((project) => project.slug === slug);
}

export type TagCount = { tag: string; count: number };

export function getAllProjectTags(projects: Project[] = getAllProjects()): TagCount[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const tag of project.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

export function getProjectsByTag(tag: string, projects: Project[] = getAllProjects()): Project[] {
  return projects.filter((project) => project.tags.includes(tag));
}
