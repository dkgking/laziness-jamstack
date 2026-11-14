import { createFileRoute } from "@tanstack/react-router";
import { PostList } from "#/components/PostList";
import { AppLayout } from "#/layouts/AppLayout";
import { seo } from "#/libs/seo";
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
	head: ({ match, loaderData }) => ({
		meta: seo({
			title: loaderData?.page.title ?? "",
			description: loaderData?.page.intro,
			path: match.pathname,
		}),
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
