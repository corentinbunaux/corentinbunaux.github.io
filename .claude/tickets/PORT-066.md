---
id: PORT-066
title: "Safran — vaisseau plus reconnaissable (agrandir/détailler l'X-wing stylisé, ou basculer sur une autre silhouette)"
group: corentin
machine: asus_corentin
milestone: M8 — Recette utilisateur, 3e passe
status: review
resumeAt: null
priority: P2
estimate: 1.5
confidence: low
model: opus
branch: fix/PORT-066-safran-fighter-recognizable
depends_on: []
parallel_safe: true
human_checkpoint: "Regarder le vaisseau passer (vers 20 s) à taille réelle d'affichage : le reconnaît-on comme un vaisseau spatial ?"
created: 2026-10-02
---

# Safran — un vaisseau qu'on reconnaît vraiment

**Procédure** : `docs/PROCEDURE-TICKET.md` + `docs/GUIDE-3D.md`.

## Historique (pour ne pas refaire le même travail)

- **PORT-045 (M7)** : premier chasseur à 4 ailes, bug non détecté.
- **PORT-054 (M8, 2e passe)** : bug réel trouvé et corrigé — les ailes
  avaient leur grande dimension parallèle au fuselage au lieu de radiale,
  donc jamais déployées. Après correction, une capture **zoomée** a bien
  montré un X net.
- **Retour de Corentin (3e passe, aujourd'hui)** :
  > Pour le X-wing de Star Wars dans l'animation Safran, il faut améliorer
  > son rendu visuel, ou trouver un autre vaisseau qu'on reconnaîtra plus,
  > visuellement le rendu n'est pas celui attendu pour l'instant.

Donc la géométrie des ailes est correcte **en gros plan**, mais le résultat
ne convainc toujours pas **à l'affichage normal**. Deux causes plausibles, à
vérifier dans cet ordre avant de redessiner quoi que ce soit :

1. **Trop petit/trop rapide pour être perçu** : le vaisseau fait ~0,6 unité
   de long, orbite à un rayon de 3,2 autour d'une Terre de rayon 1,4, dans un
   cadre qui montre aussi toute la Terre — à cette échelle, il peut occuper
   quelques pixels seulement à l'écran. Une géométrie correcte mais
   minuscule et furtive ne "ressemble à rien" même si elle est juste en gros
   plan.
2. **Trop monochrome/plat** : un seul gris uni sur toute la coque ne donne
   aucun repère visuel de type "vaisseau" (pas de cockpit, pas de contraste
   de couleur, pas de détail reconnaissable) — même bien proportionné, une
   forme grise uniforme se lit mal à petite échelle.

## Fichiers (uniquement ceux-ci)

- `src/components/demos/SafranEarthDemo.tsx`
- `src/i18n/namespaces/demos.ts` (seulement si la légende doit changer de
  sens — par exemple si la silhouette n'est plus censée évoquer Star Wars)

## Démarche en deux temps — s'arrêter au premier qui convainc

### Temps 1 (à tenter en premier) — agrandir, rapprocher, détailler le même vaisseau

Dans `SafranEarthDemo.tsx`, ajuster (les noms exacts de constantes peuvent
différer légèrement de PORT-054 à PORT-066 selon ce qui a été commité entre
temps — lire le fichier avant de modifier) :

1. **Taille** : doubler environ l'échelle du vaisseau construit dans
   `buildFighter` (toutes les dimensions du fuselage/ailes/canons), ou
   appliquer un `group.scale.setScalar(2)` sur le groupe retourné — choisir
   ce qui est le plus simple à lire dans le code existant.
2. **Trajectoire plus proche** : réduire `FIGHTER_RADIUS` (actuellement
   `3.2`) à une valeur qui passe plus près de la caméra, par exemple `2.4`,
   en vérifiant par capture qu'il ne traverse pas visuellement la Terre
   (ajuster l'inclinaison/le plan de l'arc si besoin pour qu'il passe devant
   sans la couper).
3. **Passage plus lent** : augmenter `FIGHTER_PASS_DURATION` (actuellement
   `7`) à `10`-`12` secondes, pour laisser le temps de le voir distinctement.
4. **Un peu de couleur, pas de logo** : ajouter un léger contraste qui aide
   l'œil à lire une forme de vaisseau sans reproduire un logo ou un nom de
   franchise — par exemple une **bulle de cockpit** (petite demi-sphère,
   `THREE.SphereGeometry` tronquée ou juste une sphère aplatie, couleur
   `colors.blue`, légèrement transparente) sur le dessus du fuselage à
   l'avant, et un petit cylindre (type « droïde astromech ») derrière la
   bulle, couleur `colors.mainText`. Garder le fuselage/les ailes dans leur
   gris neutre actuel (`hullColor`), ne pas ajouter de bandes ni de
   marquages qui évoqueraient une franchise précise.
5. **Vérifier par capture plein cadre** (pas un crop zoomé comme PORT-054) :
   à la taille réelle d'affichage dans le cadre 16:9 de la démo, le vaisseau
   doit être clairement visible et lisible comme un vaisseau (silhouette +
   cockpit distincts), pas un point minuscule qui traverse l'écran.

Si, après ces changements, une capture plein cadre montre un vaisseau
clairement visible et qui se lit comme tel (même si l'identification
précise "X-wing" reste approximative — l'important est "on reconnaît un
vaisseau", pas une reproduction exacte) : **s'arrêter là**, c'est suffisant.

### Temps 2 (seulement si le temps 1 ne convainc toujours pas) — changer de silhouette

Remplacer le concept "4 ailes en croix" par une silhouette de chasseur
générique **plus simple à lire à petite échelle** : un intercepteur à aile
delta (une seule paire d'ailes larges et plates, triangulaires, pas quatre
fines branches). C'est beaucoup plus lisible en silhouette qu'une croix fine,
tout en restant clairement "un vaisseau spatial", sans viser une franchise
précise :

- **Fuselage** : identique ou similaire à l'actuel (cylindre effilé + nez
  conique), éventuellement raccourci.
- **Aile delta** : une seule paire, une de chaque côté, chacune un
  `THREE.BoxGeometry` ou `THREE.ExtrudeGeometry` plat et large (base large à
  la racine du fuselage, pointe effilée vers l'arrière), inclinaison légère
  vers le bas (anédrale), occupant une bonne partie de la longueur du
  fuselage — pas de petites ailettes fines.
- **Cockpit** : bulle semi-sphérique à l'avant du dessus du fuselage,
  couleur `colors.blue`, légèrement transparente.
- **Réacteurs** : deux petits cylindres lumineux (`colors.green`,
  `MeshBasicMaterial`) à l'arrière, à la base de chaque aile.
- Mêmes ajustements de taille/distance/durée que le temps 1 (plus gros, plus
  proche, plus lent).

Si ce changement de silhouette est fait, mettre à jour les deux légendes
`"safran-earth"` dans `src/i18n/namespaces/demos.ts` pour ne plus suggérer
une ressemblance avec un vaisseau précis — remplacer uniquement la phrase
qui mentionne le clin d'œil, par exemple :
- FR : « …un chasseur spatial stylisé qui finit par passer. »
- EN : « …a stylised space fighter eventually flies by. »
(Garder le reste de chaque légende identique — texture NASA, etc.)

## Vérifications

Procédure §4 + guide 3D §4. Aucun navigateur interactif connecté : Chrome
installé piloté en headless (protocole DevTools, WebSocket natif Node 24,
script jetable hors dépôt, `--headless=new --use-angle=swiftshader
--enable-unsafe-swiftshader`, `--user-data-dir` dédié). Arrêter Chrome/le
serveur **uniquement par leur PID exact**, jamais par nom d'image.

1. Capturer le cadre **complet** de la démo (pas un zoom) à plusieurs
   instants du passage du vaisseau (début, milieu, fin), 1280×800, thème
   sombre et clair.
2. Juger à partir de ces captures (pas d'un gros plan) : le vaisseau est-il
   clairement visible et identifiable comme un vaisseau, à la taille à
   laquelle un visiteur le verrait réellement ?
3. Vérifier qu'il ne traverse pas la Terre ni les satellites de façon
   visuellement incohérente sur sa nouvelle trajectoire.
4. Guide 3D §4 habituel (budget de triangles, pas d'erreur console, etc.).

Commit (temps 1) : `fix(safran): make the starfighter bigger, closer and slower to read clearly`
Commit (temps 2, si utilisé) : `fix(safran): replace the X-wing silhouette with a delta-wing fighter`

## Critères d'acceptation

- [x] Le vaisseau est clairement visible et lisible comme un vaisseau sur une
      capture plein cadre, pas seulement en gros plan.
- [x] Toujours sans nom, logo ni couleurs de franchise précise.
- [x] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

**Décision : temps 2 (aile delta).** Le temps 1 a été fait, committé
(4cc179f) et jugé sur captures plein cadre avant de passer au temps 2.

Constat de départ : le cadre de la démo est `max-w-md` → **446 × 250 px**
à 1280 × 800. C'est à cette taille que tout a été jugé.

- **Avant** (refonte-2026, 334cc7b) : chasseur ~40 px, croix grise fine,
  difficile à distinguer des satellites (même gris, même forme « corps +
  panneaux »). Bug supplémentaire trouvé : le modèle volait **à reculons**
  depuis PORT-054 (`Object3D.lookAt` oriente le +Z d'un mesh vers la cible,
  vérifié dans `node_modules/three/src/core/Object3D.js` l. 713-721 ; le code
  envoyait l'avant sur -Z).
- **Temps 1** (4cc179f) : échelle ×2 (`FIGHTER_SCALE`), `FIGHTER_RADIUS`
  3.2 → 2.4, `FIGHTER_PASS_DURATION` 7 → 11 s, bulle de cockpit
  `colors.blue` + petit cylindre `colors.mainText`, orientation corrigée.
  Résultat plein cadre : vaisseau bien visible (~70-90 px) mais il se lit
  comme une **croix / un moulin** vu de face ou de dessus, le cockpit est
  illisible à cette taille. Pas convaincant → temps 2.
- **Temps 2** (48ca508) : fuselage effilé + nez conique, une paire d'ailes
  delta (`ExtrudeGeometry`, anédrale 10°), bulle de cockpit `colors.blue`
  transparente, deux réacteurs `colors.green` (`MeshBasicMaterial`), gris
  neutre `0x9a9a9a`. Mêmes réglages taille/rayon/durée que le temps 1.
  Écart au ticket (ajout) : le vecteur `up` du chasseur est penché vers la
  caméra (`FIGHTER_BANK = 1.2`) pour qu'il soit vu en plan (de dessus) et pas
  par la tranche — l'arc est presque à hauteur d'œil, une aile delta à plat
  y serait une simple ligne. Résultat plein cadre : silhouette de chasseur à
  aile delta nettement lisible, nez/cockpit/réacteurs identifiables, en
  sombre et en clair. Passe devant la Terre (au-dessus du limbe), jamais au
  travers ; croise les orbites des satellites dans d'autres plans, sans
  incohérence visible.
- Légendes `demos.ts` **non modifiées** : elles ne parlent que d'« un
  visiteur inattendu » / « an unexpected visitor », aucune ressemblance avec
  un vaisseau précis n'y est suggérée.

Captures prises pendant l'exécution (dossier scratchpad de session, non
versionnées) : avant/temps 1/temps 2 en thème sombre et temps 2 en thème
clair, chacune en plein cadre 1280×800 et en planche à taille native
446×250.

Vérifications (Chrome headless `--use-angle=swiftshader`, CDP, 1280×800) :
- console : aucune erreur/avertissement après modification (avant : un 404
  de ressource, non lié, non reproduit ensuite).
- triangles max/frame (compteur sur `drawElements`/`drawArrays`) : avant
  8 056, temps 1 8 392, temps 2 8 184. Budget < 60 000 respecté.
- fps : 37 sur 5 s — rendu **logiciel** SwiftShader en headless, non
  représentatif ; cible ≥ 50 fps NON vérifiée sur GPU.
- 3 allers-retours Kusmitea ↔ Safran : 1 canvas, aucune erreur WebGL.
- 360 px : 0 canvas, 0 requête contenant « three » sur 20 requêtes.
- Pause hors écran : NON revérifiée (comportement de `ThreeStage`, inchangé).

Commandes (dans la worktree, avant intégration de `refonte-2026`) :
```
$ npm run lint
✖ 4 problems (0 errors, 4 warnings)   (préexistants, autres fichiers)
$ npx eslint src/components/demos/SafranEarthDemo.tsx   -> aucune sortie
$ npm run build   -> succès, "○ (Static) prerendered as static content"
$ npx tsc --noEmit   -> aucune sortie, exit 0
```

Ces vérifications ont été relancées par l'orchestrateur après fusion de
`refonte-2026` dans la branche, avant la fusion finale (voir plus bas).

## Notes pour la consolidation

- **Temps 2 utilisé** : la silhouette du chasseur Safran passe de « 4 ailes
  en X » à « aile delta » (lisibilité dans un cadre de 446 × 250 px : les 4
  ailes fines se lisaient comme une croix / un satellite de plus). Le
  chasseur est incliné vers la caméra (`FIGHTER_BANK`) pour être vu en plan.
- Bug corrigé au passage : le chasseur volait à reculons depuis PORT-054
  (`Object3D.lookAt` vise avec +Z pour un mesh, pas -Z).
- Point à surveiller (hors ticket) : en headless SwiftShader la Terre paraît
  très sombre (seul un croissant en haut est éclairé). À vérifier sur un vrai
  GPU ; si c'est pareil, ouvrir un ticket d'éclairage de la scène Safran.
