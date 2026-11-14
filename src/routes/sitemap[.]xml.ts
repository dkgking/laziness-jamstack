import { createFileRoute } from "@tanstack/react-router";
import { allPosts, allTextPages } from "content-collections";
import { type Locale, locales } from "#/libs/locales";
import { type SitemapEntry, sitemapXml } from "#/libs/seo";

// Prerendered to sitemap.xml at build time (vite.config.ts `pages`).
export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: () => {
				const allLocales = locales.map(({ code }) => code);
				// A post is listed only in the locales it is written in.
				const postLocales = new Map<string, Locale[]>();
				for (const post of allPosts) {
					if (post.draft) continue;
					postLocales.set(post.slug, [
						...(postLocales.get(post.slug) ?? []),
						post.locale,
					]);
				}
				const pageLocales = new Map<string, Locale[]>();
				for (const page of allTextPages) {
					pageLocales.set(page.slug, [
						...(pageLocales.get(page.slug) ?? []),
						page.locale,
					]);
				}
				// Routes: sitemapXml writes each one's public address (src/libs/rewrite.ts).
				const entries: SitemapEntry[] = [
					{ path: "/", locales: allLocales },
					{ path: "/posts", locales: allLocales },
					...[...postLocales].map(([slug, written]) => ({
						path: `/posts/${slug}`,
						locales: written,
					})),
					...[...pageLocales].map(([slug, written]) => ({
						path: `/page/${slug}`,
						locales: written,
					})),
				];
				return new Response(sitemapXml(entries), {
					headers: { "content-type": "application/xml; charset=utf-8" },
				});
			},
		},
	},
});
