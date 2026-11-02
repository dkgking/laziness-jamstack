import { describe, expect, test } from "bun:test";
import { pathIn, seo, sitemapXml, unlocalizedPath } from "./seo";

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
});
