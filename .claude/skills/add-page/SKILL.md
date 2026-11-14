---
name: add-page
description: Add a new localized page/route to this TanStack Start app (under src/routes/{-$locale}/), with its words in a content file the CMS edits, a loader, and a nav link. Use when asked to create a page, screen, route or section such as /about or /contact.
---

# Add a page

Every page lives under `src/routes/{-$locale}/` so it works at `/about` and, once more languages are added, `/vi/about`, ...

A page's words are **content**: they live in `content/pages/<page>.yaml`, so the site's owner edits them in the CMS (Pages) and Web Studio's Edit tool can change them. Never write them in the TSX (`.claude/rules/content.md`). The example below adds `/about`.

## 1. The page's words: `content/pages/about.yaml`

One field per piece of text; a repeated block is a list of objects.

```yaml
title: About us
intro: Who we are and what we do.
values:
  - title: Responsible sourcing
    body: Approved farms and fisheries, documented at lot level.
  - title: Quality commitment
    body: Measured specifications and a named owner for every batch.
```

## 2. Its schema: `src/content/pages.ts`

Add a collection for the file (copy `postsPage`), and register it in `content-collections.ts`.

```ts
export const aboutPage = defineCollection({
	name: "aboutPage",
	directory: "content/pages",
	include: "**/about.yaml",
	parser: "yaml",
	schema: z.object({
		title: z.string(),
		intro: optionalString(),
		values: z.array(z.object({ title: z.string(), body: z.string() })),
	}),
	transform: (doc) => ({ ...doc, locale: localeOf(doc) }),
});
```

## 3. Its CMS entry: `public/admin/config.yml`

Add the file under the `pages` collection's `files`, with the same fields (a list of objects is the `list` widget with `fields`):

```yaml
      - name: "about"
        label: "About"
        file: "content/pages/about.yaml"
        fields:
          - { label: "Title", name: "title", widget: "string" }
          - { label: "Intro", name: "intro", widget: "text", required: false }
          - label: "Values"
            name: "values"
            widget: "list"
            summary: "{{title}}"
            fields:
              - { label: "Title", name: "title", widget: "string" }
              - { label: "Body", name: "body", widget: "text" }
```

`bun run validate:cms` fails when these fields and the schema's differ.

## 4. Its server function: `src/server/pages.ts`

```ts
export const getAboutPage = createServerFn({ method: "GET" })
	.middleware(staticMiddleware)
	.validator(input)
	.handler(({ data }) =>
		pageIn(allAboutPages, data.locale, "content/pages/about.yaml"),
	);
```

The generated list is named after the collection: `aboutPage` → `allAboutPages` (run `bun run typecheck` once to generate it).

## 5. The route file

File path → URL: `src/routes/{-$locale}/about.tsx` → `/about`, `src/routes/{-$locale}/docs/$slug.tsx` → `/docs/:slug`, `src/routes/{-$locale}/docs/index.tsx` → `/docs`.

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "#/layouts/AppLayout";
import { seo } from "#/libs/seo";
import { getAboutPage } from "#/server/pages";

export const Route = createFileRoute("/{-$locale}/about")({
	loader: ({ context }) => getAboutPage({ data: { locale: context.locale } }),
	head: ({ match, loaderData }) => ({
		meta: seo({
			title: loaderData?.title ?? "",
			description: loaderData?.intro,
			path: match.pathname,
		}),
	}),
	component: AboutPage,
});

function AboutPage() {
	const page = Route.useLoaderData();
	return (
		<AppLayout>
			<div className="w-full">
				<h1 className="text-4xl font-bold">{page.title}</h1>
				{page.intro && <p className="mt-3 text-slate-600">{page.intro}</p>}
				<ul className="mt-8 grid gap-4 sm:grid-cols-2">
					{page.values.map((value) => (
						<li key={value.title} className="rounded-lg border border-slate-200 p-4">
							<h2 className="font-semibold">{value.title}</h2>
							<p className="mt-1 text-slate-600">{value.body}</p>
						</li>
					))}
				</ul>
			</div>
		</AppLayout>
	);
}
```

The string passed to `createFileRoute` must match the file path. The Vite plugin regenerates `src/routeTree.gen.ts` when `bun dev` or `bun run build` runs; never edit that file.

A page that lists a collection (posts, projects) loads it beside its own words, as `src/routes/{-$locale}/posts/index.tsx` does (see the `add-collection` skill). Throw `notFound()` from a server function when an item does not exist; the root `notFoundComponent` then renders with HTTP 404.

`seo()` from `#/libs/seo` makes the title, description, Open Graph, and Twitter card tags, and leaves out any without a value. A page with its own picture passes `image` (a root-absolute path or a full URL); an article passes `type: "article"` and `publishedTime`. Set the site's name in `src/libs/site.ts`. Never write the `og:*` or `twitter:*` tags by hand.

## 6. Nav link (optional)

The navigation is content too: add the link to `nav` in `content/settings/site.yaml` (`LocalizedLink` adds the locale prefix):

```yaml
nav:
  - label: Home
    to: /
  - label: About
    to: /about
```

Check that the route exists: `to` is a plain string.

## 7. Languages and verify

1. With more than one language, the page's file exists once per language: `content/pages/<locale>/about.yaml` (see the `add-locale` skill). Translate the words; keep the keys.
2. Interface words the page adds (a form's messages, a button that is not copy) go through `i18n._("...")`: follow the `i18n-lingui` skill, run `bun run i18n:extract`, and fill every catalog.
3. `bun run verify`
4. Check (`verify` built the site) that `dist/client/<path>.html` (and `dist/client/<locale>/<path>.html` if the site has other languages) was written. A page no link reaches is not prerendered: link it from the nav or a page, or add it to `pages` in `vite.config.ts`.
