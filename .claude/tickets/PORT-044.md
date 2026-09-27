---
id: PORT-044
title: "Hero — globe filaire 3D avec les icônes de l'ancienne roue en orbite"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
resumeAt: null
priority: P2
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-044-hero-globe
depends_on: [PORT-031, PORT-037]
parallel_safe: true
human_checkpoint: "Juger le globe du hero : assez présent sans voler la vedette au texte ?"
created: 2026-09-27
---

# Hero — globe 3D et icônes en orbite

**Procédure** : `docs/PROCEDURE-TICKET.md` + **`docs/GUIDE-3D.md`**.

## Retour de Corentin (#1) et choix validé

> Conserver un écran d'accueil convivial, avec de l'animation avec three.js et
> l'idée des icônes, mais plus léger, en se rapprochant de ce qui était
> proposé par les maquettes.

Choix : « Maquette + icônes en 3D ». La maquette (zone ①) montre, dans le
panneau de droite, l'avatar et **à côté** un globe en maillage. Les icônes de
l'ancienne roue (tennis, échecs, Grogu, Iron Man…, `HERO_ICONS` créé par
PORT-037) deviennent de petites vignettes qui **orbitent** autour du globe.
Une seule animation, lente. Desktop uniquement ; sur mobile, avatar seul.

## Fichiers

- Créé : `src/components/hero/HeroGlobe.tsx`
- Modifié : `src/components/hero/HeroVisual.tsx` (seul fichier existant touché)

## Scène (`HeroGlobe.tsx`, gabarit du guide, `setup` au niveau du module)

- Caméra : fov 40, position (0, 0.4, 5.2), regarde l'origine.
- **Globe** : sphère rayon 1.1 en fil de fer — `new THREE.WireframeGeometry(new THREE.SphereGeometry(1.1, 18, 12))`
  dans `THREE.LineSegments`, `LineBasicMaterial` couleur `colors.blue`,
  `transparent`, opacité 0.55. Rotation Y lente : 0.12 rad/s.
- **Icônes** : une `THREE.Sprite` par entrée de `HERO_ICONS` (15), texture
  chargée avec `new THREE.TextureLoader().load(dataUrl)` et
  `texture.colorSpace = THREE.SRGBColorSpace`, `SpriteMaterial({ map, transparent: true })`,
  échelle 0.32. Réparties sur **deux anneaux inclinés** : anneau 1 rayon
  1.75, inclinaison 20°, 8 icônes ; anneau 2 rayon 2.05, inclinaison -35°,
  7 icônes ; angles régulièrement espacés ; vitesses 0.18 et -0.12 rad/s.
- **Profondeur** : l'opacité de chaque sprite dépend de sa position z dans
  le repère caméra (derrière le globe → 0.35, devant → 1), pour lire
  clairement l'orbite.
- **Réaction au pointeur** (la maquette parlait d'un maillage réactif à la
  souris) : écouter `pointermove` sur `window` ; incliner le groupe globe +
  anneaux d'au plus ±0.25 rad vers le pointeur, avec lissage
  (`current += (target - current) * min(1, delta * 3)`). Retirer l'écouteur
  dans `dispose()`.
- Anneaux eux-mêmes non dessinés (seules les icônes tournent).

Export : `export function HeroGlobe() { return <ThreeStage setup={setupGlobe} fov={40} />; }`

## `HeroVisual.tsx`

- Charger le globe comme les démos : `next/dynamic(() => import("./HeroGlobe").then(m => m.HeroGlobe), { ssr: false })`,
  rendu seulement si `useDesktopMotionGate() === "render"` ; clé
  `key={theme}` (via `useTheme()`) pour recréer la scène au changement de
  thème.
- Disposition du panneau quand le globe est rendu : avatar à gauche (cercle,
  ~38 % de la largeur), globe à droite dans un carré (~50 % de la largeur,
  `aspect-square`), centrés verticalement, comme la maquette. Quand le globe
  n'est pas rendu (mobile, réduction des animations, `pending`) : avatar
  seul centré, comme aujourd'hui. Pas de saut de mise en page gênant au
  passage `pending` → `render` sur desktop (réserver la place du globe dès
  que la largeur ≥ 1024 px, via des classes `lg:`).
- Petits points « étoiles » de la maquette : optionnels, en CSS (3-4 `span`
  ronds `bg-second-text`), pas en 3D.

## Vérifications

Guide 3D §4 sur la **home** (pas une page projet) + : le texte du hero reste
la première chose qu'on lit (l'animation est lente, rien ne clignote) ; à
360 px, avatar seul et aucun chunk three ; bouger la souris incline le globe
doucement.

Commit : `feat(hero): wireframe globe with orbiting icons next to the avatar`

## Critères d'acceptation

- [x] Globe + 15 icônes en orbite à côté de l'avatar (≥ 1024 px).
- [x] Avatar seul sur mobile / réduction des animations, sans three chargé
      (voir écart ci-dessous : vrai en production, un `<script async>` du
      chunk apparaît en dev).
- [x] Guide 3D §4 respecté.
- [x] lint / tsc / build passent.

## Journal d'exécution

Commandes (dans `../wt-PORT-044`, après `npm ci` propre) :

- `npm run lint` → 0 erreur, 6 warnings (baseline pré-existante, fichiers non
  touchés par ce ticket : `ThemeContext.tsx`, `useThemeColors.ts`,
  `SiteHeader.tsx` — `react-hooks/set-state-in-effect`, déjà présents avant
  ce ticket).
- `npm run build` → `✓ Compiled successfully`, `Running TypeScript` OK, 15
  pages statiques générées, aucune erreur.
- `npx tsc --noEmit` (après le build, worktree neuve) → aucune sortie, propre.

Vérification visuelle : `claude-in-chrome` non connecté. Chrome installé
piloté en headless via le protocole DevTools (WebSocket natif Node 24,
script jetable dans le dossier scratchpad, `--use-angle=swiftshader
--enable-unsafe-swiftshader`, `--user-data-dir` dédié, arrêté ensuite par
PID exact — jamais par nom d'image) sur mon propre `npm run dev` (port 3002,
3000/3001 déjà pris par d'autres agents) :

1. 1280×800, thème sombre et clair : globe filaire + 15 icônes en orbite à
   côté de l'avatar, cadré dans le panneau, texte du hero lisible et non
   masqué (captures `shot-1280-dark.png` / `shot-1280-light.png`). Couleur
   `colors.blue` lisible sur `--surface` clair et sombre.
2. Console : aucune erreur/avertissement three ou WebGL sur les deux thèmes.
3. FPS (~5 s, `requestAnimationFrame`) : ~120-143 fps sur la machine de dev,
   largement au-dessus de la cible 50 fps.
4. Défilement hors écran puis retour : aucune erreur, la scène reprend
   (pause hors écran gérée par `ThreeStage`, non modifiée ici).
5. Home → `/internships/safran` → home, 3 fois : aucune erreur console,
   pas de « Too many active WebGL contexts ».
6. 360×800 : `HeroVisual` ne rend que l'avatar (`document.querySelectorAll
   ('canvas').length === 0` vérifié en DOM), aucun saut de mise en page.
   Souris : le globe s'incline doucement vers le pointeur (implémenté selon
   la formule du ticket, testé visuellement via un mouvement simulé — le
   lissage et la borne ±0.25 rad sont couverts par relecture du code).

**Écart constaté et investigué (pas un bug de ce ticket)** : à 360 px, sous
`npm run dev` (Turbopack), l'onglet Réseau montre bien une requête vers le
chunk `HeroGlobe_tsx_....js`. Investigation : c'est un comportement de
Turbopack **dev uniquement** — la page HTML initiale contient un
`<script async>` vers **tous** les chunks `next/dynamic` atteignables depuis
la page, qu'ils se rendent ou non. Vérifié identique sur l'existant : la
page `/internships/safran` (PORT-045, déjà fusionné, même patron
`useDesktopMotionGate` + rendu conditionnel) script-tag pareillement son
chunk de démo à 360 px en dev. Le DOM confirme que le composant ne
**s'exécute** jamais à 360 px (0 canvas, aucun contexte WebGL). Vérifié sur
le build de production (`npm run build`, HTML statique de `/`) :
`grep -c "HeroGlobe" ` sur le HTML généré → **0** occurrence. Le
comportement réel (site statique exporté) est donc conforme au critère
d'acceptation ; seul le mode dev de Turbopack est bruyant sur ce point, pour
toutes les démos 3D du site, pas seulement celle-ci.

Serveur de dev arrêté proprement à la fin (PID exact, jamais par nom
d'image).

## Notes pour la consolidation

- ARCHITECTURE.md : décision « hero three.js revient sous forme de globe +
  icônes dans le panneau droit (PORT-044), réutilise ThreeStage ».
- ARCHITECTURE.md / point faible connu : en `npm run dev` (Turbopack), tout
  chunk `next/dynamic({ssr:false})` atteignable depuis une page reçoit un
  `<script async>` dans le HTML initial même s'il ne se rend jamais
  (vérifié identique pour PORT-045). N'affecte pas la production (export
  statique) : à vérifier si un futur ticket veut un contrôle strict du
  Network en dev.
- Point de jugement humain (`human_checkpoint`) : le globe est volontairement
  discret (fil de fer, opacité 0.55, rotation lente 0.12 rad/s) et positionné
  à droite du texte, jamais devant — captures jointes dans le dossier
  scratchpad de la session pour revue.
