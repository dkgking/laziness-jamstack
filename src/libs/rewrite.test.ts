import { describe, expect, test } from "bun:test";
import { publicPath, type RewriteRule, routePath } from "./rewrite";

// Tested with rules of its own: the site's languages and rules change.
const rules = [
	{ route: "page/privacy", paths: { en: "privacy" } },
	{ route: "posts", paths: { en: "blog" }, rest: true },
	{ route: "posts/archive", paths: { en: "old-posts" } },
] as readonly RewriteRule[];

describe("url rewrite", () => {
	test("a route shows its public address, and the address finds its route", () => {
		expect(publicPath("/page/privacy", rules)).toBe("/privacy");
		expect(routePath("/privacy", rules)).toBe("/page/privacy");
	});

	test("a section keeps what follows it", () => {
		expect(publicPath("/posts", rules)).toBe("/blog");
		expect(publicPath("/posts/hello-world", rules)).toBe("/blog/hello-world");
		expect(routePath("/blog/hello-world", rules)).toBe("/posts/hello-world");
	});

	test("the longer rule wins over the section it is in", () => {
		expect(publicPath("/posts/archive", rules)).toBe("/old-posts");
		expect(routePath("/old-posts", rules)).toBe("/posts/archive");
	});

	test("a rule without rest matches its route alone", () => {
		expect(publicPath("/page/privacy/more", rules)).toBe("/page/privacy/more");
	});

	test("the root and addresses no rule names stay as they are", () => {
		expect(publicPath("/", rules)).toBe("/");
		expect(routePath("/about", rules)).toBe("/about");
		expect(publicPath("/about", [])).toBe("/about");
	});

	test("there and back gives the same address", () => {
		for (const path of ["/page/privacy", "/posts/hello", "/posts/archive"])
			expect(routePath(publicPath(path, rules), rules)).toBe(path);
	});
});
