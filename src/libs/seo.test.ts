import { describe, expect, test } from "bun:test";
import {
	articleJsonLd,
	jsonLd,
	organizationJsonLd,
	pathIn,
	seo,
	siteMeta,
	sitemapXml,
	unlocalizedPath,
} from "./seo";

describe("seo paths", () => {
	test("drops a trailing slash but keeps the root", () => {
		expect(unlocalizedPath("/posts/")).toBe("/posts");
		expect(unlocalizedPath("/")).toBe("/");
	});

	test("puts the default locale at the root", () => {
		expect(pathIn("en", "/posts")).toBe("/posts");
		expect(pathIn("en", "/")).toBe("/");
	});

	test("lists a page only in the locales it is written in", () => {
		const xml = sitemapXml([
			{ path: "/posts/hello", locales: ["en"] },
			{ path: "/posts/none", locales: [] },
		]);
		expect(xml).toContain("/posts/hello</loc>");
		expect(xml).not.toContain("/posts/none");
	});
});

describe("seo", () => {
	test("leaves out tags without a value", () => {
		const tags = seo({ title: "Posts" });
		expect(tags).toContainEqual({ title: "Posts" });
		expect(tags).toContainEqual({ name: "twitter:card", content: "summary" });
		expect(
			tags.some((tag) => "name" in tag && tag.name === "description"),
		).toBe(false);
	});

	test("makes the image and page address absolute", () => {
		const tags = seo({
			title: "Hello",
			image: "/uploads/cover.png",
			path: "/posts/hello",
			type: "article",
		});
		expect(tags).toContainEqual({
			property: "og:image",
			content: "https://example.com/uploads/cover.png",
		});
		expect(tags).toContainEqual({
			property: "og:url",
			content: "https://example.com/posts/hello",
		});
		expect(tags).toContainEqual({
			name: "twitter:card",
			content: "summary_large_image",
		});
	});

	test("an article says when it was written and by whom", () => {
		const tags = seo({
			title: "Hello",
			type: "article",
			publishedTime: "2026-10-22T00:00:00.000Z",
			author: "Jane Doe",
		});
		expect(tags).toContainEqual({
			property: "article:author",
			content: "Jane Doe",
		});
		expect(tags).toContainEqual({ name: "twitter:title", content: "Hello" });
	});
});

describe("the site's own tags", () => {
	const site = { name: "Coast", organization: {} };

	test("only what the site says about itself is written", () => {
		const tags = siteMeta(site, "en");
		expect(tags).toContainEqual({ title: "Coast" });
		expect(tags).toContainEqual({ property: "og:site_name", content: "Coast" });
		expect(tags).toContainEqual({ property: "og:locale", content: "en" });
		expect(
			tags.some((tag) => "name" in tag && tag.name === "twitter:site"),
		).toBe(false);
		expect(
			siteMeta({ ...site, twitter: "@coast", theme_color: "#0f172a" }, "en"),
		).toContainEqual({ name: "twitter:site", content: "@coast" });
	});

	test("an organization is structured data only when the site names one", () => {
		expect(organizationJsonLd(site)).toBeUndefined();
		expect(jsonLd(organizationJsonLd(site))).toEqual([]);
		expect(
			organizationJsonLd({
				...site,
				organization: { name: "Coast Ltd", logo: "/uploads/logo.png" },
			}),
		).toMatchObject({
			"@type": "Organization",
			name: "Coast Ltd",
			logo: "https://example.com/uploads/logo.png",
		});
	});

	test("structured data cannot close its own script", () => {
		const [script] = jsonLd({ headline: "</script><script>alert(1)" });
		expect(script?.children).not.toContain("<");
		expect(JSON.parse(script?.children ?? "{}").headline).toBe(
			"</script><script>alert(1)",
		);
	});

	test("an article names its public address and its publisher", () => {
		expect(
			articleJsonLd({
				title: "Hello",
				path: "/posts/hello",
				publishedTime: "2026-10-22T00:00:00.000Z",
				author: { name: "Jane Doe" },
				site,
			}),
		).toMatchObject({
			"@type": "BlogPosting",
			url: "https://example.com/posts/hello",
			publisher: { name: "Coast" },
		});
	});
});
