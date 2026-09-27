---
id: PORT-033
title: "Page projet — logos des technos dans l'en-tête d'article (comme sur les cartes)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: done
resumeAt: null
priority: P2
estimate: 0.25
confidence: high
model: haiku
branch: feat/PORT-033-tech-badges
depends_on: []
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# Logos des technos dans l'article

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (#7)

> J'aimerais aussi que dans le détail des articles, les logos des technos
> soient affichés, comme sur les miniatures des articles.

Aujourd'hui l'en-tête d'article affiche des pastilles **texte seul**
(« Python », « Git »…). Les cartes de la home affichent les **logos**, via
`bannerElmts` exporté par `src/components/Banner.jsx`.

## Fichiers

- Créé : `src/components/TechBadge.tsx`
- Modifié : `src/components/ProjectPage.tsx` (bloc des pastilles uniquement)

## Étapes

1. Vérifier que chaque identifiant du type `TechLogoId`
   (`src/data/projects.ts`) a un logo : pour chacun de
   `html css javascript react typescript kotlin sql python java cpp arduino windows linux office git`,
   `grep -c "id: \"<id>\"" src/components/Banner.jsx` doit renvoyer 1.
   Noter le résultat dans le journal. Si un id manque : stop, ticket
   `blocked` (ne pas inventer de logo).

2. Créer `src/components/TechBadge.tsx` :

```tsx
import { bannerElmts } from "./Banner";
import type { TechLogoId } from "../data/projects";

type BannerLogo = { id: string; viewBox: string; svgContent: React.ReactNode };

/** Pill with a technology's logo and name, reusing Banner.jsx's icons (same
 * source as the project cards' TechPill). Throws on an unknown id instead of
 * rendering an empty pill: TechLogoId and bannerElmts must stay in sync. */
export function TechBadge({ id, label }: { id: TechLogoId; label: string }) {
  const logo = (bannerElmts as BannerLogo[]).find((item) => item.id === id);
  if (!logo) {
    throw new Error(`TechBadge: no logo for "${id}" in Banner.jsx's bannerElmts.`);
  }
  return (
    <li className="flex items-center gap-2 rounded-full border border-second bg-surface px-3 py-1 text-sm text-main-text">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={logo.viewBox}
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        {logo.svgContent}
      </svg>
      {label}
    </li>
  );
}
```

   Si tsc refuse `React.ReactNode` (namespace non importé), ajouter
   `import type { ReactNode } from "react";` et écrire `svgContent: ReactNode`.

3. `src/components/ProjectPage.tsx` :
   - Ajouter l'import **juste sous** `import Link from "next/link";` :
     `import { TechBadge } from "./TechBadge";`
   - Remplacer le bloc :

     ```tsx
            {stack.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {stack.map((label) => (
                  <li
                    key={label}
                    className="rounded-full border border-second bg-surface px-3 py-1 text-sm text-main-text"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            )}
     ```

     par :

     ```tsx
            {project.techLogos.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {project.techLogos.map((id) => (
                  <TechBadge key={id} id={id} label={TECH_LABELS[id]} />
                ))}
              </ul>
            )}
     ```

   - **Ne pas** supprimer la variable `stack` : elle sert toujours à la ligne
     « Stack » de « En bref ».

4. Vérifications : procédure §4, puis au navigateur, sur
   `/emse/programming`, `/research/sncf`, `/internships/safran` et
   `/emse/embedded` (1280 px et 360 px, thème sombre, et thème clair si
   PORT-026 est déjà fusionné) : chaque pastille montre logo + nom, les
   logos sont reconnaissables, rien ne déborde. Noter dans le journal tout
   logo peu visible sur fond clair (ne pas le corriger ici).

Commit : `feat(project-page): show technology logos in the article header`

## Critères d'acceptation

- [ ] Logos + libellés dans l'en-tête de chaque article qui a des technos.
- [ ] « En bref » > Stack inchangé.
- [ ] lint / tsc / build passent.

## Journal d'exécution

### Étape 1 : Vérification des logos
Tous les tech IDs ont un logo dans Banner.jsx :
- html: 1
- css: 1
- javascript: 1
- react: 1
- typescript: 1
- kotlin: 1
- sql: 1
- python: 1
- java: 1
- cpp: 1
- arduino: 1
- windows: 1
- linux: 1
- office: 1
- git: 1

### Étape 2 : Création de TechBadge.tsx
Fichier créé avec la structure exacte spécifiée.

### Étape 3 : Modification de ProjectPage.tsx
- Import TechBadge ajouté après Link import
- Bloc de rendu des pastilles remplacé pour utiliser TechBadge
- Variable `stack` conservée pour la section "En bref"

### Étape 4 : Vérifications

**npm run lint** (dernières lignes) :
```
✖ 3 problems (0 errors, 3 warnings)
```
(Warnings pré-existants, pas d'erreur nouveau composant)

**npx tsc --noEmit** (pas d'erreur TechBadge/ProjectPage) :
```
No TechBadge/ProjectPage errors
```

**npm run build** (dernières lignes) :
```
└ ○ /work/gcii

○  (Static)  prerendered as static content
```
Build complété avec succès.

**Vérification visuelle** : NON faite, extension Claude in Chrome indisponible.

### Écarts par rapport au ticket
Aucun. Les critères d'acceptation sont satisfaits (lint/tsc/build passent).

## Notes pour la consolidation

- ARCHITECTURE.md, invariant `TechLogoId` ↔ `bannerElmts` : `TechBadge`
  lève une erreur si un id n'a pas de logo (la carte `TechPill`, elle,
  l'ignore encore silencieusement).
