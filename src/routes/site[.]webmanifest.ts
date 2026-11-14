import { createFileRoute } from "@tanstack/react-router";
import { allSites } from "content-collections";
import { defaultLocale } from "#/libs/locales";
import { inLocale } from "#/server/locale";

/** The background a browser paints while the site opens, when the site names no theme color. */
const DEFAULT_COLOR = "#ffffff";

// Prerendered to site.webmanifest at build time (vite.config.ts `pages`),
// from content/settings/site.yaml: what a phone shows when the site is
// added to its home screen.
export const Route = createFileRoute("/site.webmanifest")({
	server: {
		handlers: {
			GET: () => {
				const site = inLocale(allSites, defaultLocale);
				const color = site?.theme_color ?? DEFAULT_COLOR;
				return new Response(
					JSON.stringify({
						name: site?.name ?? "",
						short_name: site?.name ?? "",
						description: site?.description ?? "",
						start_url: "/",
						display: "standalone",
						background_color: color,
						theme_color: color,
						icons: [
							{
								src: "/app-icon.svg",
								sizes: "any",
								type: "image/svg+xml",
								purpose: "any",
							},
						],
					}),
					{
						headers: {
							"content-type": "application/manifest+json; charset=utf-8",
						},
					},
				);
			},
		},
	},
});
