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
3. Replace the demo text: the home page tagline in `src/routes/{-$locale}/index.tsx`, `siteName` in `src/libs/site.ts`.

## Part B: remove the blog

1. Delete the files:

   ```bash
   rm -r "src/routes/{-\$locale}/posts" content/posts content/authors
   rm src/components/PostList.tsx src/server/posts.ts src/server/authors.ts src/content/posts.ts src/content/authors.ts
   ```

2. `content-collections.ts`: drop `authors` and `posts` from the imports and from `content` (`content: []` builds when nothing is left).
3. `public/admin/config.yml`: delete the `authors` and `posts` entries under `collections` (`collections: []` when nothing is left; then also tell the user `/admin` has nothing to edit).
4. `src/routes/sitemap[.]xml.ts`: drop the `allPosts` import, the post loop and the `/posts` entries; list the site's own pages.
5. `src/layouts/AppLayout.tsx`: drop `{ to: "/posts", ... }` from `navItems`; add the site's own pages.
6. `src/routes/{-$locale}/index.tsx`: drop the loader, the latest posts and the authors sections, and write the user's home page.
7. Leave `src/content/helpers.ts` and `rehype-youtube.ts`: a new collection uses them.
8. Delete `public/uploads/jane-doe.svg`. The `.post-content` styles in `src/styles.css` can go unless a page renders Markdown.

## Check

```bash
grep -rniE "posts|authors|hello-world|jane" src content-collections.ts public/admin/config.yml --exclude=routeTree.gen.ts --exclude-dir=locales
```

After Part B it must print only what the site really uses (`seo.test.ts` uses `/posts` as a sample path; that is fine). Then `bun run check:fix` and `bun run verify`: `i18n:extract --clean` drops the removed strings, and the prerender must list only the site's pages.
