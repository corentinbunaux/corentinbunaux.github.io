---
id: PORT-025
title: "CSS — overflow-x: clip, scroll fluide natif, hauteur d'en-tête en token"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: done
resumeAt: null
priority: P1
estimate: 0.25
confidence: high
model: haiku
branch: fix/PORT-025-scroll-sticky-css
depends_on: []
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# CSS — sticky réparé, scroll fluide natif, `--header-height`

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Pourquoi

- Le bloc « En bref » des pages projet a `position: sticky` mais ne colle pas :
  `overflow-x: hidden` sur `html`/`body` crée un conteneur de défilement qui
  casse `sticky`. `overflow-x: clip` coupe pareil le débordement horizontal
  **sans** créer de conteneur de défilement (support : tous navigateurs
  modernes).
- PORT-028 va remplacer le scroll JavaScript de la nav par des ancres natives
  (`<a href="#journey">`) ; il faut donc le scroll fluide en CSS, et un décalage
  pour que le titre de section ne passe pas sous l'en-tête fixe.

## Fichier modifié (unique)

`src/app/app.css`

## Étapes

1. Dans la règle `html { … }` (vers la ligne 118), remplacer
   `overflow-x: hidden;` par `overflow-x: clip;` et ajouter juste en dessous :
   ```css
   scroll-behavior: smooth;
   ```
2. Dans la règle `body { … }` (vers la ligne 147), remplacer
   `overflow-x: hidden;` par `overflow-x: clip;`.
3. **Ne pas** toucher à la règle `.project-page-container, .banner-section`
   (vers la ligne 194) : le bandeau a besoin de son `hidden`.
4. Dans le bloc `:root { … }` du haut du fichier, ajouter à la fin du bloc
   (avant l'accolade fermante), après `--card-min-height` :
   ```css
   /* Height of the fixed SiteHeader (PORT-028): two rows on mobile (brand +
      controls, then nav links), one row from md up. Used for scroll-margin
      and for the sticky "En bref" offset. */
   --header-height: 6.5rem;
   ```
   Et dans le bloc `@media … { :root { … } }` qui suit (celui qui redéfinit
   `--section-padding-y: 6rem`), ajouter :
   ```css
   --header-height: 4rem;
   ```
   Vérifier que ce media query est bien `min-width: 768px` (md). S'il utilise
   une autre largeur, **ne pas** le modifier : créer à la place, juste après,
   ```css
   @media (min-width: 768px) {
     :root {
       --header-height: 4rem;
     }
   }
   ```
5. Ajouter à la fin du fichier :
   ```css
   /* Native anchor navigation (PORT-025/028): land section titles below the
      fixed header instead of underneath it. */
   section[id] {
     scroll-margin-top: var(--header-height);
   }

   @media (prefers-reduced-motion: reduce) {
     html {
       scroll-behavior: auto;
     }
   }
   ```
6. Vérifs de la procédure (§4). Vérification visuelle : sur
   `/internships/safran` à 1280 px, faire défiler : la carte « En bref »
   doit rester visible en haut à droite pendant le défilement (elle colle).
   Sur la home à 360 px : aucune barre de défilement horizontale.

Commit : `fix(css): use overflow-x clip so sticky works, native smooth scroll`

## Critères d'acceptation

- [ ] « En bref » colle au défilement sur une page projet (≥ 1024 px).
- [ ] Aucun défilement horizontal à 360 px sur la home et sur une page projet.
- [ ] `--header-height` défini (6.5rem, puis 4rem dès 768 px).
- [ ] lint / tsc / build passent.

## Hors périmètre

Le décalage exact de « En bref » sous l'en-tête (PORT-035), l'en-tête lui-même
(PORT-028).

## Journal d'exécution

**Commandes lancées :**

`npm run lint` — 5 dernières lignes :
```
problems (0 errors, 3 warnings)
```

`npx tsc --noEmit` — affiche des erreurs pré-existantes (imports de CSS) non liées à ce ticket.

`npm run build` — 5 dernières lignes :
```
├ ○ /emse/android
├ ○ /emse/embedded
├ ○ /emse/minesweeper
├ ○ /emse/programming
├ ○ /internships/kusmitea
├ ○ /internships/quimesis
├ ○ /internships/safran
├ ○ /personnal/cctv
├ ○ /personnal/web
├ ○ /research/sncf
└ ○ /work/gcii
```

**Vérification visuelle :** NON FAITE, outil indisponible (extension Claude in Chrome non disponible dans cet environnement).

**Changements appliqués :**
1. `overflow-x: clip` dans html (remplace `hidden`)
2. `scroll-behavior: smooth` ajouté dans html
3. `overflow-x: clip` dans body (remplace `hidden`)
4. `--header-height: 6.5rem` ajouté dans `:root`
5. `--header-height: 4rem` ajouté dans media query (min-width: 768px)
6. CSS pour native anchor navigation et reduced-motion ajouté en fin de fichier
7. Ticket passé en `in-progress` lors du commit initial

## Notes pour la consolidation

- ARCHITECTURE.md « Known weak points » : retirer le point « En bref ne colle
  pas » et le point « Smooth scroll is broken site-wide » (PORT-022 clos,
  faux positif — onglet d'automatisation en arrière-plan).
- Token CSS `--header-height` ajouté en deux variantes (6.5rem mobile, 4rem ≥768px) ; utilisé pour scroll-margin des ancres natives (PORT-028) et offset de sticky "En bref" (PORT-035).
- Changement de `overflow-x: hidden` à `overflow-x: clip` sur html/body : déverrouille `position: sticky` en supprimant le conteneur de défilement, conservation du cut du débordement horizontal.
