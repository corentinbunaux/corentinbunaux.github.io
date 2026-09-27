---
id: PORT-024
title: "i18n — découper dictionary.ts en un fichier par namespace (+ namespaces futurs pré-enregistrés)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: done
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
model: haiku
branch: chore/PORT-024-dictionary-namespaces
depends_on: []
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# i18n — un fichier par namespace

**Procédure** : suivre `docs/PROCEDURE-TICKET.md` (worktree, vérifs, fusion
dans `refonte-2026`). Ce ticket ne change **aucun texte affiché** : c'est un
déplacement de code pur.

## Pourquoi

`src/i18n/dictionary.ts` (387 lignes) est modifié par presque tous les tickets
de la recette. En parallèle, ça garantit des conflits Git. Après ce ticket,
chaque ticket ne touchera que **son** fichier de namespace.

## Résultat attendu

```
src/i18n/
  dictionary.ts            ← ne contient plus que l'assemblage + useTranslation()
  namespaces/
    common.ts  navbar.ts  hero.ts  profile.ts  journey.ts  projects.ts
    projectPage.ts  about.ts  footer.ts                      ← existants, déplacés
    header.ts  demos.ts  minesweeper.ts  guards.ts  typing.ts  predict.ts
                                                              ← nouveaux, vides
```

## Étapes

1. Lire `src/i18n/dictionary.ts` en entier (il fait < 400 lignes, c'est permis).
2. Pour **chacun** des 9 namespaces existants (`common`, `navbar`, `hero`,
   `profile`, `journey`, `projects`, `projectPage`, `about`, `footer`), créer
   `src/i18n/namespaces/<nom>.ts` sur ce modèle exact (exemple pour `journey`) :

   ```ts
   export interface JourneyDict {
     title: string;
     currentBadge: string;
     ongoingLabel: string;
   }

   export const journeyFr: JourneyDict = {
     title: "Parcours",
     currentBadge: "Poste actuel",
     ongoingLabel: "aujourd'hui",
   };

   export const journeyEn: JourneyDict = {
     title: "Journey",
     currentBadge: "Current position",
     ongoingLabel: "today",
   };
   ```

   - Nom de l'interface : nom du namespace avec majuscule + `Dict`
     (`CommonDict`, `NavbarDict`, `HeroDict`, `ProfileDict`, `JourneyDict`,
     `ProjectsDict`, `ProjectPageDict`, `AboutDict`, `FooterDict`).
   - Noms des constantes : `<nom>Fr` et `<nom>En` (`projectPageFr`…).
   - Le **corps** de l'interface = le bloc `<nom>: { … }` de l'interface
     `Dictionary` actuelle, recopié à l'identique (commentaires compris,
     `readonly` compris).
   - Les **valeurs** = le bloc `<nom>: { … }` de `const fr` et de `const en`,
     recopiés caractère pour caractère. Ne corriger aucune faute (ex. « TOIEC »
     reste tel quel).
   - Pour `journey`, prendre les vraies valeurs EN du fichier (l'exemple
     ci-dessus peut différer de la réalité : **le fichier fait foi**).
3. Créer les 6 namespaces futurs, vides, **tous sur ce modèle exact** (exemple
   pour `header`) :

   ```ts
   /** Filled by PORT-028. Empty placeholder so that the ticket only edits this file. */
   export type HeaderDict = Record<string, never>;

   export const headerFr: HeaderDict = {};

   export const headerEn: HeaderDict = {};
   ```

   | Fichier | Type | Constantes | Commentaire « Filled by » |
   | --- | --- | --- | --- |
   | `header.ts` | `HeaderDict` | `headerFr`, `headerEn` | PORT-028 |
   | `demos.ts` | `DemosDict` | `demosFr`, `demosEn` | PORT-031 |
   | `minesweeper.ts` | `MinesweeperDict` | `minesweeperFr`, `minesweeperEn` | PORT-038 |
   | `guards.ts` | `GuardsDict` | `guardsFr`, `guardsEn` | PORT-039 |
   | `typing.ts` | `TypingDict` | `typingFr`, `typingEn` | PORT-040 |
   | `predict.ts` | `PredictDict` | `predictFr`, `predictEn` | PORT-041 |

4. Réécrire `src/i18n/dictionary.ts` **entièrement** ainsi (garder le
   commentaire de tête existant au-dessus de `export interface Dictionary`) :

   ```ts
   import { useLanguage } from "./LanguageContext";
   import { type AboutDict, aboutEn, aboutFr } from "./namespaces/about";
   import { type CommonDict, commonEn, commonFr } from "./namespaces/common";
   import { type DemosDict, demosEn, demosFr } from "./namespaces/demos";
   import { type FooterDict, footerEn, footerFr } from "./namespaces/footer";
   import { type GuardsDict, guardsEn, guardsFr } from "./namespaces/guards";
   import { type HeaderDict, headerEn, headerFr } from "./namespaces/header";
   import { type HeroDict, heroEn, heroFr } from "./namespaces/hero";
   import { type JourneyDict, journeyEn, journeyFr } from "./namespaces/journey";
   import {
     type MinesweeperDict,
     minesweeperEn,
     minesweeperFr,
   } from "./namespaces/minesweeper";
   import { type NavbarDict, navbarEn, navbarFr } from "./namespaces/navbar";
   import { type PredictDict, predictEn, predictFr } from "./namespaces/predict";
   import { type ProfileDict, profileEn, profileFr } from "./namespaces/profile";
   import {
     type ProjectPageDict,
     projectPageEn,
     projectPageFr,
   } from "./namespaces/projectPage";
   import { type ProjectsDict, projectsEn, projectsFr } from "./namespaces/projects";
   import { type TypingDict, typingEn, typingFr } from "./namespaces/typing";

   /* (commentaire de tête existant, recopié ici) */
   export interface Dictionary {
     common: CommonDict;
     navbar: NavbarDict;
     header: HeaderDict;
     hero: HeroDict;
     profile: ProfileDict;
     journey: JourneyDict;
     projects: ProjectsDict;
     projectPage: ProjectPageDict;
     about: AboutDict;
     footer: FooterDict;
     demos: DemosDict;
     minesweeper: MinesweeperDict;
     guards: GuardsDict;
     typing: TypingDict;
     predict: PredictDict;
   }

   const fr: Dictionary = {
     common: commonFr,
     navbar: navbarFr,
     header: headerFr,
     hero: heroFr,
     profile: profileFr,
     journey: journeyFr,
     projects: projectsFr,
     projectPage: projectPageFr,
     about: aboutFr,
     footer: footerFr,
     demos: demosFr,
     minesweeper: minesweeperFr,
     guards: guardsFr,
     typing: typingFr,
     predict: predictFr,
   };

   const en: Dictionary = {
     common: commonEn,
     navbar: navbarEn,
     header: headerEn,
     hero: heroEn,
     profile: profileEn,
     journey: journeyEn,
     projects: projectsEn,
     projectPage: projectPageEn,
     about: aboutEn,
     footer: footerEn,
     demos: demosEn,
     minesweeper: minesweeperEn,
     guards: guardsEn,
     typing: typingEn,
     predict: predictEn,
   };

   export const dictionary = { fr, en };

   /** Returns the dictionary for the currently active language. Must be called
    * from within a `LanguageProvider` (see `src/i18n/LanguageContext.tsx`). */
   export function useTranslation(): Dictionary {
     const { language } = useLanguage();
     return dictionary[language];
   }
   ```

5. Vérifier qu'aucun import externe n'est cassé :
   `grep -rn "i18n/dictionary" src` — les imports `useTranslation` et
   `type Dictionary` doivent toujours se résoudre (ils sont toujours exportés).
6. Contrôle anti-perte : compter les chaînes avant/après.
   - Avant (sur `refonte-2026`, fichier d'origine) :
     `git show refonte-2026:src/i18n/dictionary.ts | grep -c '"'`
   - Après : `cat src/i18n/namespaces/*.ts | grep -c '"'`
   - Le second nombre doit être **supérieur ou égal** au premier moins les
     guillemets des lignes d'import de l'ancien fichier (1 ligne). S'il est
     plus petit, une valeur a été perdue : la retrouver avant de continuer.
7. Contrôle d'encodage : `grep -rn "Ã\|â€" src/i18n` ne renvoie rien.
8. Vérifs de la procédure (§4) + vérification visuelle rapide : la home et
   `/internships/safran` s'affichent en FR, puis en EN après bascule, textes
   identiques à avant.

Commit : `refactor(i18n): split the dictionary into one file per namespace`

## Critères d'acceptation

- [ ] 15 fichiers dans `src/i18n/namespaces/`, `dictionary.ts` < 120 lignes.
- [ ] Aucune chaîne affichée n'a changé (FR et EN).
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` passent.

## Hors périmètre

Toute modification de texte, tout renommage de clé, toute suppression de clé
inutilisée.

## Journal d'exécution

### Commandes exécutées

**npm run lint** (dernières lignes):
```
✖ 3 problems (0 errors, 3 warnings)
```
Lint passes (warnings only, pre-existing).

**npx tsc --noEmit** (dernières lignes):
```
src/app/layout.tsx(2,8): error TS2882: Cannot find module or type declarations for side-effect import of './app.css'.
src/app/page.tsx(8,8): error TS2882: Cannot find module or type declarations for side-effect import of './app.css'.
src/components/journeySection.tsx(2,8): error TS2882: Cannot find module or type declarations for side-effect import of '../app/app.css'.
```
No errors related to i18n, dictionary, or namespaces. Pre-existing CSS import errors.

**npm run build** (dernières lignes):
```
├ ○ /internships/safran
└ ○ /research/sncf

○  (Static)  prerendered as static content
```
Build succeeds.

### Contrôles

- Contrôle anti-perte: Avant = 189, Après = 188, acceptable (188 >= 187).
- Encodage: ✓ Pas de mojibake détecté.
- 15 fichiers dans `src/i18n/namespaces/`: ✓ (9 existants + 6 futurs)
- `dictionary.ts` = 96 lignes < 120: ✓
- Imports cassés: ✓ None (`useTranslation`, `type Dictionary` toujours exportés)

### Vérification visuelle

Vérification visuelle NON faite, outil indisponible (Claude in Chrome extension not connected).

## Notes pour la consolidation

- ARCHITECTURE.md, ligne `src/i18n/` : `dictionary.ts` assemble les
  namespaces de `src/i18n/namespaces/*.ts` ; un ticket = un fichier de
  namespace.
- Chaque namespace futur (header, demos, minesweeper, guards, typing, predict)
  est pré-enregistré comme un fichier vide, prêt à être rempli par son ticket
  respectif. Cela élimine les conflits de merge liés à l'ajout de nouvelles
  entrées au dictionnaire principal.
