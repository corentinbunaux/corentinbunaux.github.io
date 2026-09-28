---
id: PORT-057
title: "Cartes projet — afficher le début de l'article au lieu du vide (carte vedette 2x haute)"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: review
resumeAt: null
priority: P1
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-057-card-excerpt
depends_on: []
parallel_safe: true
human_checkpoint: "Regarder la grille de projets : la carte Safran (et les autres) montrent-elles un extrait utile ?"
created: 2026-09-28
---

# Cartes projet — extrait de l'article

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (`recette-utilisateur-2.md`, point 4)

> Pour la preview de Safran, la carte prend la hauteur de 2 cartes
> traditionnelles. J'aimerais afficher le début de l'article, plutôt que de
> voir du vide laissé vacant. Des « … » en fin de carte pourraient aussi
> être un plus afin d'inviter l'utilisateur à cliquer pour en voir
> davantage.

## Diagnostic (fait le 2026-09-28)

- C'est GCII (`featured: true`, `src/data/projects.ts`), pas Safran, qui
  est en `sm:col-span-2` — mais dans une grille CSS à 3 colonnes, la ligne
  qui contient la carte vedette (2 colonnes de large) et sa voisine (1
  colonne, ici Safran puisqu'elle vient juste après GCII dans le tri) est
  dimensionnée sur la carte la **plus haute** de la ligne. Comme l'image de
  la carte vedette est en `aspect-video` mais 2× plus large, elle est aussi
  2× plus haute — et la grille CSS étire (`align-items: stretch`, valeur
  par défaut) la carte Safran à la même hauteur de ligne, laissant du vide
  sous son texte, qui est court.
- Le texte affiché aujourd'hui (`project.description`) est une étiquette
  très courte (« Stage de fin d'études »), pas le début de l'article — le
  vrai texte d'intro existe déjà dans `content/projects/<href>.<lang>.md`
  (section « Contexte »), lu par `loadArticle()` (`src/lib/articles.ts`),
  mais cette fonction utilise `node:fs` et ne peut être appelée que
  côté serveur. `src/app/page.tsx` (qui rend `ProjectsSection`) est
  actuellement un composant client (`"use client"` en tête) : il ne peut
  pas appeler `loadArticle()` directement.

## Fichiers

- Créé : `src/components/HomeShell.tsx`
- Modifiés : `src/app/page.tsx` (redevient un composant serveur),
  `src/components/projectsSection.jsx`

## Étapes

### 1. `src/app/page.tsx` devient un composant serveur qui lit les extraits

Lire le fichier entier (il est court). Le réécrire ainsi :

```tsx
import { projects } from "../data/projects";
import { loadArticle } from "../lib/articles";
import { HomeShell } from "../components/HomeShell";
import "./app.css";

export default function Home() {
  const excerpts = Object.fromEntries(
    projects.map((project) => {
      const article = loadArticle(project.href);
      return [
        project.href,
        {
          fr: article.fr[0]?.paragraphs[0] ?? "",
          en: article.en[0]?.paragraphs[0] ?? "",
        },
      ];
    }),
  );

  return <HomeShell excerpts={excerpts} />;
}
```

Pas de `"use client"` en tête : c'est justement le point (les Server
Components peuvent utiliser `node:fs` via `loadArticle`, qui est déjà
appelée exactement comme ça dans chacune des 12 routes de projet — même
pattern, rien de nouveau).

### 2. `src/components/HomeShell.tsx` — reprend tout ce que `page.tsx` faisait

```tsx
"use client";

import { useEffect } from "react";
import Homepage from "./homepage";
import { SiteHeader } from "./SiteHeader";
import JourneySection from "./journeySection";
import AboutMe from "./aboutmeSection";
import ProjectsSection from "./projectsSection";
import Footer from "./footer";
import { redirect } from "next/navigation";

export type ProjectExcerpts = Readonly<Record<string, { fr: string; en: string }>>;

export function HomeShell({ excerpts }: { excerpts: ProjectExcerpts }) {
  useEffect(() => {
    if (performance.navigation.type === 1) {
      redirect("/");
    }
  }, []);

  return (
    <>
      <SiteHeader variant="home" />
      <section id="home" className="relative">
        <Homepage />
      </section>
      <section id="journey" className="flex justify-center items-center">
        <JourneySection />
      </section>
      <section id="portfolio">
        <ProjectsSection excerpts={excerpts} />
      </section>
      <section id="about" className="flex justify-center items-center">
        <AboutMe />
      </section>
      <section id="footer">
        <Footer />
      </section>
    </>
  );
}
```

(Reprendre exactement le contenu JSX de l'ancien `page.tsx` — ne rien
changer aux sections autres que `portfolio`.)

### 3. `src/components/projectsSection.jsx` — utiliser l'extrait, remplir la hauteur

- `ProjectsSection` reçoit maintenant une prop `excerpts` et la passe à
  `ProjectCard` :
  ```jsx
  function ProjectsSection({ excerpts }) {
    // … inchangé …
    return (
      // …
      {filteredProjects.map((project) => (
        <ProjectCard key={project.href} project={project} t={t} excerpt={excerpts[project.href]?.[language]} />
      ))}
      // …
    );
  }
  ```
  Il faut donc que `language` soit lu (déjà le cas via `useLanguage()`) et
  passé jusqu'à l'appel — vérifier qu'il est bien dans le scope de
  `filteredProjects.map`.
- `ProjectCard` : donner à son contenu la capacité de remplir la hauteur
  disponible, et afficher l'extrait sous la description, tronqué
  proprement (l'ellipse visuelle `…` en fin de texte vient automatiquement
  de `line-clamp`, pas besoin de l'ajouter à la main) :

  ```jsx
  const ProjectCard = ({ project, t, excerpt }) => (
    <Link
      href={`/${project.href}`}
      className={`group flex flex-col overflow-hidden rounded-lg border border-second bg-surface transition-colors hover:border-secondary ${
        project.featured ? "sm:col-span-2" : ""
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-raised">
        {/* … image, inchangé … */}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-main-text">{project.title}</h3>
        <p className="text-sm text-second-text">{project.description}</p>
        {excerpt && (
          <p className="line-clamp-5 flex-1 text-sm text-second-text/90">{excerpt}</p>
        )}
        {project.techLogos.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {project.techLogos.map((id) => (
              <TechPill key={id} id={id} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
  ```

  Points importants :
  - Le conteneur de texte passe de `flex flex-col gap-2 p-4` à
    `flex flex-1 flex-col gap-2 p-4` (le `flex-1` est ce qui lui fait
    remplir la hauteur étirée par la grille, au lieu de laisser le vide en
    dessous).
  - `project.description` **perd** sa classe `truncate` (elle passait le
    texte en une seule ligne coupée ; ce n'est plus nécessaire puisque
    l'extrait en dessous absorbe l'essentiel de l'espace — si la
    description est déjà courte dans les données, `truncate` n'apportait
    rien d'utile de toute façon).
  - `mt-auto` sur le bloc des pastilles technos : les pousse en bas de la
    carte quand il y a de la place, pour un rendu propre.
  - Tailwind 3.4 (version du projet, vérifiée dans `package.json`) inclut
    `line-clamp-*` nativement depuis la 3.3 — ne pas ajouter
    `@tailwindcss/line-clamp`, ce serait une dépendance inutile.

### 4. Vérifications

Procédure §4 (`npm run build` est le test le plus important ici : il
exécute `loadArticle()` pour les 12 projets au moment de générer `/` —
toute incohérence Markdown FR/EN plantera le build, ce qui est le
comportement voulu, pas un bug de ce ticket). Visuel (headless Chrome si
disponible, sinon `curl` sur le HTML statique généré dans `out/index.html`
après `npm run build`) :

1. La carte GCII (vedette, 2 colonnes) et sa voisine (Safran) : leur ligne
   fait la même hauteur, mais la carte Safran affiche maintenant plusieurs
   lignes de texte (l'extrait de son contexte), pas du vide.
2. Une carte normale (1 colonne, ligne non étirée) : l'extrait s'affiche
   aussi, sur moins de lignes visibles vu l'espace disponible — c'est
   attendu, pas un problème.
3. 360 px : pas de débordement horizontal, l'extrait reste lisible.
4. Basculer FR/EN : l'extrait change de langue.

Commit : `feat(projects): show an article excerpt on project cards instead of empty space`

## Critères d'acceptation

- [x] Plus d'espace vide visible sous le texte d'une carte étirée par la
      grille (Safran en particulier).
- [x] L'extrait vient du vrai contenu de l'article (`content/projects/`),
      pas d'un texte inventé.
- [x] `npm run build` passe (donc chaque article a bien un premier
      paragraphe de contexte dans les deux langues).
- [x] lint / tsc / build passent.

## Journal d'exécution

- Worktree `../wt-PORT-057` créée depuis `refonte-2026` (`13c7a8e`), branche
  `feat/PORT-057-card-excerpt`. `npm ci` OK (437 paquets).
- Implémentation conforme aux étapes 1 à 3 du ticket, reprises telles
  quelles : `src/app/page.tsx` redevient un composant serveur qui appelle
  `loadArticle()` pour les 12 projets et construit `excerpts` ;
  `src/components/HomeShell.tsx` créé (reprend tel quel le JSX client de
  l'ancien `page.tsx`) ; `src/components/projectsSection.jsx` :
  `ProjectsSection` reçoit `excerpts`, `ProjectCard` reçoit `excerpt` et
  l'affiche sous la description (`line-clamp-5 flex-1`), `truncate` retiré de
  la description, `flex-1` ajouté au conteneur de texte, `mt-auto` sur le
  bloc de pastilles technos.
- `npm run lint` :
  ```
  ✖ 4 problems (0 errors, 4 warnings)
  ```
  Les 4 warnings (`react-hooks/set-state-in-effect`) sont préexistants dans
  `src/theme/ThemeContext.tsx` et `src/theme/useThemeColors.ts`, fichiers non
  touchés par ce ticket.
- `npx tsc --noEmit` : aucune sortie, aucune erreur.
- `npm run build` :
  ```
  ✓ Compiled successfully in 28.4s
  Running TypeScript ...
  Finished TypeScript in 9.9s ...
  ✓ Generating static pages using 7 workers (15/15) in 2.4s
  Finalizing page optimization ...
  Route (app): / , /_not-found, /cpge_tipe, /emse/android, /emse/embedded,
  /emse/minesweeper, /emse/programming, /internships/kusmitea,
  /internships/quimesis, /internships/safran, /personnal/cctv,
  /personnal/web, /research/sncf, /work/gcii — toutes ○ Static.
  ```
  Les 12 articles ont bien chargé via `loadArticle()` lors de la génération
  de `/`.
- Vérification visuelle faite via `npm run dev` (port 3002, le 3000 étant
  déjà pris par un autre agent) et un onglet Chrome dédié à moi (jamais
  touché l'onglet d'un autre agent) :
  - 1280 px, thème sombre et clair : la carte Safran (voisine de la carte
    vedette GCII, ligne étirée) affiche l'extrait de son "Contexte" sur
    plusieurs lignes, plus de vide sous le texte ; les pastilles technos sont
    bien poussées en bas (`mt-auto`).
  - Bascule FR → EN : l'extrait change de langue (vérifié sur Safran et
    GCII, ex. « During my final year at Mines de Saint-Étienne… »).
  - 360 px : **non vérifié en direct**. L'outil `resize_window` du
    navigateur partagé n'a pas modifié la fenêtre réelle (`window.innerWidth`
    toujours à 2048 après l'appel) — cette fenêtre est partagée avec l'onglet
    d'un autre agent (`localhost:3000/emse/minesweeper`), donc pas
    d'insistance pour ne pas perturber son travail. Vérifié uniquement par
    lecture du code : la grille repasse en `grid-cols-1` sous `sm:` (640 px),
    donc à 360 px chaque carte est seule sur sa ligne (pas d'étirement de
    hauteur inter-cartes) et aucune classe ajoutée n'introduit de largeur
    fixe — mais pas de capture d'écran réelle à 360 px.
  - Confirmé aussi sur le HTML statique généré (`out/index.html` après
    `npm run build`) : les 12 cartes contiennent bien `line-clamp-5
    flex-1 text-sm text-second-text/90` suivi du premier paragraphe réel de
    chaque article (FR).
- Écart par rapport au ticket : aucun.

## Notes pour la consolidation

- ARCHITECTURE.md : `src/app/page.tsx` est redevenu un composant serveur
  (il lit les extraits d'articles via `loadArticle()`) ; l'assemblage
  client de la home vit maintenant dans `src/components/HomeShell.tsx`.
