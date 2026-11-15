// The site's public address. Set VITE_SITE_URL on the host's build (or edit
// the fallback) once the site has its domain: hreflang links, the sitemap,
// and robots.txt need full URLs. The site's name and what it says about
// itself are content: content/settings/site.yaml.
export const siteUrl = (
	import.meta.env.VITE_SITE_URL || "https://example.com"
).replace(/\/$/, "");

/** A full URL for a root-absolute path ("/uploads/cover.png"). */
export const absoluteUrl = (path: string) =>
	/^https?:\/\//.test(path) ? path : `${siteUrl}${path}`;
