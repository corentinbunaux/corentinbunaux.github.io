---
id: PORT-045
title: "Démo 3D Safran — Terre texturée (NASA Blue Marble), satellites visibles, chasseur stylisé tardif"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P2
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-045-safran-earth
depends_on: [PORT-031]
parallel_safe: true
human_checkpoint: "Regarder la scène Safran 30 s : Terre reconnaissable, satellites visibles, passage du chasseur."
created: 2026-09-27
---

# Démo 3D Safran — la Terre et sa constellation

**Procédure** : `docs/PROCEDURE-TICKET.md` + **`docs/GUIDE-3D.md`**.

## Retour de Corentin (#9)

> Voir si c'est possible de modifier l'animation Safran pour visualiser
> correctement les satellites autour de l'astre, si possible faire en sorte
> que l'astre ressemble davantage à la planète Terre, et en dernier recours
> pouvoir visualiser un vaisseau Star Wars comme animation tardive qui se
> déplace autour de l'astre.

Décisions (2026-09-27) :
- Terre texturée avec **NASA Blue Marble** (domaine public). **Téléchargement
  approuvé par Corentin** dans la session du 2026-09-27 — uniquement depuis
  le site officiel de la NASA (Visible Earth / Earth Observatory).
- Star Wars : propriété de Lucasfilm → **clin d'œil stylisé** : un chasseur
  générique à quatre ailes en X, sans nom, logo ni couleurs de franchise.

## Fichiers

- Ajoutés : `assets/images-src/img/earth-blue-marble.jpg` (master), et ce
  que génère `npm run optimize:images` (`public/img/earth-blue-marble.*`,
  `src/data/imageManifest.json`)
- Remplacé : `src/components/demos/SafranEarthDemo.tsx`
- Supprimé : `src/components/SafranAccent.tsx`
- Modifié : `src/i18n/namespaces/demos.ts` — **seulement** les deux
  `caption` de `"safran-earth"` (FR et EN)

## Étapes

### 1. Texture

1. Chercher (WebSearch) la page officielle NASA de **Blue Marble: Next
   Generation** (visibleearth.nasa.gov ou earthobservatory.nasa.gov) et une
   image équirectangulaire du monde (projection plate 2:1). **Ne pas**
   deviner d'URL : partir de la page trouvée, noter l'URL exacte de la page
   et du fichier, sa taille, dans le journal.
2. Télécharger une version ≤ 20 Mo. Redimensionner en **2048 × 1024**
   (sharp est déjà une dépendance) :
   `node -e "require('sharp')('<fichier>').resize(2048,1024).jpeg({quality:85}).toFile('assets/images-src/img/earth-blue-marble.jpg')"`
3. `npm run optimize:images` ; vérifier l'entrée du manifeste et les fichiers
   générés (`public/img/earth-blue-marble.webp` attendu ; noter la taille).
4. Si aucune source NASA officielle n'est trouvable : **stop**, ticket
   `blocked` (ne pas prendre une texture d'un autre site).

### 2. Scène (`SafranEarthDemo.tsx`, gabarit du guide)

- Caméra : fov 40, position (0, 1.2, 6.5), regarde (0, 0, 0).
- Lumières : ambiante 0.35 ; directionnelle 1.6 depuis (5, 3, 5) (le
  « soleil » : un côté jour, un côté nuit doux).
- **Terre** : `SphereGeometry(1.4, 64, 48)`, `MeshStandardMaterial({ map })`,
  texture `/img/earth-blue-marble.webp` (TextureLoader, `colorSpace = SRGB`),
  inclinaison de l'axe 23.4° (rotation Z du groupe), rotation propre
  0.06 rad/s.
- **Atmosphère** : sphère rayon 1.47, `MeshBasicMaterial` couleur
  `colors.blue`, `transparent`, opacité 0.12, `side: THREE.BackSide`.
- **Étoiles** : 600 `Points` fixes sur une sphère de rayon 40,
  taille 0.08, couleur `colors.secondText`.
- **Satellites visibles** (le cœur du retour) : 6 satellites, chacun =
  corps `BoxGeometry(0.1, 0.1, 0.16)` couleur `colors.mainText` + deux
  panneaux `BoxGeometry(0.28, 0.01, 0.1)` couleur `colors.blue` de part et
  d'autre. Trois orbites inclinées (rayons 1.9 / 2.3 / 2.7, inclinaisons
  15° / -40° / 65°), deux satellites par orbite en opposition, vitesses
  0.35 / 0.25 / 0.18 rad/s. Chaque orbite est **tracée** (`LineLoop` de 128
  points, `colors.green`, opacité 0.35) pour qu'on comprenne le mouvement.
  Les satellites s'orientent dans le sens de la marche.
- **Chasseur stylisé** (apparition tardive) : groupe ≈ 0.5 de long —
  fuselage (`CylinderGeometry` effilé + nez `ConeGeometry`), 4 ailes fines
  (`BoxGeometry`) en X (±15° autour de l'axe), 4 petits réacteurs
  (`CylinderGeometry`) au bout des ailes avec une lueur
  (`MeshBasicMaterial` couleur `colors.green`). Gris neutre pour le reste.
  Première apparition à **elapsed = 20 s**, puis toutes les **45 s** : il
  traverse le champ sur un arc autour de la Terre (rayon ~3.2, un demi-tour
  en ~7 s), orienté selon sa trajectoire, puis disparaît (`visible = false`)
  hors champ. Pas de son, pas de texte.
- Budget < 60 000 triangles (vérifier `renderer.info`).

### 3. Légende — `src/i18n/namespaces/demos.ts`

Remplacer uniquement les deux légendes de `"safran-earth"` :
- FR : `Des satellites en orbite autour de la Terre, clin d'œil au secteur aérospatial de Safran. Texture : NASA Blue Marble. Restez un peu : un visiteur inattendu finit par passer.`
- EN : `Satellites orbiting Earth, a nod to Safran's aerospace sector. Texture: NASA Blue Marble. Stay a while: an unexpected visitor eventually flies by.`

### 4. Nettoyage

`git rm src/components/SafranAccent.tsx` ; `grep -rn SafranAccent src` → vide.
`registry.ts` : `safran-earth` est déjà `ready: true`, ne rien changer.

### 5. Vérifications

Guide 3D §4 sur `/internships/safran` + : la Terre est reconnaissable
(continents), les 6 satellites et leurs orbites se voient sans zoomer, le
chasseur passe vers 20 s (attendre, noter l'heure observée). Taille de la
texture chargée (onglet Réseau) notée dans le journal.

Commits :
1. `chore(assets): add the NASA Blue Marble texture`
2. `feat(demos): Earth, visible satellites and a late starfighter for Safran`

## Critères d'acceptation

- [ ] Texture NASA officielle, source notée.
- [ ] Satellites et orbites clairement visibles.
- [ ] Chasseur stylisé à 20 s puis toutes les 45 s, aucun élément de marque.
- [ ] `SafranAccent.tsx` supprimé.
- [ ] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : texture NASA Blue Marble (domaine public, source notée
  dans ce ticket) via le pipeline d'images ; chargée seulement par la démo
  Safran sur desktop.
