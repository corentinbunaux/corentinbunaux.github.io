# Architecture — corentinbunaux.github.io

> Keep this file true. It is the map Claude reads instead of exploring the whole
> tree, so a stale entry here costs real tokens and real mistakes.

## Purpose

A single-page Next.js portfolio for Corentin Bunaux, rebuilt against the
"REFONTE" Canva mockup (`design/mockups/02-refonte.png`, `docs/CADRAGE.md`),
then reworked once more after a user-acceptance round
(`docs/PLAN-RECETTE.md`, tickets PORT-024 to PORT-051, milestone **M6**). One
route (`/`) renders a stack of sections (hero+profile, journey, projects,
about, footer) linked by native anchors, plus one static route per project
under `src/app/*`. No backend, no database, no CMS.

## Map

| Path | Holds | Notes |
| --- | --- | --- |
| `src/app/page.tsx` | Assembles the five home sections (`#home`, `#journey`, `#portfolio`, `#about`, `#footer`) behind a shared `<SiteHeader variant="home" />` | Client component; `#profile` no longer exists (merged into the hero, PORT-037) |
| `src/app/layout.tsx` | Root HTML shell, inlines `THEME_INIT_SCRIPT` (anti-flash) before hydration, page metadata | |
| `src/app/{cpge_tipe,emse,internships,personnal,research,work}/**` | One static route per project (12 total) | Each imports `projects` from `src/data/projects.ts`, resolves its entry by `href`, loads its Markdown article via `src/lib/articles.ts`, and renders `<ProjectPage project={...} article={...} />` |
| `src/data/projects.ts` | Typed single source of truth for all 12 projects: `category`/`featured`, `period`/`location`, `role`/`team`/`result`, every prose field a `LocalizedText` (`{fr, en}`) resolved via `localizeProject()` | No more `pageContent` field — long-form article text moved to `content/projects/` (PORT-036) |
| `src/data/education.ts` | Formation entries (Mines ISMIN, CPGE PSI/PCSI, Bac), `LocalizedText`, integer years | New in PORT-030, feeds the Parcours "Formation" track |
| `content/projects/<href>.<fr\|en>.md` | One Markdown file per project per language (`## Titre` sections + paragraphs, nothing else interpreted) | Read at build time by `src/lib/articles.ts`; FR/EN must have the same section count or `npm run build` fails naming the offending file (PORT-036); format documented in `content/projects/README.md` |
| `src/lib/articles.ts`, `articleTypes.ts` | `parseArticle()`/`loadArticle()`: build-time Markdown reader for the above, throws `file:line` on anything outside the tiny supported subset | |
| `src/theme/` | `ThemeContext.tsx` (provider + `useTheme()`, `data-theme` on `<html>`), `themeScript.ts` (`THEME_INIT_SCRIPT`, inlined in `<head>`, storage key `corentinbunaux.theme`), `useThemeColors.ts` (resolves CSS tokens to hex, for three.js materials) | PORT-026. Default = system preference; an explicit choice persisted to `localStorage` takes priority over it |
| `src/components/SiteHeader.tsx` | Single header used on the home page and every project page (`variant="home" \| "project"`): native-anchor nav, language menu (globe icon + code, opens Français/English), theme toggle (sun/moon), current-section underline via `IntersectionObserver` | Replaces `navbar.jsx` (deleted, PORT-028) and the duplicated `LanguageToggle`; underline added by PORT-034 |
| `src/components/hero/` | `HeroVisual.tsx` (avatar + wireframe-globe panel, mockup zone ①), `HeroGlobe.tsx` (the three.js scene, built on `ThreeStage`), `heroIcons.js` (icons orbiting the globe, reused from the old CSS wheel) | PORT-037 (layout, Profil merged into hero) + PORT-044 (3D globe). Desktop only (`useDesktopMotionGate`); the avatar's slot never shifts when the gate resolves |
| `src/components/journey/` | `TrackIcon.tsx` (flat icon), `TrackIcon3D.tsx` (small three.js diploma/briefcase icon atop each track) | PORT-030 (two tracks: Expérience / Formation, both newest-first) + PORT-050 (3D icons) |
| `src/components/demos/` | `ThreeStage.tsx` (shared three.js scaffold: renderer, resize, off-screen pause, dispose, theme-triggered remount), `DemoSection.tsx` (16:9 frame, desktop gate for 3D demos, `demos.desktopOnly` fallback text on mobile), `registry.ts` (`DEMOS: Record<href, DemoEntry[]>`, `ready` flag per demo), `demoIds.ts`, one component (+ optional stateless `<name>Logic.ts`) per demo | PORT-031 laid the scaffold; every demo ticket (038-050) fills only its own file and flips only its own `ready: true` line — see `docs/GUIDE-3D.md` |
| `src/components/demos/*Demo.tsx` (12 demos across 7 projects) | `SafranEarthDemo` (Earth + satellites + stylized fighter), `QuimesisFragmentsDemo` (kept as Corentin's original animation), `QuimesisJawDemo` (interactive: `OrbitControls` + a hand-rolled `THREE.Curve` tooth arch), `SncfTrainDemo` + `SpaceTimeDemo` (2D), `MinesweeperDemo` (9×9, 10 mines), `GuardsDemo` (10×10 grid, one surveillant per target square allowed), `TypingDemo` (solo Dactylo Race), `PredictDemo` (autocomplete), `ParkingCarDemo`, `ExoArmDemo` | `kind: "3d"` demos are desktop-only; `kind: "2d"` demos (minesweeper, guards, typing, predict, space-time) run everywhere |
| `src/components/QuimesisAccent.tsx` | Still used — wrapped by `QuimesisFragmentsDemo.tsx`, the one contextual accent the plan explicitly kept as-is | |
| `src/components/ProjectPage.tsx` | Project-page template: breadcrumb, sticky "En bref" card (sticks at `--header-height + 1.5rem`, PORT-035), tech-logo pills in the article header (PORT-033), numbered article sections (from `content/projects/`), a `DemoSection` for projects that have one, gallery, prev/next nav (`UNROUTED_HREFS` guard) | Five tickets touch this file (028, 031, 033, 035, 036) — see the procedure's conflict table if editing it again |
| `src/components/journeySection.tsx` | Parcours: two side-by-side tracks (Expérience / Formation), each newest-first | Reads `period`/`location` off `projects.ts` and the new `education.ts` |
| `src/components/federer.jsx` | The "À propos" tennisman SVG; arm+racket redrawn as an isolated group (`#federer-arm`) so a state machine (`idle/flying/hit`) animates a swing when the ball arrives (PORT-043) | Ball aim corrected at click-time from measured refs (`ball_aim` over `ball_path`); realistic skin/hair-tone hex colors in this file are the documented "likeness" exception, not a token violation |
| `src/components/aboutmeSection.jsx` | Strict two-column grid (no more `columns-2` reflow bug), sudoku removed, interests split "current"/"archived" with `lucide-react` icons | PORT-029 |
| `src/components/` (rest) | `homepage.jsx`, `projectsSection.jsx`, `footer.jsx`, `Banner.jsx`, `optimizedImage.tsx`, `TechBadge.tsx`, `useDesktopMotionGate.ts` | `Banner.jsx`'s scrolling ticker is no longer rendered on the home page (replaced by the hero's tech pills) — only its `bannerElmts` icon map is still imported, by `TechBadge.tsx` and `projectsSection.jsx` |
| `src/i18n/` | `LanguageContext.tsx`, `dictionary.ts` (assembles `src/i18n/namespaces/*.ts` into one `Dictionary`), `types.ts` | PORT-024 split the former single `dictionary.ts` into one file per namespace (`header`, `hero`, `journey`, `about`, `profile`, `projectPage`, `demos`, `minesweeper`, `guards`, `typing`, `predict`, `navbar`, `footer`, `common`, `projects`) so tickets stop conflicting on one shared file |
| `scripts/optimize-images.mjs`, `scripts/generate-gcii-illustration.mjs` | Generate `public/img`/`public/logos` (AVIF+WebP) from `assets/images-src/`, and the fictional GCII/Enedis SVG illustration respectively | `npm run optimize:images`; the GCII visual is entirely generated (no real Enedis data — confidentiality) |
| `assets/images-src/`, `public/img/`, `public/logos/` | Image masters / generated web-ready assets | Never edited by hand |
| `tests/` | Does not exist — no test suite is configured | |

## Data flow

Fully static/client-side: no API routes. Structured data lives in
`src/data/projects.ts` and `src/data/education.ts`; long-form article prose
lives in `content/projects/*.md`, parsed at build time by `src/lib/articles.ts`
(a malformed Markdown file fails `npm run build`, naming the file — not a
silent fallback). Theme and language are read from `localStorage`
(`corentinbunaux.theme`, `corentinbunaux.language`) with a system-preference
default and an inline anti-flash script for theme. The current nav section is
derived live via `IntersectionObserver` (`SiteHeader.tsx`), not by measuring
`offsetTop` on mount/resize.

## Key decisions

| Date | Decision | Why | Alternatives rejected |
| --- | --- | --- | --- |
| 2026-09-26 | Next.js 16 + React 19, ESLint flat config, pinned `^9` | Current stable Next; `eslint-config-next@16.3.6` crashes on ESLint 10 | Next 15; ESLint 10 |
| 2026-09-26 | Images: masters in `assets/images-src/`, `sharp` generates AVIF+WebP, served via `<OptimizedImage>` | `next/image` performs no conversion under `images.unoptimized: true` (mandatory for static export) | `next/image` alone; AVIF-only `src` |
| 2026-09-26 | Project data in typed `src/data/projects.ts`; project pages via one shared component + explicit prop, not `[slug]` | Compiler-checked single source of truth; a dynamic route would need `generateStaticParams()` and redirects for 12 already-shared URLs | Untyped inline array; `[slug]/page.tsx` |
| 2026-09-26 | i18n: client-side context + `LocalizedText` fields on `Project`, not a parallel `projects.en.ts` | Keeps 100% static export; both languages next to each other can't silently drift apart | `next-intl`/`react-i18next`; mirrored file |
| 2026-09-27 | PORT-022 ("`behavior: 'smooth'` scroll never scrolls") closed as a **false positive** | The automation tab driving the check was backgrounded (`document.visibilityState === "hidden"`); Chrome does not animate a smooth scroll in a hidden tab. A foreground tab scrolls smoothly with no code change | Any code fix — none was needed |
| 2026-09-27 | Hero rebuilt to match the mockup: text left, avatar + one 3D scene right; the `#profile` section removed and merged into the hero; the scrolling tech `Banner` removed from the home page | The old hero had three concurrent animations (banner, background mesh, CSS wheel) — too busy; the mockup shows one hero+profile block | Keeping a separate `#profile` section; keeping the old CSS icon wheel |
| 2026-09-27 | Theme: `data-theme` on `<html>`, tokens redefined per theme, system-preference default, inline anti-flash script, three.js scenes read colors via `useThemeColors()` | Colors were hardcoded in several components and in the three.js scenes; doing the theme before new 3D scenes avoided redoing them | CSS-only `prefers-color-scheme` with no manual override |
| 2026-09-27 | One shared `SiteHeader` (home + every project page); nav via native anchors + CSS `scroll-behavior: smooth`; language control = a single globe-icon button opening a Français/English menu | The old `navbar.jsx` + breadcrumb `LanguageToggle` duplicated the control with inconsistent widths; PORT-022's real root cause (a backgrounded tab) meant native anchors were safe to adopt | JS-driven `window.scroll({behavior:"smooth"})` (works fine in a foreground tab, but needs a click handler per link) |
| 2026-09-27 | Long-form project text moved to `content/projects/<href>.<fr\|en>.md`, a tiny hand-rolled Markdown subset (`## ` headings + paragraphs only), read at build by `src/lib/articles.ts` | JSON was painful to hand-edit (escaping); a full Markdown library was an unneeded dependency for two constructs | A full Markdown/MDX pipeline; keeping `pageContent` inline in `projects.ts` |
| 2026-09-27 | GCII/Enedis visual is a generated, fictional SVG (`scripts/generate-gcii-illustration.mjs`) | The real Enedis network map is confidential | Any real network data |
| 2026-09-27 | Quimesis's jaw demo and Safran's Earth/satellites/fighter are three.js, built only from three's own geometries plus `three/examples/jsm/controls/OrbitControls`, and one public-domain NASA Blue Marble texture | No free/reliable 3D dental scan exists and a real one would be confidential; a Star-Wars-alike TIE fighter would be an IP issue — replaced by a generic, stylized winged fighter | A licensed/scanned mesh; a recognizable Star-Wars reference |
| 2026-09-27 | Per-project 3D/2D demos live in a full-width "Démo" section at the bottom of the project page (`src/components/demos/`), not a small floating accent next to the title | A 160px accent was too small for a train/parking car/jaw and overlapped the title | Keeping `ProjectAccent3D`-style floating accents |
| 2026-09-27 | 3D demos are desktop-only (`useDesktopMotionGate`, ≥1024px, no `prefers-reduced-motion`); 2D demos (minesweeper, guards, typing, predict, space-time) run everywhere | WebGL scene budget/complexity vs. simple DOM/SVG games | Shipping 3D on mobile |
| 2026-09-27 | Verifying 3D demos and cross-theme/mobile behaviour without a connected interactive browser: launch headless Chrome (`--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader`, a dedicated `--user-data-dir`) and drive it over the raw DevTools protocol via Node's native `WebSocket`, in a disposable script kept outside the repo | No browser extension was connected to several M6 sessions; this avoids adding a test/automation dependency | Skipping visual verification and asserting it was done anyway (would violate "no silent fallback") |

## Invariants

- Home sections keep exactly these `id`s: `#home`, `#journey`, `#portfolio`,
  `#about`, `#footer`. `SiteHeader`'s `useActiveSection` throws at runtime if
  any is missing on the home page. There is no `#profile` anymore.
- Nav links are native anchors (`<a href="#id">`) with
  `scroll-margin-top: var(--header-height)` on the targets, plus CSS
  `scroll-behavior: smooth` — no JS-driven `window.scroll()` for in-page nav.
- No backend/API routes — `output: "export"` + `images.unoptimized: true`.
- Every photo/logo goes through `<OptimizedImage src="/img/<name>" />`,
  backed by `src/data/imageManifest.json`; never edit `public/img`/
  `public/logos` by hand, regenerate via `npm run optimize:images`.
- `TechLogoId` (`src/data/projects.ts`) must stay in sync with the ids
  `bannerElmts` resolves in `Banner.jsx`; `TechBadge` throws on an unknown
  id, the projects-grid `TechPill` still drops it silently.
- Every project page goes through `ProjectPage.tsx`; there is no bespoke
  per-project component.
- A displayed string is either translated via `useTranslation()`
  (`src/i18n/namespaces/*.ts`) or, for per-project prose, a `LocalizedText`
  resolved by `localizeProject()` — never a hardcoded literal. A missing `en`
  key is a compile error, but nothing stops a brand-new hardcoded string from
  bypassing the dictionary entirely.
- Colors in `.tsx`/`.jsx` components come from CSS tokens (Tailwind classes
  like `bg-surface`, `text-main-text`, or `var(--my-green)`) or, in three.js
  code, from `useThemeColors()` — never a literal `#xxxxxx`. The only
  documented exceptions, both illustrative/realistic and unrelated to the
  theme: `federer.jsx`'s tennisman skin/hair tones, and
  `QuimesisJawDemo.tsx`'s tooth/gum colors (checked readable on both
  `--surface` values). `Banner.jsx`'s brand-logo colors are excluded from
  this rule the same way.
- Every three.js demo follows `docs/GUIDE-3D.md`: a module-level `setup`
  passed to `ThreeStage`, colors from `colors.*`, no external model files, no
  new dependency (only `three/examples/jsm/...` addons already shipped with
  `three`), < 60,000 triangles, animation driven by `elapsed`/`delta` (never
  `Date.now()`), no wheel/scroll capture. Enabling a demo means flipping only
  its own `ready` line in `src/components/demos/registry.ts`.
- A demo's `id` must exist in `demoIds.ts`, have an entry in `registry.ts`,
  and a caption in `src/i18n/namespaces/demos.ts` — the three stay in sync by
  convention, not by a compiler check.

## Known weak points

- No test suite (`npm test` is not defined) — regressions are caught by
  manual/visual checks and the `ci.yml` build/lint/typecheck gate.
- **Heading hierarchy is still invalid site-wide** (PORT-023, `status: draft`,
  not part of M6): sections use `h1` for their title and `h3` as a
  body-text style class, skipping `h2`. Untouched by M6 — needs its own pass.
- **No CV PDF exists** — the mockup's "Télécharger le CV" CTA stays absent
  from the hero and the footer. Untouched by M6.
- A code comment in `src/components/useDesktopMotionGate.ts` still names the
  old hero components by their retired names (`HeroMesh`/`HeroCanvas`) as
  historical context (crediting the hook's origin), not a live import.
  Harmless; worth a documentation-only cleanup pass if it becomes confusing.
- `src/app/app.css` still has a `#profile { ... }` rule (grouped with
  `#portfolio, #about`) targeting an id that no longer exists in the DOM
  since PORT-037 merged the Profil section into the hero. Dead but inert —
  the selector simply never matches. Low-priority cleanup.
- In `npm run dev` (Turbopack), every `next/dynamic({ssr:false})` chunk
  reachable from a page gets a `<script async>` in the initial HTML even if
  it never renders (noted independently in PORT-044 and PORT-045) — does not
  affect the static-export production build; would only matter to a future
  ticket wanting a strict dev-mode Network audit.
- FPS measurements taken during M6's 3D verification used headless Chrome
  under `--use-angle=swiftshader` (software rendering): the numbers recorded
  in PORT-046/047/048's journals are **not** comparable to
  `docs/GUIDE-3D.md` §4.3's ≥50fps target on a real GPU — treat them only as
  a smoke signal (catches something badly broken), not as a performance
  measurement. A re-check via a connected interactive browser
  (`claude-in-chrome`) on the dev machine's real GPU is still open.
- `docs/GUIDE-3D.md`'s `Page.captureScreenshot` recipe does not reliably
  capture a WebGL canvas's actual pixels under headless Chrome + SwiftShader
  when a `clip` region is used (returns a flat/blank image even with correct
  coordinates, per PORT-048) — a pixel-level visual check of a 3D scene
  still needs a real interactive browser.
- Several M6 tickets could not run their own required browser check during
  their session (no `claude-in-chrome` extension connected) and say so
  explicitly rather than claiming otherwise: PORT-026 (theme toggle/flash),
  PORT-028 (SiteHeader across themes/widths), PORT-031 (criteria 4-6 of the
  demo-section acceptance), PORT-037 (hero at 1280px/mobile). PORT-051's own
  cross-check (headless-Chrome contrast/overflow/console/broken-image audit
  across all 13 pages × 2 themes × 2 widths, see its Journal) covers the
  *readability* half of what's missing, not hands-on interaction (dragging
  the jaw demo, playing minesweeper, clicking through the language menu).
- **Lighthouse was not run for M6** (no interactive browser/Lighthouse CLI
  available in this session). The 82-86/100 mobile Performance figure from
  the M1-M5 recette (measured on this same shared sandboxed machine) is the
  last known value; not re-verified against `refonte-2026`'s current state.
- `federer.jsx`'s swing animation aims the ball using coordinates measured
  once at click time; a viewport resize during the ~1s flight is not
  tracked (PORT-043). At 360px, the "Échecs" interest label sits close to
  the top of the tennisman illustration (noted on a capture during PORT-043,
  outside that ticket's own scope).
- `GuardsDemo`'s rule that a surveillant may occupy a target square
  (covering it) but never a wall is an assumption from
  `docs/PLAN-RECETTE.md` §2, not yet confirmed against the original TIPE
  project by Corentin (PORT-039's `human_checkpoint`).
