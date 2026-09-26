---
id: PORT-020
title: "Accents 3D contextuels (Safran three.js, Quimesis three.js — voir décision)"
group: corentin
machine: asus_corentin
milestone: M5 — Accents 3D
status: review
resumeAt: null
priority: P3
estimate: 2.0
confidence: medium
depends_on: [PORT-019, PORT-012]
parallel_safe: false
human_checkpoint: "Corentin confirme que les accents Safran et Quimesis restent fluides et ne dénaturent pas le contenu réel des projets"
created: 2026-09-26
---

# Accents 3D contextuels (Safran, Quimesis)

**Contexte** — Arbitrage d'origine : satellites/orbites (three.js) sur Safran,
mâchoire segmentée (VTK.js) sur Quimesis.

## ⚠️ Décision de raffinage : Quimesis en three.js, pas VTK.js

`@kitware/vtk.js` pèse ~14 Mo non empaqueté, n'a jamais été utilisé dans ce
repo, et rendre quelque chose de visuellement crédible avec demande de vraies
données de scan (maillage/volume) — aucune n'existe dans ce projet. Construire
un pipeline VTK.js complet pour un accent purement décoratif, sur une
bibliothèque non éprouvée ici, a été jugé disproportionné par rapport au gain
pour cette session. **Choix retenu** : les deux accents utilisent three.js
(déjà éprouvé par PORT-003/019), ce qui garde une seule bibliothèque 3D sur
tout le site plutôt que d'en ajouter une seconde, bien plus lourde, pour une
seule page. Quimesis reçoit un accent en fragments tétraédriques wireframe
disposés en arc (évoque une segmentation, sans prétendre être un rendu VTK.js
réel). **Ouvert à révision** si Corentin préfère une vraie intégration VTK.js
plus tard — ce ticket ne la ferme pas définitivement, il documente pourquoi
elle n'a pas été tentée maintenant.

## Investigation

- `HeroCanvas`/`useDesktopMotionGate` (PORT-019) extraits en hook partagé
  (`src/components/useDesktopMotionGate.ts`) pour que les 3 accents (hero,
  Safran, Quimesis) ne divergent jamais dans leur logique de garde.
- Le gabarit `ProjectPage.tsx` n'a pas de zone de fond dédiée comme le hero —
  plutôt que de risquer une nouvelle régression de positionnement absolu
  (déjà rencontrée et corrigée en PORT-019), les accents sont en **flux
  normal**, `float-right` à côté du titre (`h-40 w-40`, `hidden lg:block`),
  le texte s'enroule autour naturellement. Aucun `position: absolute` utilisé
  ici — évite toute la classe de bugs de contexte de positionnement.
- **Bug évité pendant l'implémentation** : le point d'insertion initial
  mettait le wrapper `float-right` dans `ProjectPage.tsx` directement (pas
  dans `ProjectAccent3D`), donc une boîte vide de 160×160 aurait été
  réservée sur les 10 pages projet SANS accent (le composant interne rend
  `null`, mais le wrapper autour restait affiché). Corrigé en déplaçant le
  wrapper à l'intérieur de `ProjectAccent3D`, qui ne rend absolument rien
  (pas même un `div`) quand `ACCENTS[href]` n'a pas d'entrée.

**Livrable** — Safran et Quimesis affichent chacun leur accent 3D contextuel
(three.js), avec le même filet de sécurité que le hero.

**Critères d'acceptation**
- [x] Page Safran : sphère wireframe centrale + 3 satellites orbitant à
      vitesses différentes, conditionnel ≥1024px, rien sinon.
- [x] Page Quimesis : accent en fragments wireframe arqués (three.js, voir
      décision ci-dessus — pas VTK.js), même filet de sécurité.
- [x] Aucun des deux accents ne casse le fil d'Ariane / bloc "En bref" du
      gabarit — vérifié visuellement, les deux restent intacts et lisibles.
- [x] Aucune des 10 autres pages projet ne réserve d'espace vide (`ACCENTS`
      est un lookup par `href`, absent = aucun rendu).

**Files**
- Nouveau : `src/components/useDesktopMotionGate.ts` (extrait de
  `HeroCanvas.tsx`), `src/components/SafranAccent.tsx`,
  `src/components/QuimesisAccent.tsx`, `src/components/ProjectAccent3D.tsx`.
- Modifié : `src/components/HeroCanvas.tsx` (refactor pour consommer le hook
  partagé, comportement inchangé), `src/components/ProjectPage.tsx` (un
  point d'insertion).

## Vérification

- `npm run lint`, `npx tsc --noEmit`, `npm run build` : propres, 15 routes.
- Desktop (fenêtre réelle 2048px, `claude-in-chrome`) : accent Safran visible
  et animé (capture zoomée confirmant sphère + satellite) sur
  `/internships/safran` ; accent Quimesis visible (fragments en arc) sur
  `/internships/quimesis` ; **zéro canvas** sur `/research/sncf` (page sans
  accent défini), confirmant qu'aucun chunk three.js n'y est chargé (le
  `dynamic()` n'est jamais déréférencé si `ACCENTS[href]` est absent).
- Fil d'Ariane et bloc "En bref" intacts sur Safran (vérifié visuellement).
- **Non vérifié en conditions réelles** (même limite que PORT-019) : le repli
  <1024px — l'outil de redimensionnement de fenêtre ne change pas
  `window.innerWidth` dans cet environnement. Le garde est le même code
  partagé que celui déjà utilisé par le hero (PORT-019), dont le
  non-chargement du chunk a été confirmé par analyse du bundle.

**Statut : `review`**.
