import { createServerFn } from "@tanstack/react-start";
import { allHomePages, allPostsPages, allSites } from "content-collections";
import { z } from "zod";
import type { Locale } from "#/libs/locales";
import { inLocale, localeSchema } from "./locale";
import { staticMiddleware } from "./static";

// The words of each page and of the shared frame, from content/pages and
// content/settings. A page asks for its own file in its loader.

/** One page file in `locale`, without what only the build reads; a missing file fails the build with its name. */
const pageIn = <T extends { locale: Locale; _meta: unknown }>(
	documents: readonly T[],
	locale: Locale,
	file: string,
) => {
	const found = inLocale(documents, locale);
	if (!found) throw new Error(`${file} is missing`);
	const { _meta, locale: _locale, ...fields } = found;
	return fields;
};

const input = z.object({ locale: localeSchema });

export const getSite = createServerFn({ method: "GET" })
	.middleware(staticMiddleware)
	.validator(input)
	.handler(({ data }) =>
		pageIn(allSites, data.locale, "content/settings/site.yaml"),
	);

export const getHomePage = createServerFn({ method: "GET" })
	.middleware(staticMiddleware)
	.validator(input)
	.handler(({ data }) =>
		pageIn(allHomePages, data.locale, "content/pages/home.yaml"),
	);

export const getPostsPage = createServerFn({ method: "GET" })
	.middleware(staticMiddleware)
	.validator(input)
	.handler(({ data }) =>
		pageIn(allPostsPages, data.locale, "content/pages/posts.yaml"),
	);
