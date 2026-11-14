import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { defaultLocale, ensureLocale, isValidLocale } from "#/libs/i18n";
import {
	alternateLinks,
	jsonLd,
	organizationJsonLd,
	siteMeta,
} from "#/libs/seo";
import { getSite } from "#/server/pages";

export const Route = createFileRoute("/{-$locale}")({
	// The URL is the source of truth for the locale: children read
	// `context.locale`, and i18n follows the URL on back/forward too.
	beforeLoad: async ({ params, context }) => {
		const locale = params.locale ?? defaultLocale;
		if (!isValidLocale(locale)) {
			throw notFound();
		}
		await ensureLocale(context.i18n, locale);
		return { locale };
	},
	// What every page shares (the site's name, navigation, and footer), read by AppLayout.
	loader: ({ context }) => getSite({ data: { locale: context.locale } }),
	// What every page shares in its head: the site's own tags (a page's come
	// after and win), the same page in the other languages, and who publishes it.
	head: ({ matches, match, loaderData }) => ({
		meta: loaderData ? siteMeta(loaderData, match.context.locale) : [],
		links: alternateLinks(matches[matches.length - 1]?.pathname ?? "/"),
		scripts: loaderData ? jsonLd(organizationJsonLd(loaderData)) : [],
	}),
	component: Outlet,
});
