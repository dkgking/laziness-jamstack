import { describe, expect, test } from "bun:test";
import { rehypeYoutube, youtubeEmbed } from "./rehype-youtube";

const paragraph = (value: string) => ({
	type: "element",
	tagName: "p",
	properties: {},
	children: [{ type: "text", value }],
});

describe("youtubeEmbed", () => {
	test("embeds a valid shortcode with clamped sizes", () => {
		const embed = youtubeEmbed(
			paragraph('{{< youtube id="aqz-KE-bpKQ" width="5000" height="10" >}}'),
		);
		const iframe = embed?.children[0] as {
			properties: Record<string, unknown>;
		};
		expect(iframe.properties.src).toBe(
			"https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ",
		);
		expect(iframe.properties.width).toBe(1280);
		expect(iframe.properties.height).toBe(113);
	});

	test("uses the default size without width and height", () => {
		const embed = youtubeEmbed(paragraph('{{< youtube id="aqz-KE-bpKQ" >}}'));
		const iframe = embed?.children[0] as {
			properties: Record<string, unknown>;
		};
		expect(iframe.properties.width).toBe(560);
	});

	test("leaves a bad id or extra text alone", () => {
		expect(
			youtubeEmbed(paragraph('{{< youtube id="x" onload="alert(1)" >}}')),
		).toBeNull();
		expect(
			youtubeEmbed(paragraph('see {{< youtube id="aqz-KE-bpKQ" >}}')),
		).toBeNull();
	});

	test("replaces nested paragraphs in a tree", () => {
		const tree = {
			type: "root",
			children: [paragraph('{{< youtube id="aqz-KE-bpKQ" >}}')],
		};
		rehypeYoutube()(tree);
		expect((tree.children[0] as { tagName: string }).tagName).toBe("div");
	});
});
