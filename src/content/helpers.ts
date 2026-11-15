import { z } from "zod";
import { defaultLocale, isLocale, type Locale } from "../libs/locales";

// Sveltia CMS saves cleared optional fields as "", treat that as "not set".
const emptyToUndefined = (value: string | undefined) => value || undefined;

export const optionalString = () =>
	z.string().optional().transform(emptyToUndefined);

export const optionalUrl = () =>
	z.url().or(z.literal("")).optional().transform(emptyToUndefined);

export const optionalEmail = () =>
	z.email().or(z.literal("")).optional().transform(emptyToUndefined);

/**
 * A group of fields an editor may leave out (`widget: object` with
 * `required: false`). Sveltia CMS saves one that was not added as `null`,
 * and a file written before the field existed has no key at all: both read
 * as "not set".
 */
export const optionalObject = <Shape extends z.ZodRawShape>(shape: Shape) =>
	z
		.object(shape)
		.nullish()
		.transform((value) => value ?? undefined);

/**
 * What a page may say to search engines and link previews in place of its
 * own title and first words. Kept as plain fields beside the page's others
 * (never an object): Web Studio's Edit form writes plain fields only.
 */
export const seoFields = {
	seo_title: optionalString(),
	seo_description: optionalString(),
};

// Date-times without an offset are read as UTC, so the result does not depend on
// the timezone of the machine running the build. Stored as ISO strings.
const dateTime = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/;
const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/i;
export const isoDate = () =>
	z.union([z.string(), z.date()]).transform((value, ctx) => {
		const input =
			typeof value === "string" &&
			dateTime.test(value) &&
			!hasOffset.test(value)
				? `${value.replace(" ", "T")}Z`
				: value;
		const date = new Date(input);
		if (Number.isNaN(date.getTime())) {
			ctx.addIssue({ code: "custom", message: "Invalid date" });
			return z.NEVER;
		}
		return date.toISOString();
	});

/**
 * Splits a `multiple_folders` i18n path (`<locale>/<slug>`) into its parts.
 * Paths without a locale folder fall back to the default locale.
 */
export const parseLocalePath = (
	path: string,
): { locale: Locale; slug: string } | undefined => {
	const [first, ...rest] = path.split("/");
	if (rest.length === 0) {
		return { locale: defaultLocale, slug: first };
	}
	// Exactly <locale>/<slug>: nested slugs would not match the $slug route.
	if (rest.length !== 1 || !isLocale(first)) {
		return undefined;
	}
	return { locale: first, slug: rest[0] };
};
