---
id: PORT-059
title: "Quimesis — mâchoire procédurale fidèle aux captures réelles de l'application (arche continue, pas des dents séparées)"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: ready
resumeAt: null
priority: P2
estimate: 2
confidence: low
model: opus
branch: feat/PORT-059-quimesis-real-jaw-look
depends_on: []
parallel_safe: true
human_checkpoint: "Comparer la mâchoire à l'écran aux 3 captures de référence : la ressemblance est-elle convaincante ?"
created: 2026-09-28
---

# Quimesis — mâchoire fidèle aux captures réelles

**Procédure** : `docs/PROCEDURE-TICKET.md` + `docs/GUIDE-3D.md`. Confiance
basse : géométrie 3D nouvelle, à ajuster par capture, pas un simple
paramétrage.

## Contexte — pourquoi ce ticket existe

Retour de Corentin (`recette-utilisateur-2.md`, point 8) :

> J'aimerais que la vraie mâchoire soit visualisée dans la démo, tu peux
> fouiller dans le code existant pour retrouver le fichier .stl contenant
> la mâchoire (attention, il y a une première version qui est générée avec
> énormément de points, et une épurée où l'on voit moins de points pour la
> mâchoire).

Aucun `.stl` n'existe dans ce dépôt ni sur le poste de Corentin (recherché
dans tout l'historique Git et sur le disque le 2026-09-28) : ce n'est pas
un logiciel de segmentation dentaire, c'est le portfolio. Question posée à
Corentin, réponse reçue :

> Il n'existe pas dans le repo mais peut être généré avec les algorithmes
> contenus dans le repo. Si c'est plus facile pour toi, génère-en un qui
> ressemble à la mâchoire affichée sur les photos.

**Aucun algorithme de génération de mâchoire n'existe réellement dans ce
dépôt** (ce n'est un portfolio, pas le logiciel Quimesis) — mais les
**captures d'écran du vrai logiciel** existent bel et bien, déjà publiées
sur le site :

- `assets/images-src/img/Quimesis1.png`
- `assets/images-src/img/Quimesis2.png`
- `assets/images-src/img/Quimesis3.png`

**Lire ces trois images avec l'outil de lecture d'image avant de commencer**
— c'est la vraie référence visuelle de ce ticket, pas une description
approximative. Ce qu'elles montrent, pour situer le travail :

- Une arche dentaire (mâchoire inférieure) en une **seule surface
  continue** couleur rose/mauve (gencive et dents fondues dans le même
  matériau et la même couleur — ce n'est PAS des dents blanches séparées
  posées sur une gencive rose : c'est un scan brut, tout est de la même
  teinte).
- Chaque dent se devine par des **bosses/cuspides** qui affleurent à la
  surface (molaires : plusieurs bosses ; incisives : une arête simple),
  reliées en continu à la gencive en dessous — pas de dents flottantes
  séparées par des vides.
- De fines lignes de séparation entre les dents sont visibles par endroits
  (frontière de segmentation), et une surface légèrement irrégulière/
  texturée (bruit de scan), surtout visible sur les molaires du fond.
- Quand une dent est sélectionnée dans l'appli réelle, elle passe en gris
  clair/blanc avec des points verts le long de sa frontière avec la
  gencive — c'est ce que le survol de la démo doit rappeler.

L'actuelle `QuimesisJawDemo.tsx` (PORT-049, M6) construit 28 dents comme
des maillages **séparés** (`RoundedBoxGeometry`/`CapsuleGeometry`) posées
sur un tube de gencive à part : ça ne ressemble pas du tout aux captures
(dents visuellement détachées, couleurs différentes dents/gencive). Ce
ticket remplace cette construction par une **surface continue**.

## Fichiers

- Remplacé : `src/components/demos/QuimesisJawDemo.tsx` (garder
  l'interactivité déjà en place — `OrbitControls` sans zoom, survol par
  raycaster, clic court pour ouvrir/fermer — et ne changer que la
  construction géométrique des arcades et le mécanisme de surbrillance)

## Approche géométrique proposée

Construire chaque arcade comme **une seule `THREE.BufferGeometry`**
paramétrique plutôt que des dents séparées :

1. Garder la courbe centrale de PORT-049 (`z = -0.55·x² + 0.9`,
   `x ∈ [-1.2, 1.2]`) comme ligne guide de l'arche.
2. Découper cette plage `x` en 14 segments égaux (7 dents par côté :
   2 incisives, 1 canine, 2 prémolaires, 2 molaires — comme PORT-049,
   mais fondues ensemble cette fois).
3. Pour chaque position `u` le long de la courbe (échantillonner
   ~120 points sur toute l'arche pour une surface lisse), et pour chaque
   angle `v` autour de la section transversale (~16 points, du bord
   lingual au bord vestibulaire en passant par la couronne), calculer un
   rayon de base `R(u)` (largeur constante raisonnable, ex. 0.13) modulé
   par une fonction de bosses `cusp(u, v)` :
   - Déterminer dans quelle "dent" (parmi les 14) tombe `u`, et son type
     (incisive/canine/prémolaire/molaire) par sa position dans la liste.
   - `cusp(u, v)` ajoute une ou plusieurs bosses gaussiennes centrées sur
     le sommet de la couronne (`v` proche du haut) : une seule bosse large
     pour une incisive/canine, deux pour une prémolaire, trois à quatre
     plus petites et rapprochées pour une molaire — c'est ce qui doit
     donner, une fois la surface lissée, la silhouette dentelée visible
     sur `Quimesis2.png`.
   - Une légère striction du rayon **entre** deux dents (juste avant/après
     chaque frontière `u`) pour suggérer les fentes de séparation visibles
     sur les captures, sans aller jusqu'à des dents complètement détachées.
4. Construire les triangles de la grille `(u, v)` comme un tube fermé sur
   `v` (comme un `TubeGeometry` mais avec un rayon qui varie aussi selon
   `v`, pas seulement selon `u`) ; capuchonner les deux extrémités de
   l'arche. Calculer les normales avec `BufferGeometry.computeVertexNormals()`.
5. Matériau **unique** pour toute la surface, couleur `colors.mainText` en
   thème sombre / un rose-mauve doux et désaturé en thème clair (comme les
   captures) — c'est une couleur "réaliste" documentée en exception au
   même titre que les dents de la version M6 ou le teint du tennisman :
   choisir une valeur qui reste lisible sur `--surface` clair **et**
   sombre (vérifier au moins visuellement par capture, pas seulement en
   théorie).
6. Deux arcades (haut/bas) comme avant, la mâchoire inférieure pivotant
   pour ouvrir/fermer autour du même point de pivot que PORT-049.

**Ce plan est une base, pas une martingale.** La difficulté réelle est de
calculer des normales cohérentes et d'éviter que la surface s'auto-
intersecte près des cuspides — attendu, à corriger par capture/zoom après
un premier essai, pas à résoudre analytiquement à l'avance.

## Interactivité — adapter, pas réécrire

- `OrbitControls` (zoom désactivé, pas de capture de la molette),
  `autoRotate` initial : identique à PORT-049.
- **Survol d'une dent** : comme la surface est maintenant continue (plus
  de maillage par dent à recolorer), reproduire l'effet des points verts
  des captures autrement : le `Raycaster` détermine, à partir du point
  d'intersection, à quelle "dent" (quel intervalle `u`) appartient le
  point touché (même mapping `u` → dent que pour la construction), puis
  affiche un petit **anneau/contour** décoratif (`colors.green`, fin tore
  ou ligne pointillée) positionné à la frontière de cette dent — pas une
  recoloration de la surface elle-même. Ça se rapproche visuellement des
  points verts des captures sans exiger un dégradé de couleurs par sommet.
- **Clic court (< 5 px de glissement) → ouverture/fermeture** : identique
  à PORT-049.
- Retirer tous les écouteurs dans `dispose()`, comme le reste du site.

## Vérifications

Procédure §4 + guide 3D §4. Aucun navigateur interactif connecté : Chrome
installé piloté en headless via le protocole DevTools (WebSocket natif
Node 24, script jetable hors dépôt, `--headless=new --use-angle=swiftshader
--enable-unsafe-swiftshader`, `--user-data-dir` dédié, arrêt par PID exact
uniquement) sur `npm run dev`, comme les autres tickets 3D de la recette.

1. Capturer la scène sur `/internships/quimesis`, thème sombre et clair,
   1280×800, et la comparer **côte à côte** (dans le journal, décrire la
   comparaison précisément) aux 3 captures de référence : surface
   continue, bosses de cuspides visibles, pas de dents flottantes
   détachées.
2. Glisser → rotation ; molette → défilement de page, pas de zoom.
3. Survol → un contour vert apparaît sur une dent à la fois, positionné
   raisonnablement sur la frontière de cette dent.
4. Clic court → ouverture/fermeture fluide.
5. Budget < 60 000 triangles (calculer : 2 arcades × ~120×16 quads × 2
   triangles ≈ 7 700 — large marge).

Commit : `feat(demos): rebuild the Quimesis jaw as one continuous arch, closer to the real app`

## Critères d'acceptation

- [ ] Une seule surface continue par arcade (pas de dents séparées visibles).
- [ ] Ressemblance jugée par comparaison directe aux 3 captures de référence.
- [ ] Interactivité (rotation, ouverture, survol) conservée.
- [ ] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

_(à remplir — inclure la comparaison capture-par-capture)_

## Notes pour la consolidation

- ARCHITECTURE.md : la démo de la mâchoire Quimesis construit une arche
  dentaire comme une seule surface paramétrique continue (pas des dents
  séparées), inspirée des captures d'écran réelles de l'application
  Quimesis déjà publiées dans la galerie du projet.
