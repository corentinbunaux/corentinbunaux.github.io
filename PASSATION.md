# Handover

> Written at the end of each session by `/passation`, read at the start of the
> next by `/reprise`. This file replaces re-reading a long conversation: it is
> the small, durable memory of the project.
>
> Keep it under ~60 lines. It is loaded every session; it is not a logbook.
> Archive older entries under `.claude/passations/YYYY-MM-DD-<slug>.md`.

**Session**: 2026-09-26 (soir) · **Tickets**: PORT-019/020/021/017/018 · **Status**: M4+M5 fermés, refonte quasi complète

## Objective

Finir M5 (three.js, GO confirmé par Corentin) et M4 (i18n) en parallélisant,
sous contrainte de budget de session — objectif : que Corentin voie un rendu
complet en fin de session avant de donner des retours détaillés.

## What changed

- **M5** : hero three.js en production (plus de spike `/lab`), accents
  contextuels Safran (orbites) et Quimesis (fragments, three.js — VTK.js
  écarté, décision documentée dans PORT-020/ARCHITECTURE.md), aucune
  régression perf confirmée par capture réseau réelle sous émulation mobile.
- **M4** : infra i18n complète + traduction FR/EN de tout le site en un seul
  passage (`src/i18n/`, `LocalizedText` sur `src/data/projects.ts`). Toggle
  vérifié fonctionnel sur la home ET les pages projet (bug trouvé et corrigé
  en session : le toggle n'existait qu'dans `navbar.jsx`, absent des pages
  projet — ajouté dans le fil d'Ariane de `ProjectPage.tsx`).
- Photo du hero remplacée par l'avatar de Corentin (modification manuelle de
  sa part, prise en compte).

## What failed

- Aucun échec bloquant cette fois. Deux "quasi-échecs" évités par
  vérification avant de conclure : (1) le score Lighthouse ne bougeait pas
  après le fix du hero — vérifié que c'était du bruit d'environnement, pas
  une régression ; (2) le toggle i18n semblait complet mais ne marchait que
  sur la home — trouvé en testant réellement une page projet, pas en faisant
  confiance au rapport de l'agent délégué.

## Open questions

Rien de bloquant. `PORT-018` reste `blocked` intentionnellement — c'est la
relecture de Corentin, pas un travail Claude.

## Next step

**Le backlog M1-M5 est épuisé.** Il reste : les checkpoints humains cumulés
(liste ci-dessous), et 3 bugs pré-existants documentés mais non corrigés
(PORT-022 scroll fluide, PORT-023 hiérarchie de titres, sticky "En bref" —
tous dans `ARCHITECTURE.md` § Known weak points). Aucun n'empêche de voir le
rendu complet.

## Do not

- Ne pas toucher `public/img/Avatar_Coco.png`.
- Ne pas repasser ESLint en `^10`.
- Ne pas régénérer `public/img`/`public/logos` à la main.
- Ne pas ajouter `@kitware/vtk.js` sans en reparler — décision déjà pesée.

## Checkpoints humains en attente (Corentin)

Le plus important : **PORT-018** (relire les traductions FR/EN, notamment
GCII/Enedis) et **PORT-016** (relire le contenu GCII/Enedis lui-même).
Ensuite, dans l'ordre du backlog : PORT-001 à 015, 019, 020 (voir chaque
`human_checkpoint` dans `.claude/tickets/`). Un point notable signalé par
l'agent i18n : le texte source contenait "score TOIEC" (faute) — gardé tel
quel en français, corrigé en "TOEIC" côté anglais, pas propagé.
