import { z } from "zod";
import { defaultLocale, isLocale, type Locale } from "#/libs/locales";

/** A server function's `locale` input: one of the site's locales. */
export const localeSchema = z.custom<Locale>(
	(value) => typeof value === "string" && isLocale(value),
);

/** The document written in `locale`, else the default locale's (a missing translation falls back). */
export const inLocale = <T extends { locale: Locale }>(
	documents: readonly T[],
	locale: Locale,
): T | undefined =>
	documents.find((document) => document.locale === locale) ??
	documents.find((document) => document.locale === defaultLocale);
