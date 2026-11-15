# Routing

- Pages live under `src/routes/{-$locale}/`. Never create routes outside it, except the files a site serves at its root: `sitemap[.]xml.ts`, `robots[.]txt.ts`, `site[.]webmanifest.ts`.
- Read the locale in loaders from `context.locale` (set from the URL in `{-$locale}/route.tsx`), never from cookies or `i18n.locale`.
- Link internal pages with `LocalizedLink` from `#/libs/i18n`, never a bare `Link` or `<a>`. Its `to` is a plain string: check the target route exists.
- Only pages a link reaches are prerendered (`crawlLinks`). Link a new page from the nav or another page, or add it to `pages` in `vite.config.ts`.
- A page's `head` is `meta: seo({ … path: match.pathname })` and `links: [canonicalLink(locale, "/its/route")]` from `#/libs/seo`; its title and description come from its content file (`seo_title ?? title`), and the site's share picture from `siteOf(matches)` (`#/libs/site-match`) when it has none of its own. The site's own tags are set once by `{-$locale}/route.tsx`.
- A visitor may see another address than the route's (`/privacy` for `/page/privacy`): rules in `src/libs/rewrite.ts`, guide in `.claude/skills/localize-urls`. Links (`LocalizedLink`, a nav item's `to` in a content file) name the route, never the public address, which differs per language. `match.pathname` is always the route's; never build a full URL by hand, use `addressIn()` from `#/libs/seo`.
- Unmatched paths and `throw notFound()` render `NotFound`, errors in a loader or a page render `ErrorPage` (`src/components/`, the router's defaults in `src/router.tsx`). A loader throws `notFound()` for a missing item; give a route its own `notFoundComponent` or `errorComponent` only when it needs a different message.
- `src/routeTree.gen.ts` is generated: never edit it, never run `tsr generate`.
