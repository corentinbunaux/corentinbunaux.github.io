---
id: PORT-037
title: "Hero façon maquette + fusion de la section Profil (moins d'animation)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P1
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-037-hero-profile-merge
depends_on: [PORT-026, PORT-028, PORT-033]
parallel_safe: true
human_checkpoint: "Juger le nouveau hero à 1280 px et sur mobile, en clair et en sombre ; relire l'accroche (tagline)."
created: 2026-09-27
---

# Hero façon maquette + Profil fusionné

**Procédure** : `docs/PROCEDURE-TICKET.md`. Modèle **Sonnet** (mise en page à
juger à l'œil, suppression de plusieurs composants).

## Retours de Corentin (#1, #5)

> Écran principal pas en adéquation avec les maquettes. Conserver l'avatar,
> mais le bandeau + la figure three.js + la roue des logos font beaucoup
> d'animation et peuvent perdre l'utilisateur. […] plus léger, en se
> rapprochant de ce qui était proposé par les maquettes dans un premier temps.

> Modifier l'écran d'accueil pour intégrer directement la partie « Profil »
> dedans […] il y aura la place pour intégrer les éléments du profil sur la
> page principale.

## Cible : maquette `design/mockups/02-refonte.png`, zone ①

- **Gauche** : « Hey ! Je m'appelle » (petit), **Corentin Bunaux** (grand
  titre), accroche « Ingénieur logiciel fullstack · Diplômé de l'École des
  Mines de Saint-Étienne », phrase de rôle (GCII / Enedis / Le Havre),
  phrase de personnalité, boutons « Voir mes projets » (plein, vert) et « Me
  contacter » (contour) + icônes LinkedIn / GitHub, pastilles technos
  (logos), ligne langues, ligne « Expériences chez … ».
- **Droite** : un panneau (carte) avec l'avatar dans un cercle. Le globe 3D
  avec les icônes en orbite sera ajouté **dans ce panneau** par PORT-044 ; ce
  ticket ne met aucune 3D.
- **Supprimés** : bandeau vert, mesh three.js de fond (`HeroCanvas` /
  `HeroMesh`), roue d'icônes CSS (`RoundContainer`), section `#profile`
  (son contenu utile passe dans le hero), bandeau défilant `Banner` sur la
  home (les pastilles le remplacent ; `Banner.jsx` reste pour `bannerElmts`).
- Le paragraphe CPGE → Mines du profil n'est **pas** repris : la formation
  est désormais dans le Parcours (PORT-030).

## Fichiers

- Créés : `src/components/hero/HeroVisual.tsx`, `src/components/hero/heroIcons.js`
- Réécrit : `src/components/homepage.jsx`
- Modifiés : `src/app/page.tsx`, `src/app/app.css` (suppression des règles de
  la roue uniquement), `src/i18n/namespaces/hero.ts`,
  `src/i18n/namespaces/profile.ts`
- Supprimés : `src/components/profileSection.jsx`,
  `src/components/HeroCanvas.tsx`, `src/components/HeroMesh.tsx`

## Étapes

### 1. Icônes de la roue → module réutilisable

Déplacer l'objet `iconsWheel` de `homepage.jsx` (lignes ~8-40, images base64)
**tel quel** dans `src/components/hero/heroIcons.js` :

```js
/** Icons that used to spin in the hero wheel (tennis, chess, films, dev…),
 * as base64 data URLs. Reused by the 3D globe of PORT-044. */
export const HERO_ICONS = { /* contenu exact de iconsWheel */ };
```

Contrôle : `node -e "import('./src/components/hero/heroIcons.js').then(m=>console.log(Object.keys(m.HERO_ICONS).length))"`
affiche 15 (si Node refuse l'import ESM d'un `.js`, compter les clés à la
main avec `grep -c "data:image" src/components/hero/heroIcons.js`).

### 2. Textes

`src/i18n/namespaces/hero.ts` — garder `greeting`, `namePrefix`, `cta`,
`avatarAlt` ; ajouter :

| Clé | FR | EN |
| --- | --- | --- |
| `tagline` | `Ingénieur logiciel fullstack · Diplômé de l'École des Mines de Saint-Étienne` | `Fullstack software engineer · Graduate of the École des Mines de Saint-Étienne` |
| `stackLabel` | `Technos du quotidien` | `Everyday stack` |
| `languages` | `Anglais C1 (TOEIC 950/990) · Espagnol B1 · Français langue maternelle` | `English C1 (TOEIC 950/990) · Spanish B1 · French (native)` |
| `experienceLabel` | `Expériences chez` | `Experience at` |
| `linkedinLabel` | `Profil LinkedIn` | `LinkedIn profile` |
| `githubLabel` | `Profil GitHub` | `GitHub profile` |

`src/i18n/namespaces/profile.ts` — **garder uniquement** `roleIntro`,
`roleClient`, `roleLocation`, `experienceSummary`, `personality` (interface,
FR, EN) ; supprimer toutes les autres clés (elles ne servaient qu'à
`profileSection.jsx`).

### 3. `src/components/hero/HeroVisual.tsx`

```tsx
"use client";

import { OptimizedImage } from "../optimizedImage";
import { useTranslation } from "../../i18n/dictionary";

/**
 * Right-hand panel of the hero (mockup zone ①): the avatar in a circle.
 * PORT-044 adds the 3D globe next to it, in this file only.
 */
export function HeroVisual() {
  const t = useTranslation();
  return (
    <div className="relative mx-auto flex aspect-[4/3] w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-second bg-surface lg:max-w-none">
      <div className="aspect-square w-2/5 overflow-hidden rounded-full border-2 border-my-green bg-surface-raised">
        <OptimizedImage
          src="/img/avatar"
          alt={t.hero.avatarAlt}
          priority
          sizes="(min-width: 1024px) 20vw, 40vw"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    </div>
  );
}
```

### 4. `src/components/homepage.jsx` (réécriture complète)

Garder l'export `GithubLogo` (vérifier avec `grep -rn GithubLogo src` qui
l'importe ; s'il n'est utilisé nulle part ailleurs, le garder quand même,
c'est hors périmètre). Nouveau composant :

```jsx
import React from "react";
import "../app/app.css";
import { useTranslation } from "../i18n/dictionary";
import { useLanguage } from "../i18n/LanguageContext";
import { projects } from "../data/projects";
import { TechBadge } from "./TechBadge";
import { HeroVisual } from "./hero/HeroVisual";

const EMAIL = "corentin.bunaux@gmail.com";
const LINKEDIN_URL = "http://linkedin.com/in/corentin-bunaux";
const GITHUB_URL = "https://github.com/corentinbunaux";

/** Everyday stack shown under the CTAs. Labels as in ProjectPage's TECH_LABELS. */
const HERO_STACK = [
  { id: "typescript", label: "TypeScript" },
  { id: "react", label: "React" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "sql", label: "SQL" },
  { id: "git", label: "Git" },
  { id: "linux", label: "Linux" },
];

export function GithubLogo(props) { /* inchangé : recopier l'existant */ }

function LinkedInLogo(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="(recopier le d= du chemin LinkedIn existant)" />
    </svg>
  );
}

function Homepage() {
  const t = useTranslation();
  const { language } = useLanguage();
  const companies = projects
    .filter((p) => p.category === "pro" || p.category === "recherche")
    .map((p) => p.title[language])
    .join(" · ");

  return (
    <div className="mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-4 pb-16 pt-[calc(var(--header-height)+2rem)] sm:px-8 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="text-second-text">
          {t.hero.greeting} {t.hero.namePrefix}
        </p>
        <h1 className="mt-1 text-4xl font-bold text-main-text sm:text-5xl">Corentin Bunaux</h1>
        <p className="mt-3 text-lg text-my-blue">{t.hero.tagline}</p>
        <p className="mt-4 text-main-text">
          {t.profile.roleIntro}
          <strong className="text-my-green">GCII</strong>
          {t.profile.roleClient}
          <strong className="text-my-green">Enedis</strong>
          {t.profile.roleLocation}
          <strong className="text-my-green">Le Havre</strong>.
        </p>
        <p className="mt-2 text-second-text">
          {t.profile.experienceSummary} {t.profile.personality}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href="#portfolio" className="rounded-full bg-my-green px-6 py-2 font-medium text-main hover:underline">
            {t.hero.cta}
          </a>
          <a href={`mailto:${EMAIL}`} className="rounded-full border border-second px-6 py-2 text-main-text hover:bg-surface-raised">
            {t.footer.contactCta}
          </a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label={t.hero.linkedinLabel} className="p-2 text-main-text hover:text-my-green">
            <LinkedInLogo className="h-6 w-6" />
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label={t.hero.githubLabel} className="p-2 text-main-text hover:text-my-green">
            <GithubLogo className="h-6 w-6" />
          </a>
        </div>

        <p className="mt-8 text-sm text-second-text">{t.hero.stackLabel}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {HERO_STACK.map(({ id, label }) => (
            <TechBadge key={id} id={id} label={label} />
          ))}
        </ul>

        <p className="mt-6 text-sm text-second-text">{t.hero.languages}</p>
        <p className="mt-1 text-sm text-second-text">
          {t.hero.experienceLabel} {companies}
        </p>
      </div>

      <HeroVisual />
    </div>
  );
}

export default Homepage;
```

Points d'attention :
- `GithubLogo` : si son SVG a un `fill` en dur (ex. `#F5F5F5`), le passer en
  `currentColor` pour le thème clair.
- Le texte « Corentin Bunaux » est un nom propre : pas de traduction.

### 5. `src/app/page.tsx`

- Supprimer l'import et la section `<section id="profile">…</section>`.
- Supprimer l'état `allTops` et son `useEffect` (plus aucun consommateur :
  vérifier avec `grep -n allTops src -r`), et les imports devenus inutiles
  (`useState` si plus utilisé).
- `<Homepage />` sans prop.
- Garder l'effet `performance.navigation` et le reste tels quels.

### 6. Suppressions

```bash
git rm src/components/profileSection.jsx src/components/HeroCanvas.tsx src/components/HeroMesh.tsx
grep -rn "profileSection\|HeroCanvas\|HeroMesh\|RoundContainer\|iconsWheel" src   # → aucun résultat
grep -n "wheel" src/app/app.css
```

Supprimer de `app.css` les règles/keyframes de la roue (`wheel-spin`,
`wheel-item`, `wheel-item-counter-spin` et leurs `@keyframes`) — et
seulement celles-là. `useDesktopMotionGate.ts` **reste** (utilisé par les
démos).

### 7. Vérifications

Procédure §4, puis navigateur, clair ET sombre :

1. 1280 px : texte à gauche, panneau avatar à droite, le tout tient dans
   l'écran sous l'en-tête ; aucune animation dans le hero.
2. 360 px : une colonne, texte puis panneau, pas de défilement horizontal,
   boutons utilisables au doigt.
3. « Voir mes projets » défile jusqu'aux projets ; « Me contacter » ouvre
   un mail ; LinkedIn/GitHub s'ouvrent dans un nouvel onglet.
4. EN : accroche, langues, libellés traduits ; « Profil » de l'en-tête
   remonte au hero.
5. Onglet Réseau sur la home à 1280 px : **aucun** chunk three.js chargé
   (il reviendra avec PORT-044).

Commits :
1. `feat(hero): rebuild the hero after the mockup and merge the profile into it`
2. `chore(hero): remove the background mesh, the icon wheel and profileSection`

## Critères d'acceptation

- [ ] Structure de la zone ① de la maquette, sans bandeau, sans roue, sans mesh.
- [ ] Contenu du profil (rôle, personnalité, langues, technos) dans le hero.
- [ ] Section `#profile` supprimée, nav/footer OK.
- [ ] `HERO_ICONS` disponible pour PORT-044.
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : sections de la home = `#home #journey #portfolio #about
  #footer` (plus de `#profile`, plus de mesure `offsetTop`) ; retirer les
  lignes HeroMesh/HeroCanvas et la décision « roue CSS » ; ajouter
  `src/components/hero/` ; `HERO_STACK` duplique une partie de
  `TECH_LABELS` (à factoriser dans un ticket séparé si ça gêne).
