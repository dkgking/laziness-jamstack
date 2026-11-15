import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { optionalObject, optionalString } from "./helpers";

describe("optionalObject", () => {
	const page = z.object({
		hero: z.object({ title: z.string() }),
		prices: optionalObject({ title: optionalString() }),
	});

	test("a group the CMS saved as null, or a file never had, reads as not set", () => {
		expect(page.parse({ hero: { title: "Hi" }, prices: null }).prices).toBe(
			undefined,
		);
		expect(page.parse({ hero: { title: "Hi" } }).prices).toBe(undefined);
	});

	test("a group that is there is read, its own fields checked", () => {
		expect(
			page.parse({ hero: { title: "Hi" }, prices: { title: "Prices" } }).prices,
		).toEqual({ title: "Prices" });
		expect(
			page.safeParse({ hero: { title: "Hi" }, prices: { title: 3 } }).success,
		).toBe(false);
	});

	test("a required group still refuses null", () => {
		expect(page.safeParse({ hero: null }).success).toBe(false);
	});
});
