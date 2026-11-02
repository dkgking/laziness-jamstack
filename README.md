# Jamstack blog

A static, multilingual-ready content site: **TanStack Start** prerendered to HTML, Markdown posts with **Content Collections**, **Sveltia CMS** at `/admin`, **Lingui** for UI text, **Tailwind CSS v4**, **Biome**, **bun**.

## Start

```bash
bun install
bun dev            # http://localhost:3000
bun run build      # static site in dist/client
```

## Content

- Posts: `content/posts/<slug>.md` (front matter: `title`, `summary`, `date`, `author`, `cover`, `draft`).
- Authors: `content/authors/<slug>.yaml`.
- A paragraph holding only `{{< youtube id="…" >}}` becomes a video embed.
- Edit in the CMS at `/admin/` (set `backend.repo` in `public/admin/config.yml`; sign in with a GitHub token), or edit the files.

## Languages

English only to start. To add one (e.g. Vietnamese at `/vi/...`), follow `.claude/skills/add-locale/SKILL.md`.

## Deploy

Any static host. Configs for Cloudflare (`wrangler.jsonc`), Vercel (`vercel.json`) and Netlify (`netlify.toml`) are included; GitHub Pages needs a workflow. Set `VITE_SITE_URL` to the site's address. Details: `.claude/skills/deploy/`.

## Coding agents

`AGENTS.md` (read through `CLAUDE.md`), rules in `.claude/rules/`, task guides in `.claude/skills/`.

## License

MIT
