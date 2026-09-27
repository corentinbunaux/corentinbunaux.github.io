---
id: PORT-035
title: "Page projet — réaligner « En bref » et le faire coller sous l'en-tête fixe"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P2
estimate: 0.5
confidence: medium
model: sonnet
branch: fix/PORT-035-en-bref-alignment
depends_on: [PORT-025, PORT-028, PORT-031, PORT-033]
parallel_safe: true
human_checkpoint: "Regarder « En bref » sur 3 pages projet (dont une longue) : aligné et collant."
created: 2026-09-27
---

# « En bref » : alignement + sticky

**Procédure** : `docs/PROCEDURE-TICKET.md`. Modèle **Sonnet** : le défaut
exact n'a pas été mesuré, il faut l'observer avant de corriger.

## Retour de Corentin (#7, dernière phrase)

> Il faut également ré-aligner le « En bref », qui est décalé en comparaison
> au contenu de la modale.

## Ce qu'on sait

- Mise en page : `ProjectPage.tsx`, grille `lg:grid-cols-[1fr_20rem]` ;
  colonne gauche = en-tête d'article (titre, description, visuel, pastilles)
  puis sections ; colonne droite = `<aside className="lg:sticky lg:top-8 lg:self-start">`.
- Causes probables du décalage, à confirmer par la mesure :
  1. l'ancien accent 3D flottant (160 px, `float-right`) à côté du titre
     décalait le haut du contenu gauche — **supprimé par PORT-031** ;
  2. `sticky` inopérant à cause de `overflow-x: hidden` — **corrigé par
     PORT-025** ;
  3. `lg:top-8` (2rem) ignore l'en-tête fixe ajouté par PORT-028 : une fois
     collée, la carte passe **sous** l'en-tête.

## Fichier

`src/components/ProjectPage.tsx` (zone `<aside>` et, si nécessaire, la
grille). Rien d'autre.

## Étapes

1. **Mesurer avant** (npm run dev, 1280 × 800, `/internships/safran` puis
   `/research/sncf`) dans la console :

   ```js
   const r = (s) => document.querySelector(s).getBoundingClientRect();
   ({ h1: r('main h1').top, card: r('aside > div').top,
      right: [r('main nav[aria-label]').right, r('aside > div').right],
      header: r('header').bottom })
   ```

   Faire une capture d'écran. Noter les valeurs dans le journal. Faire
   défiler de 600 px et remesurer `card` et `header`.

2. **Corriger**, avec ces cibles :
   - au chargement, `card.top` = `h1.top` (± 2 px) : le haut de la carte est
     aligné sur le haut du titre de l'article ;
   - en défilement, la carte colle à `var(--header-height) + 1.5rem` du haut :
     remplacer `lg:top-8` par `lg:top-[calc(var(--header-height)+1.5rem)]` ;
   - bord droit de la carte = bord droit du fil d'Ariane (même conteneur
     `max-w-6xl`) ;
   - sous 1024 px (une colonne) : la carte « En bref » s'affiche **juste
     après l'en-tête d'article** (avant les sections), pas tout en bas. Pour
     cela, utiliser l'ordre de grille : garder l'`aside` après la colonne
     gauche dans le DOM est acceptable si l'ordre visuel est obtenu par
     `order-*` ; mais l'ordre de lecture clavier doit rester logique — si
     `order` crée un ordre visuel ≠ ordre DOM, préférer déplacer l'`aside`
     dans le DOM et le placer à droite en `lg` avec
     `lg:col-start-2 lg:row-start-1 lg:row-span-2`. Documenter le choix.
   - Si la mesure montre un autre défaut que ceux listés (marge interne,
     `self-start` manquant…), le corriger et l'écrire dans le journal.

3. **Mesurer après** (mêmes commandes) + captures à 1280 px (haut de page et
   après défilement) et à 360 px. Coller les valeurs dans le journal.

4. Procédure §4 (lint / tsc / build).

Commit : `fix(project-page): align the En bref card and stick it below the header`

## Critères d'acceptation

- [ ] Au chargement, haut de la carte aligné sur le haut du titre (mesure).
- [ ] En défilement, la carte colle sous l'en-tête sans être recouverte.
- [ ] Sous 1024 px, « En bref » suit l'en-tête d'article.
- [ ] Ordre de tabulation logique.
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir — mesures avant/après obligatoires)_

## Notes pour la consolidation

- ARCHITECTURE.md : « En bref » colle à `--header-height + 1.5rem`.
