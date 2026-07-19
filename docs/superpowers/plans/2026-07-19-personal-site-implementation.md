# Personal Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core personal site — CV, blog, and projects section — as a git-native, dark-mode, timeline-driven Next.js site with no database, auth, or CMS.

**Architecture:** Next.js (App Router) reads Markdown content files with frontmatter at build time, validates them against a Zod schema, and derives each post/project's displayed "commit hash" and diffstat from that file's real git history. Blog posts and projects render as a vertical timeline (dot-and-line, git-log flavored). A persistent left sidebar provides navigation. No server, no database — publishing is `git push`, deployed on Vercel.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · gray-matter · Zod · Vitest (for `lib/content/*` logic only) · npm

## Global Constraints

- Dark mode only — no light/dark toggle (per spec: "Mode: dark by default")
- No database, no authentication, no CMS/admin panel — content is Markdown files in the repo (per spec: "no auth, no admin UI, no database")
- Hosting target is Vercel (per spec)
- Hash/diffstat shown for each post/project is derived from real git history at build time, never hand-authored (per spec: "so the commit-log metaphor stays honest rather than becoming manual busywork")
- `prefers-reduced-motion` must be respected by all Framer Motion animation (per spec)
- Palette: bg `#101214`, sidebar `#16181C`, ink `#E8E6E1`, muted `#8A8F98`, rule `#24272C`, diff-add `#3FB374`, diff-remove `#E0605C` — diff-add/diff-remove are functional colors only, never purely decorative (per spec)
- No embedded interactive widgets inside post/project content, no comments (per spec non-goals)
- Package manager: npm

---

## File Structure

```
personal-site/
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── next-env.d.ts
├── vitest.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── fonts.ts
│   ├── not-found.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── cv/page.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── Hero.tsx
│   ├── Timeline.tsx
│   ├── TimelineEntry.tsx
│   └── ProjectCard.tsx
├── lib/content/
│   ├── schema.ts
│   ├── schema.test.ts
│   ├── git-meta.ts
│   ├── git-meta.test.ts
│   ├── posts.ts
│   ├── posts.test.ts
│   ├── projects.ts
│   └── projects.test.ts
└── content/
    ├── posts/hello-world.md
    └── projects/example-project.md
```

---

### Task 1: Project scaffold

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `next-env.d.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

**Interfaces:**
- Produces: a buildable Next.js + TypeScript app with `@/*` path alias resolving to the project root.

- [ ] **Step 1: Write `.gitignore`**

```
node_modules/
.next/
.env
.env.*
.vercel
.superpowers/
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "personal-site",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "gray-matter": "^4.0.3",
    "zod": "^3.23.0",
    "framer-motion": "^11.2.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^20.14.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Write `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
```

- [ ] **Step 5: Write `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 6: Write `app/layout.tsx`**

```tsx
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Write `app/page.tsx`**

```tsx
export default function HomePage() {
  return <p>Personal site — under construction.</p>;
}
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`
Expected: completes with no errors; `node_modules/` and `package-lock.json` are created.

- [ ] **Step 9: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully", with route `/` listed in the output.

- [ ] **Step 10: Commit**

```bash
git add .gitignore package.json package-lock.json tsconfig.json next.config.js next-env.d.ts app/layout.tsx app/page.tsx
git commit -m "chore: scaffold Next.js + TypeScript project"
```

---

### Task 2: Design tokens — Tailwind, global CSS, fonts

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `app/globals.css`
- Create: `app/fonts.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: Tailwind color utilities (`bg`, `sidebar`, `ink`, `muted`, `rule`, `diff-add`, `diff-remove`) and font utilities (`font-display`, `font-body`, `font-mono`) usable by every later component/page task.

- [ ] **Step 1: Write `postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 2: Write `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        sidebar: "var(--color-sidebar)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        rule: "var(--color-rule)",
        "diff-add": "var(--color-diff-add)",
        "diff-remove": "var(--color-diff-remove)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Write `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #101214;
  --color-sidebar: #16181c;
  --color-ink: #e8e6e1;
  --color-muted: #8a8f98;
  --color-rule: #24272c;
  --color-diff-add: #3fb374;
  --color-diff-remove: #e0605c;
}
```

- [ ] **Step 4: Write `app/fonts.ts`**

```ts
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});
```

- [ ] **Step 5: Modify `app/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { spaceGrotesk, inter, plexMono } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-bg font-body text-ink">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully". (This step requires network access, since `next/font/google` fetches font files at build time.)

- [ ] **Step 7: Commit**

```bash
git add tailwind.config.ts postcss.config.js app/globals.css app/fonts.ts app/layout.tsx
git commit -m "feat: add dark-mode design tokens (palette, type, Tailwind config)"
```

---

### Task 3: Content schema & validation

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/content/schema.ts`
- Test: `lib/content/schema.test.ts`

**Interfaces:**
- Produces:
  - `frontmatterSchema: ZodObject<{ title, date, tags, excerpt }>`
  - `type Frontmatter = { title: string; date: string; tags: string[]; excerpt: string }`
  - `parseFrontmatter<T>(schema: ZodType<T>, data: unknown, sourcePath: string): T` — throws `Error` with `sourcePath` and issue details when `data` doesn't match `schema`.

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 2: Write the failing test — `lib/content/schema.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { frontmatterSchema, parseFrontmatter } from "./schema";

describe("parseFrontmatter", () => {
  it("accepts valid frontmatter", () => {
    const result = parseFrontmatter(
      frontmatterSchema,
      { title: "Hello", date: "2026-07-19", tags: ["git"], excerpt: "An intro post" },
      "content/posts/hello.md"
    );
    expect(result.title).toBe("Hello");
    expect(result.tags).toEqual(["git"]);
  });

  it("defaults tags to an empty array when omitted", () => {
    const result = parseFrontmatter(
      frontmatterSchema,
      { title: "Hello", date: "2026-07-19", excerpt: "An intro post" },
      "content/posts/hello.md"
    );
    expect(result.tags).toEqual([]);
  });

  it("throws with the source path when date is malformed", () => {
    expect(() =>
      parseFrontmatter(
        frontmatterSchema,
        { title: "Hello", date: "19-07-2026", excerpt: "An intro post" },
        "content/posts/hello.md"
      )
    ).toThrow(/content\/posts\/hello\.md/);
  });

  it("throws when title is missing", () => {
    expect(() =>
      parseFrontmatter(
        frontmatterSchema,
        { date: "2026-07-19", excerpt: "An intro post" },
        "content/posts/hello.md"
      )
    ).toThrow(/title/);
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `npx vitest run lib/content/schema.test.ts`
Expected: FAIL — cannot find module `./schema`.

- [ ] **Step 4: Write `lib/content/schema.ts`**

```ts
import { z, ZodType } from "zod";

export const frontmatterSchema = z.object({
  title: z.string().min(1, "title is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  tags: z.array(z.string()).default([]),
  excerpt: z.string().min(1, "excerpt is required"),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export function parseFrontmatter<T>(schema: ZodType<T>, data: unknown, sourcePath: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid frontmatter in ${sourcePath}: ${issues}`);
  }
  return result.data;
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `npx vitest run lib/content/schema.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts lib/content/schema.ts lib/content/schema.test.ts
git commit -m "feat: add frontmatter schema and validation"
```

---

### Task 4: Git-derived metadata

**Files:**
- Create: `lib/content/git-meta.ts`
- Test: `lib/content/git-meta.test.ts`

**Interfaces:**
- Produces:
  - `type GitMeta = { hash: string; date: string; added: number; removed: number }`
  - `type RunCommand = (command: string) => string`
  - `getGitMetaForFile(filePath: string, run?: RunCommand): GitMeta` — throws `Error` matching `/No git history/` if the file has no commits.

- [ ] **Step 1: Write the failing test — `lib/content/git-meta.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { getGitMetaForFile } from "./git-meta";

describe("getGitMetaForFile", () => {
  it("parses hash, date, and diffstat from git log output", () => {
    const calls: string[] = [];
    const fakeRun = (command: string) => {
      calls.push(command);
      if (command.includes("--shortstat")) {
        return " 1 file changed, 142 insertions(+), 8 deletions(-)\n";
      }
      return "a3f9c2|2026-07-12\n";
    };

    const meta = getGitMetaForFile("content/posts/hello.md", fakeRun);

    expect(meta).toEqual({ hash: "a3f9c2", date: "2026-07-12", added: 142, removed: 8 });
    expect(calls[0]).toContain("content/posts/hello.md");
  });

  it("defaults added/removed to 0 when shortstat has no matching counts", () => {
    const fakeRun = (command: string) =>
      command.includes("--shortstat") ? " 1 file changed\n" : "1c88d4|2026-06-02\n";

    const meta = getGitMetaForFile("content/posts/new.md", fakeRun);

    expect(meta.added).toBe(0);
    expect(meta.removed).toBe(0);
  });

  it("throws when there is no git history for the file", () => {
    const fakeRun = () => "";
    expect(() => getGitMetaForFile("content/posts/untracked.md", fakeRun)).toThrow(
      /No git history/
    );
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run lib/content/git-meta.test.ts`
Expected: FAIL — cannot find module `./git-meta`.

- [ ] **Step 3: Write `lib/content/git-meta.ts`**

```ts
import { execSync } from "node:child_process";

export type GitMeta = {
  hash: string;
  date: string;
  added: number;
  removed: number;
};

export type RunCommand = (command: string) => string;

const defaultRun: RunCommand = (command) => execSync(command, { encoding: "utf-8" });

export function getGitMetaForFile(filePath: string, run: RunCommand = defaultRun): GitMeta {
  const log = run(`git log -1 --format=%h|%ad --date=short -- "${filePath}"`).trim();
  if (!log) {
    throw new Error(`No git history found for ${filePath}`);
  }
  const [hash, date] = log.split("|");

  const shortstat = run(`git log -1 --shortstat -- "${filePath}"`);
  const insertMatch = shortstat.match(/(\d+) insertion/);
  const deleteMatch = shortstat.match(/(\d+) deletion/);

  return {
    hash,
    date,
    added: insertMatch ? Number(insertMatch[1]) : 0,
    removed: deleteMatch ? Number(deleteMatch[1]) : 0,
  };
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run lib/content/git-meta.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/content/git-meta.ts lib/content/git-meta.test.ts
git commit -m "feat: derive commit hash and diffstat from git history"
```

---

### Task 5: Posts content loader

**Files:**
- Create: `lib/content/posts.ts`
- Test: `lib/content/posts.test.ts`
- Create: `content/posts/hello-world.md`

**Interfaces:**
- Consumes: `frontmatterSchema`, `parseFrontmatter` (Task 3); `getGitMetaForFile`, `type GitMeta` (Task 4)
- Produces:
  - `type Post = Frontmatter & { slug: string; content: string; git: GitMeta }`
  - `getAllPosts(postsDir?: string, fsImpl?: FsLike, gitMeta?: typeof getGitMetaForFile): Post[]` — sorted newest-first by `date`
  - `getPostBySlug(slug: string, postsDir?: string, fsImpl?: FsLike, gitMeta?: typeof getGitMetaForFile): Post | undefined`

- [ ] **Step 1: Write the failing test — `lib/content/posts.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { getAllPosts, getPostBySlug } from "./posts";

const fakeGitMeta = () => ({ hash: "abc123", date: "2026-07-01", added: 10, removed: 0 });

const fakeFs = {
  readdirSync: () => ["b-post.md", "a-post.md"],
  readFileSync: (filePath: string) =>
    filePath.includes("a-post")
      ? `---\ntitle: A Post\ndate: "2026-07-01"\nexcerpt: First\n---\nBody A`
      : `---\ntitle: B Post\ndate: "2026-07-15"\nexcerpt: Second\n---\nBody B`,
};

describe("getAllPosts", () => {
  it("returns posts sorted newest first", () => {
    const posts = getAllPosts("content/posts", fakeFs, fakeGitMeta);
    expect(posts.map((p) => p.slug)).toEqual(["b-post", "a-post"]);
  });

  it("attaches git metadata to each post", () => {
    const posts = getAllPosts("content/posts", fakeFs, fakeGitMeta);
    expect(posts[0].git.hash).toBe("abc123");
  });

  it("derives slug from filename", () => {
    const posts = getAllPosts("content/posts", fakeFs, fakeGitMeta);
    expect(posts.find((p) => p.title === "A Post")?.slug).toBe("a-post");
  });
});

describe("getPostBySlug", () => {
  it("finds a post by slug", () => {
    expect(getPostBySlug("a-post", "content/posts", fakeFs, fakeGitMeta)?.title).toBe("A Post");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getPostBySlug("missing", "content/posts", fakeFs, fakeGitMeta)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run lib/content/posts.test.ts`
Expected: FAIL — cannot find module `./posts`.

- [ ] **Step 3: Write `lib/content/posts.ts`**

```ts
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
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run lib/content/posts.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Add the sample content file — `content/posts/hello-world.md`**

```markdown
---
title: "Hello, World"
date: "2026-07-19"
tags: ["meta"]
excerpt: "The first post on this site, and a quick note on why it's built this way."
---

This is the first post on the site. More on the way.
```

- [ ] **Step 6: Commit**

Committing the sample post now (before later tasks render it) means it has real git history by the time `getGitMetaForFile` runs against it during a page build.

```bash
git add lib/content/posts.ts lib/content/posts.test.ts content/posts/hello-world.md
git commit -m "feat: add posts content loader with sample post"
```

---

### Task 6: Projects content loader

**Files:**
- Create: `lib/content/projects.ts`
- Test: `lib/content/projects.test.ts`
- Create: `content/projects/example-project.md`

**Interfaces:**
- Consumes: `frontmatterSchema`, `parseFrontmatter` (Task 3); `getGitMetaForFile`, `type GitMeta` (Task 4)
- Produces:
  - `type ProjectFrontmatter = Frontmatter & { repoUrl?: string; demoUrl?: string }`
  - `type Project = ProjectFrontmatter & { slug: string; content: string; git: GitMeta }`
  - `getAllProjects(projectsDir?: string, fsImpl?: FsLike, gitMeta?: typeof getGitMetaForFile): Project[]`
  - `getProjectBySlug(slug: string, projectsDir?: string, fsImpl?: FsLike, gitMeta?: typeof getGitMetaForFile): Project | undefined`

- [ ] **Step 1: Write the failing test — `lib/content/projects.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { getAllProjects, getProjectBySlug } from "./projects";

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
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run lib/content/projects.test.ts`
Expected: FAIL — cannot find module `./projects`.

- [ ] **Step 3: Write `lib/content/projects.ts`**

```ts
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
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run lib/content/projects.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Add the sample content file — `content/projects/example-project.md`**

```markdown
---
title: "Personal Site"
date: "2026-07-19"
tags: ["nextjs", "typescript"]
excerpt: "This site itself — a git-flavored personal site built with Next.js."
---

The site you're looking at right now.
```

- [ ] **Step 6: Commit**

```bash
git add lib/content/projects.ts lib/content/projects.test.ts content/projects/example-project.md
git commit -m "feat: add projects content loader with sample project"
```

---

### Task 7: Sidebar navigation + root layout wiring

**Files:**
- Create: `components/Sidebar.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `Sidebar()` component, rendered persistently in the root layout.

- [ ] **Step 1: Write `components/Sidebar.tsx`**

```tsx
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/projects", label: "projects" },
  { href: "/cv", label: "cv" },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-rule bg-sidebar px-6 py-8">
      <div className="font-display text-xl font-bold text-ink">Matthew</div>
      <div className="mt-1 font-mono text-xs text-muted">builds &amp; breaks things</div>
      <nav className="mt-8 flex flex-col gap-3 font-mono text-sm text-muted">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-ink">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Modify `app/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { spaceGrotesk, inter, plexMono } from "./fonts";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen bg-bg font-body text-ink">
        <Sidebar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully".

- [ ] **Step 4: Commit**

```bash
git add components/Sidebar.tsx app/layout.tsx
git commit -m "feat: add persistent sidebar navigation"
```

---

### Task 8: Timeline components + Home page

**Files:**
- Create: `components/TimelineEntry.tsx`
- Create: `components/Timeline.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getAllPosts` (Task 5)
- Produces:
  - `TimelineEntry(props: { href: string; hash: string; date: string; added: number; removed: number; title: string; excerpt: string })`
  - `Timeline(props: { items: { slug: string; title: string; excerpt: string; date: string; git: { hash: string; added: number; removed: number } }[]; basePath: string })` — reused by Task 9 (Blog index)

- [ ] **Step 1: Write `components/TimelineEntry.tsx`**

```tsx
import Link from "next/link";

type TimelineEntryProps = {
  href: string;
  hash: string;
  date: string;
  added: number;
  removed: number;
  title: string;
  excerpt: string;
};

export function TimelineEntry({ href, hash, date, added, removed, title, excerpt }: TimelineEntryProps) {
  return (
    <li className="relative pl-7">
      <span className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-diff-add" />
      <div className="font-mono text-xs text-muted">
        {date} &nbsp;{hash} &nbsp;
        <span className="text-diff-add">+{added}</span> <span className="text-diff-remove">-{removed}</span>
      </div>
      <Link href={href} className="mt-1 block font-display text-lg font-bold text-ink hover:underline">
        {title}
      </Link>
      <p className="mt-1 text-sm text-muted">{excerpt}</p>
    </li>
  );
}
```

- [ ] **Step 2: Write `components/Timeline.tsx`**

```tsx
import { TimelineEntry } from "./TimelineEntry";

type TimelineItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  git: { hash: string; added: number; removed: number };
};

export function Timeline({ items, basePath }: { items: TimelineItem[]; basePath: string }) {
  return (
    <ul className="relative space-y-8 border-l border-rule pl-2">
      {items.map((item) => (
        <TimelineEntry
          key={item.slug}
          href={`${basePath}/${item.slug}`}
          hash={item.git.hash}
          date={item.date}
          added={item.git.added}
          removed={item.git.removed}
          title={item.title}
          excerpt={item.excerpt}
        />
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: Modify `app/page.tsx`**

```tsx
import { getAllPosts } from "@/lib/content/posts";
import { Timeline } from "@/components/Timeline";

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <div>
      <div className="font-mono text-xs text-muted">~/matthew</div>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink">Matthew.</h1>
      <p className="mt-2 font-mono text-sm text-muted">builds things. breaks things. writes it down.</p>

      <h2 className="mt-12 font-display text-sm uppercase tracking-wide text-muted">Recent</h2>
      <div className="mt-4">
        <Timeline items={recentPosts} basePath="/blog" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully". This is the first build that actually executes `getAllPosts()` → `getGitMetaForFile()` against real git history — it succeeds because `content/posts/hello-world.md` was already committed in Task 5.

- [ ] **Step 5: Commit**

```bash
git add components/TimelineEntry.tsx components/Timeline.tsx app/page.tsx
git commit -m "feat: add timeline components and wire up Home page"
```

---

### Task 9: Blog index page

**Files:**
- Create: `app/blog/page.tsx`

**Interfaces:**
- Consumes: `getAllPosts` (Task 5), `Timeline` (Task 8)

- [ ] **Step 1: Write `app/blog/page.tsx`**

```tsx
import { getAllPosts } from "@/lib/content/posts";
import { Timeline } from "@/components/Timeline";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Blog</h1>
      <div className="mt-6">
        <Timeline items={posts} basePath="/blog" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully", with route `/blog` listed.

- [ ] **Step 3: Commit**

```bash
git add app/blog/page.tsx
git commit -m "feat: add blog index page"
```

---

### Task 10: Blog post page

**Files:**
- Create: `app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getAllPosts`, `getPostBySlug`, `type Post` (Task 5)

- [ ] **Step 1: Write `app/blog/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
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
      <div className="mt-6 whitespace-pre-wrap text-ink">{post.content}</div>
    </article>
  );
}
```

- [ ] **Step 2: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully", with `/blog/hello-world` listed as a static route.

- [ ] **Step 3: Commit**

```bash
git add "app/blog/[slug]/page.tsx"
git commit -m "feat: add blog post page"
```

---

### Task 11: Projects index page

**Files:**
- Create: `components/ProjectCard.tsx`
- Create: `app/projects/page.tsx`

**Interfaces:**
- Consumes: `getAllProjects` (Task 6)
- Produces: `ProjectCard(props: { slug: string; title: string; excerpt: string; tags: string[] })` — reused by nothing else, but kept as its own component per the file-structure boundary (one card per project, one responsibility)

- [ ] **Step 1: Write `components/ProjectCard.tsx`**

```tsx
import Link from "next/link";

type ProjectCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
};

export function ProjectCard({ slug, title, excerpt, tags }: ProjectCardProps) {
  return (
    <Link href={`/projects/${slug}`} className="block rounded border border-rule p-5 hover:border-diff-add">
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{excerpt}</p>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted">
          {tags.map((tag) => (
            <span key={tag} className="rounded border border-rule px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
```

- [ ] **Step 2: Write `app/projects/page.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully", with route `/projects` listed.

- [ ] **Step 4: Commit**

```bash
git add components/ProjectCard.tsx app/projects/page.tsx
git commit -m "feat: add projects index page"
```

---

### Task 12: Project detail page

**Files:**
- Create: `app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getAllProjects`, `getProjectBySlug`, `type Project` (Task 6)

- [ ] **Step 1: Write `app/projects/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
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
      <div className="mt-6 whitespace-pre-wrap text-ink">{project.content}</div>
    </article>
  );
}
```

- [ ] **Step 2: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully", with `/projects/example-project` listed as a static route.

- [ ] **Step 3: Commit**

```bash
git add "app/projects/[slug]/page.tsx"
git commit -m "feat: add project detail page"
```

---

### Task 13: CV page

**Files:**
- Create: `app/cv/page.tsx`

**Interfaces:** none — standalone page.

- [ ] **Step 1: Write `app/cv/page.tsx`**

The `EXPERIENCE` and `SKILLS` arrays below hold clearly-fillable sample entries — real CV content is an explicitly deferred item from the design spec (Matthew supplies it, not fabricated). Replace them after this task lands.

```tsx
type ExperienceEntry = {
  role: string;
  org: string;
  period: string;
  summary: string;
};

const EXPERIENCE: ExperienceEntry[] = [
  {
    role: "Replace with your role",
    org: "Replace with company/org",
    period: "20XX — Present",
    summary: "Replace with a one or two line summary of what you did here.",
  },
];

const SKILLS: string[] = ["Replace", "With", "Your", "Skills"];

export default function CvPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">CV</h1>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Experience</h2>
        <div className="mt-4 space-y-6">
          {EXPERIENCE.map((entry) => (
            <div key={`${entry.org}-${entry.period}`}>
              <div className="font-display text-lg font-bold text-ink">{entry.role}</div>
              <div className="font-mono text-xs text-muted">
                {entry.org} &nbsp;·&nbsp; {entry.period}
              </div>
              <p className="mt-1 text-sm text-muted">{entry.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Skills</h2>
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted">
          {SKILLS.map((skill) => (
            <span key={skill} className="rounded border border-rule px-2 py-0.5">
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully", with route `/cv` listed.

- [ ] **Step 3: Commit**

```bash
git add app/cv/page.tsx
git commit -m "feat: add CV page with fillable sample content"
```

---

### Task 14: Not-found (404) page

**Files:**
- Create: `app/not-found.tsx`

**Interfaces:** none — standalone page.

- [ ] **Step 1: Write `app/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <div className="font-mono text-xs text-diff-remove">
        git checkout: pathspec did not match any file
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">404</h1>
      <p className="mt-2 text-sm text-muted">
        Nothing here.{" "}
        <Link href="/" className="text-diff-add hover:underline">
          Back to home
        </Link>
        .
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully".

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat: add themed 404 page"
```

---

### Task 15: Motion pass (Framer Motion + reduced-motion support)

**Files:**
- Create: `components/Hero.tsx`
- Modify: `components/TimelineEntry.tsx`
- Modify: `components/Sidebar.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `Hero()` component (client component) — the Home page's page-load animation sequence.
- Modifies `TimelineEntry` to become a client component with scroll-triggered reveal; its props/exported name are unchanged from Task 8, so Task 9/10 callers (`Timeline`) require no changes.

- [ ] **Step 1: Write `components/Hero.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Hero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
  };

  const item = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      <motion.div variants={item} className="font-mono text-xs text-muted">
        ~/matthew
      </motion.div>
      <motion.h1 variants={item} className="mt-2 font-display text-4xl font-bold text-ink">
        Matthew.
      </motion.h1>
      <motion.p variants={item} className="mt-2 font-mono text-sm text-muted">
        builds things. breaks things. writes it down.
      </motion.p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Modify `components/TimelineEntry.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

type TimelineEntryProps = {
  href: string;
  hash: string;
  date: string;
  added: number;
  removed: number;
  title: string;
  excerpt: string;
};

export function TimelineEntry({ href, hash, date, added, removed, title, excerpt }: TimelineEntryProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      className="relative pl-7"
      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <span className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-diff-add" />
      <div className="font-mono text-xs text-muted">
        {date} &nbsp;{hash} &nbsp;
        <span className="text-diff-add">+{added}</span> <span className="text-diff-remove">-{removed}</span>
      </div>
      <Link href={href} className="mt-1 block font-display text-lg font-bold text-ink hover:underline">
        {title}
      </Link>
      <p className="mt-1 text-sm text-muted">{excerpt}</p>
    </motion.li>
  );
}
```

- [ ] **Step 3: Modify `components/Sidebar.tsx`** (add hover transition polish)

```tsx
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/projects", label: "projects" },
  { href: "/cv", label: "cv" },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-rule bg-sidebar px-6 py-8">
      <div className="font-display text-xl font-bold text-ink">Matthew</div>
      <div className="mt-1 font-mono text-xs text-muted">builds &amp; breaks things</div>
      <nav className="mt-8 flex flex-col gap-3 font-mono text-sm text-muted">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 4: Modify `app/page.tsx`** to use `Hero`

```tsx
import { getAllPosts } from "@/lib/content/posts";
import { Timeline } from "@/components/Timeline";
import { Hero } from "@/components/Hero";

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <div>
      <Hero />

      <h2 className="mt-12 font-display text-sm uppercase tracking-wide text-muted">Recent</h2>
      <div className="mt-4">
        <Timeline items={recentPosts} basePath="/blog" />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully".

- [ ] **Step 6: Manually verify motion behavior in the browser**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: Home's header text staggers in on load; scrolling `/blog` reveals timeline entries one at a time; nav links transition color smoothly on hover. Then, with the OS "reduce motion" setting turned on, reload — entries should appear immediately with no animation.

- [ ] **Step 7: Commit**

```bash
git add components/Hero.tsx components/TimelineEntry.tsx components/Sidebar.tsx app/page.tsx
git commit -m "feat: add page-load and scroll-reveal motion, respecting prefers-reduced-motion"
```

---

### Task 16: Responsive sidebar + final verification pass

**Files:**
- Modify: `components/Sidebar.tsx`
- Modify: `app/layout.tsx`

**Interfaces:** none — layout-only change, no prop/type changes.

- [ ] **Step 1: Modify `components/Sidebar.tsx`** to collapse to a top bar below the `md` breakpoint

```tsx
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/projects", label: "projects" },
  { href: "/cv", label: "cv" },
];

export function Sidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-rule bg-sidebar px-6 py-5 md:w-56 md:border-b-0 md:border-r md:py-8">
      <div className="font-display text-xl font-bold text-ink">Matthew</div>
      <div className="mt-1 font-mono text-xs text-muted">builds &amp; breaks things</div>
      <nav className="mt-6 flex gap-4 font-mono text-sm text-muted md:mt-8 md:flex-col md:gap-3">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Modify `app/layout.tsx`** so the sidebar stacks above content on small screens

```tsx
import type { ReactNode } from "react";
import { spaceGrotesk, inter, plexMono } from "./fonts";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-bg font-body text-ink md:flex-row">
        <Sidebar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the app builds**

Run: `npm run build`
Expected: "Compiled successfully".

- [ ] **Step 4: Manually verify responsive and accessibility behavior**

Run: `npm run dev`, open `http://localhost:3000` with the browser's device toolbar at a mobile width (e.g. 375px).
Expected: sidebar renders as a top bar with horizontal nav; at desktop width it's back to a left column. Tab through the page with the keyboard on both sizes — every link shows a visible focus outline (browser default is fine; nothing in this plan suppresses it).

- [ ] **Step 5: Run the full test suite one last time**

Run: `npm test`
Expected: all `lib/content/*.test.ts` suites pass (16 tests total across Tasks 3–6).

- [ ] **Step 6: Commit**

```bash
git add components/Sidebar.tsx app/layout.tsx
git commit -m "feat: collapse sidebar to a top bar on small screens"
```

---

## Post-plan notes (not implementation tasks)

- Real CV content (`app/cv/page.tsx`) and real project/post write-ups still need to replace the sample entries — flagged in the spec as Matthew's to supply.
- Custom domain and Vercel project connection are deferred, per the spec's open items — connect the repo to a new Vercel project and deploy when ready.
