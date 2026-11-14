import { defineConfig } from "@content-collections/core";
import { authors } from "./src/content/authors";
import { homePage, postsPage, site } from "./src/content/pages";
import { posts } from "./src/content/posts";
import { textPages } from "./src/content/text-pages";

export default defineConfig({
	content: [authors, posts, textPages, site, homePage, postsPage],
});
