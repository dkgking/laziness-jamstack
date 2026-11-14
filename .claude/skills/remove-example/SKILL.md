---
name: remove-example
description: Remove or replace the template's sample content (the Hello World post, the Jane Doe author, the demo home page text), and remove the whole blog (posts, authors, /posts pages, CMS collections) when the site has no blog. Use on the first round that builds the user's site, or whenever a page, link, post or text from the template is still in the site.
---

# Remove the example

The template ships a sample blog: one post (`content/posts/hello-world.md`), one author (`content/authors/jane-doe.yaml`), the `/posts` pages and a demo home page. Decide in the first round which case fits the user's site, and do it in that round.

| The user wants | Do |
|---|---|
| A blog, or a site with a blog | Part A |
| Another kind of content edited in the CMS (projects, events, menu…) and no blog | `add-collection` for that content, then Part B |
| A site with no blog (landing page, portfolio, docs…) | Part B |

## Part A: keep the blog, drop the samples

1. Delete `content/posts/hello-world.md` and `content/authors/jane-doe.yaml`. Write the user's own posts and author only from what they gave you; never invent a person, quotes or facts. An empty blog builds and shows "No posts yet." (a post needs an author, so add the author first).
2. Delete `public/uploads/jane-doe.svg` (the sample avatar) once nothing uses it.
3. Replace the demo text: the home page's words in `content/pages/home.yaml`, the Posts page's in `content/pages/posts.yaml`, the navigation in `content/settings/site.yaml`, and `siteName` in `src/libs/site.ts`.

## Part B: remove the blog

1. Delete the files:

   ```bash
   rm -r "src/routes/{-\$locale}/posts" content/posts content/authors
   rm src/components/PostList.tsx src/server/posts.ts src/server/authors.ts src/content/posts.ts src/content/authors.ts content/pages/posts.yaml
   ```

2. `content-collections.ts`: drop `authors`, `posts`, and `postsPage` from the imports and from `content`; in `src/content/pages.ts` delete `postsPage`, and in `src/server/pages.ts` delete `getPostsPage`. Keep `site` and `homePage`: the navigation and the home page stay.
3. `public/admin/config.yml`: delete the `authors` and `posts` collections, and the `posts` file under the `pages` collection. The `pages` and `settings` collections stay, so `/admin` still edits the site's words.
4. `src/routes/sitemap[.]xml.ts`: drop the `allPosts` import, the post loop and the `/posts` entries; list the site's own pages.
5. `content/settings/site.yaml`: drop the Posts item from `nav`; add the site's own pages.
6. The home page: in `src/routes/{-$locale}/index.tsx` drop the posts and authors from the loader and their two sections, and build the user's home page from `content/pages/home.yaml` (its sections there, their schema in `src/content/pages.ts`, their fields in `config.yml`; the `add-page` skill shows the three places).
7. Leave `src/content/helpers.ts` and `rehype-youtube.ts`: a new collection uses them.
8. Delete `public/uploads/jane-doe.svg`. The `.post-content` styles in `src/styles.css` can go unless a page renders Markdown.

## Check

```bash
grep -rniE "posts|authors|hello-world|jane" src content-collections.ts public/admin/config.yml --exclude=routeTree.gen.ts --exclude-dir=locales
```

After Part B it must print only what the site really uses (`seo.test.ts` uses `/posts` as a sample path; that is fine). Then `bun run check:fix` and `bun run verify`: `i18n:extract --clean` drops the removed strings, and the prerender must list only the site's pages.
