import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { defaultLocale, ensureLocale, isValidLocale } from "#/libs/i18n";
import { alternateLinks } from "#/libs/seo";
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
	// What every page shares (the navigation), read by AppLayout.
	loader: ({ context }) => getSite({ data: { locale: context.locale } }),
	head: ({ matches }) => ({
		links: alternateLinks(matches[matches.length - 1]?.pathname ?? "/"),
	}),
	component: Outlet,
});
