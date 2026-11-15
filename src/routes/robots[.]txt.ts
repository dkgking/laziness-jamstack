import { createFileRoute } from "@tanstack/react-router";
import { siteUrl } from "#/libs/site";

// Prerendered to robots.txt at build time (vite.config.ts `pages`): every
// page may be read, the CMS is left alone, and the sitemap is named.
export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: () =>
				new Response(
					[
						"User-agent: *",
						"Allow: /",
						"Disallow: /admin/",
						"",
						`Sitemap: ${siteUrl}/sitemap.xml`,
						"",
					].join("\n"),
					{ headers: { "content-type": "text/plain; charset=utf-8" } },
				),
		},
	},
});
