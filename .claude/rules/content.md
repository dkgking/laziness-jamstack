# Content

- Pages read content only through server functions in `src/server/`, called from a route `loader`. Never import `content-collections` in components or routes (it would ship the data to the browser).
- Every server function ends with `.middleware(staticMiddleware)` (`src/server/static.ts`), so its result is saved as JSON at build time.
- Return only the fields a page renders (strip `_meta`, raw `content`).
- A collection is defined twice and both must match: the zod schema in `src/content/<name>.ts` and the collection in `public/admin/config.yml`.
- Files in `src/content/` run in Node at build time: import only framework-free modules, never `#/libs/i18n` or React.
- Keep `rehype-sanitize` on Markdown; the HTML is rendered with `dangerouslySetInnerHTML`. New embeds go in a rehype plugin after it, built from checked values (see `rehype-youtube.ts`).
- Two kinds of draft, kept apart: the CMS's editorial workflow keeps an unpublished entry on a `cms/...` branch, so it is not on `main` and not built; `draft: true` keeps a post that is on `main` out of the built site (it shows only in `bun dev`, marked Draft). Every list of posts, the sitemap included, leaves drafts out.
- Dates: `isoDate()` from `src/content/helpers.ts`, formatted with `formatDate(locale, value)` from `#/libs/intl`. Optional CMS fields arrive as `""`: use `optionalString()`, `optionalUrl()`, `optionalEmail()`.
