import type { Element, ElementContent, Root } from "hast";

// Gives every heading of a text an id, for links to a section, and lists
// the headings of the result for a table of contents. Runs after the sanitizer (which
// would rename an id written by hand).

// A type, not an interface: content-collections takes a transform's result only as a plain serializable object.
export type Heading = {
	id: string;
	text: string;
	/** 2 for an h2, 3 for an h3, and so on. */
	depth: number;
};

const HEADING = /^h([2-6])$/;

const textOf = (node: ElementContent): string => {
	if (node.type === "text") return node.value;
	return node.type === "element" ? node.children.map(textOf).join("") : "";
};

/** A heading's words as an address: lowercase, letters and digits of any script, one dash between. */
export const headingId = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, "-")
		.replace(/^-+|-+$/g, "");

/** A rehype plugin that gives each heading of a tree an id; a second heading of the same words gets "-2". */
export const rehypeHeadings = () => (tree: Root) => {
	const used = new Map<string, number>();
	const visit = (node: Root | Element) => {
		for (const child of node.children) {
			if (child.type !== "element") continue;
			if (!HEADING.test(child.tagName)) {
				visit(child);
				continue;
			}
			const base =
				headingId(child.children.map(textOf).join("").trim()) || "section";
			const count = (used.get(base) ?? 0) + 1;
			used.set(base, count);
			child.properties = {
				...child.properties,
				id: count === 1 ? base : `${base}-${count}`,
			};
		}
	};
	visit(tree);
};

const HEADING_TAG = /<h([2-6]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
const ENTITIES: Readonly<Record<string, string>> = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#x27;": "'",
	"&#39;": "'",
};

/**
 * The headings of compiled HTML, in order, for a table of contents. Read
 * from the HTML itself, not gathered while compiling: a compile answered
 * from the build's cache runs no plugin.
 */
export const headingsOf = (html: string): Heading[] =>
	[...html.matchAll(HEADING_TAG)].map(([, depth, id, inner]) => ({
		id: id ?? "",
		text: (inner ?? "")
			.replace(/<[^>]+>/g, "")
			.replace(
				/&(amp|lt|gt|quot|#x27|#39);/g,
				(entity) => ENTITIES[entity] ?? entity,
			)
			.trim(),
		depth: Number(depth),
	}));
