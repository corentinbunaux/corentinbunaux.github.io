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
| `src/app/{cpge_tipe,emse,internships,personnal,research}/**` | Static case-study pages, one per project (e.g. `internships/safran`, `emse/minesweeper`) | Each is its own route |
| `src/components/` | Shared section components (`homepage`, `navbar`, `profileSection`, `projectsSection`, `aboutmeSection`, `footer`, `project`, `federer`) | Mix of `.jsx` and `.tsx` |
| `public/` | Static assets (images, icons) served as-is | |
| `tests/` | Does not exist — no test suite is configured | |
| `scripts/` | Does not exist | |

## Data flow

Fully static/client-side: no API routes, no external data fetching. Content
(text, images) is hardcoded in the section components and the per-project
pages under `src/app/`. The only runtime logic is DOM measurement (`useEffect`
+ `offsetTop`) to drive the navbar's scroll-spy behaviour.

## Key decisions

| Date | Decision | Why | Alternatives rejected |
| --- | --- | --- | --- |
| — | Next.js App Router with a single scrolling page plus separate static routes per project | Simple portfolio, no need for a CMS or dynamic routing | — |

## Invariants

- The four section anchors (`#home`, `#profile`, `#portfolio`, `#about`) must
  keep those exact `id`s — `navbar.jsx` and `page.tsx` depend on them for
  scroll-spy offsets.
- No backend/API routes — this app is meant to stay static-hostable (GitHub
  Pages style), see the commented `output: "export"` in `next.config.mjs`.

## Known weak points

- No test suite (`npm test` is not defined) and no CI test gate — regressions
  are caught only by manual/visual checks.
- Scroll-offset logic recomputes on `resize` only, not on content/image load,
  so late-loading images can throw off `navbar` highlighting.
