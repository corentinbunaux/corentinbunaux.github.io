# Architecture — corentinbunaux.github.io

> Keep this file true. It is the map Claude reads instead of exploring the whole
> tree, so a stale entry here costs real tokens and real mistakes.

## Purpose

A single-page Next.js portfolio for Corentin Bunaux, rebuilt against the
"REFONTE" Canva mockup (`design/mockups/02-refonte.png`, `docs/CADRAGE.md`).
One route (`/`) renders a stack of sections (hero, profile, career timeline,
projects, about, footer) that scroll-link via `id` anchors, plus one static
route per project under `src/app/*`. No backend, no database, no CMS.

## Map

| Path | Holds | Notes |
| --- | --- | --- |
| `src/app/page.tsx` | Assembles the six home sections and measures each one's `offsetTop` for the navbar's scroll-spy | Client component (`"use client"`) |
| `src/app/layout.tsx` | Root HTML shell, page metadata | |
| `src/app/{cpge_tipe,emse,internships,personnal,research,work}/**` | One static route per project (12 total, including `work/gcii`) | Each imports `projects` from `src/data/projects.ts`, resolves its own entry by `href`, and renders `<ProjectPage project={...} />` |
| `src/data/projects.ts` | Typed single source of truth for all 12 projects | `category`/`featured` (PORT-011, drives the Projets filters), `period`/`location` (PORT-008/010, drives the Parcours timeline), `role`/`team`/`result` (PORT-012/013, drives each project page's "En bref" card); every prose field is `LocalizedText` (`{fr, en}`, PORT-017), resolved via `localizeProject()` |
| `src/i18n/` | `LanguageContext.tsx` (provider + `useLanguage()`), `dictionary.ts` (`{fr, en}` `Dictionary` + `useTranslation()`), `types.ts` (`Language`, `LocalizedText`) | Client-side only, default `fr`, persisted to `localStorage` (`corentinbunaux.language`) and re-synced in a `useEffect` post-mount to avoid a hydration mismatch; no routing impact (no `/fr` `/en` paths) |
| `src/components/useDesktopMotionGate.ts` | Shared gate (`>=1024px` AND no `prefers-reduced-motion`) for every decorative three.js accent | Consumed by `HeroCanvas.tsx`, `ProjectAccent3D.tsx` — one gate, so the three call sites can't drift apart |
| `src/components/HeroMesh.tsx` + `HeroCanvas.tsx` | The hero's cursor-reactive three.js mesh (production, promoted from the PORT-003 spike — GO verdict from Corentin) | Renders as a background layer behind `homepage.jsx`'s content (DOM order, no z-index); gated by `useDesktopMotionGate`, `next/dynamic(ssr:false)` |
| `src/components/ProjectAccent3D.tsx` + `SafranAccent.tsx`/`QuimesisAccent.tsx` | Per-project contextual three.js accents (PORT-020), looked up by `href` | Both are three.js (Quimesis deviates from the original VTK.js arbitrage — see Key decisions); render in normal flow (`float-right`, fixed size) next to the project title, not as an absolute overlay |
| `src/components/ProjectPage.tsx` | The project-page template: breadcrumb, sticky "En bref" card, header visual, numbered body sections, gallery, prev/next nav (array order, `UNROUTED_HREFS` guard for any future data-ahead-of-route entry) | Replaces the old `project.tsx` (deleted, PORT-013) — no more `window.location.pathname` sniffing |
| `src/components/journeySection.tsx` | The Parcours timeline (zone ②) | Reads `period`/`location` off `src/data/projects.ts`; not wired into the navbar's scroll-spy (see Known weak points) |
| `src/components/` (rest) | `homepage`, `navbar`, `profileSection`, `projectsSection`, `aboutmeSection`, `footer`, `federer`, `optimizedImage`, `Banner` | Mix of `.jsx` and `.tsx` |
| `scripts/optimize-images.mjs` | Generates `public/img` + `public/logos` (AVIF + WebP) from `assets/images-src/` via `sharp` | Run with `npm run optimize:images`; idempotent |
| `assets/images-src/` | Original, full-resolution image masters | Never served directly; not touched by the build |
| `public/img/`, `public/logos/` | Generated, web-ready images (AVIF + WebP pairs, one `.svg`) | Rebuilt from `assets/images-src/`; do not edit by hand |
| `tests/` | Does not exist — no test suite is configured | |

## Data flow

Fully static/client-side: no API routes, no external data fetching. Content
lives in `src/data/projects.ts` (structured) and directly in JSX (prose that
isn't per-project). The only runtime logic is DOM measurement (`useEffect` +
`offsetTop`) driving the navbar's scroll-spy, and the hero icon wheel's CSS
animation (no JS driving it — see Key decisions).

## Key decisions

| Date | Decision | Why | Alternatives rejected |
| --- | --- | --- | --- |
| — | Next.js App Router with a single scrolling page plus separate static routes per project | Simple portfolio, no need for a CMS or dynamic routing | — |
| 2026-09-26 | Next.js 16 + React 19, ESLint flat config (`eslint.config.mjs`) | Next 16 is the current stable release; it removes `next lint`, so the ESLint CLI and flat config are mandatory | Staying on Next 15 (maintenance only) |
| 2026-09-26 | ESLint pinned to `^9`, not `^10` | `eslint-config-next@16.3.6` crashes on ESLint 10 (`scopeManager.addGlobals is not a function`) | ESLint 10, which the peer range allows but the plugin does not support |
| 2026-09-26 | Design tokens for surfaces/border/focus in `app.css`; `--second-text` raised to `#999999` | `#666666` failed WCAG AA (2.5–3.0:1) | `#8f8f8f` as originally proposed — fails AA on `--surface-raised` (4.44:1) |
| 2026-09-26 | Images: masters in `assets/images-src/`, `scripts/optimize-images.mjs` (sharp) generates AVIF+WebP into `public/`, served via `<OptimizedImage>`'s `<picture>` | `next/image` performs no format conversion at all under `images.unoptimized: true` (mandatory for static export) — it's purely a layout helper here, not an optimizer | `next/image` alone (saves 0 bytes); AVIF-only `src` (breaks on Safari < 16.4, a silent-fallback violation) |
| 2026-09-26 | Project data extracted to typed `src/data/projects.ts` | Single source of truth, verified by the compiler (`satisfies readonly Project[]`) instead of an untyped array | Keeping the array inline in `projectsSection.jsx` with a separate `.d.ts` |
| 2026-09-26 | Project pages: new component + explicit prop, not a dynamic `[slug]` route | A dynamic route would need `generateStaticParams()` and redirects for all 12 already-shared URLs (CV, LinkedIn) — out of proportion for what's really just "stop reading `window.location`" | `src/app/projects/[slug]/page.tsx` with `generateStaticParams()` |
| 2026-09-26 | Hero icon wheel (`RoundContainer`) rotates via CSS `@keyframes`, not a JS interval | The old `setInterval(fn, 10)` re-rendered React 100×/second forever — Lighthouse measured 13.1s of main-thread work from it alone | Throttling the interval (still JS-driven, still forces reflows) |
| 2026-09-26 | Nav restructured to Profil/Expériences/Projets/À propos, wired to `journeyTop` | Matches the mockup's 4 nav entries; "Expériences" needed a real scroll target once the Parcours section existed | Keeping "Accueil" as a 5th item (mockup drops it — the hero is already what's on screen at the top) |
| 2026-09-26 | No "Télécharger le CV" button anywhere (hero or footer) | No CV PDF exists yet; a dead link is worse than no button | Linking to a placeholder path like `/cv.pdf` |
| 2026-09-26 | three.js promoted to production for the hero (GO) | Corentin tested the `/lab/hero-3d` spike on his own machine: "je ne vois pas de lags" | NO-GO path (keep the 2D hero as-is) — not taken |
| 2026-09-26 | Quimesis's contextual accent uses three.js, not `@kitware/vtk.js` | VTK.js is ~14MB unpacked, never used in this repo, and needs real scan/mesh data to render anything meaningful — none exists here; a from-scratch pipeline for one decorative accent was judged disproportionate | A real VTK.js integration — not closed, just not attempted this session |
| 2026-09-26 | i18n: client-side context + dictionary, `LocalizedText` fields in place on `Project` (not a parallel `projects.en.ts`) | No `/fr`/`/en` routes needed (stays 100% static export); keeping both languages on the same object next to each other means they can't silently drift apart the way two separate files could | `next-intl`/`react-i18next` (new dependency for a problem this small); a mirrored `projects.en.ts` |
| 2026-09-26 | `LanguageToggle` rendered in both `navbar.jsx` (home) and `ProjectPage.tsx`'s breadcrumb (every project page) | `navbar.jsx` itself is only mounted by `src/app/page.tsx` — a visitor landing directly on a project page (shared link, search result) had no way to change language at all without the toggle also living there | A single global toggle in `layout.tsx` outside either component — rejected only because it would've meant restyling it out of context of both navbar's and the breadcrumb's design |

## Invariants

- The six section anchors (`#home`, `#profile`, `#journey`, `#portfolio`,
  `#about`, `#footer`) must keep those exact `id`s — `page.tsx` measures all
  of them via `offsetTop`; `navbar.jsx` only scroll-links four of the six
  (`journeyTop` is measured but has no nav-spy entry of its own beyond the
  "Expériences" link — see Known weak points for what's *not* wired up).
- No backend/API routes — `output: "export"` + `images.unoptimized: true` in
  `next.config.mjs` enforce static-hostability at build time.
- Every real photo/logo goes through `<OptimizedImage src="/img/<name>" />`
  (no extension) — it throws at render time if `<name>` has no entry in
  `src/data/imageManifest.json`, rather than shipping a broken image. Adding
  an image means dropping the master in `assets/images-src/` and running
  `npm run optimize:images`, not editing `public/` by hand.
- `TechLogoId` in `src/data/projects.ts` is a closed union that must stay in
  sync with the ids `bannerElmts` resolves in `src/components/Banner.jsx`;
  that module silently drops an id it does not recognize.
- Every project page goes through `ProjectPage.tsx` — there is no more
  per-project bespoke component (`project.tsx` is deleted).
- Any newly displayed string must go through `useTranslation()`
  (`src/i18n/dictionary.ts`) or, for per-project prose, `LocalizedText` +
  `localizeProject()` — not a hardcoded French literal. The `Dictionary`
  interface makes a missing `en` key a compile error, but nothing stops a new
  hardcoded string from being added outside the dictionary entirely.

## Known weak points

- No test suite (`npm test` is not defined) — regressions are caught only by
  manual/visual checks and by the `ci.yml` build/lint/typecheck gate.
- Scroll-offset logic recomputes on `resize` only, not on content/image load,
  so late-loading images can throw off scroll-spy accuracy.
- **Smooth scroll is broken site-wide** (PORT-022): every `window.scroll({
  behavior: "smooth" })` call — nav clicks, the "Voir mes projets" CTA — is a
  silent no-op (`scrollY` stays 0); `behavior: "auto"` and setting
  `documentElement.scrollTop` directly both work fine. Root cause not yet
  found (isolated to `behavior: "smooth"` specifically, not a scroll-container
  mismatch as first suspected). Every click still "works" functionally in the
  sense that nothing errors — it just doesn't scroll.
- **Heading hierarchy is invalid site-wide** (PORT-023, Lighthouse
  Accessibility 98/100): every section uses `h1` for its title and `h3` as a
  body-text style class, skipping `h2` everywhere. Needs a real pass across
  every component, not a local patch.
- **The "En bref" card's `position: sticky` doesn't visually stick**
  (found in PORT-012, confirmed in PORT-013): `body { overflow-x: hidden }`
  in `app.css` makes `body` a CSSOM scroll container, which becomes the
  sticky positioning context instead of the viewport. Recommended fix:
  `overflow-x: clip` instead of `hidden`.
- No CV PDF exists — the mockup's "Télécharger le CV" CTA is absent from both
  the hero and the footer until one is provided.
- Lighthouse Performance on the home page measures 82-86/100 (mobile) in this
  project's sandboxed dev environment, short of the 90 target — confirmed via
  the wheel-spin CSS fix and again after the M5 3D accents that neither
  regressed it further nor explains the shortfall (network capture shows
  zero three.js chunk loaded under mobile emulation). Needs re-measuring
  against the deployed GitHub Pages site or a non-shared machine.
