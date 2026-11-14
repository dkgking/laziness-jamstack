---
name: localize-urls
description: Give a page or a section another public address than its route, per language (e.g. /vi/bai-viet for /vi/posts, /privacy for /page/privacy, /lien-he for /vi/contact), with src/libs/rewrite.ts. Use when asked to translate URLs or slugs of sections, shorten a page's address, or move a text page to the top level.
---

# Public addresses that differ from routes

A route's file decides its address (`src/routes/{-$locale}/posts/` is `/posts`, `/vi/posts`). `src/libs/rewrite.ts` lets the address a visitor sees be another one, per language, without moving any file:

| Route | Rule | Public address |
|---|---|---|
| `/page/privacy` | `{ route: "page/privacy", paths: { en: "privacy" } }` | `/privacy` |
| `/vi/posts`, `/vi/posts/hello` | `{ route: "posts", paths: { vi: "bai-viet" }, rest: true }` | `/vi/bai-viet`, `/vi/bai-viet/hello` |
| `/vi/contact` | `{ route: "contact", paths: { vi: "lien-he" } }` | `/vi/lien-he` |

The router applies the rules both ways (`rewrite` in `src/router.tsx`): a public address finds its route, and every link, redirect, canonical address, hreflang link, and sitemap entry shows the public one. Nothing else changes: routes, loaders, and content files keep their names.

## Add or change a rule

Edit `rewriteRules` in `src/libs/rewrite.ts`:

```ts
export const rewriteRules: readonly RewriteRule[] = [
	{ route: "page/privacy", paths: { en: "privacy", vi: "chinh-sach-rieng-tu" } },
	{ route: "posts", paths: { vi: "bai-viet" }, rest: true },
];
```

- `route` and each path are written without a locale prefix and without a slash at either end.
- `paths` lists only the languages whose address differs; a language left out keeps the route's own address.
- `rest: true` keeps what follows the route (a section with pages under it). Without it only that exact route is renamed.
- Use lowercase ASCII words joined by dashes (`bai-viet`, not `bài-viết`): they survive copying and sharing.
- A public address must not be another route's address (do not name a section `page` or `posts` in one language while another route has that name), and two rules must not give the same address in one language.

## What stays the same

- **A post's or a text page's own slug** is its file name, the same in every language (`content/posts/<locale>/<slug>.md`): the CMS, the fallback to the default language, and Web Studio's Edit tool pair translations by it. Only the section before it can be renamed (`posts` to `bai-viet`). Do not give one entry a different slug per language.
- **Links name the route, never a public address**: `LocalizedLink to="/page/privacy"`, and the same in content files (a nav or footer item's `to`). The route is the same in every language; a public address belongs to one language, so `/privacy` written in a content file would be a dead link on the Vietnamese site once that page is `/vi/chinh-sach`.
- **Switching language** goes through the page's route (`routePath(window.location.pathname)` in `AppLayout`'s language switcher): keep that when changing the switcher, or `/vi/bai-viet` would switch to `/bai-viet`.
- **`match.pathname`** in a route is the route's path; `seo()`, `canonicalLink()`, `alternateLinks()`, and `sitemapXml()` turn it into the public address themselves. Never build an absolute URL by hand: use `addressIn(locale, path)` from `#/libs/seo`.

## Verify

```bash
bun test src/libs/rewrite.test.ts
bun run verify
```

The build log lists the prerendered pages by their public address (`/privacy`, `/vi/bai-viet`): each renamed page must be there, and its old address must not. `dist/client/sitemap.xml` and each page's `<link rel="canonical">` show the public address.
