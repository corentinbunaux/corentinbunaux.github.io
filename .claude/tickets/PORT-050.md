---
id: PORT-050
title: "Parcours — petites icônes 3D (diplôme, mallette) en tête des deux pistes"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P3
estimate: 0.5
confidence: medium
model: sonnet
branch: feat/PORT-050-journey-3d-icons
depends_on: [PORT-030, PORT-031]
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# Parcours — icônes 3D

**Procédure** : `docs/PROCEDURE-TICKET.md` + **`docs/GUIDE-3D.md`**.

## Retour de Corentin (#6) et choix validé

> Ajouter une icône three.js représentant le diplôme / l'expérience
> professionnelle peut-être ?

Choix : **deux icônes** (« 2 icônes c'est super ») : une toque de diplômé
pour la piste Formation, une mallette pour la piste Expérience. Desktop
uniquement ; ailleurs, l'icône lucide actuelle (PORT-030) reste.

## Fichiers

- Créé : `src/components/journey/TrackIcon3D.tsx`
- Modifié : `src/components/journey/TrackIcon.tsx` (seul fichier existant touché)

## Étapes

1. `TrackIcon3D.tsx` : exporte `TrackIcon3D({ kind })`, qui rend
   `<ThreeStage setup={kind === "experience" ? setupBriefcase : setupCap} fov={30} />`
   (deux fonctions `setup` au niveau du module, gabarit du guide).
   - Caméra : position (0, 0.6, 3.2), regarde l'origine ; objets d'environ
     1.4 unité pour remplir le cadre.
   - **Toque** : plateau carré (`BoxGeometry(1.3, 0.06, 1.3)`) posé en
     losange (rotation Y 45°) sur une calotte (`CylinderGeometry` évasé),
     bouton central (petite sphère) et **gland** (fil = `TubeGeometry`
     courbe + petit cylindre) couleur `colors.green` ; toque `colors.mainText`.
   - **Mallette** : corps `BoxGeometry(1.3, 0.9, 0.4)` aux arêtes adoucies
     (ou `ExtrudeGeometry` d'un rectangle arrondi), poignée
     `TorusGeometry` (demi-tore) sur le dessus, deux fermoirs et une bande
     couleur `colors.green` ; corps `colors.mainText`.
   - Lumières : ambiante 0.7 + directionnelle 1.0 depuis (2, 3, 4).
   - Animation : rotation Y lente (0.5 rad/s) avec un léger balancement en X
     (±0.15 rad) ; au survol du conteneur (`pointerenter`/`pointerleave` sur
     `container`), rotation ×3 pendant le survol. Retirer les écouteurs dans
     `dispose()`.
2. `TrackIcon.tsx` :
   - garder la version lucide actuelle comme rendu par défaut ;
   - ajouter le chargement `next/dynamic(() => import("./TrackIcon3D").then(m => m.TrackIcon3D), { ssr: false })`
     et, si `useDesktopMotionGate() === "render"`, rendre à la place un
     conteneur de **même taille** que la version lucide (garder
     `h-12 w-12`, ou passer les deux à `h-14 w-14` si c'est trop petit pour
     lire la forme — même taille dans les deux cas pour éviter tout saut),
     `aria-hidden="true"`, avec `<TrackIcon3D key={theme} kind={kind} />`
     (`useTheme()` pour la clé).
3. Contexte WebGL : la home aura alors 3 canvases (globe du hero si PORT-044
   est fusionné + 2 icônes). C'est acceptable ; vérifier qu'il n'y a pas
   d'avertissement dans la console.

## Vérifications

Guide 3D §4 sur la **home**, section Parcours (à 1280 px : deux icônes 3D qui
tournent doucement, plus vite au survol ; à 360 px : icônes lucide, aucun
chunk three) + pas de décalage de mise en page quand les icônes 3D
apparaissent.

Commit : `feat(journey): small 3D cap and briefcase icons on desktop`

## Critères d'acceptation

- [ ] Toque (Formation) et mallette (Expérience) en 3D sur desktop.
- [ ] Repli lucide identique en taille ailleurs.
- [ ] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

Rien.
