import type { SiteSeo } from "./seo";

/** The route that loads content/settings/site.yaml for every page under it. */
const LOCALE_ROUTE = "/{-$locale}";

/**
 * The site's settings from a page's `head({ matches })`: the locale route
 * loaded them. Read by route id, which a `head` cannot type, so the shape
 * is named here once.
 */
export const siteOf = (
	matches: readonly {
		readonly routeId: string;
		readonly loaderData?: unknown;
	}[],
): SiteSeo | undefined =>
	matches.find((match) => match.routeId === LOCALE_ROUTE)?.loaderData as
		| SiteSeo
		| undefined;
