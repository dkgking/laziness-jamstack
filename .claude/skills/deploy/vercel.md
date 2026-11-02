# Deploy to Vercel

`vercel.json` makes Vercel build the site and serve `dist/client`:

```json
{
	"framework": null,
	"buildCommand": "bun run build",
	"outputDirectory": "dist/client",
	"cleanUrls": true,
	"trailingSlash": false
}
```

- `"framework": null` is required: Vercel would otherwise detect TanStack Start and build it as a server app.
- `cleanUrls` serves `posts.html` at `/posts` (and redirects `/posts.html` to `/posts`).
- `trailingSlash: false` redirects `/posts/` to `/posts`; the CMS is then at `/admin`, which finds its config through the absolute `cms-config-url` link in `public/admin/index.html`.
- Unknown paths get `404.html` with a 404 status.

## Deploy

Import the repository in Vercel (or `bunx vercel`). Nothing to fill in: `vercel.json` holds the settings. Add `VITE_SITE_URL` under Settings → Environment Variables. Vercel installs with bun because of `bun.lock`.

Preview deployments get their own URLs; `VITE_SITE_URL` should stay the production address.
