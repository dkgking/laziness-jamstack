import { useLingui } from "@lingui/react";
import { createFileRoute } from "@tanstack/react-router";
import { PostList } from "#/components/PostList";
import { AppLayout } from "#/layouts/AppLayout";
import { seo } from "#/libs/seo";
import { listPosts } from "#/server/posts";

export const Route = createFileRoute("/{-$locale}/posts/")({
	loader: ({ context }) => listPosts({ data: { locale: context.locale } }),
	head: ({ match }) => ({
		meta: seo({
			title: match.context.i18n._("Posts"),
			path: match.pathname,
		}),
	}),
	component: PostsPage,
});

function PostsPage() {
	const posts = Route.useLoaderData();
	const { i18n } = useLingui();

	return (
		<AppLayout>
			<div className="w-full">
				<h1 className="mb-8 text-4xl font-bold">{i18n._("Posts")}</h1>
				<PostList posts={posts} />
			</div>
		</AppLayout>
	);
}
