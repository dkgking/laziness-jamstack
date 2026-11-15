import { defaultLocale, type Locale, locales } from "./locales";
import { publicPath } from "./rewrite";
import { absoluteUrl, siteUrl } from "./site";

export interface SeoInput {
	readonly title: string;
	readonly description?: string;
	/** Root-absolute ("/uploads/cover.png") or a full URL. */
	readonly image?: string;
	/** What the image shows; the title when left out. */
	readonly imageAlt?: string;
	/** The page's own path (`match.pathname`), for og:url. */
	readonly path?: string;
	readonly type?: "website" | "article";
	/** ISO dates and the writer's name, for articles. */
	readonly publishedTime?: string;
	readonly modifiedTime?: string;
	readonly author?: string;
}

/**
 * A page's `head().meta`: title, description, Open Graph, and Twitter card.
 * Tags without a value are left out. What the whole site shares (its name,
 * its X handle) is `siteMeta`, set once by the locale route.
 */
export const seo = ({
	title,
	description,
	image,
	imageAlt,
	path,
	type = "website",
	publishedTime,
	modifiedTime,
	author,
}: SeoInput) => {
	const imageUrl = image ? absoluteUrl(image) : undefined;
	const url = path ? absoluteUrl(publicPath(path)) : undefined;
	return [
		{ title },
		{ property: "og:type", content: type },
		{ property: "og:title", content: title },
		{ name: "twitter:title", content: title },
		{
			name: "twitter:card",
			content: imageUrl ? "summary_large_image" : "summary",
		},
		...(description
			? [
					{ name: "description", content: description },
					{ property: "og:description", content: description },
					{ name: "twitter:description", content: description },
				]
			: []),
		...(url ? [{ property: "og:url", content: url }] : []),
		...(imageUrl
			? [
					{ property: "og:image", content: imageUrl },
					{ property: "og:image:alt", content: imageAlt ?? title },
					{ name: "twitter:image", content: imageUrl },
				]
			: []),
		...(publishedTime
			? [{ property: "article:published_time", content: publishedTime }]
			: []),
		...(modifiedTime
			? [{ property: "article:modified_time", content: modifiedTime }]
			: []),
		...(author ? [{ property: "article:author", content: author }] : []),
	];
};

/** What the site says about itself (content/settings/site.yaml), as the head needs it. */
export interface SiteSeo {
	readonly name: string;
	readonly description?: string;
	readonly image?: string;
	readonly twitter?: string;
	readonly google_verification?: string;
	readonly theme_color?: string;
	readonly organization: {
		readonly name?: string;
		readonly url?: string;
		readonly logo?: string;
		readonly email?: string;
	};
}

/**
 * The tags every page of the site shares, in `locale`: the site's name, its
 * language and the others it is in, its X handle, Google's verification
 * code, and the browser's theme color. Set by the locale route; a page's
 * own tags (`seo`) come after.
 */
export const siteMeta = (site: SiteSeo, locale: Locale) => [
	{ title: site.name },
	{ property: "og:site_name", content: site.name },
	{ property: "og:locale", content: locale },
	...locales
		.filter(({ code }) => code !== locale)
		.map(({ code }) => ({ property: "og:locale:alternate", content: code })),
	...(site.twitter ? [{ name: "twitter:site", content: site.twitter }] : []),
	...(site.google_verification
		? [
				{
					name: "google-site-verification",
					content: site.google_verification,
				},
			]
		: []),
	...(site.theme_color
		? [{ name: "theme-color", content: site.theme_color }]
		: []),
];

/**
 * Structured data as `head().scripts`. "<" is written as its escape, so
 * words from a content file can never close the script.
 */
export const jsonLd = (...items: readonly (object | undefined)[]) =>
	items
		.filter((item) => item !== undefined)
		.map((item) => ({
			type: "application/ld+json",
			children: JSON.stringify(item).replaceAll("<", "\\u003c"),
		}));

/** Who publishes the site, for search engines; nothing when the site names no organization. */
export const organizationJsonLd = (site: SiteSeo) =>
	site.organization.name
		? {
				"@context": "https://schema.org",
				"@type": "Organization",
				name: site.organization.name,
				url: site.organization.url ?? siteUrl,
				...(site.organization.logo
					? { logo: absoluteUrl(site.organization.logo) }
					: {}),
				...(site.organization.email ? { email: site.organization.email } : {}),
			}
		: undefined;

/** An article (a post) as structured data. */
export const articleJsonLd = (article: {
	readonly title: string;
	readonly description?: string;
	readonly path: string;
	readonly image?: string;
	readonly publishedTime: string;
	readonly author: { readonly name: string; readonly url?: string };
	readonly site: SiteSeo;
}) => ({
	"@context": "https://schema.org",
	"@type": "BlogPosting",
	headline: article.title,
	...(article.description ? { description: article.description } : {}),
	url: absoluteUrl(publicPath(article.path)),
	...(article.image ? { image: absoluteUrl(article.image) } : {}),
	datePublished: article.publishedTime,
	author: {
		"@type": "Person",
		name: article.author.name,
		...(article.author.url ? { url: article.author.url } : {}),
	},
	publisher: {
		"@type": "Organization",
		name: article.site.organization.name ?? article.site.name,
		...(article.site.organization.logo
			? { logo: absoluteUrl(article.site.organization.logo) }
			: {}),
	},
});

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

/** The path of the route `path` in `locale` (the default locale has no prefix), before any rewrite. */
export const pathIn = (locale: Locale, path: string) =>
	locale === defaultLocale ? path : `/${locale}${path === "/" ? "" : path}`;

/** The full public address of the route `path` in `locale`: what a visitor's browser shows. */
export const addressIn = (locale: Locale, path: string) =>
	`${siteUrl}${publicPath(pathIn(locale, path))}`;

/** `<link rel="alternate" hreflang>` for each locale and x-default. */
export const alternateLinks = (pathname: string) => {
	const path = unlocalizedPath(pathname);
	return [
		...locales.map(({ code }) => ({
			rel: "alternate",
			hrefLang: code,
			href: addressIn(code, path),
		})),
		{
			rel: "alternate",
			hrefLang: "x-default",
			href: addressIn(defaultLocale, path),
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
	href: addressIn(locale, path),
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
						`<xhtml:link rel="alternate" hreflang="${other}" href="${escapeXml(addressIn(other, path))}"/>`,
				)
				.join("");
			return `<url><loc>${escapeXml(addressIn(code, path))}</loc>${alternates}</url>`;
		}),
	);
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>\n`;
};
