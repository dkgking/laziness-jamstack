// Turns a paragraph that holds only the CMS's YouTube shortcode
// ({{< youtube id="…" width="…" height="…" >}}) into an embed. It runs after
// rehype-sanitize, so the only iframes in a post are the ones made here, from
// a checked video id and clamped sizes.

interface Text {
	type: "text";
	value: string;
}
interface Element {
	type: "element";
	tagName: string;
	properties: Record<string, string | number | boolean>;
	children: Node[];
}
type Node = Text | Element | { type: string; children?: Node[] };

const SHORTCODE =
	/^\{\{<\s*youtube\s+id="([^"]*)"(?:\s+width="([^"]*)"\s+height="([^"]*)")?\s*>\}\}$/;
const VIDEO_ID = /^[\w-]{11}$/;
const WIDTH = { min: 200, max: 1280, default: 560 };
const HEIGHT = { min: 113, max: 720, default: 315 };

const clamp = (value: string | undefined, range: typeof WIDTH) => {
	const number = Number.parseInt(value ?? "", 10);
	return Number.isFinite(number)
		? Math.min(range.max, Math.max(range.min, number))
		: range.default;
};

/** The embed for a paragraph that is exactly a valid shortcode, else null. */
export const youtubeEmbed = (node: Node): Element | null => {
	if (node.type !== "element" || (node as Element).tagName !== "p") return null;
	const children = (node as Element).children;
	if (children.length !== 1 || children[0].type !== "text") return null;
	const match = SHORTCODE.exec((children[0] as Text).value.trim());
	if (!match || !VIDEO_ID.test(match[1])) return null;
	const width = clamp(match[2], WIDTH);
	const height = clamp(match[3], HEIGHT);
	return {
		type: "element",
		tagName: "div",
		properties: {
			className: "video-embed",
			style: `aspect-ratio: ${width} / ${height}; max-width: ${width}px`,
		},
		children: [
			{
				type: "element",
				tagName: "iframe",
				properties: {
					src: `https://www.youtube-nocookie.com/embed/${match[1]}`,
					title: "YouTube video",
					width,
					height,
					loading: "lazy",
					allow: "autoplay; encrypted-media; picture-in-picture",
					allowFullScreen: true,
					referrerPolicy: "strict-origin-when-cross-origin",
				},
				children: [],
			},
		],
	};
};

const replaceIn = (node: Node) => {
	const children = "children" in node ? node.children : undefined;
	if (!children) return;
	children.forEach((child, index) => {
		const embed = youtubeEmbed(child);
		if (embed) children[index] = embed;
		else replaceIn(child);
	});
};

/** The rehype plugin: put it after rehype-sanitize. */
export const rehypeYoutube = () => (tree: Node) => {
	replaceIn(tree);
};
