---
name: deploy
description: >
  Publish this static site to Cloudflare, Vercel, Netlify or GitHub Pages: the
  config each host reads (already in the repo), the site address for hreflang
  and the sitemap, CMS sign-in on a static host, CI, and post-deploy checks.
  Use when asked to deploy, host, publish, go live, set up CI/CD, or move to
  another host.
---

# Deploy

The site is **static**: `bun run build` prerenders every page to `dist/client` (HTML, assets, and the server functions' results as JSON under `__tsr/`). No server code runs after the build, so any static host works, and content changes need a rebuild (every host below rebuilds on push).

Pages are flat files (`posts.html`, `vi/posts.html`), which every host below serves at `/posts` with no redirect; `404.html` is served for unknown paths with a 404 status.

| Host | Config in the repo | Guide |
|---|---|---|
| **Cloudflare** (Workers static assets) | `wrangler.jsonc` | [cloudflare.md](cloudflare.md) |
| **Vercel** | `vercel.json` | [vercel.md](vercel.md) |
| **Netlify** | `netlify.toml` | [netlify.md](netlify.md) |
| **GitHub Pages** | a workflow to add | [github-pages.md](github-pages.md) |

The configs coexist: deploying to one host never needs another's file removed.

## Always

1. Run `bun run verify` before deploying.
2. Set **`VITE_SITE_URL`** (the site's public address, e.g. `https://blog.example.com`) in the host's build environment, or edit the fallback in `src/libs/site.ts`. hreflang links and `sitemap.xml` use it.
3. CMS: set `backend.repo` in `public/admin/config.yml` to the real `owner/repo`. Editors sign in with a GitHub token by default; for an OAuth button see the `sveltia-cms` skill (an external proxy, since a static host runs no `/api/auth`).
4. After deploying, check `/`, `/posts`, `/posts/hello-world`, a missing path (404 page, status 404), `/sitemap.xml`, and `/admin/`.

## In Web Studio

Studio previews the built `dist/client` (`.laziness/preview.json`). Its Publish to Vercel sends the source and Vercel builds it with `vercel.json`; Publish to Netlify sends the built folder; Publish to GitHub pushes the source, from which Cloudflare (Workers Builds), Netlify, Vercel, or GitHub Pages can build.
