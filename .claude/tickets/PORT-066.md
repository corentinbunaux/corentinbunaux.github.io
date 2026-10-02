---
id: PORT-066
title: "Safran — vaisseau plus reconnaissable (agrandir/détailler l'X-wing stylisé, ou basculer sur une autre silhouette)"
group: corentin
machine: asus_corentin
milestone: M8 — Recette utilisateur, 3e passe
status: ready
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

- [ ] Le vaisseau est clairement visible et lisible comme un vaisseau sur une
      capture plein cadre, pas seulement en gros plan.
- [ ] Toujours sans nom, logo ni couleurs de franchise précise.
- [ ] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

_(à remplir — joindre au moins une capture plein cadre avant/après)_

## Notes pour la consolidation

- ARCHITECTURE.md : si le temps 2 est utilisé, noter que la silhouette du
  chasseur Safran est passée de "4 ailes en X" à "aile delta", et pourquoi
  (lisibilité à petite échelle).
