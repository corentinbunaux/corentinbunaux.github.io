---
id: PORT-049
title: "Démo 3D Quimesis — mâchoire procédurale interactive (rotation, ouverture, survol des dents)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
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

- [ ] Mâchoire procédurale lisible (2 arcades, 28 dents, gencives).
- [ ] Rotation, ouverture au clic, survol des dents ; pas de capture de la molette.
- [ ] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : première démo interactive (OrbitControls des addons de
  three, sans nouvelle dépendance).
