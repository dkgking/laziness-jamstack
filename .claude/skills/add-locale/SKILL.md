---
name: add-locale
description: Add, remove or change a site language (e.g. make the site English and Vietnamese, add French "fr", drop one) across the locale list, Lingui config, translation catalogs, Sveltia CMS i18n config, translated content folders, and the prerender seed pages. Use when the user asks for more than one language or to remove one.
---

# Add or remove a locale

The site starts **English only**. Only add languages the user asks for.

Locale codes must be **exactly two lowercase letters** (`vi`, `fr`, `de`). The URL prefix matcher in `@sourceking/tanstack-lingui` only accepts `/[a-z]{2}/`, so `zh-TW` or `pt-BR` will not route. If two variants of one language are needed, stop and ask.

The default locale (`en`) has no URL prefix and its catalog is the Lingui source: `/posts` is English, `/vi/posts` is Vietnamese.

## Add the first extra locale (example: `vi`)

1. **`src/libs/locales.ts`**: add an entry. `nativeName` is shown in the language switcher, which appears once there are two locales.
   ```ts
   { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
   ```
2. **`lingui.config.ts`**: add `"vi"` to `locales`.
3. **Catalog**: run `bun run i18n:extract`. It creates `src/locales/vi.json`. Translate every entry (see the `i18n-lingui` skill).
4. **Content folders**: while the site was English only, posts sat at `content/posts/<slug>.md`. Move them into the default locale's folder, then add the translations:
   ```bash
   mkdir -p content/posts/en content/posts/vi
   git mv content/posts/*.md content/posts/en/ 2>/dev/null || mv content/posts/*.md content/posts/en/
   ```
   For each slug add `content/posts/vi/<slug>.md`: copy the `en` file, translate `title`, `summary` and the body, keep `date`, `author`, `cover` and `draft` identical. A missing translation falls back to `en`.
5. **CMS** (`public/admin/config.yml`): add the i18n block after `logo`, and mark the translated collection and its fields:
   ```yaml
   i18n:
     structure: multiple_folders
     locales: [en, vi]
     default_locale: en
   ```
   In the `posts` collection add `i18n: true`; on the fields, `i18n: true` for text that is translated (`title`, `summary`, `body`) and `i18n: duplicate` for the rest (`date`, `author`, `cover`, `draft`). Set its description to `content/posts/<locale>/<slug>.md`.
6. Nothing else: the prerender seeds one page per locale from `src/libs/locales.ts` (`vite.config.ts`), hreflang links list every locale; `sitemap.xml` lists each post only in the locales it is written in, and a page that falls back to `en` gets a canonical link to the `en` page.

## Add another locale later (example: `fr`)

Steps 1–3, add `fr` to `i18n.locales` in `config.yml`, and add `content/posts/fr/<slug>.md` for the existing slugs.

## Remove a locale (example: `vi`)

1. Remove it from `src/libs/locales.ts`, `lingui.config.ts` and `i18n.locales` in `public/admin/config.yml`.
2. Delete `src/locales/vi.json` and `content/posts/vi/`.
3. Back to English only: move `content/posts/en/*.md` to `content/posts/`, delete the `i18n` block and every `i18n:` key in `config.yml`.
4. `grep -rn '"vi"\|/vi/' src content public` to catch leftovers.

A post left in a folder for a removed locale makes the build fail on purpose (`parseLocalePath` rejects unknown locales).

## Verify

```bash
bun run i18n:check        # every catalog complete
bun run validate:cms
bun run verify
```

The build log lists the prerendered pages: `/vi`, `/vi/posts`, and each post under `/vi/posts/` must be there. `dist/client/vi/posts.html` holds the Vietnamese text.

Note: `Intl` formats dates per locale (`formatDate` in `src/libs/intl.ts`). `th` uses the Buddhist calendar year by default; pass `th-TH-u-ca-gregory` to force Gregorian.
