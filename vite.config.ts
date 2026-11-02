import contentCollections from "@content-collections/vite";
import { lingui } from "@lingui/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { defaultLocale, locales } from "./src/libs/locales.ts";

/**
 * A static site: every page is prerendered to HTML in dist/client at build
 * time, as flat files (posts.html, vi/posts.html) that Cloudflare, Netlify,
 * and Vercel (cleanUrls) all serve at /posts with no redirect.
 */
const config = defineConfig({
	plugins: [
		contentCollections(),
		lingui({ macroTransform: true }),
		tailwindcss(),
		tanstackStart({
			// One seed page per locale (the language switcher is a <select>, which
			// the crawler cannot follow), then crawlLinks finds the rest.
			pages: [
				...locales.map(({ code }) => ({
					path: code === defaultLocale ? "/" : `/${code}`,
				})),
				{ path: "/sitemap.xml" },
			],
			prerender: {
				enabled: true,
				crawlLinks: true,
				autoSubfolderIndex: false,
				failOnError: true,
			},
			// 404.html: the app shell the hosts serve for unknown paths, which
			// renders the not-found page. maskPath must not be "/" or "/404".
			spa: {
				enabled: true,
				maskPath: "/?shell",
				prerender: { outputPath: "/404" },
			},
		}),
		viteReact(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

export default config;
