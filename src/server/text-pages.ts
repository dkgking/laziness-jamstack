import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { allTextPages } from "content-collections";
import { z } from "zod";
import { defaultLocale } from "#/libs/locales";
import { localeSchema } from "./locale";
import { staticMiddleware } from "./static";

/** A text page by its slug, in `locale` when it is written in it, else the default locale's. */
export const getTextPage = createServerFn({ method: "GET" })
	.middleware(staticMiddleware)
	.validator(z.object({ locale: localeSchema, slug: z.string() }))
	.handler(({ data }) => {
		const versions = allTextPages.filter((page) => page.slug === data.slug);
		const page =
			versions.find((version) => version.locale === data.locale) ??
			versions.find((version) => version.locale === defaultLocale);
		if (!page) {
			throw notFound();
		}
		const { _meta, ...rest } = page;
		return rest;
	});
