# Lubô Confeitaria project instructions

## Project overview

- This is a Portuguese-language, single-page marketing and order website for Lubô Confeitaria.
- It uses Vite, native ES modules, Tailwind CSS 4, and Firebase (Hosting, Analytics, Storage, and Remote Config).
- The main page is `index.html`; JavaScript modules live in the repository root and are loaded directly from that page.
- Keep changes focused on the existing static-site architecture. Do not introduce a framework or redesign the page unless explicitly requested.

## Source and build layout

- Edit source files in the repository root and assets under `public/`.
- Do not hand-edit `dist/`; it is generated and ignored by Git.
- `public/` contains files copied unchanged by Vite. Update `public/robots.txt`, `public/sitemap.xml`, `manifest.json`, or `public/images/` there as needed.
- `vite.config.js` uses `index.html` as the build entry and `dist/` as the output directory.
- Firebase Hosting is configured by `firebase.json` to serve `dist/`.
- The project uses npm in this environment even though `package.json` contains a Firebase deploy script using Yarn. Use `npm install` for dependencies and `npm run build` for validation.

## Common commands

- Start the local site: `npm run dev`
- Build for production: `npm run build`
- Preview the production build locally: `npm run preview`
- Deploy only when explicitly requested: `npm run deploy`
- There is currently no automated test suite. `npm test` is a placeholder and will fail.

## JavaScript conventions

- Preserve native ESM syntax and the existing root-level module structure.
- Use browser APIs and the existing Firebase SDK imports rather than adding unnecessary libraries.
- Shared Firebase initialization belongs in `index.js` and should be imported through named exports such as `app`, `analytics`, `storage`, and `remoteConfig`.
- Keep each existing responsibility in its current module:
  - `carousel.js`: Firebase portfolio loading and the image carousel/modal.
  - `menu.js`: mobile navigation.
  - `order.js`: order form formatting, submission, WhatsApp handoff, and Analytics.
  - `filter.js`: flavor filtering and combo preview.
  - `flags.js`: Remote Config seasonal feature flags.
- Use DOM checks when modules may encounter missing or hidden elements.
- Preserve keyboard, pointer, and touch behavior when changing interactive components.
- Use safe DOM construction for user or remote-config data. Avoid interpolating untrusted values into `innerHTML`.
- Keep the WhatsApp recipient in `order.js` and preserve phone/date formatting behavior unless the task explicitly changes it.
- Dates sent from the order form must remain in Brazilian `DD/MM/YYYY` format.

## Styling and HTML

- Use Tailwind CSS utility classes for layout and component styling where practical.
- Use design tokens and custom classes from `index.css`:
  - `--terracotta`, `--peach`, `--deep`, `--cream`, `--sand`, `--ink`, `--white`
- Preserve the site's warm confectionery visual identity and Portuguese labels.
- Keep responsive behavior for mobile, tablet, and desktop; Tailwind breakpoints are currently used directly in `index.html`.
- Keep semantic HTML, descriptive image `alt` text, visible focus states, and accessible names for icon-only controls.
- Preserve the existing smooth-anchor behavior and mobile menu interactions.
- When changing the page structure, update any matching JavaScript element ID used for navigation or DOM initialization.

## Firebase and configuration

- Read Firebase browser configuration only from `import.meta.env.VITE_*` values in `index.js`.
- Required values use `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`, `VITE_APP_ID`, and `VITE_MEASUREMENT_ID`.
- Never commit `.env` files or Firebase credentials/secrets.
- Portfolio categories are loaded dynamically from Firebase Storage under `portfolio/{category}/`.
- Preserve the `index.json` metadata contract for each portfolio category. Read its `hidden`, `title`, `order`, `cover`, and image metadata fields consistently.
- Remote Config flag names must match existing IDs, including `NATAL_2026` and `PASCOA_2026`.
- Analytics and Remote Config changes should use the existing initialized instances instead of initializing Firebase a second time.

## SEO and production assets

- Preserve canonical URLs, Open Graph/Twitter metadata, and JSON-LD in `index.html`.
- Keep business details consistent across page metadata, structured data, `manifest.json`, `public/sitemap.xml`, and visible contact information.
- The primary domain is `https://luboconfeitaria.com.br`.
- Use `public/` for crawler-facing files and static images. Add the asset to the sitemap when it represents indexable content.
- Maintain image preload, lazy-loading, and dimensions/ratio conventions when modifying the hero or gallery to avoid regressions to LCP and CLS.
- Do not add a new duplicate metadata or structured-data block; update the existing relevant block.

## Change verification

- For source or HTML changes, run `npm run build` and fix build errors.
- Inspect the result with `npm run preview` for layout, navigation, form, carousel, and seasonal UI changes.
- After JavaScript changes, verify there are no browser console errors and confirm relevant Firebase-dependent behavior in a configured environment.
- For responsive UI changes, check at least mobile and desktop widths.
- For content or SEO changes, verify `index.html`, `manifest.json`, `public/robots.txt`, and `public/sitemap.xml` remain consistent.
- Do not commit `dist/`; use it only as build output.
