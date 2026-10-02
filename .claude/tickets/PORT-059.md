---
id: PORT-059
title: "Quimesis — mâchoire procédurale fidèle aux captures réelles de l'application (arche continue, pas des dents séparées)"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: review
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

Exécuté le 2026-09-28 → 2026-10-02 (session interrompue puis reprise), worktree
`../wt-PORT-059`, branche `feat/PORT-059-quimesis-real-jaw-look`.

### Ce qui a été fait

`src/components/demos/QuimesisJawDemo.tsx` réécrit (seul fichier de code touché ;
registre inchangé, `ready: true` déjà en place) :

- Chaque arcade = **une seule `BufferGeometry` indexée** : un tube balayé le long
  de la parabole de PORT-049 (`z = -0.55·x² + 0.9`), paramétré par abscisse
  curviligne. À chaque échantillon, un anneau de section (38 sommets, sens
  trigonométrique dans le plan normale/haut) : socle de gencive (fond plat à bord
  légèrement irrégulier, paroi vestibulaire évasée, bosse radiculaire sous chaque
  couronne) + couronne en super-ellipse avec relief occlusal (incisive : bord
  droit ; canine : une cuspide émoussée ; prémolaire : 2 cuspides ; molaire :
  4 cuspides + 1 petite + sillon central). Le long de l'arche, la hauteur de
  couronne suit une super-ellipse par dent → sillon en V à chaque frontière,
  papille gingivale qui remonte entre les dents. Extrémités : un petit coussinet
  rétromolaire puis capuchon en éventail. Léger bruit déterministe (aspect scan).
  `computeVertexNormals()`. Arcade haute = miroir en y avec inversion du sens des
  triangles.
- Matériau **unique** pour toute la surface (gencive et dents fondues).
- Survol : le `Raycaster` touche la surface → `face.a / RING_SIZE` donne la bande
  d'anneaux → table bande → dent (même découpage que la construction). Un
  `InstancedMesh` de 18 petites sphères `colors.green` (enfant de l'arcade, suit
  l'ouverture) dessine la frontière dent/gencive de cette dent (côté
  vestibulaire, côté lingual, deux extrémités). Une dent à la fois ; curseur
  `pointer`. Ajout d'un `pointerleave` qui masque les points (retiré dans
  `dispose()`).
- Inchangé : `OrbitControls` sans zoom/pan, `autoRotate`, clic court < 5 px →
  ouverture/fermeture (même pivot, même angle, même durée).

### Écarts par rapport au ticket (assumés, au nom de la ressemblance)

1. **Couleur** : le ticket propose `colors.mainText` en thème sombre ; or ce
   token vaut `#f5f5f5` (blanc) → on retrouvait des « dents blanches », contraire
   aux captures. Rose « réaliste » dans les deux thèmes : `#d6aab2` (sombre),
   `#dcaab3` (clair, rendu mauve désaturé une fois éclairé). Lisible sur les deux
   surfaces (vérifié par capture).
2. **Largeurs de dents** : poids par type (incisive 0.78, canine 0.88,
   prémolaire 0.9, molaire 1.3) au lieu de 14 segments égaux — les molaires des
   captures sont nettement plus longues que les incisives.
3. **Échantillonnage** : 16 anneaux par dent (233 anneaux) et 38 sommets par
   anneau au lieu de ~120 × 16 : les cuspides n'étaient pas représentables avec
   16 points de section.
4. **Caméra** : rapprochée (`(0, 1.8, 3.7)`, cible `(0, 0, 0.3)`) pour que
   l'arche remplisse le cadre.
5. Survol : points (comme l'appli) plutôt qu'un tore — le ticket laisse le choix.

### Budget triangles (calculé depuis les constantes du code)

233 anneaux × 38 sommets → 232 × 38 × 2 = 17 632 triangles + 2 × 38 de
capuchons = 17 708 par arcade → **≈ 35 400** pour les deux, + ~1 400 pour les
18 sphères quand le survol est actif. < 60 000. Non mesuré via
`renderer.info` (renderer inaccessible depuis la page) : c'est un calcul.

### Vérifications

```
$ npm run lint   (5 dernières lignes)
  48 |   return colors;
  49 | }  react-hooks/set-state-in-effect

✖ 4 problems (0 errors, 4 warnings)
```
(4 avertissements préexistants, hors de ce fichier.)

```
$ npm run build   (5 dernières lignes)
└ ○ /work/gcii


○  (Static)  prerendered as static content
```

```
$ npx tsc --noEmit   (lancé après le build)
npm notice run next-app@0.1.0 npx
npm notice run tsc --noEmit
(code de sortie 0, aucune erreur)
```

Visuel : Chrome installé en headless (`--headless=new --use-angle=swiftshader
--enable-unsafe-swiftshader`, profil dédié, script CDP jetable hors dépôt) sur
`npm run dev -- -p 3159` dans la worktree ; Chrome et serveur arrêtés par PID
exact.

- 1280×800, sombre et clair : scène cadrée dans le 16:9, deux arcades roses
  continues, rien de coupé.
- Glisser → rotation (captures après glissement) ; molette au-dessus du canvas →
  `scrollY` 2263 → 2563 (la page défile, pas de zoom).
- Survol → curseur `pointer` et un seul anneau de points verts au collet de la
  dent survolée (testé sur une incisive inférieure et une dent supérieure).
- Clic court → la mâchoire inférieure s'ouvre (capture à 200 ms : mouvement en
  cours ; à 1,2 s : ouverte, faces occlusales visibles) puis se referme.
- Console : aucune erreur ni avertissement three/WebGL.
- fps : 15–20 en headless **SwiftShader** (rendu logiciel) — non représentatif ;
  la cible ≥ 50 fps sur vrai GPU n'est **pas vérifiée**.
- 3 allers-retours Safran ↔ Quimesis : pas d'erreur « Too many active WebGL
  contexts », 2 canvas, la scène s'affiche. Défilement en haut de page puis
  retour : la scène est toujours là.
- 360 px : message « Cette animation 3D s'affiche sur un écran large… » pour les
  deux démos, 0 canvas, 0 ressource « three » chargée.
- Thème : vérifié en sombre et en clair par rechargement (pas par bascule à
  chaud du bouton de thème).

### Comparaison aux 3 captures de référence

- **Quimesis1.png** (gros plan vestibulaire des molaires inférieures, dent
  sélectionnée blanche + points verts) : même principe de surface unique rose où
  les couronnes émergent d'une gencive épaisse à paroi vestibulaire haute, sillons
  nets entre couronnes. Différences : nos couronnes sont plus régulières et moins
  bombées (pas de contre-dépouille au collet), micro-texture de scan bien plus
  discrète ; la dent survolée n'est pas blanchie (seuls les points, comme le
  ticket le demande), points plus petits et en `colors.green` (vert-gris du
  thème) plutôt que vert saturé.
- **Quimesis2.png** (arcade inférieure entière vue de 3/4 dessus) : la plus
  proche. Mâchoire ouverte (clic), on retrouve l'arche en fer à cheval, les
  incisives en arête, les molaires à plusieurs cuspides avec sillon central, le
  rebord de gencive qui déborde côté vestibulaire et lingual, le bord inférieur
  légèrement irrégulier. Différences : la référence n'a qu'une arcade (ici deux,
  comme PORT-049) ; l'arcade haute vue de dessus montre un socle plat assez
  massif qui n'existe pas sur les captures.
- **Quimesis3.png** (gros plan d'une dent sélectionnée, points verts au collet) :
  l'anneau de points verts au collet de la dent survolée reproduit directement
  celui de la capture (frontière dent/gencive, tout le tour). Les couronnes de la
  référence sont plus hautes et séparées par des embrasures plus ouvertes ; les
  nôtres se touchent davantage au sommet.

Verdict de l'exécutant : ressemblance correcte de loin (forme, couleur unique,
continuité, cuspides), plus schématique de près. Checkpoint humain requis.

## Notes pour la consolidation

- ARCHITECTURE.md : la démo de la mâchoire Quimesis construit une arche
  dentaire comme une seule surface paramétrique continue (pas des dents
  séparées), inspirée des captures d'écran réelles de l'application
  Quimesis déjà publiées dans la galerie du projet.
- Point faible : la section est un « champ de hauteur » par anneau, donc pas de
  couronnes bombées en contre-dépouille au collet ; le socle de l'arcade haute
  (vu de dessus) est un bloc plat.
- Couleur rose « réaliste » `#d6aab2` / `#dcaab3` documentée comme exception au
  même titre que la Terre ou le teint du tennisman (pas `colors.mainText`, qui
  est blanc en thème sombre).
- Idée (non faite) : blanchir la couronne survolée par couleurs de sommets, comme
  l'appli réelle.
