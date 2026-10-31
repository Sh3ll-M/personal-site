import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { frontmatterSchema, parseFrontmatter } from "./schema";
import { getGitMetaForFile, type GitMeta } from "./git-meta";

const GANGS_DIR = path.join(process.cwd(), "content", "gangs");
const GANG_IMAGES_DIR = path.join(process.cwd(), "public", "images", "gangs");

const gangFrontmatterSchema = frontmatterSchema.extend({
  faction: z.string().min(1, "faction is required"),
  // How the cover photo is cropped on the gallery card. Defaults to centered;
  // use "top" when the subject's head sits near the top of a portrait shot.
  coverPosition: z.enum(["top", "center", "bottom"]).default("center"),
});

export type GangFrontmatter = z.infer<typeof gangFrontmatterSchema>;

export type GangPhoto = {
  /** Larger image, shown in the lightbox. */
  full: string;
  /** Smaller image, shown in the grid. */
  thumb: string;
};

export type Gang = GangFrontmatter & {
  slug: string;
  content: string;
  git: GitMeta;
  photos: GangPhoto[];
};

type FsLike = {
  readdirSync: (dir: string) => string[];
  readFileSync: (filePath: string) => string;
  existsSync: (p: string) => boolean;
};

const defaultFs: FsLike = {
  readdirSync: (dir) => fs.readdirSync(dir),
  readFileSync: (filePath) => fs.readFileSync(filePath, "utf-8"),
  existsSync: (p) => fs.existsSync(p),
};

// A short, stable pseudo-hash so a gang still renders a git-style header before
// its markdown file has been committed (real git metadata is used once it has).
function fallbackHash(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(7, "0").slice(0, 7);
}

function listPhotos(slug: string, imagesDir: string, fsImpl: FsLike): GangPhoto[] {
  const thumbDir = path.join(imagesDir, slug, "thumb");
  if (!fsImpl.existsSync(thumbDir)) return [];

  return fsImpl
    .readdirSync(thumbDir)
    .filter((f) => f.endsWith(".webp"))
    .sort()
    .map((file) => ({
      thumb: `/images/gangs/${slug}/thumb/${file}`,
      full: `/images/gangs/${slug}/full/${file}`,
    }));
}

export function getAllGangs(
  gangsDir: string = GANGS_DIR,
  imagesDir: string = GANG_IMAGES_DIR,
  fsImpl: FsLike = defaultFs,
  gitMeta: typeof getGitMetaForFile = getGitMetaForFile
): Gang[] {
  const files = fsImpl.readdirSync(gangsDir).filter((f) => f.endsWith(".md"));

  const gangs = files.map((file) => {
    const filePath = path.join(gangsDir, file);
    const raw = fsImpl.readFileSync(filePath);
    const { data, content } = matter(raw);
    const frontmatter = parseFrontmatter(gangFrontmatterSchema, data, filePath);
    const slug = file.replace(/\.md$/, "");

    let git: GitMeta;
    try {
      git = gitMeta(path.relative(process.cwd(), filePath));
    } catch {
      // Not committed yet — fall back to a stable, plausible header.
      git = { hash: fallbackHash(slug), date: frontmatter.date, added: 0, removed: 0 };
    }

    const photos = listPhotos(slug, imagesDir, fsImpl);
    return { ...frontmatter, slug, content, git, photos };
  });

  return gangs.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getGangBySlug(
  slug: string,
  gangsDir: string = GANGS_DIR,
  imagesDir: string = GANG_IMAGES_DIR,
  fsImpl: FsLike = defaultFs,
  gitMeta: typeof getGitMetaForFile = getGitMetaForFile
): Gang | undefined {
  return getAllGangs(gangsDir, imagesDir, fsImpl, gitMeta).find((gang) => gang.slug === slug);
}
