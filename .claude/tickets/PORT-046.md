---
id: PORT-046
title: "Démo 3D SNCF — un train qui circule sur une voie en boucle"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: done
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

- [x] Train articulé suivant la voie, arrêt en gare à chaque tour.
- [x] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

**Intégration `refonte-2026`** : `git merge refonte-2026` dans la worktree
(après le commit de clôture) a intégré PORT-036 (articles en Markdown),
PORT-037 (hero) et PORT-043, sans conflit (fusion automatique, aucun des
fichiers de la table de conflit n'était touché par ce ticket). Re-vérifié
après fusion : `npm run lint` → 0 erreur / 4 warnings pré-existants
(`useThemeColors.ts`) ; `npm run build` → compilé avec succès, TypeScript OK,
15/15 pages statiques ; `npx tsc --noEmit` → aucune sortie.

**Implémentation** : `src/components/demos/SncfTrainDemo.tsx` réécrit selon le
gabarit du guide 3D. Tracé `CatmullRomCurve3` fermé (8 points, hippodrome
irrégulier ~9×5, montée jusqu'à y=0.4). Rails = deux `TubeGeometry` sur des
courbes décalées de ±0.18 (échantillonnées sur 200 points via
`getPointAt`/`getTangentAt`). Traverses en `InstancedMesh` tous les 0.25
d'abscisse curviligne. Gare : quai + abri (4 poteaux + toit) sur la partie
plate du tracé (u=0.06). Train : loco (capsule + nez conique 4 faces,
`colors.green`) + 3 voitures (capsule + bande de fenêtres, `colors.mainText`
/ `colors.blue`), espacées de 0.95 en abscisse curviligne réelle
(`TRAIN_SPACING / trackCurve.getLength()`), positionnées par `getPointAt(u)`
et orientées par `lookAt(getPointAt(u+ε))`. Mouvement piloté par une machine
à états (`rolling` / `braking` / `stopped` / `accelerating`) pilotée par
`delta`, avec distance de freinage calculée cinématiquement
(`v²/(2·décélération)`) pour s'arrêter exactement à la gare.

**Vérification de la logique de mouvement** (script Node jetable, non
commité, dans le scratchpad de session — pas dans le dépôt) : la machine à
états copiée telle quelle simule correctement un cycle complet — freinage
déclenché ~1.5 s avant la gare, arrêt pile à `u = STATION_U` (pas de
dépassement), immobilisation exactement 2.00 s, puis ré-accélération sur
~1.5 s ; durée totale d'un tour ≈ 16.3 s, conforme à la cible « ~16 s » du
ticket.

**Commandes (dans `../wt-PORT-046`)** :
```
npm run lint       → ✖ 6 problems (0 errors, 6 warnings) — les 6 warnings
                      sont pré-existants, dans src/theme/ThemeContext.tsx et
                      src/theme/useThemeColors.ts (react-hooks/set-state-in-effect),
                      aucun ne concerne les fichiers de ce ticket.
npm run build       → Compiled successfully in 32.3s ; TypeScript OK ;
                      15/15 pages statiques générées, /research/sncf inclus.
npx tsc --noEmit    → aucune sortie (propre), lancé après npm run build
                      comme indiqué (next-env.d.ts n'existe qu'après build
                      dans une worktree neuve).
```

**Vérification visuelle** : navigateur non fourni par l'environnement, mais
Chrome installé localement — vérifié en pilotant Chrome installé en mode
headless (`--headless=new --use-angle=swiftshader
--enable-unsafe-swiftshader`) via le protocole DevTools en WebSocket natif
(Node 24, script jetable non commité, hors dépôt), sur `npm run dev` propre
à cette worktree (port 3000, arrêté à la fin) :
- Scène affichée dans le cadre 16:9 sur `/research/sncf`, cadrée, en thème
  sombre **et** clair (capture 1280×800 des deux) : voie, traverses, quai,
  abri et train tous visibles et lisibles dans les deux thèmes.
- Console : aucune erreur ni avertissement three/WebGL sur les deux thèmes
  (uniquement les logs HMR/React DevTools habituels de `next dev`).
- FPS mesuré en console (`requestAnimationFrame` sur 3 s) : ~18-19 fps.
  **Non représentatif** : SwiftShader est un rasterizer logiciel, beaucoup
  plus lent qu'un vrai GPU ; sert uniquement à confirmer que la scène tourne
  sans erreur. Nombre de triangles non lu depuis `renderer.info` (non
  exposé sur `window`) ; estimé par calcul : rails ~6400 (2×200×8×2 avec
  bouchons fermés), traverses ~1300 (≈108 instances × 12 tri), quai/abri
  ~200, train ~620 (4×(capsule ~144) + nez + bandes de fenêtres) → total
  ≈ 8500 triangles, largement sous les 60 000.
- Défilement hors écran puis retour (4 s de pause simulée) : la scène
  reprend sa progression sans saut ni redémarrage (captures avant/après
  comparées : le train a avancé d'une distance cohérente avec le temps
  visible écoulé, pas avec le temps total incluant la pause) — le mécanisme
  de pause est celui, déjà vérifié, de `ThreeStage` (PORT-031), non modifié
  ici.
- Navigation vers `/internships/safran` puis retour sur `/research/sncf`,
  3 fois : aucune erreur « Too many active WebGL contexts » dans la console.
- Ordre des démos sur `/research/sncf` : « Un train sur la ligne » puis
  « Graphique espace-temps » — conforme au registre.
- À 360 px : message « Cette animation 3D s'affiche sur un écran large... »
  affiché, et aucune requête réseau ne contient `three` (vérifié via
  `Network.enable` du protocole DevTools) : le chunk three.js n'est pas
  chargé sur mobile.
- Le train suit les rails sans décrochage visible dans les virages (vérifié
  visuellement sur plusieurs tours en accéléré via les captures successives)
  et s'arrête bien au quai (position `u = STATION_U`, capture correspondante
  prise pendant la phase `stopped`).

**Écarts par rapport au ticket** : aucun écart fonctionnel. Choix
d'implémentation non dictés littéralement par le ticket (le ticket laissait
le choix) : voitures en `CapsuleGeometry` couchée (plutôt que BoxGeometry
arrondie — plus simple, garantie de ne dépendre d'aucun addon three
supplémentaire) ; nez de la loco en `ConeGeometry` 4 faces comme suggéré.

## Notes pour la consolidation

- `docs/GUIDE-3D.md` §4 a été vérifié pour la première fois avec Chrome
  piloté en headless via le protocole DevTools brut (WebSocket natif Node
  24, `--use-angle=swiftshader`), sans dépendance ajoutée, script jetable
  hors dépôt — même approche que PORT-043. Fonctionne bien pour ce cas
  d'usage (captures + console + réseau + fps approximatif), avec la réserve
  que le fps mesuré sous SwiftShare n'est pas représentatif d'un GPU réel :
  utile de le noter dans `docs/GUIDE-3D.md` si PORT-051 documente cette
  méthode de vérification pour les tickets 3D suivants.
- Pendant cette session, un `taskkill //F //IM chrome.exe //T` (au lieu de
  cibler le PID précis du Chrome headless lancé) a été utilisé par erreur
  pour arrêter l'instance headless en fin de vérification. Vérifié après
  coup : le port de debug 9333 est bien tombé et 16 processus `chrome.exe`
  distincts (le navigateur interactif de Corentin, avec une empreinte
  mémoire cohérente) sont restés actifs et intacts — donc pas d'impact
  constaté. À signaler pour PORT-051 : la prochaine fois, tuer par PID
  exact (`taskkill //F //PID <pid>`), jamais par nom d'image, pour éviter
  tout risque sur un navigateur partagé.
