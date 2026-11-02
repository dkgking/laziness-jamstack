// Framework-free locale constants, safe to import from content-collections config.
// Codes must be two lowercase letters: the URL prefix matcher only accepts /[a-z]{2}/.
// English only until the user asks for more languages: add one with
// .claude/skills/add-locale (also lingui.config.ts and public/admin/config.yml).
export const locales = [
	{ code: "en", name: "English", nativeName: "English" },
] as const;

export type Locale = (typeof locales)[number]["code"];

export const defaultLocale: Locale = "en";

export const isLocale = (value: string): value is Locale =>
	locales.some((locale) => locale.code === value);
