# Static site

- The build prerenders every page; nothing runs on a server afterwards. No request-time code: no API routes, form handlers, cookies, or auth on the site itself. A form posts to an outside service.
- No secrets in the code or in `VITE_*` variables: everything in the build is public.
- Content changes reach the site by rebuilding.
- Root-absolute paths (`/uploads/...`, `/app-icon.svg`) assume the site is served at `/`.
