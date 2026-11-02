// The site's name and public address. Set VITE_SITE_URL on the host's build
// (or edit the fallback) once the site has its domain: hreflang links and the
// sitemap need full URLs.
export const siteName = "Jamstack blog";

export const siteUrl = (
	import.meta.env.VITE_SITE_URL || "https://example.com"
).replace(/\/$/, "");

/** A full URL for a root-absolute path ("/uploads/cover.png"). */
export const absoluteUrl = (path: string) =>
	/^https?:\/\//.test(path) ? path : `${siteUrl}${path}`;
