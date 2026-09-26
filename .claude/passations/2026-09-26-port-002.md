# Handover

> Written at the end of each session by `/passation`, read at the start of the
> next by `/reprise`. This file replaces re-reading a long conversation: it is
> the small, durable memory of the project.
>
> Keep it under ~60 lines. It is loaded every session; it is not a logbook.
> Archive older entries under `.claude/passations/YYYY-MM-DD-<slug>.md`.

**Session**: 2026-09-26 · **Ticket**: PORT-002 · **Status**: review (attente checkpoint humain)

## Objective

Passer le repo sur la dernière stack stable (Next 16 + React 19) sans toucher
au contenu, en gardant l'export statique et le gate CI de PORT-001 verts.

## Problem statement

Le brouillon du ticket ne parlait que d'un bump de versions. En réalité
Next 16 **supprime `next lint`** : sans migration ESLint (flat config + CLI
directe), le gate CI créé en PORT-001 casse. La migration ESLint était donc
inséparable de l'upgrade, d'où l'estimation passée de 1.5 à 2.5 demi-journées.

## What changed

| File | Change |
| --- | --- |
| `package.json` | next 16.3.6, react/react-dom 19.3.0, eslint ^9, eslint-config-next 16.3.6, `typescript` ajouté en explicite, script `lint` → `eslint .` |
| `.eslintrc.json` → `eslint.config.mjs` | Migration flat config ; `react/no-unescaped-entities: off` conservée, `react-hooks/set-state-in-effect` ramenée en `warn` |
| `tsconfig.json` | `moduleResolution: bundler` (node10 déprécié en TS 6) ; `jsx`/`target`/`include` réécrits par `next build` lui-même |
| `ARCHITECTURE.md`, `CLAUDE.md` | Stack et décisions à jour |

## What failed

1. **Codemod officiel inutilisable ici** : `npx @next/codemod@canary upgrade latest`
   (puis `... upgrade 16.3.6`) répond
   `Invalid revision provided: "latest" (resolved to "latest")` en mode non
   interactif. Migration faite à la main à la place — ne pas réessayer le
   codemod dans ce contexte.
2. **ESLint 10 incompatible** : `eslint-config-next@16.3.6` déclare pourtant
   `eslint >= 9.0.0` en peer, mais plante au runtime avec
   `TypeError: scopeManager.addGlobals is not a function`. Rester en `^9`
   malgré le warning npm « eslint@9.39.5 is no longer supported ».

## Open questions

- ~~Node 20 en fin de vie dans les workflows CI~~ → tranché le 2026-09-26 :
  les deux workflows sont passés en **Node 24** (LTS actif, aligné sur le
  Node local de la machine de dev).
- TypeScript 7.0.2 existe ; le repo est épinglé en `^6.0.3` (version qui
  arrivait déjà par transitivité). Upgrade TS majeur à traiter à part.
- `npm audit` : 7 vulnérabilités (1 low, 1 moderate, 5 high) non traitées.

## Next step

Lancer en parallèle les 4 tickets débloqués par PORT-002, chacun sur sa propre
branche depuis `refonte-2026` : PORT-003 (spike three.js), PORT-004 (tokens
CSS), PORT-005 (images `next/image`), PORT-008 (`src/data/projects.ts`).

## Do not

- Ne pas toucher `public/img/Avatar_Coco.png` — non trackée, sans rapport.
- Ne pas passer ESLint en 10.x (voir « What failed » ci-dessus).
- Ne pas « corriger » `react-hooks/set-state-in-effect` dans `project.tsx` :
  ce fichier est réécrit entièrement par PORT-012.
