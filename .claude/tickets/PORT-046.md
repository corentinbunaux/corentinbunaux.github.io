---
id: PORT-046
title: "Démo 3D SNCF — un train qui circule sur une voie en boucle"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P2
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-046-sncf-train
depends_on: [PORT-031]
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# Démo 3D SNCF — le train

**Procédure** : `docs/PROCEDURE-TICKET.md` + **`docs/GUIDE-3D.md`**.

## Retour de Corentin (#8)

> Ajouter une animation three.js pour la SNCF, avec un train qui se déplace
> sur un chemin de fer ?

Complété par le graphique espace-temps 2D (PORT-042), qui explique le sujet
du projet ; cette scène est l'illustration « vivante ».

## Fichier

Remplacé : `src/components/demos/SncfTrainDemo.tsx`. Registre : ligne
`ready` de `sncf-train` → `true`.

## Scène (gabarit du guide)

- Caméra : fov 38, position (0, 5.5, 9), regarde (0, 0, 0) ; très lente
  orbite de la caméra autour de l'axe Y (un tour en ~90 s) pour donner du
  relief.
- Lumières : ambiante 0.55, directionnelle 1.1 depuis (4, 8, 5).
- **Tracé** : `CatmullRomCurve3` fermée (`closed: true`), forme d'hippodrome
  un peu irrégulière dans le plan XZ (≈ 10 × 5 unités), avec une légère
  montée (y jusqu'à 0.4) sur un côté. Environ 8 points de contrôle.
- **Sol** : `PlaneGeometry(16, 10)` couleur `colors.surfaceRaised`, et une
  grille discrète (`GridHelper(16, 16)`, couleurs `colors.border`).
- **Voie** : deux rails = deux `TubeGeometry` (rayon 0.025) le long de
  courbes décalées de ±0.18 perpendiculairement à la tangente (construire
  les deux courbes à partir de 200 points échantillonnés), couleur
  `colors.secondText` ; **traverses** = `InstancedMesh` de `BoxGeometry(0.5,
  0.04, 0.08)` tous les 0.25 le long de la courbe (`getSpacedPoints`),
  orientées selon la tangente, couleur `colors.border`.
- **Gare** : un quai (`BoxGeometry(2.2, 0.15, 0.5)`) le long de la ligne
  droite, avec un abri simple (4 poteaux fins + toit plat), couleur
  `colors.surface` / `colors.secondText`.
- **Train** : 4 éléments (motrice + 3 voitures), chacun ≈ 0.9 × 0.28 × 0.3
  (`BoxGeometry` arrondie ou `CapsuleGeometry` couchée), espacés de 0.95 en
  abscisse curviligne. Motrice avec un nez biseauté (`ConeGeometry` à 4
  faces ou `ExtrudeGeometry` d'un trapèze), couleur `colors.green` ; voitures
  `colors.mainText` avec une bande de fenêtres (`BoxGeometry` fine,
  `colors.blue`). Chaque élément se place avec `curve.getPointAt(u)` et
  s'oriente avec `lookAt(curve.getPointAt(u + ε))` (u en [0,1), modulo).
- **Mouvement** : le train fait le tour en ~16 s ; il **ralentit et marque
  un arrêt de 2 s** au quai à chaque passage (profil de vitesse : décélérer
  sur la ligne droite avant le quai, arrêt, accélérer) — c'est exactement ce
  que le graphique espace-temps représente par un palier. Implémenter la
  position u(t) par une petite machine à états (rouler / freiner / arrêté /
  accélérer) pilotée par `delta`.
- Budget < 60 000 triangles.

## Vérifications

Guide 3D §4 sur `/research/sncf` + : les deux démos (train puis graphique)
s'affichent dans l'ordre du registre ; le train suit les rails sans
décrochage dans les virages et s'arrête au quai.

Commit : `feat(demos): 3D train looping on a track for the SNCF page`

## Critères d'acceptation

- [ ] Train articulé suivant la voie, arrêt en gare à chaque tour.
- [ ] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

Rien.
