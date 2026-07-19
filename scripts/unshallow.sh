#!/bin/sh
# Vercel's GitHub integration clones with a shallow history and no
# configured git remote, so getGitMetaForFile's `git log` can silently
# resolve the wrong commit for older content files. Un-shallowing
# against the repo's own public URL (no remote needed) fixes this.
if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
  git fetch --unshallow https://github.com/Sh3ll-M/personal-site.git
fi
