import { defineCollection } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";
import rehypeSanitize from "rehype-sanitize";
import { z } from "zod";
import { isoDate, optionalString, parseLocalePath, seoFields } from "./helpers";
import { rehypeHeadings } from "./rehype-headings";

// Pages that are a title and a text: privacy, terms, an about page.
// content/text-pages/<slug>.md while the site is English only, and
// content/text-pages/<locale>/<slug>.md with more languages (the same slug
// in each locale folder is one page), as posts are. Each is routed at
// /page/<slug>; src/libs/rewrite.ts may show it at another address.
export const textPages = defineCollection({
	name: "textPages",
	directory: "content/text-pages",
	include: "**/*.md",
	parser: "frontmatter",
	schema: z.object({
		title: z.string(),
		summary: optionalString(),
		updated: isoDate(),
		...seoFields,
		content: z.string(),
	}),
	transform: async (doc, context) => {
		const parsed = parseLocalePath(doc._meta.path);
		if (!parsed) {
			throw new Error(
				`Text page "${doc._meta.filePath}" must be content/text-pages/<slug>.md, or content/text-pages/<locale>/<slug>.md with a locale from src/libs/locales.ts`,
			);
		}
		const html = await compileMarkdown(context, doc, {
			rehypePlugins: [rehypeSanitize, rehypeHeadings],
		});
		const { content: _content, ...rest } = doc;
		return { ...rest, ...parsed, html };
	},
});
