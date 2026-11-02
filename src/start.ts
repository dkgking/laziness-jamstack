import { createStart } from "@tanstack/react-start";
import { i18nMiddleware } from "./libs/i18n";

// Runs while pages are prerendered at build time: each page renders with the
// locale its URL names. A static host runs no server code afterwards.
export const startInstance = createStart(() => ({
	requestMiddleware: [i18nMiddleware],
}));
