import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { allPosts } from "content-collections";
import { z } from "zod";
import { defaultLocale, type Locale } from "#/libs/locales";
import { localeSchema } from "./locale";
import { staticMiddleware } from "./static";

// Content stays on the server: pages receive only what they render, so the
// collections do not grow the client bundle.

type Post = (typeof allPosts)[number];

const visiblePosts = () =>
	allPosts.filter((post) => import.meta.env.DEV || !post.draft);

// Prefer the requested locale, fall back to the default-locale version.
const pickTranslation = (posts: Post[], slug: string, locale: Locale) =>
	posts.find((post) => post.slug === slug && post.locale === locale) ??
	posts.find((post) => post.slug === slug && post.locale === defaultLocale);

/** What a list shows of a post. */
const summaryOf = ({
	slug,
	locale,
	title,
	summary,
	date,
	cover,
	draft,
	featured,
	readingMinutes,
	author,
}: Post) => ({
	slug,
	locale,
	title,
	summary,
	date,
	cover,
	draft,
	featured,
	readingMinutes,
	author,
});

/** Every visible post as `locale` reads it (its own version, else the default locale's), newest first. */
const postsIn = (locale: Locale) => {
	const posts = visiblePosts();
	const slugs = [...new Set(posts.map((post) => post.slug))];
	return slugs
		.map((slug) => pickTranslation(posts, slug, locale))
		.filter((post): post is Post => post !== undefined)
		.sort((a, b) => b.date.localeCompare(a.date));
};

export const listPosts = createServerFn({ method: "GET" })
	.middleware(staticMiddleware)
	.validator(z.object({ locale: localeSchema }))
	.handler(({ data }) => postsIn(data.locale).map(summaryOf));

/** A neighbour's link: its slug and title. */
const linkOf = (post: Post | undefined) =>
	post ? { slug: post.slug, title: post.title } : null;

export const getPost = createServerFn({ method: "GET" })
	.middleware(staticMiddleware)
	.validator(z.object({ locale: localeSchema, slug: z.string() }))
	.handler(({ data }) => {
		const posts = postsIn(data.locale);
		const at = posts.findIndex((post) => post.slug === data.slug);
		const post = posts[at];
		if (!post) {
			throw notFound();
		}

		const { _meta, ...rest } = post;
		// Newest first: the one after it in the list was written before it.
		return {
			...rest,
			newer: linkOf(posts[at - 1]),
			older: linkOf(posts[at + 1]),
		};
	});

export type PostSummary = Awaited<ReturnType<typeof listPosts>>[number];
