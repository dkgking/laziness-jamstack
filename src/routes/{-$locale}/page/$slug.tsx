import { useLingui } from "@lingui/react";
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "#/layouts/AppLayout";
import { formatDate } from "#/libs/intl";
import { canonicalLink, seo } from "#/libs/seo";
import { siteOf } from "#/libs/site-match";
import { getTextPage } from "#/server/text-pages";

// A text page (content/text-pages/<slug>.md): privacy, terms, and the like.
// Its public address may be shorter than its route: src/libs/rewrite.ts.
export const Route = createFileRoute("/{-$locale}/page/$slug")({
	loader: ({ context, params }) =>
		getTextPage({ data: { locale: context.locale, slug: params.slug } }),
	head: ({ loaderData, match, matches }) => {
		if (!loaderData) return {};
		return {
			meta: seo({
				title: loaderData.seo_title ?? loaderData.title,
				description: loaderData.seo_description ?? loaderData.summary,
				image: siteOf(matches)?.image,
				path: match.pathname,
			}),
			// A page not yet translated shows the default-locale text: that version's address is kept.
			links: [canonicalLink(loaderData.locale, `/page/${loaderData.slug}`)],
		};
	},
	component: TextPage,
});

function TextPage() {
	const page = Route.useLoaderData();
	const { i18n } = useLingui();

	return (
		<AppLayout>
			<article className="w-full" lang={page.locale}>
				<h1 className="text-4xl font-bold">{page.title}</h1>
				<p className="mt-2 text-sm text-slate-500">
					{i18n._("Updated {date}", {
						date: formatDate(i18n.locale, page.updated),
					})}
				</p>
				{/* HTML is compiled from Markdown at build time; content comes from repo editors. */}
				<div
					className="post-content mt-8"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, build-time Markdown
					dangerouslySetInnerHTML={{ __html: page.html }}
				/>
			</article>
		</AppLayout>
	);
}
