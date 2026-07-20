# Syntax-Highlighted Code Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add build-time syntax highlighting (with a language badge, line numbers, and a copy-to-clipboard button) to fenced code blocks rendered from post/project Markdown.

**Architecture:** `rehype-pretty-code` (built on Shiki) runs as a rehype plugin inside the existing `ReactMarkdown` pipeline, highlighting at build time since both content routes are statically generated. The duplicated `ReactMarkdown` setup in the blog and project page files is consolidated into one shared `<PostMarkdown>` component. Badge and line numbers are pure CSS keyed off data attributes the plugin already emits; only the copy button needs a small client component.

**Tech Stack:** Next.js 14 (App Router, existing), `react-markdown` v9 + `remark-gfm` v4 (existing), `rehype-pretty-code` + `shiki` (new, both ESM-only — no special Next config needed, this repo already depends on ESM-only packages like `react-markdown`/`remark-gfm` without issue).

## Global Constraints

- Theme: Shiki's built-in `github-dark` theme, used as-is — no custom theme authoring.
- No line-highlighting/diff-annotation syntax (e.g. `{1,3-5}` ranges) — not needed for current content.
- No automated test coverage for rendering output — `vitest` in this repo is unit-level only; every task below is verified manually via the dev server.
- Clipboard write failures are caught and silently no-op (no error UI) — the site is HTTPS-only via Vercel, so this is a minor, unlikely edge case.
- Fenced code blocks with no language in the info string fall back to plaintext highlighting via `defaultLang: "plaintext"`, and must show **no** language badge.

---

### Task 1: Shared Markdown renderer with base highlighting, wired into the blog page

**Files:**
- Modify: `package.json`
- Create: `lib/content/markdown.tsx`
- Modify: `app/blog/[slug]/page.tsx:1-30`

**Interfaces:**
- Produces: `PostMarkdown({ content: string }): JSX.Element`, exported from `lib/content/markdown.tsx`. Later tasks (2, 4) import and extend this component.

- [ ] **Step 1: Install dependencies**

Run: `npm install rehype-pretty-code shiki`

Expected: `package.json` gains `rehype-pretty-code` and `shiki` under `dependencies`; `package-lock.json` (or equivalent) updates.

- [ ] **Step 2: Create the shared Markdown renderer**

Create `lib/content/markdown.tsx`:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

const rehypePrettyCodeOptions = {
  theme: "github-dark",
  keepBackground: true,
  defaultLang: "plaintext",
};

export function PostMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypePrettyCode, rehypePrettyCodeOptions]]}
    >
      {content}
    </ReactMarkdown>
  );
}
```

- [ ] **Step 3: Wire the blog post page to use it**

Modify `app/blog/[slug]/page.tsx` — replace the `ReactMarkdown`/`remarkGfm` import and inline usage:

```tsx
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/content/posts";
import { PostMarkdown } from "@/lib/content/markdown";

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
        <PostMarkdown content={post.content} />
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Manually verify**

Temporarily append a fenced code block to `content/posts/hello-world.md`:

````
```ts
const greeting: string = "hello";
console.log(greeting);
```
````

Run `npm run dev`, open `http://localhost:3000/blog/hello-world`, and confirm the block renders with Shiki's dark-theme syntax colors (not plain text).

Then revert the temporary edit: `git checkout -- content/posts/hello-world.md`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/content/markdown.tsx app/blog/[slug]/page.tsx
git commit -m "feat: add Shiki-based syntax highlighting to blog post Markdown"
```

---

### Task 2: Wire the project detail page to the shared renderer

**Files:**
- Modify: `app/projects/[slug]/page.tsx:1-42`

**Interfaces:**
- Consumes: `PostMarkdown({ content: string })` from `lib/content/markdown.tsx` (Task 1).

- [ ] **Step 1: Replace inline ReactMarkdown usage**

Modify `app/projects/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/content/projects";
import { PostMarkdown } from "@/lib/content/markdown";

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
        <PostMarkdown content={project.content} />
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Manually verify**

Temporarily append the same fenced code block (from Task 1, Step 4) to `content/projects/example-project.md`. Run `npm run dev`, open `http://localhost:3000/projects/example-project`, confirm highlighting renders. Revert: `git checkout -- content/projects/example-project.md`

- [ ] **Step 3: Commit**

```bash
git add app/projects/[slug]/page.tsx
git commit -m "feat: use shared PostMarkdown renderer on project detail page"
```

---

### Task 3: Language badge and line numbers (CSS only)

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: DOM structure emitted by `rehype-pretty-code` (Task 1) — `<figure data-rehype-pretty-code-figure><pre data-language="..." data-theme="...">​<code><span data-line>...</span></code></pre></figure>`.

- [ ] **Step 1: Add badge and line-number CSS**

Append to `app/globals.css`:

```css
figure[data-rehype-pretty-code-figure] {
  position: relative;
}

.prose-content pre[data-language]::before {
  content: attr(data-language);
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-muted);
  pointer-events: none;
}

.prose-content pre[data-language="plaintext"]::before {
  content: none;
}

.prose-content pre code {
  counter-reset: line;
}

.prose-content pre code > [data-line] {
  counter-increment: line;
  display: inline-block;
  width: 100%;
}

.prose-content pre code > [data-line]::before {
  content: counter(line);
  display: inline-block;
  width: 1.5em;
  margin-right: 1em;
  text-align: right;
  color: var(--color-muted);
  user-select: none;
}
```

- [ ] **Step 2: Manually verify**

Repeat the temporary code-block edit from Task 1 Step 4 on `content/posts/hello-world.md` (use a multi-line snippet, e.g. 3-4 lines, to see numbering clearly). Run `npm run dev`, open the post, confirm: a "ts" badge appears top-right, each line is numbered starting at 1, numbers don't get selected/copied when you manually select code text. Revert the file afterward.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add language badge and line numbers to code blocks"
```

---

### Task 4: Copy-to-clipboard button

**Files:**
- Create: `components/CodeBlock.tsx`
- Modify: `lib/content/markdown.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `CodeBlock(props: React.ComponentPropsWithoutRef<"pre">): JSX.Element`, a client component exported from `components/CodeBlock.tsx`.
- Consumes (modifies): `PostMarkdown` in `lib/content/markdown.tsx` (Task 1) — adds a `components` prop to the existing `ReactMarkdown` call.

- [ ] **Step 1: Create the CodeBlock client component**

Create `components/CodeBlock.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";

export function CodeBlock(props: React.ComponentPropsWithoutRef<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const code = preRef.current?.querySelector("code")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — silently no-op per design spec.
    }
  }

  return (
    <div className="code-block-wrapper">
      <pre {...props} ref={preRef} />
      <button
        type="button"
        onClick={handleCopy}
        className="code-copy-button"
        aria-label="Copy code to clipboard"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the shared renderer**

Modify `lib/content/markdown.tsx` — add the import and `components` prop:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { CodeBlock } from "@/components/CodeBlock";

const rehypePrettyCodeOptions = {
  theme: "github-dark",
  keepBackground: true,
  defaultLang: "plaintext",
};

export function PostMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypePrettyCode, rehypePrettyCodeOptions]]}
      components={{ pre: CodeBlock }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

- [ ] **Step 3: Add wrapper/button CSS**

Append to `app/globals.css`:

```css
.code-block-wrapper {
  position: relative;
}

.code-copy-button {
  position: absolute;
  top: 0.5em;
  right: 3.5em;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-muted);
  background: var(--color-sidebar);
  border: 1px solid var(--color-rule);
  border-radius: 0.25em;
  padding: 0.15em 0.5em;
  cursor: pointer;
}

.code-copy-button:hover {
  color: var(--color-ink);
}
```

- [ ] **Step 4: Manually verify**

Repeat the temporary code-block edit on `content/posts/hello-world.md`. Run `npm run dev`, open the post, click "Copy", confirm the button label swaps to "Copied" for ~1.5s and reverts, and paste elsewhere (e.g. a text editor) to confirm the clipboard contains the code text without line-number digits or button text mixed in. Revert the file afterward.

- [ ] **Step 5: Commit**

```bash
git add components/CodeBlock.tsx lib/content/markdown.tsx app/globals.css
git commit -m "feat: add copy-to-clipboard button to code blocks"
```

---

### Task 5: Edge case verification and full build check

**Files:** none (verification only; fix forward in this task if any check below fails)

- [ ] **Step 1: Verify the no-language fallback**

Temporarily append a fenced block with no language tag to `content/posts/hello-world.md`:

````
```
plain text, no language tag
```
````

Run `npm run dev`, open the post, confirm the block renders as plain (unhighlighted) text with **no** language badge shown, and the page doesn't error. Revert the file afterward.

- [ ] **Step 2: Run the full verification suite**

Run, in order:
```bash
npm run typecheck
npm run lint
npm run build
```
Expected: all three complete without errors. `npm run build` in particular confirms Shiki's build-time highlighting succeeds across both statically-generated content routes.

- [ ] **Step 3: Commit (only if Step 2 required fixes)**

```bash
git add -A
git commit -m "fix: address issues found in syntax-highlighting build verification"
```
If no fixes were needed, skip this step — there's nothing to commit.
