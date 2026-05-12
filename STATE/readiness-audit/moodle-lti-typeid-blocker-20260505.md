# Moodle LTI typeid blocker — 2026-05-05

## User-reported state

The permanent Supabase Edge Function gateway is live at:

```text
https://ncoqanascubqkxfvucfz.supabase.co/functions/v1/lti-launch
```

The user reported:

- The Supabase project ref is `ncoqanascubqkxfvucfz`.
- `RUNTIME_TARGET_URL` was configured in Supabase Secrets to the current Termux/Cloudflare runtime URL.
- The Moodle Tool URL was updated to the permanent Supabase gateway URL.
- Consumer Key remains `yaniv-lti-tool`.
- Shared Secret was updated on the relevant interface available to the user.
- Moodle saved the changes.

## Current blocker

The remaining blocker is `MISSING_OAUTH_SIGNATURE`.

User reports the Moodle activity appears to be using `typeid=0` / Automatic instead of the preconfigured site tool, so the launch is not using the expected preconfigured tool/secret path.

Likely required fix requires Moodle Site Admin access:

```text
Site administration → Plugins → Activity modules → External tool → Manage tools
```

The configured tool for `yaniv-lti-tool` must have:

- Tool URL: permanent Supabase gateway URL
- Consumer key: `yaniv-lti-tool`
- Shared secret: configured there, matching Supabase secret

If database access is used by an authorized Moodle administrator, the specific activity should be checked to ensure it is linked to the correct preconfigured tool rather than Automatic.

## Security note

No shared secret values are stored in this repo note. The value was exposed in conversation and should be rotated again after the final Moodle-side configuration is confirmed.

## Current truth

- Termux runtime package works.
- Permanent Supabase gateway GET/health works.
- Moodle permanent Tool URL configuration was attempted/saved.
- LTI POST with OAuth signature is not yet verified end-to-end.
- Next required action: Moodle Site Admin must link the activity to the preconfigured tool or configure the site-level tool secret correctly.
