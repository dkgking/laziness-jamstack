import { useLingui } from "@lingui/react";
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "#/layouts/AppLayout";
import { LocalizedLink } from "#/libs/i18n";
import { formatDate } from "#/libs/intl";
import { canonicalLink, seo } from "#/libs/seo";
import { getPost } from "#/server/posts";

export const Route = createFileRoute("/{-$locale}/posts/$slug")({
	loader: ({ context, params }) =>
		getPost({ data: { locale: context.locale, slug: params.slug } }),
	head: ({ loaderData, match }) => {
		if (!loaderData) return {};
		const meta = seo({
			title: loaderData.title,
			description: loaderData.summary,
			image: loaderData.cover,
			path: match.pathname,
			type: "article",
			publishedTime: loaderData.date,
		});
		// A post not yet translated shows the default-locale text: point search
		// engines at that page instead of indexing the copy.
		const links =
			loaderData.locale === match.context.locale
				? []
				: [canonicalLink(loaderData.locale, `/posts/${loaderData.slug}`)];
		return { meta, links };
	},
	component: PostPage,
});

function PostPage() {
	const post = Route.useLoaderData();
	const { i18n } = useLingui();

	return (
		<AppLayout>
			<article className="w-full" lang={post.locale}>
				<LocalizedLink
					to="/posts"
					className="text-sm text-slate-500 hover:text-slate-700"
				>
					← {i18n._("All posts")}
				</LocalizedLink>

				<h1 className="mt-4 text-4xl font-bold">{post.title}</h1>
				<p className="mt-2 text-sm text-slate-500">
					{formatDate(i18n.locale, post.date)} · {post.author.name}
				</p>

				{post.cover && (
					<img src={post.cover} alt="" className="mt-6 w-full rounded-lg" />
				)}

				{/* HTML is compiled from Markdown at build time; content comes from repo editors. */}
				<div
					className="post-content mt-8"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, build-time Markdown
					dangerouslySetInnerHTML={{ __html: post.html }}
				/>
			</article>
		</AppLayout>
	);
}
