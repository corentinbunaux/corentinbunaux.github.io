---
id: PORT-049
title: "Démo 3D Quimesis — mâchoire procédurale interactive (rotation, ouverture, survol des dents)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
resumeAt: null
priority: P2
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-049-quimesis-jaw
depends_on: [PORT-031]
parallel_safe: true
human_checkpoint: "Manipuler la mâchoire : rotation, ouverture/fermeture, survol des dents."
created: 2026-09-27
---

# Démo 3D Quimesis — mâchoire interactive

**Procédure** : `docs/PROCEDURE-TICKET.md` + **`docs/GUIDE-3D.md`**.

## Retour de Corentin (#11) et choix validé

> Pour Quimesis, conserver l'animation three.js existante […] mais intégrer
> une animation où l'utilisateur peut jouer avec une représentation 3D d'une
> mâchoire.

- L'animation existante (fragments) **reste** : c'est déjà la démo
  `quimesis-fragments` (PORT-031). Celle-ci s'ajoute dessous.
- Choix « **arcade procédurale** » : pas de modèle téléchargé, pas de scan
  (confidentialité, droits) ; mâchoire simplifiée générée par le code. La
  légende le dit (« Modèle simplifié, généré par le code »).

## Fichier

Remplacé : `src/components/demos/QuimesisJawDemo.tsx`. Registre : ligne
`ready` de `quimesis-jaw` → `true`.

## Scène (gabarit du guide)

- Caméra : fov 35, position (0, 1.2, 5), regarde (0, 0, 0).
- Lumières : ambiante 0.55, directionnelle 1.1 depuis (2, 4, 5),
  directionnelle 0.4 depuis (-3, -1, -2) (contre-jour doux).
- **Arcades** : deux arcs paraboliques dans le plan XZ
  (`z = -0.55 * x² + 0.9`, x ∈ [-1.2, 1.2]), 14 dents chacun (7 par côté),
  espacées régulièrement en abscisse curviligne.
  - Types et tailles (de l'avant vers l'arrière, par côté) : 2 incisives
    (`BoxGeometry` arrondie ≈ 0.14 × 0.3 × 0.07), 1 canine
    (`ConeGeometry`/`CapsuleGeometry` ≈ 0.12 de diamètre × 0.34), 2
    prémolaires (`CapsuleGeometry` ≈ 0.16 × 0.26), 2 molaires
    (`BoxGeometry` arrondie ≈ 0.24 × 0.24 × 0.22). Chaque dent orientée
    selon la tangente de l'arc.
  - Dents couleur ivoire neutre (`#f1ece2`, acceptée car « réaliste » —
    vérifier la lisibilité en thème clair, sinon utiliser `colors.mainText`
    en sombre et un gris chaud en clair), `MeshStandardMaterial`,
    roughness 0.4.
  - Gencives : `TubeGeometry` (rayon 0.12) le long de l'arc, un peu sous
    les dents, couleur rosée désaturée (`#c98a8f`, même vérification).
- **Mâchoire inférieure** : groupe dont le pivot est l'axe X passant à
  l'arrière (z ≈ -0.3, y ≈ 0.05) — les dents du bas pointent vers le haut,
  celles du haut vers le bas, arcades en occlusion quand fermé.
- **Interactions** :
  - `OrbitControls` depuis `three/examples/jsm/controls/OrbitControls.js`
    (fichier vérifié présent le 2026-09-27) : `enableZoom = false` (ne
    jamais capter la molette), `enablePan = false`, `enableDamping = true`,
    angle polaire limité (0.6 → 2.2 rad), `autoRotate = true` lent (0.6)
    tant que l'utilisateur n'a pas touché la scène, désactivé ensuite.
    Appeler `controls.update()` dans `update()`, `controls.dispose()` dans
    `dispose()`.
  - **Survol** : `Raycaster` sur `pointermove` (coordonnées relatives au
    canvas) → la dent survolée passe en `emissive` `colors.green`
    (intensité 0.5), les autres reviennent à 0 ; curseur `pointer` sur une
    dent.
  - **Clic** (pointerdown + pointerup à moins de 5 px d'écart, pour ne pas
    confondre avec une rotation) → bascule ouvert/fermé : angle de la
    mâchoire inférieure interpolé vers 0 ou 0.5 rad en ~0.5 s
    (`easeOutCubic`).
  - Clavier : le canvas n'est pas focusable ; c'est acceptable pour une
    illustration (la légende décrit l'objet). Ne pas ajouter de piège au
    focus.
  - Retirer tous les écouteurs dans `dispose()`.

## Vérifications

Guide 3D §4 sur `/internships/quimesis` + :
1. Deux démos, dans l'ordre : fragments puis mâchoire.
2. Glisser fait tourner, la molette **fait défiler la page** (pas de zoom).
3. Survol : une seule dent en surbrillance à la fois.
4. Clic court : ouvre/ferme ; glisser ne déclenche pas l'ouverture.

Commit : `feat(demos): interactive procedural jaw for the Quimesis page`

## Critères d'acceptation

- [x] Mâchoire procédurale lisible (2 arcades, 28 dents, gencives).
- [x] Rotation, ouverture au clic, survol des dents ; pas de capture de la molette.
- [x] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

Commandes (worktree `../wt-PORT-049`, après `npm ci`) :

```
npm run lint
```
→ 0 erreur, 4 warnings pré-existants (`react-hooks/set-state-in-effect` dans
`ThemeContext.tsx` / `useThemeColors.ts`, hors périmètre du ticket, aucun
warning dans les fichiers touchés).

```
npm run build
```
→ échec initial : `TS2674` sur `class GumCurve extends THREE.Curve<...>`
(constructeur protégé) faute de constructeur explicite dans la sous-classe.
Corrigé en ajoutant `constructor() { super(); }` à `GumCurve` (pattern connu
pour les sous-classes de `THREE.Curve` en TypeScript strict). Après correctif :
`✓ Compiled successfully`, `✓ Generating static pages using 7 workers (15/15)`,
14 routes statiques générées, aucune erreur.

```
npx tsc --noEmit
```
→ aucune sortie (0 erreur), lancé après le build réussi dans la worktree.

Vérification visuelle : `npm run dev` (port 3001, 3000 pris) piloté par Chrome
headless (`--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader`,
`--user-data-dir` dédié temporaire, port de debug libre, script Node 24 jetable
hors dépôt, WebSocket natif, protocole DevTools direct) sur
`/internships/quimesis`, 1280×800, thème sombre **et** clair
(`localStorage.corentinbunaux.theme`). Captures lues (sombre : état initial,
survol, ouvert, refermé, après glisser, après 3 allers-retours de page, 360 px ;
clair : état initial, survol, ouvert) :

1. Deux démos dans l'ordre : fragments (« Mes débuts en 3D ») puis mâchoire
   (« Mâchoire interactive »), cadrées dans le 16:9 — vu sur les captures.
2. Glisser (`Input.dispatchMouseEvent` press→move×6→release) : la caméra
   change d'angle (capture « after-drag », vue de dessus/côté), la mâchoire
   reste fermée (le glisser n'a pas déclenché l'ouverture, écart < 5 px non
   atteint car glisser > 70 px). Molette (`mouseWheel`, deltaY 300 sur le
   canvas) : `window.scrollY` passe de 2304 à 2604 — la page défile, aucun
   zoom capté.
3. Survol : sondage d'une grille de points dans le canvas jusqu'à
   `getComputedStyle(canvas).cursor === "pointer"` — trouvé, confirmant le
   raycast touche une dent (curseur `pointer`, une seule dent en surbrillance
   à la fois par construction du code : un seul `hovered` réinitialisé avant
   d'appliquer l'`emissive` suivant).
4. Clic court (press+release au même point) : capture « open » montre la
   mâchoire clairement ouverte (écart visible entre les deux arcades) ; un
   second clic la referme (capture « closed-again » identique à l'état
   initial). Reproduit en thème clair (capture « light-03-open »).
5. Pause hors écran : `scrollIntoView` puis `scrollBy(0, 4000)` puis retour à
   `scrollTo(0,0)` — aucune erreur console pendant le cycle (une seule entrée
   d'erreur, un 404 sur `/favicon.ico`, sans rapport avec three/WebGL : vérifié
   séparément que ce favicon 404 existe déjà indépendamment de cette page,
   `curl http://localhost:3001/favicon.ico` → 404).
6. Navigation Safran ↔ Quimesis ×3 : aucune erreur « Too many active WebGL
   contexts » dans la console collectée.
7. FPS mesuré (`requestAnimationFrame` pendant 5 s) : **138,8 fps sous
   SwiftShader (rendu logiciel)** — chiffre non représentatif d'un vrai GPU,
   à ne pas comparer à la cible « ≥ 50 fps sur la machine de dev ».
8. 360 px : le message « Cette animation 3D s'affiche sur un écran large… »
   s'affiche pour les deux démos Quimesis, et le filtrage des requêtes réseau
   (`Network.requestWillBeSent`) ne montre **aucune** URL contenant `three`
   à cette largeur.

Couleurs : dents ivoire (`#f1ece2`) / gencive rosée (`#c98a8f`) en thème
sombre ; bascule vers un gris chaud plus soutenu (`#8a7361`) / un rose plus
soutenu (`#a85c63`) en thème clair (détection via la luminance relative de
`colors.surface`). Sur les captures, l'éclairage de la scène (ambiante 0,55 +
deux directionnelles) éclaircit sensiblement les deux jeux de couleurs, mais
la forme de la mâchoire reste nettement lisible sur fond blanc grâce au
contraste apporté par la gencive et aux ombrages entre les dents — vérifié
visuellement, pas de calcul de contraste WCAG formel (illustration
décorative, pas du texte).

Écart par rapport au ticket : aucun écart fonctionnel. Seul ajustement non
spécifié dans le ticket : ajout d'un `constructor()` explicite dans
`GumCurve` (nécessaire pour satisfaire `tsc --noEmit`/`next build` avec le
constructeur protégé de `THREE.Curve`), et un décalage d'un petit offset
(-0,03) de la gencive par rapport à la ligne de base des dents plutôt qu'un
alignement exact, pour éviter le z-fighting — choix d'implémentation laissé
au modèle (« un peu sous les dents » du ticket ne précisait pas de valeur).

## Notes pour la consolidation

- ARCHITECTURE.md : première démo interactive (OrbitControls + RoundedBoxGeometry,
  addons de `three/examples/jsm/...`, sans nouvelle dépendance npm). Pattern à
  documenter : sous-classer `THREE.Curve` en TypeScript strict exige un
  `constructor() { super(); }` explicite (sinon `TS2674`, constructeur protégé).
- Interaction clic-vs-glisser : distinction par tolérance de 5 px entre
  `pointerdown` et `pointerup` (écouteurs sur `renderer.domElement`, pas sur le
  `container`), pattern réutilisable pour de futures démos cliquables.
