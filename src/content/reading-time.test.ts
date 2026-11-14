import { describe, expect, test } from "bun:test";
import { readingMinutes } from "./reading-time";

describe("reading time", () => {
	test("a short text takes a minute", () => {
		expect(readingMinutes("Hello world")).toBe(1);
		expect(readingMinutes("")).toBe(1);
	});

	test("spaced scripts are counted by the word", () => {
		expect(readingMinutes("word ".repeat(450))).toBe(3);
	});

	test("Chinese and Japanese are counted by the character", () => {
		expect(readingMinutes("字".repeat(900))).toBe(3);
	});

	test("code and link addresses are not read", () => {
		const code = `\`\`\`ts\n${"const a = 1;\n".repeat(400)}\`\`\``;
		expect(readingMinutes(`Intro.\n\n${code}`)).toBe(1);
		expect(
			readingMinutes(`[link](https://example.com/${"a/".repeat(2000)})`),
		).toBe(1);
	});
});
