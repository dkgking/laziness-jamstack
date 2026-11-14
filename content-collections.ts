import { defineConfig } from "@content-collections/core";
import { authors } from "./src/content/authors";
import { homePage, postsPage, site } from "./src/content/pages";
import { posts } from "./src/content/posts";

export default defineConfig({
	content: [authors, posts, site, homePage, postsPage],
});
