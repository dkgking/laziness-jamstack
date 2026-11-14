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
- The preview is the built site: `.laziness/preview.json` runs `bun install`, `bun run build`, and serves `dist/client` once you end. While you work, Studio may also run its `live` dev server on `$PORT` (on plans with room for it), so the page follows your edits as you save them; the built site is still what the user gets at the end.
- Keep `bun run build` working: a page that fails to prerender fails the build (`failOnError`).
- The sandbox's memory is small and shared by everything running in it: you, the build, and any server. Run one heavy command at a time (install, typecheck, test, build, verify), never in the background or side by side.
- Never start another dev server (`bun dev`, `vite dev`) or `bun run preview`, and never wait for one: Studio runs the live one and builds and shows the site itself. If you started one, stop it before you run `verify` or `build`.
- Never open a browser (Playwright, Chromium) or serve `dist/client` yourself to look at the site: Studio opens it when you end, takes its screenshots, and tells you what failed on the page.
- `/workspace/.cache` holds the package managers' caches: never format, lint, search, or delete it.

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
  pages/<page>.yaml           # each page's words (home.yaml, posts.yaml); pages/<locale>/<page>.yaml with several languages
  settings/site.yaml          # what every page shares: the site's name and what it tells search engines, navigation, footer
  authors/<slug>.yaml
  posts/<slug>.md             # posts/<locale>/<slug>.md once there are several languages
  text-pages/<slug>.md        # a title and a text (privacy, terms), at /page/<slug>; same layout as posts
content-collections.ts        # registers collections
src/
  content/                    # collection schemas (zod) + transforms; run at build time, outside Vite
    pages.ts                  # one schema per page file and for settings/site.yaml
    rehype-youtube.ts         # the CMS's YouTube shortcode → embed
    rehype-headings.ts        # ids for a text's headings, and their list (a post's table of contents)
    reading-time.ts           # minutes to read a text, by its script
  server/                     # server functions over the collections (run at build time, saved as JSON)
    pages.ts                  # getSite, getHomePage, getPostsPage: a page's words in its locale
    static.ts                 # the middleware every server function ends with
  routes/
    __root.tsx                # html shell, head
    {-$locale}/               # every page (optional locale prefix)
    sitemap[.]xml.ts          # prerendered sitemap.xml; robots[.]txt.ts and site[.]webmanifest.ts beside it
  layouts/AppLayout.tsx       # header, nav, language switcher (shown with 2+ locales), footer
  components/                 # NotFound and ErrorPage (the router's defaults), PostList
  libs/
    locales.ts                # the locale list
    i18n.ts                   # Lingui + router (LocalizedLink, useLocale, ...)
    seo.ts, site.ts           # seo() for each page's head, siteMeta() for the site's, structured data, hreflang, sitemap; the site's address
    rewrite.ts                # public addresses that differ from routes (/privacy for /page/privacy)
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
- **The site's words live in content files, never in TSX**: a page's in `content/pages/<page>.yaml`, shared ones in `content/settings/site.yaml`. A new page or section means its YAML, its schema in `src/content/pages.ts`, and its entry in `public/admin/config.yml`.
- A collection is defined twice, and both must match: its zod schema in `src/content/<name>.ts` and its entry in `public/admin/config.yml` (`bun run validate:cms` compares their fields).
- Nothing runs on a server after the build: no API routes, form handlers, cookies, auth, or secrets (everything in the build is public).
- Only the interface's own words (404, errors, small labels) go through `i18n._()`; text written straight into JSX fails `bun run check`. Dates and numbers through `#/libs/intl`.
- A page's `head` is `seo()` plus `canonicalLink()`; what the whole site says (name, description, share picture, X handle) is content in `content/settings/site.yaml`, never a constant. Search fields on an entry are plain fields beside its others (`seo_title`, `seo_description`, `og_image`), never an object or a list: Web Studio's Edit form writes plain fields only, and a collection with any other kind of field can no longer get a new entry from it.
- A public address that differs from its route is a rule in `src/libs/rewrite.ts`, never a moved file or a redirect.
- `src/routeTree.gen.ts` is generated: never edit it.

## Languages

The site is English only. When the user asks for other languages (e.g. "make the site English and Vietnamese"), follow `.claude/skills/add-locale/SKILL.md` and translate every catalog, page file, and post. Otherwise keep one locale and write UI text in English through Lingui as usual.

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
| Translate or shorten a page's or a section's address | `.claude/skills/localize-urls/SKILL.md` |
| UI text and translations (house rules) | `.claude/skills/i18n-lingui/SKILL.md` |
| Content Collections reference and pitfalls | `.claude/skills/content-collections/SKILL.md` |
| Sveltia CMS: fields, sign-in, editor components | `.claude/skills/sveltia-cms/SKILL.md` |
| Client-side global state (Zustand) | `.claude/skills/zustand-store/SKILL.md` |
| Deploy (Cloudflare, Vercel, Netlify, GitHub Pages) | `.claude/skills/deploy/SKILL.md` |
