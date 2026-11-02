import { defaultLocale, type Locale, locales } from "./locales";
import { absoluteUrl, siteName, siteUrl } from "./site";

export interface SeoInput {
	readonly title: string;
	readonly description?: string;
	/** Root-absolute ("/uploads/cover.png") or a full URL. */
	readonly image?: string;
	/** The page's own path (`match.pathname`), for og:url. */
	readonly path?: string;
	readonly type?: "website" | "article";
	/** ISO date, for articles. */
	readonly publishedTime?: string;
}

/**
 * A page's `head().meta`: title, description, Open Graph, and Twitter card.
 * Tags without a value are left out; X reads og:* when twitter:* is missing.
 */
export const seo = ({
	title,
	description,
	image,
	path,
	type = "website",
	publishedTime,
}: SeoInput) => {
	const imageUrl = image ? absoluteUrl(image) : undefined;
	const url = path ? absoluteUrl(path) : undefined;
	return [
		{ title },
		{ property: "og:site_name", content: siteName },
		{ property: "og:type", content: type },
		{ property: "og:title", content: title },
		{
			name: "twitter:card",
			content: imageUrl ? "summary_large_image" : "summary",
		},
		...(description
			? [
					{ name: "description", content: description },
					{ property: "og:description", content: description },
				]
			: []),
		...(url ? [{ property: "og:url", content: url }] : []),
		...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
		...(publishedTime
			? [{ property: "article:published_time", content: publishedTime }]
			: []),
	];
};

/** A path without its locale prefix or a trailing slash ("/vi/posts/" → "/posts"). */
export const unlocalizedPath = (rawPathname: string) => {
	const pathname =
		rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;
	for (const { code } of locales) {
		if (pathname === `/${code}`) return "/";
		if (pathname.startsWith(`/${code}/`))
			return pathname.slice(code.length + 1);
	}
	return pathname;
};

/** The path of `path` in `locale` (the default locale has no prefix). */
export const pathIn = (locale: Locale, path: string) =>
	locale === defaultLocale ? path : `/${locale}${path === "/" ? "" : path}`;

/** `<link rel="alternate" hreflang>` for each locale and x-default. */
export const alternateLinks = (pathname: string) => {
	const path = unlocalizedPath(pathname);
	return [
		...locales.map(({ code }) => ({
			rel: "alternate",
			hrefLang: code,
			href: `${siteUrl}${pathIn(code, path)}`,
		})),
		{
			rel: "alternate",
			hrefLang: "x-default",
			href: `${siteUrl}${pathIn(defaultLocale, path)}`,
		},
	];
};

const escapeXml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");

/** `<link rel="canonical">` to `path` in `locale`. */
export const canonicalLink = (locale: Locale, path: string) => ({
	rel: "canonical",
	href: `${siteUrl}${pathIn(locale, path)}`,
});

export interface SitemapEntry {
	/** Unlocalized, e.g. "/posts/hello-world". */
	readonly path: string;
	/** The locales the page is written in; a fallback to another locale is left out. */
	readonly locales: readonly Locale[];
}

/** A sitemap of each entry in each of its locales, with the others as alternates. */
export const sitemapXml = (entries: readonly SitemapEntry[]) => {
	const urls = entries.flatMap(({ path, locales: written }) =>
		written.map((code) => {
			const alternates = written
				.map(
					(other) =>
						`<xhtml:link rel="alternate" hreflang="${other}" href="${escapeXml(`${siteUrl}${pathIn(other, path)}`)}"/>`,
				)
				.join("");
			return `<url><loc>${escapeXml(`${siteUrl}${pathIn(code, path)}`)}</loc>${alternates}</url>`;
		}),
	);
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>\n`;
};
