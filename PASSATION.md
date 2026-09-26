# Handover

> Written at the end of each session by `/passation`, read at the start of the
> next by `/reprise`. This file replaces re-reading a long conversation: it is
> the small, durable memory of the project.
>
> Keep it under ~60 lines. It is loaded every session; it is not a logbook.
> Archive older entries under `.claude/passations/YYYY-MM-DD-<slug>.md`.

**Session**: 2026-09-26 · **Tickets**: PORT-003, PORT-004, PORT-005, PORT-008 · **Status**: review (4 checkpoints humains en attente)

## Objective

Faire tourner en parallèle les 4 tickets débloqués par PORT-002 (M1 fini), en
worktrees git isolées, puis fusionner dans `refonte-2026`.

## Problem statement

Les 4 agents ont crashé sur la limite de session Claude (quota, pas un bug de
logique) avant de terminer. Reprise après reset : le code de chacun était
quasi fini, juste pas commité/vérifié jusqu'au bout.

## What changed

| File | Change |
| --- | --- |
| `src/app/app.css`, `tailwind.config.js` | PORT-004 : tokens de surface/bordure/focus, `--second-text` → `#999999` (WCAG AA), `vh` → padding, `justify`→`left`, scrollbar visible |
| `src/data/projects.ts` (nouveau) | PORT-008 : 12 projets typés (11 existants + GCII/Enedis), remplace le tableau de `projectsSection.jsx` |
| `scripts/optimize-images.mjs`, `src/components/optimizedImage.tsx`, `assets/images-src/**` | PORT-005 : AVIF+WebP générés par `sharp` (public/ : 9,3 Mo → ~1,7 Mo) |
| `src/app/lab/hero-3d/**` | PORT-003 : spike three.js isolé, GO/NO-GO **pas encore tranché** |
| `.gitignore`, `eslint.config.mjs` | Ignorer `.claude/worktrees/` (voir « What failed ») |

## What failed

1. **Corruption d'encodage** : la branche originale de PORT-005 a ré-encodé en
   UTF-8 double tout le texte français de `projectsSection.jsx` en l'éditant
   (« études » → « Ã©tudes »), + BOM ajouté. Diagnostiqué via `git diff` (les
   lignes non touchées restaient correctes). Cette branche n'a **pas** été
   fusionnée ; le travail a été rejoué à la main sur `src/data/projects.ts`
   (propre, issu de PORT-008). Si ça se reproduit : comparer le diff plutôt
   que relire, ne jamais éditer ce fichier via un outil qui ne garantit pas
   l'UTF-8 sans BOM.
2. **`eslint .` a rapporté ~800 erreurs après le merge** : les 4 worktrees
   (`.claude/worktrees/agent-*`) étaient restées imbriquées dans le checkout
   principal, chacune avec son propre `.next/` plein de code minifié. Corrigé
   par suppression des worktrees (`git worktree remove`) + ignore ESLint
   dédié. Si `eslint .` explose soudainement : vérifier `git worktree list`.

## Open questions

- **PORT-003 verdict GO/NO-GO non tranché** — outil de navigateur indisponible
  cette session. Corentin doit lancer `npm run dev`, ouvrir `/lab/hero-3d`.
- `.claude/settings.json` a été modifié sans qu'on le demande (deny-list
  `curl|sh` → `sh:*`/`bash:*`) par un des agents parallèles ; reverté sans
  commit. À surveiller si ça se reproduit.

## Next step

4 checkpoints humains à faire (voir chaque ticket PORT-003/004/005/008 pour le
détail), puis `/ticket PORT-010` ou `PORT-011` (parallélisables, dépendent
seulement de PORT-008).

## Do not

- Ne pas re-tenter le codemod `@next/codemod` (voir passation archivée).
- Ne pas repasser ESLint en `^10` (voir passation archivée).
- Ne pas éditer `public/img/`/`public/logos/` à la main — régénérer via
  `npm run optimize:images` depuis `assets/images-src/`.
