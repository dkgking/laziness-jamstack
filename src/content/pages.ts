import { defineCollection } from "@content-collections/core";
import { z } from "zod";
import { optionalString, parseLocalePath } from "./helpers";

// A page's words live in one YAML file, edited in the CMS under Pages:
// content/pages/<page>.yaml while the site is English only, and
// content/pages/<locale>/<page>.yaml once it has more languages (the same
// layout as posts). What every page shares is content/settings/site.yaml.
// Each file is its own collection, since each page has its own fields; its
// fields here must match its entry in public/admin/config.yml
// (`bun run validate:cms` holds them together).

/** The locale a page file is written in, from its path; throws for a path that is not `<page>` or `<locale>/<page>`. */
const localeOf = (doc: { _meta: { path: string; filePath: string } }) => {
	const parsed = parseLocalePath(doc._meta.path);
	if (!parsed) {
		throw new Error(
			`"${doc._meta.filePath}" must be <name>.yaml, or <locale>/<name>.yaml with a locale from src/libs/locales.ts`,
		);
	}
	return parsed.locale;
};

export const site = defineCollection({
	name: "site",
	directory: "content/settings",
	include: "**/site.yaml",
	parser: "yaml",
	schema: z.object({
		nav: z.array(z.object({ label: z.string(), to: z.string() })),
	}),
	transform: (doc) => ({ ...doc, locale: localeOf(doc) }),
});

export const homePage = defineCollection({
	name: "homePage",
	directory: "content/pages",
	include: "**/home.yaml",
	parser: "yaml",
	schema: z.object({
		hero: z.object({ title: z.string(), text: optionalString() }),
		latest: z.object({ title: z.string(), link: z.string() }),
		authors: z.object({ title: z.string() }),
	}),
	transform: (doc) => ({ ...doc, locale: localeOf(doc) }),
});

export const postsPage = defineCollection({
	name: "postsPage",
	directory: "content/pages",
	include: "**/posts.yaml",
	parser: "yaml",
	schema: z.object({
		title: z.string(),
		intro: optionalString(),
	}),
	transform: (doc) => ({ ...doc, locale: localeOf(doc) }),
});
