---
title: "Personal Site"
date: "2026-07-19"
tags: ["nextjs", "typescript"]
excerpt: "The site you're on: how it's built, and the workflow that takes it from local to live."
repoUrl: "https://github.com/Sh3ll-M/personal-site"
---

The site you're reading right now. The whole thing is built around one idea: a
personal site that reads like **git**. Every post and project is a "commit" with
a real hash and diffstat pulled from this repo's own history.

## The stack

- **[Next.js](https://nextjs.org/)** (App Router) and **TypeScript** for the site itself
- **Tailwind CSS** for styling, with a small set of dark mode design tokens
- Content is plain **Markdown**. Each post, project and gang is just a file,
  validated at build time so a broken one fails loudly instead of shipping
- No database, no CMS, no admin panel

## How it actually gets made

I write it locally in **VS Code**, pairing with **Claude** right there in the
editor. We sketch out features, write the components and fix things as we go.
Claude does a lot of the heavy lifting; I steer, review and decide what ships.

The loop is deliberately boring, which is the whole point:

1. Build and preview locally (`npm run dev`)
2. Commit the change
3. Push it

```bash
git push origin master
```

That's the entire "publish" step.

## From push to live

- A push to `master` kicks off **Vercel**, which builds the site and deploys it
  automatically
- **Cloudflare** sits in front, handling the **sh3ll.co.uk** domain (and routing
  my contact email)

So there's no deploy button and no server to babysit. Publishing really is just
`git push`, and a minute or so later it's live.
