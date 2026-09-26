---
id: PORT-005
title: Optimisation des images — AVIF/WebP générés au build
group: corentin
machine: asus_corentin
milestone: M2 — Design system & accessibilité
status: review
resumeAt: null
priority: P1
estimate: 2
confidence: high
depends_on: [PORT-002]
parallel_safe: true
human_checkpoint: "Comparer visuellement 3-4 images avant/après sur mobile et desktop, confirmer qu'aucune n'est floue ou mal cadrée"
created: 2026-09-26
---

# Optimisation des images — AVIF/WebP générés au build

**Contexte** — `public/img/` + `public/logos/` pèsent 9 658 770 octets (26
fichiers, zéro AVIF/WebP). Le problème n'est pas seulement le format : les
sources sont massivement surdimensionnées (`programming.jpg` fait 6000×4000
pour une vignette de carte, `embedded.jpg` 5192×3466). Ce ticket alimente le
critère de succès `docs/CADRAGE.md` § « Lighthouse Performance ≥ 90 en
émulation mobile sur la page d'accueil » : la page d'accueil télécharge
aujourd'hui ~5,3 Mo d'images (photo hero + 11 vignettes de projets).

**Deliverable** — Toutes les images du site sont servies en AVIF (avec repli
WebP), redimensionnées au build par `sharp`, pour un poids total de `public/`
réduit d'au moins 80 %, sans régression visuelle ni décalage de mise en page.

## Le piège à résoudre d'abord : AVIF est impossible via `next/image` seul

`next/config.mjs` impose `output: "export"` + `images: { unoptimized: true }`.
Ce second réglage est **obligatoire** pour l'export statique (il n'y a pas de
serveur Next pour exécuter `/_next/image`). Conséquence mesurée et vérifiée :

- Avec `unoptimized: true`, `next/image` n'émet **ni `srcset`, ni conversion de
  format, ni redimensionnement**. Il rend l'équivalent d'un `<img src>` brut.
- Donc « migrer vers `next/image` » n'apporte **aucun octet** économisé ici. Son
  seul apport réel est `width`/`height` pour réserver la place (anti-CLS) —
  ce qu'un `<img width height>` écrit à la main fournit à l'identique.
- Et `<picture>`/`<source type="image/avif">` est le seul mécanisme HTML de
  négociation de format ; `next/image` ne sait pas le produire.

**Le titre initial du ticket (« migration vers next/image + AVIF ») décrivait
donc une solution qui ne peut pas fonctionner sur cet export statique.** La
conversion doit venir d'une étape de build, pas du composant.

### Options

- **(A) WebP seul, via `next/image` classique.** Un seul fichier par image,
  `src` pointe sur `.webp`, aucun nouveau composant, support ~97 %.
  Total mesuré : 1 057 413 o (−89 %).
- **(B) AVIF + repli WebP, via `<picture>`.** Deux fichiers par image, un
  composant partagé. Total AVIF mesuré : 602 259 o (−94 %), soit 43 % de moins
  que le WebP seul. Coût : `next/image` disparaît des points d'appel, et la
  règle lint `@next/next/no-img-element` doit être désactivée dans ce seul
  fichier, avec justification.
- **(C) AVIF seul en `src` direct.** Rejeté : les navigateurs sans AVIF (~4 %,
  Safari < 16.4) affichent une image cassée. Contraire à la règle « pas de
  repli silencieux » de `.claude/rules/00-core.md`.

**Recommandation : (B).** L'AVIF est le livrable nommé par le ticket, il pèse
43 % de moins que le WebP, et le repli WebP couvre tout navigateur non-AVIF
sans image cassée. Le composant unique concentre la dette (un seul
`eslint-disable` justifié) au lieu de la disperser.

## Acceptance criteria

- [ ] `scripts/optimize-images.mjs` existe, utilise `sharp`, et régénère
      `public/img` + `public/logos` de façon idempotente (relancer le script
      deux fois produit le même résultat).
- [ ] Chaque source matricielle produit un `.avif` **et** un `.webp`,
      redimensionnés à 1600 px de large maximum (`withoutEnlargement`).
- [ ] Le `.svg` (`ac-normandie.svg`) est copié tel quel, jamais converti.
- [ ] Poids total de `public/` réduit d'au moins 80 % — chiffres avant/après
      mesurés et reportés.
- [ ] Un composant unique rend `<picture>` + `<source type="image/avif">` +
      `<img>` WebP de repli, avec `width`/`height` explicites, `loading` et
      `decoding` paramétrables.
- [ ] Les deux `<img>` bruts signalés par le lint (`homepage.jsx`,
      `ProjectCard` dans `projectsSection.jsx`) passent par ce composant.
- [ ] `npm run lint` : zéro warning `@next/next/no-img-element` hors du
      composant partagé (où il est désactivé avec un commentaire justifiant).
- [ ] `npx tsc --noEmit` et `npm run build` passent.
- [ ] Naming normalisé en kebab-case minuscule dans `public/img` et
      `public/logos` ; **toutes** les références mises à jour (le tableau
      `projects` dans `projectsSection.jsx`), zéro 404 image.
- [ ] Vérification navigateur : page d'accueil + au moins une page projet, à
      360 px et en desktop, aucune image floue, mal cadrée ou déformée.

## Files

**À modifier**
- `scripts/optimize-images.mjs` (nouveau)
- `src/components/optimizedImage.tsx` (nouveau)
- `src/components/homepage.jsx` — le `<img>` hero
- `src/components/projectsSection.jsx` — **chirurgical** : chemins d'images du
  tableau `projects` + le `<img>` de `ProjectCard` uniquement
- `src/components/project.tsx` — carrousel et `entityLogo`
- `package.json` — script `optimize:images`
- `public/img/**`, `public/logos/**` — fichiers régénérés/renommés

**À ne pas toucher**
- `src/app/app.css` — appartient à PORT-004
- `PASSATION.md`, `ARCHITECTURE.md` — conflits de merge avec PORT-003/004/008
- `public/img/Avatar_Coco.png` — non suivi, hors sujet
- `next.config.mjs` — `unoptimized: true` reste obligatoire, ne pas le retirer

## Approach

1. Écrire `scripts/optimize-images.mjs` : lire les sources, normaliser le nom
   en kebab-case, redimensionner à ≤1600 px, écrire `.avif` (q50) et `.webp`
   (q78), copier les `.svg`. Le script part d'un dossier source versionné pour
   rester idempotent.
2. Lancer le script, mesurer avant/après, supprimer les anciens fichiers.
3. Écrire `optimizedImage.tsx` (`<picture>`, width/height, `priority` →
   `loading="eager"` + `fetchPriority="high"`).
4. Remplacer les 2 `<img>` bruts, puis les `<Image>` de `project.tsx`.
5. Mettre à jour les chemins du tableau `projects`.
6. Lint, tsc, build, puis vérification visuelle au navigateur.

## Test plan

Aucun framework de test n'est configuré (`CLAUDE.md` : *Test: none*). La
vérification est donc :
- `npm run lint` — zéro warning `no-img-element` hors composant partagé.
- `npx tsc --noEmit` — clean.
- `npm run build` — l'export statique réussit.
- Script relancé deux fois → `git status` propre la seconde fois (idempotence).
- `npm run dev` + navigateur : accueil et page projet, 360 px et desktop,
  onglet réseau pour confirmer que l'AVIF est bien servi.

## Out of scope

- Générer un `srcset` multi-largeurs (une seule largeur suffit ici ; à noter
  comme suivi si Lighthouse signale « properly size images »).
- Retoucher le cadrage/`object-fit` existant des images.
- Optimiser les SVG inline de `Banner.jsx`.
- Toucher au `<Image>` `techLogos` de `project.tsx` : branche morte, aucun
  `bannerElmts` n'a de propriété `src`.

## Human checkpoint

Lancer `npm run dev`, ouvrir `/` puis `/quimesis`, comparer 3-4 images avec
l'ancienne version : aucune ne doit être floue, mal cadrée ou déformée.

## Risks

- Les PNG à canal alpha (`Embedded2.png`, logos) doivent garder leur
  transparence : AVIF et WebP la supportent, mais un aplatissement accidentel
  se verrait immédiatement sur les logos.
- `quimesis.jpg` et `android.jpg` sont en réalité des fichiers **WebP** avec une
  extension `.jpg` ; se fier à l'extension casserait le script.
- PORT-008 déplace le tableau `projects` hors de `projectsSection.jsx` :
  garder la diff minimale dans ce fichier.

## Estimate

1.5 → **2**. L'étape de build `sharp` et le composant `<picture>` n'étaient pas
prévus par le ticket initial, qui supposait à tort que `next/image` suffisait.

## Intégration manuelle (reprise après reset de quota)

Le travail original de ce ticket (branche `chore/PORT-005-image-optimization`)
était fonctionnellement complet mais **`src/components/projectsSection.jsx`
avait été corrompu en encodage** lors de son édition : tous les caractères
accentués du tableau `projects` avaient été ré-encodés en double UTF-8 (ex.
« études » → « Ã©tudes »), et un BOM avait été ajouté en tête de fichier.
Diagnostiqué en comparant le diff `git` (les lignes de contexte non modifiées
s'affichaient correctement, seules les lignes touchées étaient corrompues).

Cette branche n'a pas été fusionnée. Le travail a été réintégré à la main
dans la branche `feat/PORT-008-projects-data` (qui avait déjà extrait le même
tableau vers `src/data/projects.ts`, en encodage propre) :

- `scripts/optimize-images.mjs`, `src/components/optimizedImage.tsx`,
  `src/data/imageManifest.json`, `assets/images-src/**`, `public/img/**`,
  `public/logos/**`, le script `optimize:images` dans `package.json` : copiés
  tels quels depuis la branche originale (non corrompus).
- Les chemins d'image dans `src/data/projects.ts` (`img`, `entityLogo`,
  `photos`) : réécrits manuellement à partir de `imageManifest.json`, dans
  ce fichier propre, plutôt que dans le fichier corrompu.
- `homepage.jsx`, `project.tsx`, `projectsSection.jsx` : le remplacement
  `<img>`/`<Image>` → `<OptimizedImage>` a été rejoué à la main (mêmes props
  que la branche originale) dans les fichiers de `feat/PORT-008-projects-data`.

**Vérification** : `npm run lint` (0 erreur, 3 warnings pré-existants dont les
2 `set-state-in-effect`, hors périmètre), `npx tsc --noEmit` (propre),
`npm run build` (export statique, 14 pages). `public/img` + `public/logos` :
9,3 Mo → ~1,7 Mo (env. -82 %). Vérification visuelle des 12 pages en
navigateur non refaite (outil indisponible dans cette session) — reste un
point de contrôle humain.

**Statut : `review`** — fonctionnellement complet et vérifié par build ;
relecture visuelle par Corentin recommandée avant de considérer le ticket
`done`.
