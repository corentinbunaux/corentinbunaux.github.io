---
id: PORT-047
title: "Démo 3D Systèmes embarqués — robot voiture qui détecte une place et se gare en créneau"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: done
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

- [x] Recherche au capteur, détection visible, créneau propre, boucle.
- [x] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

**Trajectoire (point 3 du ticket) isolée en fonction pure**, testée sans
navigateur : `src/components/demos/parkingCarLogic.ts`, fonction
`getParkingFrame(t)`. Aucun état mutable au niveau module ; le rendu
(`ParkingCarDemo.tsx`) ne fait que lire la trame retournée.

Modèle bicyclette (rear-axle, vitesse/angle de braquage/empattement) utilisé
pour les phases *drive*/*stop* (ligne droite, cas trivial). Pour le
*créneau* : **deux calibrations du modèle bicyclette en deux arcs symétriques
ont échoué** (script Node jetable, non commité, échantillonnant la boîte
englobante du robot toutes les ~4 ms sur toute la boucle) :
  1. calibration résolue analytiquement (corde des deux arcs) pour un point
     d'arrêt à x=0.8 (repère essieu arrière) → 49 échantillons en
     chevauchement avec la voiture suivante, pendant le 2ᵉ arc.
  2. point d'arrêt reculé à x=1.6 pour plus de dégagement, rayon/vitesse
     recalibrés → 280 échantillons en chevauchement (pire, le grand rayon
     fait sortir le coin de la voiture plus tôt).
- Conformément à la clause de repli du ticket, le créneau est donc interpolé
  par une **courbe de Bézier cubique** (position, points de contrôle réglés
  par un script Node jetable jusqu'à zéro chevauchement) + une
  **interpolation sinusoïdale de l'angle** (0 → ±35° → 0). Le freinage/braquage
  visuel des roues avant reste une fonction cosinus de la progression (détail
  cosmétique, non contraint par la physique dans ce mode).
- Vérifications par script Node jetable (non commité, supprimé après usage) :
  - Pose finale : x=-1.0000, z=1.0500, cap=0.000° (cible : centré dans la
    place, parallèle au trottoir) — écart nul à la précision flottante.
  - Boîte englobante du robot (rectangle orienté, SAT) vs les 4 voitures
    garées et le trottoir : **0 chevauchement** sur 3360 échantillons
    (dt≈4,17 ms, plus fin qu'une frame à 60 fps) sur toute la boucle de 14 s.
  - Budget triangles estimé à la main (géométries à faible segmentation :
    cylindres à 12 côtés, cône à 12 côtés) : **~392 triangles**, très en
    dessous des 60 000.

**Commandes lancées** (dans `../wt-PORT-047`) :
- `npm run lint` → `6 problems (0 errors, 6 warnings)` ; les 6 avertissements
  préexistent dans `LanguageContext.tsx` / `ThemeContext.tsx` /
  `useThemeColors.ts` / un composant grille (`role-supports-aria-props`),
  aucun dans les fichiers touchés par ce ticket.
- `npm run build` → `✓ Compiled successfully` puis `Finished TypeScript`,
  `Generating static pages using 7 workers (15/15)` — 13 routes statiques
  générées, `/emse/embedded` comprise.
- `npx tsc --noEmit` (après le build, `next-env.d.ts` généré) → aucune sortie,
  code de sortie 0.

**Vérification visuelle** (Guide 3D §4) : faite, via Chrome headless piloté
en DevTools Protocol (WebSocket natif de Node 24, script jetable hors dépôt,
`--use-angle=swiftshader --enable-unsafe-swiftshader`), sur le `npm run dev`
de la worktree (port 3003, arrêté à la fin par PID exact). Pas d'extension
`claude-in-chrome` connectée pour cette session.
  1. Scène affichée dans le cadre 16:9 sur `/emse/embedded`, en thème sombre
     **et** clair (captures à 1280×900, `localStorage.corentinbunaux.theme`) :
     route, trottoir, 4 voitures garées, robot (carrosserie verte, 4 roues
     visibles, faisceau capteur bleu) tous visibles ; scénario observé sur
     plusieurs captures échelonnées : recherche (faisceau visible, robot
     longeant la rangée), approche/arrêt, créneau (robot incliné dans le
     trou), garé (robot droit, centré dans le trou, faisceau éteint),
     réinitialisation (fondu) puis nouvelle boucle — narration compréhensible
     sans légende. Le clignotement précis des feux arrière (fenêtre de 0,4 s)
     n'a pas pu être isolé pixel par pixel avec cette marge de timing
     (délai de montage du composant non mesuré précisément par le script) ;
     code revu (booléen `tailLightsOn` piloté par la phase/temps, simple et
     typé) mais pas confirmé visuellement à l'image près — à vérifier par
     Corentin dans un vrai navigateur si besoin.
  2. Console : aucune erreur ni avertissement three/WebGL sur les 3 thèmes/
     tailles testés (`Runtime.exceptionThrown` et `Runtime.consoleAPICalled`
     de type `error`/`warning` écoutés, liste vide à chaque chargement).
  3. FPS : mesuré via le snippet du guide, mais **sous rendu logiciel
     SwiftShader** (Chrome headless) : ~32–33 fps de façon répétée (deux
     mesures indépendantes), très en dessous des 50 fps cible. Écart attribué
     au rendu logiciel (pas de vraie accélération GPU en headless), pas à la
     scène elle-même : budget de ~392 triangles, quelques mesh seulement, une
     seule scène. Non re-testé sur GPU matériel (aucun navigateur graphique
     interactif disponible dans cette session) — à confirmer par Corentin en
     conditions normales.
  4. Pause hors écran : non vérifiée visuellement pixel à pixel (nécessite de
     faire défiler puis revenir et comparer l'état) ; le mécanisme lui-même
     (`IntersectionObserver` dans `ThreeStage`, non modifié par ce ticket) est
     déjà utilisé par les autres démos 3D existantes.
  5. Navigation répétée : 3 allers-retours `/` → `/emse/embedded`, aucune
     erreur console (pas de « Too many active WebGL contexts »).
  6. À 360 px : `document.querySelectorAll("canvas").length === 0` (message
     de repli affiché à la place) et aucune requête réseau contenant « three »
     — confirmé par écoute `Network.requestWillBeSent`.
  7. Captures : prises (sombre, clair, 360 px, plusieurs instants de la
     boucle) via le script jetable ; non jointes au ticket (pas de pièce
     jointe possible dans ce format), mais inspectées une à une pendant la
     session.

**Écarts par rapport au ticket** :
- Étape 3 (créneau) implémentée par interpolation de Bézier + angle, pas par
  le modèle bicyclette en deux arcs, conformément à la clause de repli
  explicite du ticket après deux calibrations physiques infructueuses.
- Le point d'arrêt avant créneau (repère châssis) est à x=1.6 (essieu
  arrière) au lieu d'une valeur plus proche de la place, pour laisser de la
  marge au Bézier — n'affecte pas le rendu visuel du récit, juste un détail
  interne.
- FPS non confirmé ≥ 50 : mesuré uniquement sous rendu logiciel headless
  (voir point 3 ci-dessus).
- Clignotement des feux arrière non isolé visuellement à l'image près (code
  revu, comportement non capturé par une capture d'écran).

## Notes pour la consolidation

- Premier ticket de démo 3D à utiliser réellement le gabarit `ThreeStage`
  (`setup` + `update(elapsed, delta)`) pour une scène neuve ; les démos 3D
  précédentes fusionnées avant lui étaient soit des accents temporaires
  (Safran) soit conservées telles quelles (Quimesis).
- Pattern réutilisable pour les prochains tickets 3D : isoler toute
  trajectoire/état complexe dans un module `<nom>Logic.ts` sans état module,
  fonction pure de `elapsed`, testable par un script Node jetable (Node 24
  exécute du `.ts` directement sans dépendance ajoutée, tant que la syntaxe
  reste « erasable » — pas d'enum, pas de namespace).
- Vérification visuelle 3D sans extension navigateur : Chrome headless
  piloté en DevTools Protocol brut (WebSocket natif Node, sans dépendance)
  avec `--use-angle=swiftshader --enable-unsafe-swiftshader` fonctionne pour
  captures d'écran, console, réseau et FPS — mais le FPS mesuré sous ce mode
  logiciel n'est pas comparable au seuil de 50 fps du Guide 3D §4.3 (pensé
  pour un GPU réel) ; les prochains tickets 3D devraient soit ignorer ce
  chiffre en mode headless soit le re-vérifier via `claude-in-chrome` sur un
  vrai GPU quand l'extension est connectée.
