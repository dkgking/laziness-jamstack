import { defaultLocale, type Locale, locales } from "./locales";

// A page's public address may differ from its route: a legal page at
// /privacy is the route /page/privacy, and a section may read in each
// language's own words (/vi/bai-viet for the route /vi/posts). The router
// turns a public address into its route on the way in and a route into its
// public address on the way out, so links, redirects, the sitemap, and
// canonical addresses all show the public one. Adding or changing a rule:
// .claude/skills/localize-urls.

/**
 * One route's public address. `route` and each of `paths` are written
 * without a locale prefix or slashes at either end ("posts", "page/privacy").
 * A language `paths` leaves out keeps the route's own address. With `rest`,
 * what follows the route is kept ("posts/hello" with "bai-viet" reads
 * "bai-viet/hello").
 */
export interface RewriteRule {
	readonly route: string;
	readonly paths: Partial<Record<Locale, string>>;
	readonly rest?: boolean;
}

export const rewriteRules: readonly RewriteRule[] = [
	// Text pages (content/text-pages) are routed at /page/<slug>; these two are shown at the top level.
	{ route: "page/privacy", paths: { en: "privacy" } },
	{ route: "page/terms", paths: { en: "terms" } },
];

const localeCodes: ReadonlySet<string> = new Set(
	locales.map(({ code }) => code),
);

/** A pathname as its locale prefix (kept as written, "" when it has none) and the rest, without slashes at either end. */
const partsOf = (pathname: string) => {
	const segments = pathname.split("/").filter(Boolean);
	const first = segments[0];
	const prefixed = first !== undefined && localeCodes.has(first);
	return {
		locale: (prefixed ? first : defaultLocale) as Locale,
		prefix: prefixed ? `/${first}` : "",
		path: (prefixed ? segments.slice(1) : segments).join("/"),
	};
};

/** The longest side first, so "posts/drafts" is tried before "posts". */
const longestFirst = (
	rules: readonly RewriteRule[],
	side: (rule: RewriteRule) => string,
) =>
	[...rules].sort(
		(a, b) => side(b).split("/").length - side(a).split("/").length,
	);

const swapped = (
	path: string,
	from: string,
	to: string,
	rest: boolean,
): string | null => {
	if (path === from) return to;
	return rest && path.startsWith(`${from}/`)
		? `${to}${path.slice(from.length)}`
		: null;
};

const rewritten = (
	pathname: string,
	rules: readonly RewriteRule[],
	direction: "in" | "out",
): string => {
	const { locale, prefix, path } = partsOf(pathname);
	if (!path) return pathname;
	const publicOf = (rule: RewriteRule) => rule.paths[locale] ?? rule.route;
	const side =
		direction === "in" ? publicOf : (rule: RewriteRule) => rule.route;
	for (const rule of longestFirst(rules, side)) {
		const next =
			direction === "in"
				? swapped(path, publicOf(rule), rule.route, rule.rest === true)
				: swapped(path, rule.route, publicOf(rule), rule.rest === true);
		if (next !== null && next !== path) return `${prefix}/${next}`;
	}
	return pathname;
};

/** The route of a public pathname ("/privacy" is "/page/privacy"). */
export const routePath = (
	pathname: string,
	rules: readonly RewriteRule[] = rewriteRules,
) => rewritten(pathname, rules, "in");

/** The public pathname of a route ("/page/privacy" is "/privacy"). */
export const publicPath = (
	pathname: string,
	rules: readonly RewriteRule[] = rewriteRules,
) => rewritten(pathname, rules, "out");

/** The router's `rewrite` option: public addresses in, routes inside, public addresses out. */
export const urlRewrite = {
	input: ({ url }: { url: URL }) => {
		url.pathname = routePath(url.pathname);
		return url;
	},
	output: ({ url }: { url: URL }) => {
		url.pathname = publicPath(url.pathname);
		return url;
	},
};
