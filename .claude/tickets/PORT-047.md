---
id: PORT-047
title: "Démo 3D Systèmes embarqués — robot voiture qui détecte une place et se gare en créneau"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P2
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-047-parking-car
depends_on: [PORT-031]
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# Démo 3D — voiture qui se gare seule

**Procédure** : `docs/PROCEDURE-TICKET.md` + **`docs/GUIDE-3D.md`**.

## Retour de Corentin (#13)

> Pour les systèmes embarqués […] ajouter des animations three.js avec […]
> un robot voiture qui se gare de manière autonome.

Lien avec le projet réel (article `emse/embedded`) : robot piloté par une
carte électronique maison, qui balayait une zone avec un capteur pour
détecter les obstacles. La scène met donc en scène **le capteur** : on doit
voir le faisceau balayer et « trouver » la place.

## Fichier

Remplacé : `src/components/demos/ParkingCarDemo.tsx`. Registre : ligne
`ready` de `parking-car` → `true`.

## Scène (gabarit du guide)

- Caméra : fov 40, position (-1, 6, 7), regarde (1, 0, 0) — vue de 3/4
  plongeante, toute la rangée visible.
- Lumières : ambiante 0.6, directionnelle 1.0 depuis (3, 8, 4).
- **Décor** : chaussée (`PlaneGeometry(14, 5)`, `colors.surfaceRaised`),
  trottoir (`BoxGeometry(14, 0.12, 1)` le long du bord, `colors.border`),
  marquages de places au sol (fines `BoxGeometry` blanches → couleur
  `colors.secondText`).
- **Voitures garées** : 4 voitures stationnées le long du trottoir
  (carrosserie `BoxGeometry(1.6, 0.45, 0.8)` + habitacle plus petit au-dessus,
  couleur `colors.secondText`), avec **un trou** d'environ 2.4 de long entre
  la 2ᵉ et la 3ᵉ.
- **Robot voiture** : carrosserie `colors.green` (plus petite, 1.3 × 0.4 ×
  0.7), 4 roues (`CylinderGeometry` couchés, `colors.mainText`, qui tournent
  selon la distance parcourue ; les roues avant **braquent** pendant la
  manœuvre), un capteur sur le flanc droit (petit `BoxGeometry`) émettant un
  **faisceau** : cône fin (`ConeGeometry`, `MeshBasicMaterial` transparent
  0.25) pointé vers le trottoir, qui oscille légèrement (±15°) comme un
  balayage.
- **Scénario en boucle (~14 s)**, machine à états pilotée par `delta` :
  1. *Recherche* : le robot avance à vitesse constante le long de la rangée,
     faisceau couleur `colors.blue`.
  2. *Détection* : quand le faisceau passe devant le trou, il devient
     `colors.green` et plus opaque ; le robot continue jusqu'à se trouver
     légèrement au-delà de la place, s'arrête (0.6 s).
  3. *Créneau* : marche arrière en deux arcs de cercle (braquage à droite
     puis à gauche) qui l'amènent dans la place, parallèle au trottoir ;
     implémenter la trajectoire par un modèle bicyclette simple (vitesse,
     angle de braquage, empattement) intégré avec `delta`, avec des phases
     de braquage fixées à l'avance et calibrées pour finir centré dans la
     place (tolérance visuelle).
  4. *Garé* : pause 2 s, feux arrière (2 petites `BoxGeometry` émissives)
     qui clignotent une fois.
  5. *Réinitialisation* : fondu (opacité) ou repositionnement instantané au
     départ, et recommence.
- Si le calage du créneau avec le modèle bicyclette échoue deux fois :
  remplacer l'étape 3 par une interpolation de pose le long d'une courbe de
  Bézier cubique (position) + interpolation d'angle, et le noter.

## Vérifications

Guide 3D §4 sur `/emse/embedded` + : on comprend sans légende que la voiture
cherche, trouve, puis se gare ; elle ne traverse aucune autre voiture ni le
trottoir (observer 3 boucles).

Commit : `feat(demos): self-parking robot car for the embedded systems page`

## Critères d'acceptation

- [ ] Recherche au capteur, détection visible, créneau propre, boucle.
- [ ] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

Rien.
