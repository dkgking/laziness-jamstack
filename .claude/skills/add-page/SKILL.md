---
name: add-page
description: Add a new localized page/route to this TanStack Start app (under src/routes/{-$locale}/), with an optional loader, translated UI strings and a nav link. Use when asked to create a page, screen, route or section such as /about or /contact.
---

# Add a page

Every page lives under `src/routes/{-$locale}/` so it works at `/about` and, once more languages are added, `/vi/about`, ...

## 1. Create the route file

File path → URL: `src/routes/{-$locale}/about.tsx` → `/about`, `src/routes/{-$locale}/docs/$slug.tsx` → `/docs/:slug`, `src/routes/{-$locale}/docs/index.tsx` → `/docs`.

```tsx
import { useLingui } from "@lingui/react";
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "#/layouts/AppLayout";

export const Route = createFileRoute("/{-$locale}/about")({
	component: AboutPage,
});

function AboutPage() {
	const { i18n } = useLingui();
	return (
		<AppLayout>
			<div className="w-full">
				<h1 className="text-4xl font-bold">
					{i18n._("About us")}
				</h1>
			</div>
		</AppLayout>
	);
}
```

The string passed to `createFileRoute` must match the file path. The Vite plugin regenerates `src/routeTree.gen.ts` when `bun dev` or `bun run build` runs; never edit that file.

## 2. Data (optional)

Load data in a `loader` through a server function. Take the locale from `context.locale`:

```tsx
import { listPosts } from "#/server/posts";

export const Route = createFileRoute("/{-$locale}/news")({
	loader: ({ context }) => listPosts({ data: { locale: context.locale } }),
	component: NewsPage,
});

function NewsPage() {
	const posts = Route.useLoaderData();
	// ...
}
```

For content-backed pages, write the server function first (see the `add-collection` skill). Throw `notFound()` from the server function when an item does not exist. The root `notFoundComponent` then renders with HTTP 404.

## 3. Head / SEO (optional)

```tsx
head: ({ match }) => ({
	meta: seo({
		title: match.context.i18n._("About us"),
		description: match.context.i18n._("Who we are and what we do."),
		path: match.pathname,
	}),
}),
```

`seo()` from `#/libs/seo` makes the title, description, Open Graph, and Twitter card tags, and leaves out any without a value. A page with its own picture passes `image` (a root-absolute path or a full URL); an article passes `type: "article"` and `publishedTime`. Set the site's name in `src/libs/site.ts`. Never write the `og:*` or `twitter:*` tags by hand.

## 4. Nav link (optional)

Add an entry to `navItems` in `src/layouts/AppLayout.tsx`. Labels are module-level `msg` descriptors, and `LocalizedLink` adds the locale prefix automatically:

```tsx
const navItems = [
	{ to: "/", label: msg({ id: "Home" }) },
	{ to: "/posts", label: msg({ id: "Posts" }) },
	{ to: "/about", label: msg({ id: "About" }) },
] satisfies { to: string; label: MessageDescriptor }[];
```

`to` is typed as plain `string`, so check that the route exists.

## 5. Translate and verify

1. Follow the `i18n-lingui` skill: every visible string goes through `i18n._("...")`. Run `bun run i18n:extract`, then fill the new keys in every `src/locales/<locale>.json` except `en.json`.
2. `bun run verify`
3. Optional: `bun dev`, then open `/<path>` (and `/<locale>/<path>` if the site has other languages). A page no link reaches is not prerendered: link it from the nav or a page, or add it to `pages` in `vite.config.ts`.
