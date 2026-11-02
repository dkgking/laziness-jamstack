# Routing

- Pages live under `src/routes/{-$locale}/`. Never create routes outside it, except `sitemap[.]xml.ts`.
- Read the locale in loaders from `context.locale` (set from the URL in `{-$locale}/route.tsx`), never from cookies or `i18n.locale`.
- Link internal pages with `LocalizedLink` from `#/libs/i18n`, never a bare `Link` or `<a>`. Its `to` is a plain string: check the target route exists.
- Only pages a link reaches are prerendered (`crawlLinks`). Link a new page from the nav or another page, or add it to `pages` in `vite.config.ts`.
- A page's `head` meta comes from `seo()` in `#/libs/seo` (title through `i18n._`, `path: match.pathname`).
- Unmatched paths and `throw notFound()` render `NotFound`, errors in a loader or a page render `ErrorPage` (`src/components/`, the router's defaults in `src/router.tsx`). A loader throws `notFound()` for a missing item; give a route its own `notFoundComponent` or `errorComponent` only when it needs a different message.
- `src/routeTree.gen.ts` is generated: never edit it, never run `tsr generate`.
