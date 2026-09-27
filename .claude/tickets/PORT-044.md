---
id: PORT-044
title: "Hero — globe filaire 3D avec les icônes de l'ancienne roue en orbite"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
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

- [ ] Globe + 15 icônes en orbite à côté de l'avatar (≥ 1024 px).
- [ ] Avatar seul sur mobile / réduction des animations, sans three chargé.
- [ ] Guide 3D §4 respecté.
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : décision « hero three.js revient sous forme de globe +
  icônes dans le panneau droit (PORT-044), réutilise ThreeStage ».
