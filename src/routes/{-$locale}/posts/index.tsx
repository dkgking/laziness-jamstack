import { createFileRoute } from "@tanstack/react-router";
import { PostList } from "#/components/PostList";
import { AppLayout } from "#/layouts/AppLayout";
import { canonicalLink, seo } from "#/libs/seo";
import { siteOf } from "#/libs/site-match";
import { getPostsPage } from "#/server/pages";
import { listPosts } from "#/server/posts";

export const Route = createFileRoute("/{-$locale}/posts/")({
	loader: async ({ context }) => {
		const [page, posts] = await Promise.all([
			getPostsPage({ data: { locale: context.locale } }),
			listPosts({ data: { locale: context.locale } }),
		]);
		return { page, posts };
	},
	head: ({ match, matches, loaderData }) => ({
		meta: seo({
			title: loaderData?.page.seo_title ?? loaderData?.page.title ?? "",
			description: loaderData?.page.seo_description ?? loaderData?.page.intro,
			image: siteOf(matches)?.image,
			path: match.pathname,
		}),
		links: [canonicalLink(match.context.locale, "/posts")],
	}),
	component: PostsPage,
});

function PostsPage() {
	const { page, posts } = Route.useLoaderData();

	return (
		<AppLayout>
			<div className="w-full">
				<h1 className="text-4xl font-bold">{page.title}</h1>
				{page.intro && <p className="mt-3 text-slate-600">{page.intro}</p>}
				<div className="mt-8">
					<PostList posts={posts} />
				</div>
			</div>
		</AppLayout>
	);
}
