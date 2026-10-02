---
id: PORT-060
title: "Systèmes embarqués — remplacer la fausse démo de créneau par les deux vraies démos"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: review
resumeAt: null
priority: P1
estimate: 1.5
confidence: low
model: sonnet
branch: feat/PORT-060-embedded-real-demos
depends_on: [PORT-053]
parallel_safe: true
human_checkpoint: "Vérifier que les deux démos correspondent bien à ce qui a été fait (balayage 180°+approche, puis scan+retour en L)."
created: 2026-09-28
---

# Systèmes embarqués — les deux vraies démos

**Procédure** : `docs/PROCEDURE-TICKET.md` + `docs/GUIDE-3D.md`.

## Retour de Corentin (`recette-utilisateur-2.md`, point 9)

> Pour les systèmes embarqués, notamment la démo avec le robot qui se gare,
> la démo est un peu erronée. Ce n'était pas vraiment un park assist comme
> tu l'as entendu. Il y avait 2 démos : une première qui faisait tourner le
> robot sur 180° en boucle, et qui le faisait avancer vers un obstacle si
> celui-ci était détecté à l'avant du robot pendant la boucle. Durant la
> seconde démo, le robot scannait son environnement autour, et lorsqu'il
> était déplacé, il allait se garer de nouveau au même emplacement
> rigoureusement, en suivant une trajectoire en forme de « L ».

Deux démos distinctes remplacent l'actuelle "voiture qui se gare en
créneau" (PORT-047, M6), qui décrivait mal ce qui a été construit.

## Fichiers

- Supprimés : `src/components/demos/ParkingCarDemo.tsx`,
  `src/components/demos/parkingCarLogic.ts`
- Créés : `src/components/demos/EmbeddedSweepDemo.tsx`,
  `src/components/demos/EmbeddedReturnDemo.tsx`
- Modifiés : `src/components/demos/demoIds.ts`,
  `src/components/demos/registry.ts` (bloc `emse/embedded`),
  `src/i18n/namespaces/demos.ts`

## Étapes

### 1. Retirer l'ancienne démo

- `git rm src/components/demos/ParkingCarDemo.tsx src/components/demos/parkingCarLogic.ts`.
  Si refusé : garder les fichiers, `ready: false` sur l'entrée à la place,
  signaler dans le journal, ne pas insister.
- `src/components/demos/demoIds.ts` : remplacer `"parking-car"` par
  `"embedded-sweep"` et `"embedded-return"` dans l'union `DemoId`.

### 2. Démo A — `EmbeddedSweepDemo.tsx` : balayage 180° + approche

Réutiliser le style et le gabarit `ThreeStage` déjà en place (voir
`docs/GUIDE-3D.md` pour les règles communes : couleurs via `colors.*`,
< 60 000 triangles, pas de capture de la molette). Réutiliser le
constructeur de roue de l'ancien `ParkingCarDemo.tsx` si Git l'a gardé
accessible (sinon reconstruire une roue simple, ce n'est pas le point
délicat de ce ticket).

Scène :
- Sol plat, un robot simple (corps + 2-4 roues) posé au centre.
- Un **capteur avant** (petit cône ou secteur transparent, comme dans
  l'ancienne démo de créneau) tourne en réalité avec le CORPS entier du
  robot (c'est le robot lui-même qui pivote, pas juste un capteur sur une
  tourelle — l'énoncé dit « faisait tourner le robot »).
- Cycle (boucle continue) :
  1. Le robot tourne sur lui-même, d'un côté à l'autre, entre -90° et +90°
     par rapport à son orientation de repos (donc 180° d'amplitude totale),
     lentement (~4-5 s pour l'aller-retour complet).
  2. Un obstacle (un simple cube ou cylindre) est placé à poste fixe dans la
     scène, à une position qui n'est PAS toujours dans l'arc de balayage —
     ou, plus simple et plus lisible : l'obstacle est toujours présent mais
     à une distance/angle tel qu'il n'entre dans le cône du capteur qu'à un
     moment précis du balayage.
  3. Quand l'orientation du robot fait que l'obstacle tombe dans son cône
     avant (test d'angle simple : différence entre l'angle du robot et
     l'angle vers l'obstacle, sous un seuil), le balayage s'arrête et le
     robot **avance tout droit** vers l'obstacle jusqu'à s'en approcher
     (sans le traverser), marque une pause, puis recule à sa position de
     départ et reprend le balayage — boucle infinie.
- Highlight visuel : le cône/secteur du capteur change de couleur
  (`colors.blue` → `colors.green`) au moment où il détecte l'obstacle,
  comme dans les autres démos de la recette (convention déjà utilisée pour
  la voiture qui se gare en M6).

### 3. Démo B — `EmbeddedReturnDemo.tsx` : scan + retour en L, interactive

C'est la démo qui demande le plus de jugement. Comportement voulu :

1. Au chargement (et après chaque retour), le robot **scanne son
   environnement** : une animation courte et lisible (le capteur/corps
   effectue un tour, ou un balayage large) qui communique visuellement
   « je mémorise où je suis » — 1 à 2 secondes, pas besoin d'un vrai
   lidar simulé, juste un signal visuel clair (par exemple un cercle qui
   s'étend depuis le robot puis se referme, ou le capteur qui fait un tour
   complet).
2. L'utilisateur peut alors **faire glisser le robot** (clic/tap +
   déplacement) n'importe où sur le sol de la scène. Implémenter le
   glisser-déposer avec un raycaster contre un plan sol invisible
   (`THREE.Plane`) et les événements pointer du conteneur du canvas — PAS
   d'`OrbitControls` sur cette scène (une caméra fixe, vue du dessus ou
   légèrement inclinée, simplifie énormément le glisser-déposer puisqu'il
   n'y a pas de rotation de caméra à distinguer d'un glissement du robot).
3. Au relâchement, une pause brève (~0,5 s), puis le robot revient à sa
   position d'origine **strictement en suivant un trajet en L** : un
   déplacement le long d'un axe (par exemple X) jusqu'à aligner sa
   coordonnée X avec celle du point de départ, PUIS un déplacement le long
   de l'autre axe (Z) jusqu'à revenir exactement au point de départ — deux
   segments perpendiculaires, jamais une diagonale ni une courbe. Le robot
   s'oriente dans le sens de chaque segment pendant qu'il le parcourt
   (rotation avant chaque segment, comme un vrai robot différentiel qui
   tourne puis avance).
4. Une fois revenu exactement à la position et à l'orientation de départ,
   il relance un scan (retour à l'étape 1) et la boucle recommence.

Éléments de scène : sol avec une grille discrète (repère visuel utile ici,
contrairement à d'autres démos, puisque le point du dispositif est
justement la précision du retour), le robot, éventuellement une petite
marque au sol (anneau `colors.green` fin) qui reste visible à la position
d'origine pendant tout le déplacement, pour que l'utilisateur voie
visuellement que le robot y revient exactement.

Curseur : `cursor: grab` au survol du robot, `cursor: grabbing` pendant le
glisser (classes CSS sur le conteneur, pilotées par un état React ou
directement par `container.style.cursor`).

### 4. `registry.ts`

Retirer le bloc `dynamic(...)` de `ParkingCarDemo` et l'entrée
`"parking-car"` dans `DEMOS["emse/embedded"]`. Ajouter à la place :

```ts
const EmbeddedSweepDemo = dynamic(() => import("./EmbeddedSweepDemo").then((m) => m.EmbeddedSweepDemo), { ssr: false });
const EmbeddedReturnDemo = dynamic(() => import("./EmbeddedReturnDemo").then((m) => m.EmbeddedReturnDemo), { ssr: false });
```
```ts
  "emse/embedded": [
    {
      id: "embedded-sweep",
      kind: "3d",
      ready: true,
      placement: "demo",
      Component: EmbeddedSweepDemo,
    },

    {
      id: "embedded-return",
      kind: "3d",
      ready: true,
      placement: "demo",
      Component: EmbeddedReturnDemo,
    },
  ],
```

(`placement: "demo"` — ces deux démos restent dans la section « Démo »
numérotée, rien ne demande de les en sortir.)

### 5. `src/i18n/namespaces/demos.ts`

Retirer l'entrée `"parking-car"` (FR et EN), ajouter :

FR :
```
"embedded-sweep": {
  title: "Balayage et approche",
  caption: "Le robot balaie 180° devant lui ; s'il détecte un obstacle pendant le balayage, il s'arrête et avance droit vers lui.",
},
"embedded-return": {
  title: "Retour précis au point de départ",
  caption: "Le robot scanne son environnement, mémorise sa position, puis — glissez-le ailleurs — y revient exactement en suivant un trajet en L.",
},
```

EN :
```
"embedded-sweep": {
  title: "Sweep and approach",
  caption: "The robot sweeps 180° in front of it; if it detects an obstacle during the sweep, it stops and drives straight toward it.",
},
"embedded-return": {
  title: "Precise return to base",
  caption: "The robot scans its surroundings, remembers its position, then — drag it elsewhere — returns to it exactly along an L-shaped path.",
},
```

### 6. Vérifications

Procédure §4 + guide 3D §4 (Chrome headless, PID exact). Sur
`/emse/embedded` : deux démos dans l'ordre balayage puis retour. Pour la
seconde, simuler un glisser via le protocole DevTools
(`Input.dispatchMouseEvent` press/move/release sur les coordonnées du
robot) et capturer avant/après pour vérifier que le trajet retour est bien
en deux segments perpendiculaires (pas une ligne droite diagonale).

Commit : `feat(embedded): replace the wrong parking demo with the two real ones`

## Critères d'acceptation

- [x] Démo A : balayage 180° en boucle, approche d'un obstacle détecté.
- [x] Démo B : glisser le robot puis retour exact en trajet en L (deux
      segments perpendiculaires, pas une diagonale).
- [x] `ParkingCarDemo`/`parkingCarLogic` disparus ou `ready: false` si la
      suppression a été refusée.
- [x] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

**Implémentation** : `git rm` a été accepté sans résistance pour
`ParkingCarDemo.tsx`/`parkingCarLogic.ts`. Deux nouveaux fichiers créés :
`EmbeddedSweepDemo.tsx` (balayage 180° + approche, machine à états
sweep/approach/pause/retreat) et `EmbeddedReturnDemo.tsx` (scan + glisser-
déposer + retour en L, machine à états scan/idle/dragging/paused/returning).
`registry.ts`, `demoIds.ts`, `demos.ts` mis à jour comme décrit dans le
ticket. Convention de cap commune aux deux démos : `rotation.y = h` fait
face à la direction monde `(sin h, cos h)`, donc h=0 regarde +Z ; reprise
documentée en commentaire dans chaque fichier.

**Commandes lancées** (dans `../wt-PORT-060`) :
- `npm run lint` → 0 erreur, 4 avertissements pré-existants
  (`react-hooks/set-state-in-effect` dans `LanguageContext.tsx`,
  `ThemeContext.tsx`, `useThemeColors.ts`), sans rapport avec ce ticket.
- `npx tsc --noEmit` → aucune sortie, code de sortie 0.
- `npm run build` → "Compiled successfully in 9.2s", "Finished TypeScript in
  9.3s", 15 pages statiques générées dont `/emse/embedded`, code de sortie 0.
  Relancées à l'identique après l'intégration de `refonte-2026` (étape 6b) :
  mêmes résultats (0 erreur, 4 mêmes avertissements pré-existants).

**Vérification visuelle** : faite via Chrome headless piloté par le
protocole DevTools natif (script jetable hors dépôt, WebSocket Node 24,
`--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader`,
`--user-data-dir` dédié), Chrome et le serveur de dev arrêtés par PID exact
en fin de session.
- `/emse/embedded`, 1280 px, thème sombre et clair : les deux démos
  s'affichent dans le cadre 16:9, robot + capteur/cône lisibles sur les deux
  fonds, aucune erreur/avertissement console.
- Démo B, glisser-déposer simulé via `Input.dispatchMouseEvent`
  (press/move/release, pointe en haut-à-gauche du robot) : le robot suit le
  pointeur, puis au relâchement revient en deux segments perpendiculaires
  (capture d'écran en rafale confirme un déplacement pur sur un axe puis
  pur sur l'autre, jamais les deux à la fois) ; il se pose exactement sur
  l'anneau de départ et son orientation finale correspond à l'orientation de
  repos. Le cycle scan → idle → dragging → paused → returning → scan a été
  confirmé par instrumentation temporaire (`console.log`, retirée avant le
  commit final) : l'anneau de scan progresse bien en opacité/échelle de 0 à
  1 sur ~1,5 s, au chargement et après chaque retour.
- 360 px : message « écran large » affiché, 0 `<canvas>`, aucune requête
  réseau liée aux démos/`three`.
- Navigation `/emse/embedded` → `/` → `/emse/embedded` ×3 : aucune erreur
  « Too many active WebGL contexts ».
- FPS (`requestAnimationFrame` sur ~4 s, snippet du guide) : ~16 fps sur les
  deux démos **mais mesuré sous SwiftShader (rendu logiciel, pas de GPU) en
  headless** — non représentatif d'une machine de dev avec accélération
  GPU. Les scènes sont très simples (quelques boîtes/cylindres/cônes par
  robot, aucune ombre portée), donc largement sous le budget de 60 000
  triangles ; la cible ≥ 50 fps n'a **pas** été vérifiée sur GPU réel, à
  confirmer visuellement par Corentin (c'est aussi l'objet du
  `human_checkpoint`).

**Écarts par rapport au ticket** : aucun écart fonctionnel. Petite liberté
de mise en scène : Démo B utilise une caméra plongeante légèrement inclinée
(`position (0, 6.3, 3.2)`, `lookAt` origine) plutôt que strictement
zénithale, comme suggéré en option par le ticket ("vue du dessus ou
légèrement inclinée").

**Intégration `refonte-2026` (étape 6b)** : `git merge refonte-2026` a
intégré PORT-057, PORT-058, PORT-061 (et PORT-052 si non déjà présent) sans
conflit sur les fichiers touchés par ce ticket. Re-vérifié lint/tsc/build
après fusion (mêmes résultats que ci-dessus).

## Notes pour la consolidation

- ARCHITECTURE.md : deux démos pour `emse/embedded` (balayage+approche,
  scan+retour en L avec glisser-déposer) remplacent l'ancienne "voiture qui
  se gare en créneau", qui ne correspondait pas au vrai projet.
- Les deux nouvelles démos partagent une convention de cap non documentée
  ailleurs : `rotation.y = h` fait face à la direction monde `(sin h, cos
  h)` dans le plan XZ (h=0 → +Z). Si une prochaine démo robot/véhicule a
  besoin d'une convention de cap, envisager de la documenter dans
  `docs/GUIDE-3D.md` plutôt que de la relaisser dans chaque fichier.
- FPS non vérifié sur GPU réel pour ces deux démos (seulement mesuré en
  headless/SwiftShader, ~16 fps, non représentatif) : à confirmer par
  Corentin au moment du `human_checkpoint`.
