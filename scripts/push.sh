#!/usr/bin/env bash
# Push the current branch to GitHub.
# Works in a Claude Code web session once GitHub auth is connected, either:
#   1) via /web-setup or the Claude GitHub App (no token needed in-container), or
#   2) by setting a GH_TOKEN env var (fine-grained PAT, Contents: read/write).
set -euo pipefail
branch="$(git rev-parse --abbrev-ref HEAD)"
remote_url="$(git remote get-url origin)"

if [ -n "${GH_TOKEN:-}" ]; then
  # Use the token without persisting it into tracked files.
  host_path="${remote_url#https://github.com/}"
  auth_url="https://x-access-token:${GH_TOKEN}@github.com/${host_path}"
  git push "$auth_url" "$branch":"$branch"
else
  git push -u origin "$branch"
fi
