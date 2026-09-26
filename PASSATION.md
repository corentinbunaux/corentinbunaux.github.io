# Handover

> Written at the end of each session by `/passation`, read at the start of the
> next by `/reprise`. This file replaces re-reading a long conversation: it is
> the small, durable memory of the project.
>
> Keep it under ~60 lines. It is loaded every session; it is not a logbook.
> Archive older entries under `.claude/passations/YYYY-MM-DD-<slug>.md`.

**Session**: 2026-09-26 · **Tickets**: PORT-006/007/009/010/011/012/013/014/015/016 · **Status**: jalons M2+M3 fermés

## Objective

Fermer M2 (design system) et M3 (contenu) en parallélisant tout ce qui n'avait
pas de conflit de fichier, en séquentiel pour le reste (PORT-006→009 sur
`navbar.jsx`, PORT-012→013 sur le gabarit de page projet).

## What changed

10 tickets mergés dans `refonte-2026`. Points marquants :
- Navbar accessible (boutons sémantiques) + restructurée (Profil/Expériences/
  Projets/À propos), wired à la nouvelle section Parcours.
- `ProjectPage.tsx` remplace `project.tsx` (supprimé) sur les 12 routes —
  fini le `window.location.pathname`.
- Filtres Projets (`category`/`featured` dans `src/data/projects.ts`).
- Roue d'icônes du hero : `setInterval` 10ms → animation CSS pure
  (13,1s → 2,6s de main-thread selon Lighthouse).
- CTA "Télécharger le CV" retiré partout (pas de PDF disponible).

## What failed

- **Corruption d'encodage** (vague précédente, PORT-005) : ne pas éditer un
  fichier à texte français via un outil qui ne garantit pas l'UTF-8 sans BOM.
  Comparer le diff plutôt que relire visuellement pour l'attraper.
- **Worktrees imbriqués non nettoyés** ont fait exploser `eslint .` à ~800
  erreurs (ESLint lintait `.next`/`node_modules` des autres worktrees) —
  `git worktree remove --force --force` + `rm -rf` systématiquement après
  chaque merge, jamais laissé traîner.
- **Lighthouse en environnement sandboxé** : scores de performance non
  fiables (82-86 sur deux runs identiques) — à refaire sur le site déployé.

## Open questions

Trois bugs pré-existants trouvés et documentés (pas corrigés, hors périmètre
de leur ticket d'origine) : PORT-022 (scroll `behavior:'smooth'` ne scrolle
jamais), PORT-023 (hiérarchie de titres h1→h3 invalide site entier), le
`body{overflow-x:hidden}` qui casse `position:sticky` (noté dans
`ARCHITECTURE.md`, pas encore de ticket dédié).

## Next step

**Attendre les checkpoints humains avant M4/M5** (voir liste ci-dessous) —
ne pas empiler i18n/three.js sur du contenu pas encore relu. Une fois relu :
`/ticket PORT-017` (infra i18n) ou trancher le GO/NO-GO three.js
(`/lab/hero-3d`, `.claude/tickets/PORT-003.md`) pour débloquer PORT-019.

## Do not

- Ne pas toucher `public/img/Avatar_Coco.png` (non suivi, hors sujet).
- Ne pas repasser ESLint en `^10` (crash avec `eslint-config-next`).
- Ne pas éditer `public/img`/`public/logos` à la main — régénérer via
  `npm run optimize:images`.

## Checkpoints humains en attente (10)

PORT-001/002/003/004/005 (Lighthouse+navigateur sur la nouvelle stack),
PORT-006 (focus clavier), PORT-007 (relancer Lighthouse hors sandbox),
PORT-009/010/011/014/015 (relecture visuelle/contenu), **PORT-016 : relire
le contenu GCII/Enedis dans `src/data/projects.ts`** (le plus important —
c'est un emploi en cours).
