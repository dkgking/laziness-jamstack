import { useLingui } from "@lingui/react";
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "#/layouts/AppLayout";
import { LocalizedLink } from "#/libs/i18n";
import { formatDate } from "#/libs/intl";
import { articleJsonLd, canonicalLink, jsonLd, pathIn, seo } from "#/libs/seo";
import { siteOf } from "#/libs/site-match";
import { getPost } from "#/server/posts";

/** A post lists its sections only when it has at least this many. */
const MIN_HEADINGS_FOR_CONTENTS = 2;

export const Route = createFileRoute("/{-$locale}/posts/$slug")({
	loader: ({ context, params }) =>
		getPost({ data: { locale: context.locale, slug: params.slug } }),
	head: ({ loaderData, match, matches }) => {
		if (!loaderData) return {};
		const site = siteOf(matches);
		const title = loaderData.seo_title ?? loaderData.title;
		const description = loaderData.seo_description ?? loaderData.summary;
		const image = loaderData.og_image ?? loaderData.cover ?? site?.image;
		// A post not yet translated shows the default-locale text: the address
		// search engines keep is that version's, never the copy's.
		const path = `/posts/${loaderData.slug}`;
		return {
			meta: seo({
				title,
				description,
				image,
				path: match.pathname,
				type: "article",
				publishedTime: loaderData.date,
				author: loaderData.author.name,
			}),
			links: [canonicalLink(loaderData.locale, path)],
			scripts: site
				? jsonLd(
						articleJsonLd({
							title,
							description,
							path: pathIn(loaderData.locale, path),
							image,
							publishedTime: loaderData.date,
							author: loaderData.author,
							site,
						}),
					)
				: [],
		};
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
					{"← "}
					{i18n._("All posts")}
				</LocalizedLink>

				<h1 className="mt-4 text-4xl font-bold">{post.title}</h1>
				<p className="mt-2 text-sm text-slate-500">
					{formatDate(i18n.locale, post.date)}
					{" · "}
					{post.author.name}
					{" · "}
					{i18n._("{minutes, plural, one {# min read} other {# min read}}", {
						minutes: post.readingMinutes,
					})}
				</p>

				{post.cover && (
					<img src={post.cover} alt="" className="mt-6 w-full rounded-lg" />
				)}

				{post.headings.length >= MIN_HEADINGS_FOR_CONTENTS && (
					<nav
						aria-label={i18n._("On this page")}
						className="mt-6 rounded-lg border border-slate-200 p-4 text-sm"
					>
						<p className="font-semibold">{i18n._("On this page")}</p>
						<ul className="mt-2 flex flex-col gap-1">
							{post.headings.map((heading) => (
								<li
									key={heading.id}
									className={heading.depth > 2 ? "pl-4" : undefined}
								>
									<a
										href={`#${heading.id}`}
										className="text-slate-600 hover:text-slate-900"
									>
										{heading.text}
									</a>
								</li>
							))}
						</ul>
					</nav>
				)}

				{/* HTML is compiled from Markdown at build time; content comes from repo editors. */}
				<div
					className="post-content mt-8"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, build-time Markdown
					dangerouslySetInnerHTML={{ __html: post.html }}
				/>

				{(post.older || post.newer) && (
					<nav
						aria-label={i18n._("More posts")}
						className="mt-12 flex flex-wrap justify-between gap-4 border-t border-slate-200 pt-6 text-sm"
					>
						{post.older ? (
							<LocalizedLink
								to={`/posts/${post.older.slug}`}
								className="text-slate-600 hover:text-slate-900"
							>
								{"← "}
								{post.older.title}
							</LocalizedLink>
						) : (
							<span />
						)}
						{post.newer && (
							<LocalizedLink
								to={`/posts/${post.newer.slug}`}
								className="text-slate-600 hover:text-slate-900"
							>
								{post.newer.title}
								{" →"}
							</LocalizedLink>
						)}
					</nav>
				)}
			</article>
		</AppLayout>
	);
}
