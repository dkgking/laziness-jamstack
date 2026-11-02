# Deploy to Cloudflare (Workers static assets)

`wrangler.jsonc` serves `dist/client` as static assets. No Worker code runs.

```jsonc
"assets": {
	"directory": "./dist/client",
	"html_handling": "auto-trailing-slash", // /posts → posts.html
	"not_found_handling": "404-page"         // unknown paths → 404.html, status 404
}
```

Cloudflare recommends exactly this pair for statically generated sites.

## From your machine

```bash
bunx wrangler@4.151.3 login
bun run deploy:cloudflare     # bun run build && bunx wrangler@4.151.3 deploy (not a dependency: it is 150 MB)
```

Change `name` in `wrangler.jsonc` first: it is the Worker's name and its `*.workers.dev` subdomain.

## From the Git repository (Workers Builds)

Cloudflare dashboard → Workers & Pages → Create → Import a repository. Build command `bun run build`, deploy command `bunx wrangler@4.151.3 deploy`. Add `VITE_SITE_URL` under the build's variables. Every push to the production branch rebuilds.

## Check locally

```bash
bun run build && bunx wrangler@4.151.3 dev     # serves dist/client like Cloudflare does
```

`/admin` redirects to `/admin/` (a folder index), which the CMS expects.
