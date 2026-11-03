# AGENTS.md

Guide for coding agents working in this repository. Read it, and `.claude/rules/`, before changing code.

## What this is

A **static** content site (blog, portfolio, marketing pages):

- **TanStack Start** (React 19, file-based routing, React Compiler), **prerendered to HTML** at build time into `dist/client`. No server code runs after the build.
- **Content Collections** turns `content/` (Markdown, YAML) into typed data at build time.
- **Sveltia CMS** at `/admin` edits `content/` through GitHub.
- **Lingui** for UI text, with the locale in the URL (`@sourceking/tanstack-lingui`). The site is **English only** until the user asks for other languages.
- **Tailwind CSS v4**, **Biome**, **bun**.

## The example is not the site

The Hello World post, the Jane Doe author, and the demo home page text only show the patterns. **In the first round that builds the user's site, remove them** with `.claude/skills/remove-example/SKILL.md`: keep the blog code and drop the samples when the user wants a blog, or remove the blog entirely (posts, authors, `/posts`, their CMS collections) when the site has none. Never hand back a site that still has template pages, posts, links or text.

## Working in Web Studio

- Work in `/workspace`, on this one project. Never start a second project beside it, and never start the app over.
- Never commit, push, or change git history: Studio records each round itself.
- The preview is the built site: `.laziness/preview.json` runs `bun install`, `bun run build`, and serves `dist/client`. A change shows once it builds.
- Keep `bun run build` working: a page that fails to prerender fails the build (`failOnError`).
- The sandbox's memory is small and shared by everything running in it: you, the build, and any server. Run one heavy command at a time (install, typecheck, test, build, verify), never in the background or side by side.
- Do not start `bun dev` or `bun run preview`: Studio builds and shows the site itself. If you started one, stop it before you run `verify` or `build`.

## Commands

| Task | Command |
|---|---|
| Dev server (port 3000; not in Web Studio) | `bun dev` |
| Type check (also generates content types) | `bun run typecheck` |
| Lint + format check | `bun run check` (`bun run check:fix` to fix) |
| Extract UI strings into catalogs | `bun run i18n:extract` |
| Fail if any translation is missing | `bun run i18n:check` |
| Validate the CMS config | `bun run validate:cms` |
| Unit tests | `bun test` |
| Production build (static, `dist/client`) | `bun run build` |

| Every check above, the tests, then the build | `bun run verify` |

**Before you say a change is done**, run `bun run verify` once, at the end (not after every file), and fix what it reports.

## Layout

```
content/                      # CMS-managed data
  authors/<slug>.yaml
  posts/<slug>.md             # posts/<locale>/<slug>.md once there are several languages
content-collections.ts        # registers collections
src/
  content/                    # collection schemas (zod) + transforms; run at build time, outside Vite
    rehype-youtube.ts         # the CMS's YouTube shortcode → embed
  server/                     # server functions over the collections (run at build time, saved as JSON)
    static.ts                 # the middleware every server function ends with
  routes/
    __root.tsx                # html shell, head
    {-$locale}/               # every page (optional locale prefix)
    sitemap[.]xml.ts          # prerendered sitemap.xml
  layouts/AppLayout.tsx       # header, nav, language switcher (shown with 2+ locales)
  components/                 # NotFound and ErrorPage (the router's defaults), PostList
  libs/
    locales.ts                # the locale list
    i18n.ts                   # Lingui + router (LocalizedLink, useLocale, ...)
    seo.ts, site.ts           # seo() for each page's head, hreflang, sitemap; site name and address
    intl.ts                   # number/date formatting
  locales/<locale>.json       # Lingui catalogs (en.json is the source)
public/admin/                 # Sveltia CMS (index.html + config.yml)
public/uploads/               # media uploaded from the CMS
.laziness/                    # Web Studio: preview and template settings
wrangler.jsonc, vercel.json, netlify.toml   # static hosting on Cloudflare, Vercel, Netlify
```

## Must-follow rules

Short rule files in `.claude/rules/`: `routing.md`, `content.md`, `i18n.md`, `static.md`, `style.md`. In short:

- Pages under `src/routes/{-$locale}/`, linked with `LocalizedLink`; a new page must be reached by a link (or listed in `pages` in `vite.config.ts`) to be prerendered.
- Pages read content only through server functions in `src/server/` that end with `.middleware(staticMiddleware)`; never import `content-collections` in a component or route.
- A collection is defined twice, and both must match: its zod schema in `src/content/<name>.ts` and its entry in `public/admin/config.yml`.
- Nothing runs on a server after the build: no API routes, form handlers, cookies, auth, or secrets (everything in the build is public).
- Every visible string through `i18n._()`; dates and numbers through `#/libs/intl`.
- `src/routeTree.gen.ts` is generated: never edit it.

## Languages

The site is English only. When the user asks for other languages (e.g. "make the site English and Vietnamese"), follow `.claude/skills/add-locale/SKILL.md` and translate every catalog and post. Otherwise keep one locale and write UI text in English through Lingui as usual.

## CMS

When the user publishes the project to GitHub, set `backend.repo` in `public/admin/config.yml` to that `owner/repo` (and `branch`). Editors sign in with a GitHub token; an OAuth button needs an external proxy (`.claude/skills/sveltia-cms/SKILL.md`).

## Task guides

Step-by-step guides in `.claude/skills/` (also at `.agents/skills/`, the same folder; read the one that fits before starting):

| Task | Guide |
|---|---|
| Remove the sample content, or the whole blog (first round) | `.claude/skills/remove-example/SKILL.md` |
| Add a page / route | `.claude/skills/add-page/SKILL.md` |
| Add a content collection (CMS + schema + server fn) | `.claude/skills/add-collection/SKILL.md` |
| Add or remove a language | `.claude/skills/add-locale/SKILL.md` |
| UI text and translations (house rules) | `.claude/skills/i18n-lingui/SKILL.md` |
| Content Collections reference and pitfalls | `.claude/skills/content-collections/SKILL.md` |
| Sveltia CMS: fields, sign-in, editor components | `.claude/skills/sveltia-cms/SKILL.md` |
| Client-side global state (Zustand) | `.claude/skills/zustand-store/SKILL.md` |
| Deploy (Cloudflare, Vercel, Netlify, GitHub Pages) | `.claude/skills/deploy/SKILL.md` |
