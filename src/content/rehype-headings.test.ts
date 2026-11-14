import { describe, expect, test } from "bun:test";
import type { Root } from "hast";
import { headingId, headingsOf, rehypeHeadings } from "./rehype-headings";

const heading = (tagName: string, text: string) => ({
	type: "element" as const,
	tagName,
	properties: {},
	children: [{ type: "text" as const, value: text }],
});

describe("headings", () => {
	test("an id is the heading's words, in any script", () => {
		expect(headingId("Embedding a video!")).toBe("embedding-a-video");
		expect(headingId("Cài đặt nhanh")).toBe("cài-đặt-nhanh");
	});

	test("each heading gets an id; the same words twice are told apart", () => {
		const tree: Root = {
			type: "root",
			children: [
				heading("h2", "Setup"),
				heading("p", "Text"),
				heading("h3", "Setup"),
			],
		};
		rehypeHeadings()(tree);
		expect(tree.children[0]).toMatchObject({ properties: { id: "setup" } });
		expect(tree.children[1]).toMatchObject({ properties: {} });
		expect(tree.children[2]).toMatchObject({ properties: { id: "setup-2" } });
	});

	test("the headings of the compiled HTML are listed in order, as plain words", () => {
		const html =
			'<p>Intro</p><h2 id="setup">Setup &amp; <code>run</code></h2><h3 id="setup-2">Setup</h3><h2>No id</h2>';
		expect(headingsOf(html)).toEqual([
			{ id: "setup", text: "Setup & run", depth: 2 },
			{ id: "setup-2", text: "Setup", depth: 3 },
		]);
	});
});
