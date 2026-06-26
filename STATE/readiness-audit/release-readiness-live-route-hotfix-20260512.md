# Release Readiness Live Route Hotfix — 2026-05-12

Added `/api/release/readiness` directly to the Render deployment branch.

Purpose:
- Render deploys from `gemini/ai-studio-sync-20260428-193953`
- live `/api/release/readiness` returned SPA HTML
- this hotfix adds a real JSON API route before the SPA fallback

Teacher release remains blocked.
