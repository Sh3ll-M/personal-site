#!/bin/sh
echo "[unshallow] git version: $(git --version)"
echo "[unshallow] remotes:"
git remote -v
echo "[unshallow] is-shallow-repository: $(git rev-parse --is-shallow-repository)"
echo "[unshallow] running: git fetch --unshallow"
git fetch --unshallow
echo "[unshallow] fetch exit code: $?"
echo "[unshallow] is-shallow-repository after: $(git rev-parse --is-shallow-repository)"
echo "[unshallow] git log for hello-world.md: $(git log -1 --oneline -- content/posts/hello-world.md)"
