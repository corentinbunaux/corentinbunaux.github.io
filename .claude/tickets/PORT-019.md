---
id: PORT-019
title: "Hero three.js (GO confirmé par Corentin)"
group: corentin
machine: asus_corentin
milestone: M5 — Accents 3D
status: review
resumeAt: null
priority: P2
estimate: 1.5
confidence: high
depends_on: [PORT-003, PORT-009]
parallel_safe: false
human_checkpoint: "Vérifier au navigateur (desktop ≥1024px) que le maillage réagit au curseur sans ralentir le reste de la home ; réduire la fenêtre sous 1024px et émuler prefers-reduced-motion pour confirmer sa disparition propre"
created: 2026-09-26
---

# Hero three.js

**Contexte** — PORT-003 a rendu son verdict : **GO**, confirmé par Corentin
("je ne vois pas de lags dans le navigateur, donc on peut partir là-dessus").
Ce ticket porte le prototype (`src/components/lab/HeroMesh.tsx`) en
production, dans le hero réel (`homepage.jsx`), avec le même filet de
sécurité que le prototype.

## Investigation

- Le hero actuel (`homepage.jsx`) n'a pas d'emplacement dédié pour un canvas
  3D façon maquette (deux cercles côte à côte) — la mise en page a évolué
  pendant M3 (PORT-009 y a ajouté le CTA, PORT-005 la photo). Plutôt que de
  restructurer une mise en page déjà stabilisée, le maillage devient un
  **calque de fond décoratif** derrière tout le contenu du hero
  (`<div className="container-fluid h-full">`), en `position: absolute`,
  `pointer-events: none` (ne doit jamais intercepter les clics du CTA/nav) et
  `aria-hidden` (purement décoratif).
- Conséquence sur le critère "repli statique (image fixe)" du brouillon
  initial : comme le maillage est un calque de fond, pas un élément qui
  occupe sa propre place dans la mise en page, son repli n'a pas besoin
  d'être une image de remplacement — **ne rien afficher** est déjà le repli
  correct (le hero est déjà complet et fonctionnel sans lui, c'est
  littéralement son état actuel avant ce ticket). Documenté ici plutôt que
  fabriqué une image de repli dont personne n'a besoin.
- `src/components/lab/HeroMesh.tsx` prend déjà `onFrame` en prop optionnelle
  (pour le compteur FPS du spike) — repris tel quel, `onFrame` restera juste
  non fourni en production.

**Livrable** — Le hero affiche le maillage three.js réactif au curseur en
calque de fond, uniquement ≥1024px et hors `prefers-reduced-motion`, sans
jamais intercepter les interactions du hero.

**Critères d'acceptation**
- [ ] `src/components/HeroMesh.tsx` (production) — copie du composant three.js
      du spike, sans changement de comportement.
- [ ] `src/components/HeroCanvas.tsx` (nouveau) — le garde `matchMedia`
      (`(min-width: 1024px)` ET `(prefers-reduced-motion: reduce)`, évalué
      *avant* l'import dynamique) + `next/dynamic({ ssr:false })` +
      `pointer-events-none` + `aria-hidden="true"`.
- [ ] `homepage.jsx` rend `<HeroCanvas />` en tout premier enfant du
      conteneur du hero (derrière tout le reste, via l'ordre du DOM).
- [ ] Sous 1024px ou avec `prefers-reduced-motion: reduce` : aucun chunk
      `three` chargé (vérifiable dans l'onglet Network).
- [ ] Aucune régression sur le CTA "Voir mes projets", les liens sociaux, ni
      la roue d'icônes (le maillage est purement un calque de fond, jamais
      au-dessus, jamais cliquable).
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` propres.
- [ ] `src/app/lab/hero-3d/`, `src/components/lab/` (spike PORT-003)
      supprimés une fois la version production vérifiée — ne pas garder les
      deux implémentations en parallèle.

**Files**
- Nouveau : `src/components/HeroMesh.tsx`, `src/components/HeroCanvas.tsx`.
- Modifié : `src/components/homepage.jsx` (un seul point d'insertion).
- Supprimé : `src/app/lab/hero-3d/**`, `src/components/lab/**`.
- Ne pas toucher : `src/app/app.css`, `navbar.jsx`, `profileSection.jsx`.

**Approche**
1. Copier `HeroMesh.tsx` du spike vers `src/components/`, sans changement
   fonctionnel.
2. Écrire `HeroCanvas.tsx` (garde + dynamic import + wrapper `pointer-events-none`).
3. Insérer `<HeroCanvas />` dans `homepage.jsx`.
4. Supprimer le spike (`src/app/lab/hero-3d/`, `src/components/lab/`).
5. Vérifier au navigateur : ≥1024px (maillage visible et réactif, CTA toujours
   cliquable), <1024px et `prefers-reduced-motion` émulé (rien, onglet Network
   sans chunk `three`).
6. `npm run lint && npx tsc --noEmit && npm run build`.

**Test plan** — Aucune suite de tests. Vérification manuelle au navigateur
(`claude-in-chrome`) : capture desktop avec curseur en mouvement, capture
<1024px, requêtes réseau filtrées sur "three" dans les deux cas.

**Out of scope** — Les accents Safran (orbites/satellites) et Quimesis
(mâchoire VTK.js) — PORT-020. Le compteur de FPS du spike (outil de mesure,
pas un besoin de production).

**Risks** — `pointer-events: none` doit être posé sur le calque racine, pas
seulement sur le canvas WebGL lui-même, sinon un clic sur le CTA pourrait
être intercepté par une div intermédiaire du composant three.js.

## Vérification

- `npm run lint`, `npx tsc --noEmit`, `npm run build` : propres, 15 routes
  (spike `/lab/hero-3d` supprimé).
- **Bug trouvé et corrigé pendant l'implémentation** : le calque `absolute
  inset-0` du canvas se positionnait par rapport à l'ancêtre positionné le
  plus proche — comme `container-fluid` (le conteneur direct) et `#home`
  n'avaient ni l'un ni l'autre de `position` déclarée, le calque débordait
  largement au-delà du hero (vérifié visuellement, capture avant/après).
  Corrigé en ajoutant `className="relative"` à `<section id="home">` dans
  `src/app/page.tsx` (un seul mot-clé, aucun autre changement visuel :
  `#home` établit déjà sa propre boîte via `min-height: 100svh`, donc la
  rendre positionnée ne change rien pour les autres éléments absolus qui s'y
  trouvent déjà). Vérifié après coup : `canvas.getBoundingClientRect().height`
  == `#home.getBoundingClientRect().height` exactement (983px).
- Desktop (fenêtre réelle 2048px) : canvas présent, réactif au curseur, CTA
  "Voir mes projets" reste cliquable (`elementFromPoint` sur le bouton
  renvoie bien le bouton, pas le canvas — `pointer-events-none` fonctionne).
- **Non vérifié en conditions réelles** : le repli <1024px et
  `prefers-reduced-motion`. L'outil de redimensionnement de fenêtre du
  navigateur ne change pas `window.innerWidth` dans cet environnement (même
  limite que rencontrée par l'agent PORT-013) ; simuler `matchMedia` par
  patch runtime n'a pas fonctionné de façon fiable non plus. Vérifié à la
  place par lecture de code (garde identique à celui du spike PORT-003,
  déjà éprouvé) et par analyse du bundle de build : le chunk contenant le
  code `three.js` (524 Ko, marqueurs `THREE`/`WebGLRenderer` confirmés)
  n'est référencé nulle part dans `out/index.html` — il n'est donc chargé
  que par l'import dynamique conditionnel, jamais au chargement initial.
  **Reste au point de contrôle humain** : confirmer sur un vrai petit écran
  ou en réduisant vraiment la fenêtre.

**Statut : `review`**.
