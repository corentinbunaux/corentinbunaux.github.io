---
id: PORT-029
title: "À propos — retirer sudoku, activités actives/archivées avec icônes, bouton PUSH remis en place"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P2
estimate: 0.5
confidence: high
model: haiku
branch: feat/PORT-029-about-interests
depends_on: [PORT-024, PORT-026]
parallel_safe: true
human_checkpoint: "Relire la nouvelle phrase sur les autres sports (FR/EN) et les libellés « Aujourd'hui » / « Archivées »."
created: 2026-09-27
---

# À propos — centres d'intérêt et bouton PUSH

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (#14, première partie)

> Dans le à propos, retirer « sudoku », placer « natation », « escalade »,
> « échecs » comme activités « archivées », c'est-à-dire essayées pendant les
> études mais non pratiquées aujourd'hui, et ajouter les icônes qui manquent
> visuellement sur l'interface. Remettre le bouton « PUSH » au bon endroit.

L'animation du tennisman est un ticket séparé (PORT-043).

## Cause du bouton PUSH mal placé

La section utilise `columns-1 lg:columns-2` : des **colonnes CSS de texte**,
où le contenu coule d'une colonne à l'autre. L'ajout de la grille de centres
d'intérêt a allongé la colonne gauche, et une partie du contenu (dont le
bouton) a basculé. Une vraie grille à deux colonnes règle le problème.

## Fichiers (uniquement ceux-ci)

- `src/components/aboutmeSection.jsx`
- `src/i18n/namespaces/about.ts`

## Étapes

### 1. Textes — `src/i18n/namespaces/about.ts`

Dans l'interface `AboutDict` :
- supprimer `sudoku` de `interests` ;
- ajouter `activeLabel: string;` et `archivedLabel: string;` (au même
  niveau que `interestsLabel`).

Valeurs :

| Clé | FR | EN |
| --- | --- | --- |
| `activeLabel` | `Aujourd'hui` | `Today` |
| `archivedLabel` | `Archivées — pratiquées pendant mes études` | `Archived — tried during my studies` |
| `otherSports` (remplace la valeur actuelle) | `Je pratique aussi la course à pied. Pendant mes études, je me suis essayé à l'escalade, à la natation et aux échecs.` | `I also go running. During my studies, I tried my hand at climbing, swimming and chess.` |

Supprimer `sudoku: …` de `aboutFr.interests` et `aboutEn.interests`.
Ne rien changer d'autre.

### 2. Composant — `src/components/aboutmeSection.jsx`

a. Imports, en haut du fichier (après les imports existants) :

```jsx
import { Code, Crown, Footprints, Gamepad2, Mountain, Waves } from 'lucide-react';
```

Ces noms ont été vérifiés par PORT-026 (voir ses « Notes pour la
consolidation »). Si l'un d'eux y est signalé absent, utiliser le nom de
remplacement noté là-bas.

b. Ajouter, au-dessus de `function AboutMe()`, l'icône tennis dessinée à la
main (lucide n'en a pas ; même grille 24×24 et même trait que lucide) :

```jsx
function TennisBallIcon(props) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <circle cx='12' cy='12' r='10' />
      <path d='M5 4.9a10 10 0 0 1 0 14.2' />
      <path d='M19 4.9a10 10 0 0 0 0 14.2' />
    </svg>
  );
}

function InterestList({ labelId, label, items, archived }) {
  return (
    <div className='mt-6'>
      <p id={labelId} className='text-sm font-semibold uppercase tracking-wider text-second-text'>
        {label}
      </p>
      <ul aria-labelledby={labelId} className='mt-3 grid grid-cols-2 gap-6 sm:grid-cols-4'>
        {items.map(({ label: itemLabel, Icon }) => (
          <li key={itemLabel} className='flex flex-col items-center gap-2 text-center'>
            <span
              aria-hidden='true'
              className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                archived
                  ? 'border-dashed border-second-text text-second-text'
                  : 'border-second bg-surface text-my-green'
              }`}
            >
              <Icon className='h-6 w-6' />
            </span>
            <span className='text-sm text-second-text'>{itemLabel}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

c. Dans `AboutMe`, remplacer le tableau `interests` par :

```jsx
  const activeInterests = [
    { label: t.about.interests.tennis, Icon: TennisBallIcon },
    { label: t.about.interests.running, Icon: Footprints },
    { label: t.about.interests.videoGames, Icon: Gamepad2 },
    { label: t.about.interests.code, Icon: Code },
  ];
  const archivedInterests = [
    { label: t.about.interests.swimming, Icon: Waves },
    { label: t.about.interests.climbing, Icon: Mountain },
    { label: t.about.interests.chess, Icon: Crown },
  ];
```

d. Remplacer tout le bloc `<ul className='mt-8 grid …' aria-label={t.about.interestsLabel}> … </ul>`
par :

```jsx
              <div role='group' aria-label={t.about.interestsLabel}>
                <InterestList
                  labelId='interests-active'
                  label={t.about.activeLabel}
                  items={activeInterests}
                  archived={false}
                />
                <InterestList
                  labelId='interests-archived'
                  label={t.about.archivedLabel}
                  items={archivedInterests}
                  archived
                />
              </div>
```

e. Mise en page : remplacer `className='columns-1 lg:columns-2 h-full'` par
`className='grid grid-cols-1 lg:grid-cols-2 h-full'`. Ne pas toucher aux
autres classes, ni au bouton PUSH, ni à `TennisBallAnim` (PORT-043 s'en
occupe).

### 3. Vérifications

Procédure §4, puis au navigateur, section « À propos » :

1. À 1280 px : colonne gauche = titre, 3 paragraphes, « Aujourd'hui » (4
   icônes : tennis, course, jeu vidéo, code), « Archivées… » (3 icônes en
   pointillés : natation, escalade, échecs). Colonne droite = bouton PUSH
   **au-dessus** du tennisman, centré.
2. Cliquer PUSH : la balle part toujours (l'arrivée exacte sur la raquette
   sera recalée par PORT-043 — noter dans le journal où elle arrive).
3. À 360 px : une seule colonne, grille 2×2 puis 2×2 (dernière case vide),
   pas de défilement horizontal. Le bouton PUSH est masqué (comportement
   existant `hidden xl:block`, inchangé).
4. Thème clair et sombre : icônes visibles, texte lisible.
5. En anglais : libellés traduits, « Sudoku » absent partout.

Commit : `feat(about): split interests into active/archived with icons`

## Critères d'acceptation

- [ ] Sudoku absent (FR/EN, code et dictionnaire).
- [ ] Natation, escalade, échecs sous « Archivées », visuellement distincts.
- [ ] Chaque activité a une icône.
- [ ] PUSH dans la colonne droite, au-dessus du tennisman (≥ 1280 px).
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : icônes via `lucide-react` (dépendance approuvée),
  icône tennis dessinée à la main dans `aboutmeSection.jsx`.
