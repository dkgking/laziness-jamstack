# Deploy to GitHub Pages

The build is already static (`dist/client`). Pages needs only a workflow.

**Prefer a user/org page (`<user>.github.io`) or a custom domain**, where the site is served at `/`. A project page (`<user>.github.io/<repo>/`) needs the base-path fixes below.

## Workflow

`.github/workflows/pages.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build
        env:
          VITE_SITE_URL: https://<user>.github.io
      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist/client
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Repository → Settings → Pages → Source: **GitHub Actions**. Pages serves `posts.html` at `/posts` and `404.html` for unknown paths.

## Project page under `/<repo>/` (only if not served at `/`)

1. `vite.config.ts`: `base: process.env.BASE_PATH || "/"`, and set `BASE_PATH: /<repo>/` in the build step. TanStack Start takes the router basepath from it.
2. Root-absolute content paths (`/uploads/...` in `cover`, `avatar`, and post HTML) need the base prefixed in the server functions (`src/server/posts.ts`, `src/server/authors.ts`): `base + path.slice(1)` for paths starting with a single `/`.
3. The static-functions package fetches `/__tsr/...` from the domain root (upstream bug). In `src/client.tsx`, before `hydrateRoot`:
   ```ts
   const base = import.meta.env.BASE_URL.replace(/\/$/, "");
   if (base) {
   	const fetch = window.fetch.bind(window);
   	window.fetch = (input, init) =>
   		fetch(
   			typeof input === "string" && input.startsWith("/__tsr/") ? base + input : input,
   			init,
   		);
   }
   ```
4. The language switcher reads `window.location.pathname`: in `src/layouts/AppLayout.tsx`, pass the router's pathname as `switchLocale(locale, pathname)` (`useLocation`).
5. Prefix `/app-icon.svg` in `src/routes/__root.tsx`, `public/admin/index.html`, and `logo.src` in `public/admin/config.yml`, and the `cms-config-url` link in `public/admin/index.html`.

Test: `BASE_PATH=/my-repo/ bun run build`, then serve `dist/client` under `/my-repo/`.

## Caveats

- Static server functions are **experimental** (`@tanstack/start-static-server-functions`, pinned to the `@tanstack/start-client-core` the installed Start uses). Re-test after upgrading `@tanstack/*`.
- An unknown post slug (`/posts/missing`) shows the error view, not the 404 page: every page must exist at build time.
