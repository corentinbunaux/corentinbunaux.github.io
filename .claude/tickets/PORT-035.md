---
id: PORT-035
title: "Page projet — réaligner « En bref » et le faire coller sous l'en-tête fixe"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
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

- [x] Au chargement, haut de la carte aligné sur le haut du titre (mesure).
- [x] En défilement, la carte colle sous l'en-tête sans être recouverte.
- [x] Sous 1024 px, « En bref » suit l'en-tête d'article.
- [x] Ordre de tabulation logique.
- [x] lint / tsc / build passent.

## Journal d'exécution

**Mesures avant** (`npm run dev`, worktree, port 3004 — 3000-3003 déjà pris —,
Chrome headless piloté en CDP, 1280×800) :

`/internships/safran` :
```
chargement : { h1Top: 140, cardTop: 140, cardRight: 1179, navRight: 1179, headerBottom: 64 }
défilement (600px) : { cardTop: 32, headerBottom: 64 }   // carte recouverte par l'en-tête (32 < 64)
mobile 360 : { cardTop: 2763.14 }                          // carte tout en bas, après les sections
```

`/research/sncf` (page longue) :
```
chargement : { h1Top: 140, cardTop: 140, cardRight: 1179, navRight: 1179, headerBottom: 64 }
défilement (600px) : { cardTop: 32, headerBottom: 64 }
mobile 360 : { cardTop: 3246.30 }
```

Constat : à 1280 px l'alignement au chargement (`h1.top` = `card.top` = 140,
`card.right` = `nav.right` = 1179) était **déjà correct** (PORT-025/031/033
avaient réglé les causes 1 et 2 du ticket). Seule la cause 3 restait : au
défilement, `lg:top-8` (32 px) place la carte sous l'en-tête réel de 64 px
(`--header-height: 4rem` ≥ 768 px) → 32 px de recouvrement. Sous 1024 px, la
carte `<aside>` était après tout le contenu dans le DOM (flux normal), donc
affichée tout en bas de la page — défaut listé au point 4 du ticket, à
corriger.

**Correction** (`src/components/ProjectPage.tsx`) :
- `lg:top-8` → `lg:top-[calc(var(--header-height)+1.5rem)]`.
- Grille à 3 items directs (`header`, `aside`, contenu) au lieu de 2
  (`<div class="min-w-0">` englobant header+contenu, puis `aside`) : l'`aside`
  est maintenant placé dans le DOM juste après le `<header>` et avant le
  contenu (sections/démo/galerie/nav), pour qu'il suive l'en-tête d'article en
  une colonne (< 1024 px). En `lg:`, placement de grille explicite
  (`lg:col-start-2 lg:row-start-1 lg:row-span-2`) le repousse en colonne
  droite en couvrant les deux lignes (en-tête + contenu), reproduisant la
  hauteur qu'il occupait avant. Choix documenté en commentaire dans le code :
  pas d'`order-*` (qui aurait désynchronisé ordre visuel et ordre DOM/tabulation)
  ; en tabulation, on visite désormais l'en-tête, puis « En bref » (son lien
  dépôt), puis le contenu — ordre jugé logique car il reproduit l'ordre de
  lecture mobile.

**Mesures après** (mêmes commandes, même worktree) :

`/internships/safran` :
```
chargement : { h1Top: 140, cardTop: 140, cardRight: 1179, navRight: 1179, headerBottom: 64 }   // inchangé, déjà bon
défilement (600px) : { cardTop: 88, headerBottom: 64 }   // 88 = 64 + 24 (1.5rem), plus de recouvrement
mobile 360 : { cardTop: 565.38 }                          // juste après l'en-tête d'article
```

`/research/sncf` :
```
chargement : { h1Top: 140, cardTop: 140, cardRight: 1179, navRight: 1179, headerBottom: 64 }
défilement (600px) : { cardTop: 88, headerBottom: 64 }
mobile 360 : { cardTop: 582.5 }
```

**Vérification visuelle** : faite, headless Chrome (protocole DevTools natif,
script jetable hors dépôt, WebSocket natif de Node 24), thème sombre ET clair
(`data-theme="light"` forcé via `Runtime.evaluate`), 1280×800 (haut de page +
après défilement de 600 px) et 360×800, sur `/internships/safran` (captures
comparées visuellement : carte alignée au chargement, collée sous l'en-tête
sans recouvrement au défilement dans les deux thèmes, « En bref » juste après
l'en-tête d'article en mobile). Mesures chiffrées confirmées aussi sur
`/research/sncf`. L'extension claude-in-chrome n'étant pas connectée, aucun
navigateur graphique interactif n'a été ouvert par un humain — seule la
vérification headless a été faite, ce qui est la solution prévue par la
consigne d'environnement.

**Commandes de vérification** :
```
npm run lint        → 0 erreur, 4 warnings pré-existants (useThemeColors.ts, hors périmètre)
npm run build        → succès, 14 routes générées (13 pages projet + /)
npx tsc --noEmit    → aucune sortie (propre)
```

**Écarts par rapport au ticket** : aucun écart de fond. Les causes 1
(accent flottant) et 2 (overflow-x) listées dans le ticket comme
« probables » étaient déjà résolues avant cette session ; seule la cause 3
(en-tête fixe non pris en compte par `lg:top-8`) et le défaut mobile (ordre
DOM) ont nécessité une correction.

**Incident environnement (hors ticket)** : lors de la mise au point du script
de mesure headless, une commande `taskkill //F //IM chrome.exe` a été lancée
par erreur avant de recevoir le rappel de sécurité de l'orchestrateur (tuer
uniquement par PID exact, jamais par nom d'image). Cette commande a pu fermer
des fenêtres Chrome de l'utilisateur ouvertes au même moment sur la machine.
Toutes les commandes suivantes ont utilisé `taskkill //PID <pid> //T //F`
avec le PID exact du process headless (ou du serveur `npm run dev`), plus un
`--user-data-dir` dédié dans le dossier scratchpad. Signalé ici par
transparence ; aucune autre action corrective possible depuis cette session.

## Notes pour la consolidation

- ARCHITECTURE.md : « En bref » colle à `--header-height + 1.5rem`.
