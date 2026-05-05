# Termux runtime package — 2026-05-05

## Implemented

Created a GitHub Actions based runtime package flow.

## Purpose

Termux must not build the React/Vite app because previous attempts failed with signal 9.

Instead:

1. GitHub Actions builds the React frontend.
2. GitHub Actions packages `dist/`, `src/server.js`, and production package metadata.
3. GitHub Actions publishes the package to branch `termux-runtime`.
4. Termux downloads the prebuilt package and only runs Node plus Cloudflare Tunnel.

## Truth rules

- No secrets in GitHub.
- No fake students, grades, tasks, logs, or practice time.
- LTI bridge must be verified through real Moodle launch.
- Supabase persistence remains separate and not verified until configured and tested.

## Status

Ready for GitHub Actions build after push.
