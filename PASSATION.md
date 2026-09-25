# Handover

> Written at the end of each session by `/passation`, read at the start of the
> next by `/reprise`. This file replaces re-reading a long conversation: it is
> the small, durable memory of the project.
>
> Keep it under ~60 lines. It is loaded every session; it is not a logbook.
> Archive older entries under `.claude/passations/YYYY-MM-DD-<slug>.md`.

**Session**: 2026-09-26 · **Ticket**: PORT-001 · **Status**: review (attente checkpoint humain)

## Objective

Corriger l'export statique cassé (`output: "export"` était commenté alors que
la CI publie déjà `./out`) et ajouter un gate CI minimal (lint/typecheck/build).

## Problem statement

Confirmé : le build ne produisait pas `out/` avant ce ticket. Découverte non
présente dans le brouillon initial du ticket : `next/image` est déjà utilisé
(`homepage.jsx`, roue d'icônes) et l'optimiseur par défaut est incompatible
avec `output: "export"` — il fallait aussi `images.unoptimized: true`, sinon
le build casse dès l'activation de l'export.

## What changed

| File | Change |
| --- | --- |
| `next.config.mjs` | `output: "export"` activé + `images.unoptimized: true` ajouté |
| `.github/workflows/ci.yml` | Nouveau : lint + `tsc --noEmit` + build sur push/PR |
| `ARCHITECTURE.md` | Invariants/points faibles mis à jour (export forcé, gate CI) |
| `.claude/tickets/PORT-001.md` | `status: review` |

## What failed

`npm run build` a d'abord échoué (`'next' n'est pas reconnu`) : `node_modules`
n'était pas installé. Corrigé par `npm ci` avant de rebuilder — pas une
impasse, juste un pré-requis manqué.

## Open questions

`npm ci` signale 16 vulnérabilités (1 critique) dans les dépendances
actuelles — hors périmètre de ce ticket, pas corrigé. À décider : un futur
ticket dédié, ou traité en marge de PORT-002 (upgrade Next/React) ?

## Next step

Pousser la branche `fix/PORT-001-static-export-ci`, ouvrir une PR vers
`refonte-2026`, vérifier dans l'onglet Actions que `nextjs.yml` et `ci.yml`
passent tous les deux au vert, puis merger. Ensuite : `/ticket PORT-002`
(upgrade Next 15 + React 19).

## Do not

- Ne pas toucher `public/img/Avatar_Coco.png` — non trackée, sans rapport
  avec ce ticket, semble être un travail en cours ailleurs.
- Ne pas lancer `npm audit fix --force` sans validation — casserait des
  versions juste avant l'upgrade Next/React de PORT-002.
