# Moodle CSS asset 502 — 2026-05-03

## Evidence

After opening Moodle Teacher Hub from the real Moodle external tool, the app frame loaded, but the UI appeared without normal styling.

Chrome DevTools showed:

```text
GET https://nasty-rabbits-wait.loca.lt/assets/index-Ba-IsUbH.css 502 Bad Gateway
```

## Meaning

The Moodle iframe and public app route are now loading, but one static Vite asset is failing through the temporary Localtunnel URL. This points first to tunnel/static asset reliability, not to a new product feature problem.

## Current truth

```text
Moodle iframe loads: yes
Basic app HTML loads: yes
CSS through public tunnel: failed with 502
Premium styled dashboard: not verified yet
LTI connected session: not verified yet
Production-ready: no
```

## Next check

Compare local and public CSS asset responses:

```text
http://127.0.0.1:3000/assets/index-Ba-IsUbH.css
https://nasty-rabbits-wait.loca.lt/assets/index-Ba-IsUbH.css
```

If local works and public fails, the tunnel is the problem. If local fails, the server is serving a mismatched or missing build.
