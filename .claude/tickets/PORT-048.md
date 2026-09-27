---
id: PORT-048
title: "Démo 3D Robotique (TIPE) — bras d'exosquelette qui soulève une charge"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P2
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-048-exo-arm
depends_on: [PORT-031]
parallel_safe: true
human_checkpoint: "Vérifier que la scène évoque bien le prototype du TIPE (moteur au coude, Arduino)."
created: 2026-09-27
---

# Démo 3D — bras d'exosquelette

**Procédure** : `docs/PROCEDURE-TICKET.md` + **`docs/GUIDE-3D.md`**.

## Retour de Corentin (#13)

> […] et pour la robotique, […] un exosquelette de bras qui permet de
> soulever des charges.

Article `cpge_tipe` : bras d'exosquelette, moteur commandé par une carte
Arduino. La scène est un schéma animé, pas un rendu anatomique.

## Fichier

Remplacé : `src/components/demos/ExoArmDemo.tsx`. Registre : ligne `ready`
de `exo-arm` → `true`.

## Scène (gabarit du guide)

- Caméra : fov 38, position (3.2, 1.6, 4.2), regarde (0, 0.6, 0) — vue de
  3/4, bras de profil.
- Lumières : ambiante 0.5, directionnelle 1.2 depuis (3, 5, 4).
- **Bras humain stylisé** (couleur neutre `colors.secondText`, opacité 0.9) :
  épaule (sphère) en (0, 1.8, 0), bras (`CapsuleGeometry`, longueur 1.1)
  vertical vers le bas jusqu'au coude, avant-bras (capsule, 1.0) articulé au
  coude, main (petite sphère aplatie).
- **Exosquelette** (couleur `colors.green`) : deux barres fines
  (`BoxGeometry` 0.06 × longueur × 0.06) parallèles au bras et à
  l'avant-bras, décalées vers l'extérieur ; 2 sangles par segment
  (`TorusGeometry` autour du membre) ; au coude, le **moteur** : cylindre
  (`colors.mainText`) dont l'axe est l'axe du coude, avec un disque de
  couleur `colors.blue` qui tourne visiblement quand il travaille.
- **Carte de commande** : petite plaque (`BoxGeometry` 0.4 × 0.03 × 0.3,
  `colors.blue`) fixée sur la barre du bras, reliée au moteur par un câble
  (`TubeGeometry` sur une courbe souple).
- **Charge** : haltère (2 disques `CylinderGeometry` + barre) tenu dans la
  main, `colors.mainText`.
- **Cycle (~6 s, en boucle)** : angle du coude de 0° (bras tendu vers le
  bas) à 110° (charge levée) en 2.2 s avec `easeInOutSine`, maintien 0.8 s,
  redescente 2.2 s, pause 0.8 s. Pendant la montée, le moteur « travaille » :
  disque qui tourne et matériau légèrement émissif (`emissive` =
  `colors.green`, intensité 0.4) ; au repos, pas d'émission.
- **Jauges d'effort** (optionnel mais souhaité) : deux petites barres
  verticales 3D à côté du bras, étiquetées par leur couleur seulement
  (pas de texte 3D) : « assistance moteur » (`colors.green`) qui monte
  fort pendant la levée, « effort du porteur » (`colors.blue`) qui reste
  basse. Si elles sont ajoutées, compléter la légende FR/EN de `"exo-arm"`
  dans `src/i18n/namespaces/demos.ts` par une phrase qui explique les
  couleurs (et ne toucher qu'à ces deux légendes).

## Vérifications

Guide 3D §4 sur `/cpge_tipe` + : l'articulation reste cohérente (l'avant-bras
tourne autour du coude, la barre de l'exosquelette suit, la charge suit la
main), pas d'interpénétration visible.

Commit : `feat(demos): exoskeleton arm lifting a load for the TIPE page`

## Critères d'acceptation

- [ ] Bras + exosquelette + moteur au coude + charge, cycle de levée.
- [ ] Moteur visiblement actif pendant l'effort.
- [ ] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

Rien.
