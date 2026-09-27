# Guide commun des scènes 3D (PORT-044 → PORT-050)

À lire avant tout ticket 3D, en plus de `docs/PROCEDURE-TICKET.md`.
Prérequis fusionnés : PORT-026 (thème, `useThemeColors`) et PORT-031
(`ThreeStage`, registre des démos).

## 1. Gabarit

Toute scène est une **fonction `setup` au niveau du module** passée à
`ThreeStage` (`src/components/demos/ThreeStage.tsx`) :

```tsx
"use client";

import * as THREE from "three";
import { ThreeStage, type ThreeStageSetup } from "./ThreeStage";

const setupScene: ThreeStageSetup = ({ scene, camera, colors }) => {
  camera.position.set(0, 2, 6);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(3, 5, 4);
  scene.add(sun);

  const accent = new THREE.Color(colors.green);
  // … construire les objets …

  return {
    update(elapsed, delta) {
      // animer à partir de `elapsed` (secondes) — jamais de Date.now()
    },
    dispose() {
      // seulement ce que la scène ne contient pas : listeners, OrbitControls…
    },
  };
};

export function MaDemo() {
  return <ThreeStage setup={setupScene} />;
}
```

Ce que `ThreeStage` fait déjà — **ne pas le refaire** : renderer, taille
(ResizeObserver), boucle, pause hors écran, libération des géométries /
matériaux / textures de la scène, retrait du canvas. `DemoSection` fait déjà
le gate desktop / réduction des animations, le cadre 16:9, et **remonte la
scène au changement de thème** (donc lire `colors` une fois dans `setup`
suffit).

## 2. Règles

- **Couleurs** : uniquement `colors.*` (tokens du thème) pour tout ce qui
  est « interface » (traits, accents, sol). Des couleurs « réalistes »
  (texture de la Terre, peau, métal gris) sont permises si elles restent
  lisibles sur `--surface` clair **et** sombre ; le vérifier.
- **Aucun modèle externe** (.glb, .obj), aucune nouvelle dépendance : formes
  construites avec les géométries de three (`Box`, `Cylinder`, `Sphere`,
  `Capsule`, `Torus`, `Tube`, `Extrude`, `Lathe`…). Seule exception prévue :
  la texture NASA de PORT-045. `three/examples/jsm/...` (addons livrés avec
  three, ex. `OrbitControls`) est autorisé : vérifier que le fichier existe
  dans `node_modules/three/examples/jsm/` avant de l'importer.
- **Budget** : < 60 000 triangles (`renderer.info.render.triangles`), une
  seule scène, pas d'ombres portées (`castShadow`) sauf mention contraire,
  `InstancedMesh` pour les objets répétés (> 20 copies).
- **Mouvement** : lent et lisible (c'est une illustration, pas un jeu).
  Toute animation dépend de `elapsed`/`delta`, pour rester correcte si
  l'onglet ralentit.
- **Pas de piège au défilement** : ne jamais capter la molette (pas de zoom
  à la molette), sinon la page ne défile plus au-dessus du canvas.
- **Accessibilité** : la scène est décorative/illustrative ; la légende de
  `DemoSection` porte le sens. Rien d'essentiel ne doit être uniquement dans
  la 3D.

## 3. Activer la démo

Dans `src/components/demos/registry.ts`, passer **uniquement** la ligne
`ready` de sa démo à `true` (certaines démos sont déjà `ready`).

## 4. Vérifications propres à la 3D (en plus de la procédure §4)

À faire au navigateur, onglet au premier plan, 1280 × 800 :

1. La scène s'affiche dans le cadre 16:9, cadrée (rien de coupé
   d'important), en thème sombre **et** clair (le changement de thème
   recrée la scène).
2. Console : aucune erreur ni avertissement three/WebGL.
3. Coût : dans la console, mesurer ~5 s de fluidité :
   ```js
   let n=0,t0=performance.now();(function f(){n++;if(performance.now()-t0<5000)requestAnimationFrame(f);else console.log('fps',n/5)})()
   ```
   Noter le résultat (cible ≥ 50 fps sur la machine de dev).
4. Faire défiler pour sortir la scène de l'écran puis revenir : elle
   reprend là où elle était (pause hors écran).
5. Naviguer vers un autre projet puis revenir, 3 fois : pas d'erreur
   « Too many active WebGL contexts ».
6. À 360 px : le message « animation 3D sur écran large » s'affiche et
   l'onglet Réseau ne montre **aucun** chunk three.
7. Joindre une capture (sombre et clair) dans le journal du ticket.
