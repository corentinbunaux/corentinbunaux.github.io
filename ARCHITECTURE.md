# Architecture — corentinbunaux.github.io

> Keep this file true. It is the map Claude reads instead of exploring the whole
> tree, so a stale entry here costs real tokens and real mistakes.

## Purpose

A single-page Next.js portfolio for Corentin Bunaux. One route (`/`) renders a
stack of sections — home, profile, projects, about, footer — that scroll-link
via `id` anchors. It does not have a backend, a database, or any per-project
subpages beyond the static case-study pages under `src/app/*`.

## Map

| Path | Holds | Notes |
| --- | --- | --- |
| `src/app/page.tsx` | The single-page layout: assembles the sections and tracks their scroll offsets for the navbar | Client component (`"use client"`) |
| `src/app/layout.tsx` | Root HTML shell, page metadata | |
| `src/app/{cpge_tipe,emse,internships,personnal,research}/**` | Static case-study pages, one per project (e.g. `internships/safran`, `emse/minesweeper`) | Each is its own route; every one is a 5-line wrapper around `<Project />` |
| `src/app/lab/hero-3d/` | Throwaway spike route (PORT-003) prototyping a three.js hero mesh | Not linked from the real site; delete once its GO/NO-GO verdict is acted on |
| `src/data/projects.ts` | Typed single source of truth for all 12 projects (11 case studies + the current GCII/Enedis role) | `projectsSection.jsx` and `project.tsx` both import from here |
| `src/components/` | Shared section components (`homepage`, `navbar`, `profileSection`, `projectsSection`, `aboutmeSection`, `footer`, `project`, `federer`, `optimizedImage`) | Mix of `.jsx` and `.tsx` |
| `scripts/optimize-images.mjs` | Generates `public/img` + `public/logos` (AVIF + WebP) from `assets/images-src/` via `sharp` | Run with `npm run optimize:images`; idempotent |
| `assets/images-src/` | Original, full-resolution image masters | Never served directly; not touched by the build |
| `public/img/`, `public/logos/` | Generated, web-ready images (AVIF + WebP pairs, one `.svg`) | Rebuilt from `assets/images-src/`; do not edit by hand |
| `tests/` | Does not exist — no test suite is configured | |

## Data flow

Fully static/client-side: no API routes, no external data fetching. Content
(text, images) is hardcoded in the section components and the per-project
pages under `src/app/`. The only runtime logic is DOM measurement (`useEffect`
+ `offsetTop`) to drive the navbar's scroll-spy behaviour.

## Key decisions

| Date | Decision | Why | Alternatives rejected |
| --- | --- | --- | --- |
| — | Next.js App Router with a single scrolling page plus separate static routes per project | Simple portfolio, no need for a CMS or dynamic routing | — |
| 2026-09-26 | Next.js 16 + React 19, ESLint flat config (`eslint.config.mjs`) | Next 16 is the current stable release; it removes `next lint`, so the ESLint CLI and flat config are mandatory, not optional | Staying on Next 15 (maintenance only) |
| 2026-09-26 | ESLint pinned to `^9`, not `^10` | `eslint-config-next@16.3.6` crashes on ESLint 10 (`scopeManager.addGlobals is not a function`) | ESLint 10, which the peer range allows but the plugin does not support |
| 2026-09-26 | Design tokens for surfaces/border/focus in `app.css`; `--second-text` raised to `#999999` | `next.config.mjs` forces `images: { unoptimized: true }` for static export, and the old `#666666` failed WCAG AA (2.5–3.0:1) | `#8f8f8f` as originally proposed — fails AA on `--surface-raised` (4.44:1); `#999999` passes everywhere (5.0–6.1:1) |
| 2026-09-26 | Images: masters in `assets/images-src/`, `scripts/optimize-images.mjs` (sharp) generates AVIF+WebP into `public/`, served via `<OptimizedImage>`'s `<picture>` | `next/image` performs no format conversion at all under `images.unoptimized: true` — the static-export constraint makes it purely a layout helper, not an optimizer | `next/image` alone (saves 0 bytes here); AVIF-only `src` (breaks on Safari < 16.4, a silent-fallback violation) |
| 2026-09-26 | Project data extracted to typed `src/data/projects.ts` | Single source of truth for 12 projects, verified by the compiler (`satisfies readonly Project[]`) instead of an untyped array | Keeping the array inline in `projectsSection.jsx` with a separate `.d.ts` |

## Invariants

- The four section anchors (`#home`, `#profile`, `#portfolio`, `#about`) must
  keep those exact `id`s — `navbar.jsx` and `page.tsx` depend on them for
  scroll-spy offsets.
- No backend/API routes — this app is meant to stay static-hostable (GitHub
  Pages style); `output: "export"` + `images.unoptimized: true` in
  `next.config.mjs` enforce this at build time.
- Every real photo/logo goes through `<OptimizedImage src="/img/<name>" />`
  (no extension) — it throws at render time if `<name>` has no entry in
  `src/data/imageManifest.json`, rather than shipping a broken image. Adding
  an image means dropping the master in `assets/images-src/` and running
  `npm run optimize:images`, not editing `public/` by hand.
- `TechLogoId` in `src/data/projects.ts` is a closed union that must stay in
  sync with the ids `bannerElmts` resolves in `src/components/Banner.jsx`;
  that module silently drops an id it does not recognize.

## Known weak points

- No test suite (`npm test` is not defined) — regressions are caught only by
  manual/visual checks and by the `ci.yml` build/lint/typecheck gate.
- Scroll-offset logic recomputes on `resize` only, not on content/image load,
  so late-loading images can throw off `navbar` highlighting.
- `project.tsx` still identifies the current project by parsing
  `window.location.pathname` instead of a route parameter — the pattern
  PORT-012 replaces. It also calls `setState` synchronously inside its mount
  effect (as does `Banner.jsx`), flagged by `react-hooks/set-state-in-effect`
  and downgraded to a lint warning until that rewrite lands.
- `/src/app/lab/hero-3d` is a spike, not production code — a reminder to
  delete it once PORT-019/PORT-020 settle three.js's fate.
