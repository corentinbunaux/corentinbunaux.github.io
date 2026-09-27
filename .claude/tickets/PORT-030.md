---
id: PORT-030
title: "Parcours — ordre décroissant, deux pistes Expérience / Formation, étapes de formation"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
model: haiku
branch: feat/PORT-030-journey-two-tracks
depends_on: [PORT-024, PORT-026]
parallel_safe: true
human_checkpoint: "Relire les 4 entrées de formation (intitulés FR/EN, lieux, années)."
created: 2026-09-27
---

# Parcours — deux pistes, plus récent en premier

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (#6)

> Montrer le parcours dans l'ordre chronologique décroissant … intégrer les
> étapes de ma formation … 2022-2025 à l'école des Mines de Saint-Étienne,
> 2020-2022 CPGE PCSI PSI, et 2020 obtention du baccalauréat série générale - S.

Précisions données le 2026-09-27 :
- Bac au lycée **Guillaume Le Conquérant**, **Lillebonne** (Seine-Maritime),
  mention **Très bien**, spécialité **Mathématiques**, 2020.
- CPGE **PCSI** au lycée **François Ier**, **Le Havre**, 2020-2021.
- CPGE **PSI** au lycée **Victor Hugo**, **Caen**, 2021-2022.
- Les deux entrées CPGE **renvoient au TIPE** (`/cpge_tipe`).
- Mines : diplôme **ISMIN** (Ingénieur Spécialité Microélectronique et
  INformatique), à **Gardanne**, 2022-2025.
- Stages et études se chevauchent (Quimesis 2024 pendant les Mines) : décision
  = **deux pistes côte à côte**, Expérience à gauche, Formation à droite, chacune
  du plus récent au plus ancien.

## Fichiers

- Créés : `src/data/education.ts`, `src/components/journey/TrackIcon.tsx`
- Modifiés : `src/components/journeySection.tsx`,
  `src/i18n/namespaces/journey.ts`

## Étapes

### 1. Données — `src/data/education.ts`

```ts
import type { LocalizedText } from "../i18n/types";

/** Whole years. A single-year milestone (the baccalauréat) has start === end. */
export interface EducationYears {
  readonly start: number;
  readonly end: number;
}

export interface EducationEntry {
  readonly id: string;
  readonly title: LocalizedText;
  /** Proper nouns: not translated (same rule as `Project.location`). */
  readonly institution: string;
  readonly location: string;
  readonly years: EducationYears;
  readonly detail?: LocalizedText;
  /** Route without a leading slash, when the entry has a page (e.g. the TIPE). */
  readonly href?: string;
}

export const education: readonly EducationEntry[] = [
  {
    id: "mines",
    title: {
      fr: "Diplôme d'ingénieur — cursus ISMIN",
      en: "Engineering degree — ISMIN track",
    },
    detail: {
      fr: "Ingénieur spécialité Microélectronique et Informatique",
      en: "Engineering specialty in Microelectronics and Computer Science",
    },
    institution: "École des Mines de Saint-Étienne",
    location: "Gardanne",
    years: { start: 2022, end: 2025 },
  },
  {
    id: "cpge-psi",
    title: {
      fr: "Classe préparatoire PSI",
      en: "Preparatory class PSI (CPGE)",
    },
    institution: "Lycée Victor Hugo",
    location: "Caen",
    years: { start: 2021, end: 2022 },
    href: "cpge_tipe",
  },
  {
    id: "cpge-pcsi",
    title: {
      fr: "Classe préparatoire PCSI",
      en: "Preparatory class PCSI (CPGE)",
    },
    institution: "Lycée François Ier",
    location: "Le Havre",
    years: { start: 2020, end: 2021 },
    href: "cpge_tipe",
  },
  {
    id: "bac",
    title: {
      fr: "Baccalauréat S — mention Très bien",
      en: "Baccalauréat, science track — highest honours",
    },
    detail: {
      fr: "Spécialité Mathématiques",
      en: "Mathematics specialty",
    },
    institution: "Lycée Guillaume Le Conquérant",
    location: "Lillebonne",
    years: { start: 2020, end: 2020 },
  },
];
```

Vérifier l'orthographe exacte : **Guillaume** (deux L), **François Ier**,
**Victor Hugo**, **Saint-Étienne** (É majuscule accentué).

### 2. Textes — `src/i18n/namespaces/journey.ts`

Ajouter à l'interface et aux deux objets :

| Clé | FR | EN |
| --- | --- | --- |
| `experienceTrack` | `Expérience professionnelle` | `Work experience` |
| `educationTrack` | `Formation` | `Education` |

### 3. Icône de piste — `src/components/journey/TrackIcon.tsx`

Version 2D (PORT-050 y ajoutera une variante 3D sur desktop, en ne
modifiant **que** ce fichier) :

```tsx
"use client";

import { BriefcaseBusiness, GraduationCap } from "lucide-react";

export type TrackKind = "experience" | "education";

/** Small emblem heading each Parcours track. Decorative. */
export function TrackIcon({ kind }: { kind: TrackKind }) {
  const Icon = kind === "experience" ? BriefcaseBusiness : GraduationCap;
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-second bg-surface text-my-green"
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}
```

Si PORT-026 a noté que `BriefcaseBusiness` n'existe pas, utiliser le nom de
remplacement noté (probablement `Briefcase`).

### 4. Composant — `src/components/journeySection.tsx`

a. Tri décroissant : dans la construction de `journeyEntries`, remplacer
`(a, b) => a.period.start.localeCompare(b.period.start)` par
`(a, b) => b.period.start.localeCompare(a.period.start)`. Mettre à jour le
commentaire au-dessus : « Newest first: the most recent position is what a
recruiter looks for first (Corentin's feedback, 2026-09-26). »

b. Dans `JourneyEntryRow`, remplacer la balise `h2` du titre par `h3`
(même `className`) : les titres de piste deviennent les `h2`.

c. Ajouter les imports :

```tsx
import { education, type EducationEntry } from "../data/education";
import { TrackIcon, type TrackKind } from "./journey/TrackIcon";
```

d. Ajouter, sous `JourneyEntryRow`, ces deux composants :

```tsx
function formatYears({ start, end }: EducationEntry["years"]): string {
  return start === end ? String(start) : `${start} – ${end}`;
}

function EducationRow({
  entry,
  isLast,
  language,
}: {
  entry: EducationEntry;
  isLast: boolean;
  language: "fr" | "en";
}) {
  const body = (
    <>
      <h3 className="text-lg font-semibold text-main-text">
        {entry.title[language]}
      </h3>
      {entry.detail && <p className="text-second-text">{entry.detail[language]}</p>}
      <p className="text-second-text">
        {entry.institution} · {entry.location}
      </p>
      <p className="text-sm text-second-text">{formatYears(entry.years)}</p>
    </>
  );

  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-second-text" aria-hidden="true" />
        {!isLast && <span className="w-px flex-1 bg-second" aria-hidden="true" />}
      </div>
      {entry.href ? (
        <Link
          href={`/${entry.href}`}
          className="block flex-1 rounded-md pb-6 hover:[&_h3]:underline focus-visible:outline-none"
        >
          {body}
        </Link>
      ) : (
        <div className="flex-1 pb-6">{body}</div>
      )}
    </li>
  );
}

function Track({
  kind,
  headingId,
  title,
  children,
}: {
  kind: TrackKind;
  headingId: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-lg border border-second bg-surface-raised p-6 md:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <TrackIcon kind={kind} />
        <h2 id={headingId} className="text-xl font-semibold text-main-text">
          {title}
        </h2>
      </div>
      <ol className="flex flex-col">{children}</ol>
    </section>
  );
}
```

(Si `React.ReactNode` pose problème à tsc, `import type { ReactNode } from "react";`.)

e. Remplacer le JSX retourné par `JourneySection` par :

```tsx
    <div className="container mx-auto px-[var(--section-padding-x)] py-[var(--section-padding-y)]">
      <h1 className="outlined-text">{t.journey.title}</h1>
      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Track kind="experience" headingId="journey-experience" title={t.journey.experienceTrack}>
          {journeyEntries.map((entry, index) => (
            <JourneyEntryRow
              key={entry.href}
              entry={entry}
              isLast={index === journeyEntries.length - 1}
              t={t}
              language={language}
            />
          ))}
        </Track>
        <Track kind="education" headingId="journey-education" title={t.journey.educationTrack}>
          {education.map((entry, index) => (
            <EducationRow
              key={entry.id}
              entry={entry}
              isLast={index === education.length - 1}
              language={language}
            />
          ))}
        </Track>
      </div>
    </div>
```

### 5. Vérifications

Procédure §4, puis au navigateur, section Parcours :

1. 1280 px : deux cartes côte à côte. Gauche : GCII (badge « Poste actuel »)
   → Safran → Quimesis → Kusmitea. Droite : Mines → PSI → PCSI → Bac.
2. 360 px : cartes empilées, Expérience d'abord, pas de défilement horizontal.
3. Cliquer PSI puis PCSI : les deux ouvrent `/cpge_tipe`. Mines et Bac ne
   sont pas des liens.
4. EN : titres de piste et intitulés traduits, noms propres inchangés.
5. Thème clair et sombre lisibles.

Commit : `feat(journey): newest first, split into work and education tracks`

## Critères d'acceptation

- [ ] Ordre décroissant dans les deux pistes.
- [ ] 4 entrées de formation exactes (intitulés, établissements, lieux, années).
- [ ] PCSI et PSI mènent au TIPE.
- [ ] Deux colonnes ≥ 1024 px, une colonne en dessous.
- [ ] lint / tsc / build passent.

## Hors périmètre

Les icônes 3D (PORT-050). Toute modification de `src/data/projects.ts`.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : nouvelle ligne `src/data/education.ts` (formation,
  `LocalizedText`, années entières) ; `journeySection.tsx` = deux pistes,
  ordre décroissant ; `journey/TrackIcon.tsx`.
