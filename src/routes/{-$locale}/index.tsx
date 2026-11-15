import { useLingui } from "@lingui/react";
import { createFileRoute } from "@tanstack/react-router";
import { PostList } from "#/components/PostList";
import { AppLayout } from "#/layouts/AppLayout";
import { LocalizedLink } from "#/libs/i18n";
import { canonicalLink, seo } from "#/libs/seo";
import { siteOf } from "#/libs/site-match";
import { listAuthors } from "#/server/authors";
import { getHomePage } from "#/server/pages";
import { listPosts } from "#/server/posts";

const LATEST_POSTS = 3;

export const Route = createFileRoute("/{-$locale}/")({
	loader: async ({ context }) => {
		const [page, posts, authors] = await Promise.all([
			getHomePage({ data: { locale: context.locale } }),
			listPosts({ data: { locale: context.locale } }),
			listAuthors(),
		]);
		// Featured posts first, each group newest first.
		const latest = [
			...posts.filter((post) => post.featured),
			...posts.filter((post) => !post.featured),
		].slice(0, LATEST_POSTS);
		return { page, latest, authors };
	},
	head: ({ match, matches, loaderData }) => {
		const site = siteOf(matches);
		return {
			meta: seo({
				title: loaderData?.page.seo_title ?? loaderData?.page.hero.title ?? "",
				description:
					loaderData?.page.seo_description ??
					loaderData?.page.hero.text ??
					site?.description,
				image: site?.image,
				path: match.pathname,
			}),
			links: [canonicalLink(match.context.locale, "/")],
		};
	},
	component: Home,
});

function Home() {
	const { page, latest, authors } = Route.useLoaderData();

	return (
		<AppLayout>
			<div className="w-full">
				<section className="py-12">
					<h1 className="text-5xl font-bold tracking-tight">
						{page.hero.title}
					</h1>
					{page.hero.text && (
						<p className="mt-4 max-w-2xl text-lg text-slate-600">
							{page.hero.text}
						</p>
					)}
				</section>

				<section>
					<div className="mb-6 flex items-baseline justify-between gap-4">
						<h2 className="text-2xl font-bold">{page.latest.title}</h2>
						<LocalizedLink
							to="/posts"
							className="text-sm text-slate-500 hover:text-slate-700"
						>
							{page.latest.link}
							{" →"}
						</LocalizedLink>
					</div>
					<PostList posts={latest} />
				</section>

				{authors.length > 0 && (
					<section className="mt-12">
						<h2 className="mb-6 text-2xl font-bold">{page.authors.title}</h2>
						<ul className="grid gap-4 sm:grid-cols-2">
							{authors.map((author) => (
								<li
									key={author.slug}
									className="flex gap-4 rounded-lg border border-slate-200 p-4"
								>
									{author.avatar && (
										<img
											src={author.avatar}
											alt={author.name}
											className="h-14 w-14 shrink-0 rounded-full object-cover"
										/>
									)}
									<div>
										<h3 className="font-semibold">{author.name}</h3>
										{author.bio && (
											<p className="mt-1 text-sm text-slate-600">
												{author.bio}
											</p>
										)}
										<AuthorLinks author={author} />
									</div>
								</li>
							))}
						</ul>
					</section>
				)}
			</div>
		</AppLayout>
	);
}

function AuthorLinks({
	author,
}: {
	author: Awaited<ReturnType<typeof listAuthors>>[number];
}) {
	const { i18n } = useLingui();
	const links = [
		author.email && { href: `mailto:${author.email}`, label: i18n._("Email") },
		author.github && { href: author.github, label: "GitHub" },
		author.twitter && { href: author.twitter, label: "Twitter" },
		author.website && { href: author.website, label: i18n._("Website") },
	].filter((link) => !!link);

	if (links.length === 0) return null;

	return (
		<div className="mt-2 flex gap-3 text-sm text-blue-600">
			{links.map((link) => (
				<a
					key={link.href}
					href={link.href}
					target={link.href.startsWith("mailto:") ? undefined : "_blank"}
					rel="noreferrer"
					className="hover:underline"
				>
					{link.label}
				</a>
			))}
		</div>
	);
}
