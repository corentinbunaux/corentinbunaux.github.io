---
id: PORT-048
title: "Démo 3D Robotique (TIPE) — bras d'exosquelette qui soulève une charge"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
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

- [x] Bras + exosquelette + moteur au coude + charge, cycle de levée.
- [x] Moteur visiblement actif pendant l'effort.
- [x] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

**Implémentation** : `src/components/demos/ExoArmDemo.tsx` réécrit selon le
gabarit `docs/GUIDE-3D.md` (caméra fov 38, groupes `shoulderGroup` /
`elbowGroup`, matériaux via `colors.*`). Ajout des jauges d'effort (option
« souhaitée » retenue) : deux `BoxGeometry` mises à l'échelle en Y, vertes
(assistance moteur, proportionnelle à l'angle du coude) et bleue (effort du
porteur, valeur basse constante). `registry.ts` : `exo-arm.ready` → `true`.
`src/i18n/namespaces/demos.ts` : légendes FR/EN de `"exo-arm"` complétées
d'une phrase sur le code couleur des jauges (seules ces deux entrées
touchées).

**Commandes** (dans `../wt-PORT-048`) :

```
npm ci            → OK (437 packages)
npm run lint      → ✖ 4 problems (0 errors, 4 warnings) — les 4 warnings
                    (react-hooks/set-state-in-effect) sont préexistants dans
                    src/theme/ThemeContext.tsx et useThemeColors.ts, aucun
                    dans les fichiers touchés par ce ticket.
npm run build     → Compiled successfully in 40s ; TypeScript OK ;
                    15/15 pages générées, /cpge_tipe inclus.
npx tsc --noEmit  → aucune sortie (clean), lancé après le build.
```

**Vérification visuelle** — extension claude-in-chrome non connectée ;
pilotage du Chrome installé en headless via CDP brut (WebSocket natif
Node 24, script jetable hors dépôt), flags
`--use-angle=swiftshader --enable-unsafe-swiftshader`, sur mon propre
`npm run dev` (port 3001, 3000 déjà pris par un autre agent), page
`/cpge_tipe`, thème via `localStorage.corentinbunaux.theme` :

- 1280×720, thème sombre **et** clair : scène cadrée dans le 16:9, bras +
  exosquelette + moteur + carte + câble + haltère visibles, rien de coupé.
  Captures à 4 instants du cycle (repos, montée, tenue en haut, descente) en
  sombre et 3 instants en clair.
- Articulation : l'avant-bras tourne autour du coude, les barres/sangles de
  l'exosquelette et l'haltère suivent la main sans décrochage visible sur les
  captures ; pas d'interpénétration flagrante observée.
- Jauge « assistance moteur » (verte) : quasi nulle au repos, monte nettement
  pendant la levée puis redescend — confirme visuellement que le moteur est
  actif pendant l'effort. Jauge « effort du porteur » (bleue) reste basse en
  permanence, comme prévu.
- Console navigateur : une seule entrée, `404` sur une ressource (favicon —
  le projet n'a pas de fichier favicon, `find`/`ls` le confirme) ; préexistant
  sur tout le site, indépendant de three.js/WebGL et de ce ticket. Aucune
  erreur/avertissement three ou WebGL.
- 360 px : le message « Cette animation 3D s'affiche sur un écran large
  (1024 px et plus)… » s'affiche à la place de la scène ; sur les requêtes
  réseau capturées à ce moment, aucune ne contient « three » (pas de chunk
  three.js chargé).
- fps (`requestAnimationFrame` ~3 s, mesuré dans la page, canvas visible à
  l'écran) : **non concluant** — ~110 fps sur un run, ~40 fps sur un autre,
  selon que le rendu tournait sous SwiftShader (rendu logiciel forcé pour le
  headless, cf. contrainte d'environnement) au moment exact de la mesure.
  Le budget géométrique est très faible (une trentaine de primitives simples,
  bien en dessous des 60 000 triangles), donc peu de risque réel sur machine
  avec accélération GPU, mais je n'ai **pas** de mesure fiable ≥ 50 fps à
  rapporter — à revérifier par Corentin sur sa machine si besoin.
- Zoom pixel sur le disque du moteur (pour confirmer visuellement le
  matériau émissif à l'œil) : **non fait** — `Page.captureScreenshot` avec
  `clip` renvoie systématiquement une image unie (probablement une limite de
  la capture WebGL+clip sous Chrome headless/SwiftShader), y compris avec les
  coordonnées exactes du canvas (`getBoundingClientRect`). Le comportement du
  disque (rotation + `emissiveIntensity` 0 ↔ 0.4) a été vérifié par lecture du
  code, pas par capture zoomée ; la jauge verte sert de confirmation visuelle
  indirecte que le moteur est actif au bon moment du cycle.
- Onglet fermé et serveur de dev arrêté (`taskkill` sur le PID du port 3001)
  à la fin.

**Écarts par rapport au ticket** :
- Jauges d'effort : ajoutées (case « optionnel mais souhaité » retenue),
  légendes FR/EN mises à jour comme demandé.
- Câble : couleur non précisée par le ticket ; choisi `colors.mainText`
  (même teinte que le moteur/la charge) plutôt qu'une couleur littérale.
- Deux points du guide 3D §4 non confirmés avec certitude (fps ≥ 50 et détail
  pixel de l'émissif du disque), documentés ci-dessus plutôt que déclarés
  « vérifiés » sans l'être.

## Notes pour la consolidation

- Les captures `Page.captureScreenshot` avec `clip` semblent ne pas
  fonctionner sur un canvas WebGL en Chrome headless + SwiftShader (image
  unie renvoyée à chaque essai, coordonnées vérifiées correctes). Si un futur
  ticket 3D a besoin d'un zoom pixel pour vérifier un détail (émissif, texte
  fin, etc.), prévoir un budget d'essai supplémentaire ou une autre méthode
  (ex. augmenter `deviceScaleFactor` global plutôt qu'un `clip`).
- La mesure fps en headless/SwiftShader n'est pas représentative de la
  machine de dev réelle (logiciel vs GPU) : à ne pas prendre comme preuve de
  performance, seulement comme fumée si elle est anormalement basse.
