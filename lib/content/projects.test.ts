import { describe, it, expect } from "vitest";
import {
  getAllProjects,
  getProjectBySlug,
  getAllProjectTags,
  getProjectsByTag,
  type Project,
} from "./projects";

const fakeGitMeta = () => ({ hash: "def456", date: "2026-07-01", added: 20, removed: 0 });

const fakeFs = {
  readdirSync: () => ["project-a.md"],
  readFileSync: () =>
    `---\ntitle: Project A\ndate: "2026-07-01"\nexcerpt: A thing I built\ntags: ["nextjs"]\nrepoUrl: "https://example.com/repo"\n---\nBody`,
};

describe("getAllProjects", () => {
  it("returns projects with parsed frontmatter and git metadata", () => {
    const projects = getAllProjects("content/projects", fakeFs, fakeGitMeta);
    expect(projects[0]).toMatchObject({
      slug: "project-a",
      title: "Project A",
      repoUrl: "https://example.com/repo",
      git: { hash: "def456" },
    });
  });

  it("leaves repoUrl/demoUrl undefined when omitted", () => {
    const fsNoLinks = {
      readdirSync: () => ["project-b.md"],
      readFileSync: () => `---\ntitle: Project B\ndate: "2026-07-01"\nexcerpt: Another thing\n---\nBody`,
    };
    const projects = getAllProjects("content/projects", fsNoLinks, fakeGitMeta);
    expect(projects[0].repoUrl).toBeUndefined();
    expect(projects[0].demoUrl).toBeUndefined();
  });
});

describe("getProjectBySlug", () => {
  it("finds a project by slug", () => {
    expect(getProjectBySlug("project-a", "content/projects", fakeFs, fakeGitMeta)?.title).toBe(
      "Project A"
    );
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProjectBySlug("missing", "content/projects", fakeFs, fakeGitMeta)).toBeUndefined();
  });
});

const fakeGit = { hash: "def456", date: "2026-07-01", added: 20, removed: 0 };

const fakeProjects: Project[] = [
  { slug: "project-a", title: "Project A", date: "2026-07-01", tags: ["nextjs", "typescript"], excerpt: "A", content: "", git: fakeGit },
  { slug: "project-b", title: "Project B", date: "2026-07-05", tags: ["nextjs"], excerpt: "B", content: "", git: fakeGit },
];

describe("getAllProjectTags", () => {
  it("counts each tag across all projects, sorted alphabetically", () => {
    expect(getAllProjectTags(fakeProjects)).toEqual([
      { tag: "nextjs", count: 2 },
      { tag: "typescript", count: 1 },
    ]);
  });
});

describe("getProjectsByTag", () => {
  it("returns only projects with the matching tag", () => {
    expect(getProjectsByTag("typescript", fakeProjects).map((p) => p.slug)).toEqual(["project-a"]);
  });

  it("returns an empty array for an unknown tag", () => {
    expect(getProjectsByTag("nonexistent", fakeProjects)).toEqual([]);
  });
});
