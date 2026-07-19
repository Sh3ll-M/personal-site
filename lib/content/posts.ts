import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { frontmatterSchema, parseFrontmatter, type Frontmatter } from "./schema";
import { getGitMetaForFile, type GitMeta } from "./git-meta";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type Post = Frontmatter & {
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

export function getAllPosts(
  postsDir: string = POSTS_DIR,
  fsImpl: FsLike = defaultFs,
  gitMeta: typeof getGitMetaForFile = getGitMetaForFile
): Post[] {
  const files = fsImpl.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

  const posts = files.map((file) => {
    const filePath = path.join(postsDir, file);
    const raw = fsImpl.readFileSync(filePath);
    const { data, content } = matter(raw);
    const frontmatter = parseFrontmatter(frontmatterSchema, data, filePath);
    const slug = file.replace(/\.md$/, "");
    const git = gitMeta(path.relative(process.cwd(), filePath));
    return { ...frontmatter, slug, content, git };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(
  slug: string,
  postsDir: string = POSTS_DIR,
  fsImpl: FsLike = defaultFs,
  gitMeta: typeof getGitMetaForFile = getGitMetaForFile
): Post | undefined {
  return getAllPosts(postsDir, fsImpl, gitMeta).find((post) => post.slug === slug);
}
