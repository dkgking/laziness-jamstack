# Content

## The site's words live in content files

- Every word and picture a visitor reads as the site's content comes from a content file, never from TSX: a page's own words in `content/pages/<page>.yaml` (CMS → Pages), what every page shares (navigation, footer) in `content/settings/site.yaml` (CMS → Settings), and lists of things (posts, authors, projects) in their collections. The site's owner changes all of it in the CMS, and Web Studio's Edit tool writes these same files.
- Lingui (`i18n._()`) keeps only the interface's own words: the 404 and error pages, form messages, labels such as "Back to home" and "Language". When in doubt, it is content.
- A page's section is an object (`hero: { title, text }`) or a list of objects (`features: [{ title, body }]`), so each card on the page is one list item an editor changes on its own. Keep one field per piece of text; never join two fields into one string, and never split one sentence over several fields.
- A new page or section is written in three places that must match: the YAML file, its schema in `src/content/pages.ts` (registered in `content-collections.ts`), and its `files` entry in `public/admin/config.yml`. `bun run validate:cms` fails when the schema and the CMS name different fields.
- `.laziness/cms.json` tells Web Studio where the CMS config is (`config`, and `url`, the address the site serves it at) and which folders hold content (`content`). Keep it in step when a collection's folder or the CMS's `media_folder` moves: Studio's Edit tool writes only inside those folders.
- Text written straight into JSX in `src/routes`, `src/components`, or `src/layouts` fails `bun run check` (Biome's `noJsxLiterals`). Do not get round it with `{"text"}`: put the words in the page's file.

## Reading content

- Pages read content only through server functions in `src/server/`, called from a route `loader`. Never import `content-collections` in components or routes (it would ship the data to the browser).
- Every server function ends with `.middleware(staticMiddleware)` (`src/server/static.ts`), so its result is saved as JSON at build time.
- Return only the fields a page renders (strip `_meta`, raw `content`).
- A collection is defined twice and both must match: the zod schema in `src/content/<name>.ts` and the collection in `public/admin/config.yml`.
- Files in `src/content/` run in Node at build time: import only framework-free modules, never `#/libs/i18n` or React.
- Keep `rehype-sanitize` on Markdown; the HTML is rendered with `dangerouslySetInnerHTML`. New embeds go in a rehype plugin after it, built from checked values (see `rehype-youtube.ts`).
- Two kinds of draft, kept apart: the CMS's editorial workflow keeps an unpublished entry on a `cms/...` branch, so it is not on `main` and not built; `draft: true` keeps a post that is on `main` out of the built site (it shows only in `bun dev`, marked Draft). Every list of posts, the sitemap included, leaves drafts out.
- Dates: `isoDate()` from `src/content/helpers.ts`, formatted with `formatDate(locale, value)` from `#/libs/intl`. Optional CMS fields arrive as `""`: use `optionalString()`, `optionalUrl()`, `optionalEmail()`.
