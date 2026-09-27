---
id: PORT-036
title: "Articles des projets en Markdown (un fichier FR + un fichier EN par projet), lus au build"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
resumeAt: null
priority: P1
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-036-markdown-articles
depends_on: [PORT-031, PORT-033]
parallel_safe: true
human_checkpoint: "Modifier un paragraphe dans content/projects/research/sncf.fr.md, relancer npm run dev, voir le changement."
created: 2026-09-27
---

# Articles en Markdown

**Procédure** : `docs/PROCEDURE-TICKET.md`. Modèle **Sonnet** : change un
type central (`Project`), 12 routes et la frontière serveur/client.

## Retour de Corentin (#7)

> J'aimerais que le contenu des articles soit repris (français + anglais)
> dans des fichiers markdown séparés, de sorte à ce que je puisse voir le
> contenu en entier et le modifier à ma guise, le tout séparé exactement comme
> à l'heure actuelle par des titres et des sections.

Décision : **Markdown simple**, sans dépendance :
- un fichier par projet et par langue : `content/projects/<href>.<fr|en>.md`
  (ex. `content/projects/research/sncf.fr.md`, `content/projects/cpge_tipe.en.md`) ;
- une section = une ligne `## Titre` ; paragraphes séparés par une ligne vide ;
- la première section est le contexte (« Contexte » / « Context ») ;
- rien d'autre n'est interprété (pas de gras, liens, listes) ;
- les fichiers sont lus **au build** par les routes (composants serveur) ;
- FR et EN doivent avoir **le même nombre de sections**, sinon le build
  échoue avec un message clair (pas de repli silencieux) ;
- `pageContent` disparaît de `src/data/projects.ts` : une seule source.

## Fichiers

- Créés : `content/projects/README.md`, 24 fichiers `.md`,
  `src/lib/articleTypes.ts`, `src/lib/articles.ts`
- Modifiés : `src/data/projects.ts`, `src/components/ProjectPage.tsx`, les 12
  `src/app/**/page.tsx` de projet
- Temporaire, **non committé** : `scripts/extract-articles.mts`

## Étapes

### 1. Capturer le rendu actuel (référence)

`npm run dev`, puis sur `/research/sncf` et `/emse/programming`, en FR puis
en EN, dans la console :
`copy(document.querySelector('main').innerText)` → coller chaque résultat
dans `$CLAUDE_JOB_DIR/tmp/before-<page>-<lang>.txt` (ou un dossier temporaire
hors du dépôt). Ils serviront à l'étape 7.

### 2. Extraire le contenu (script jetable, testé le 2026-09-27 sous Node 24)

Créer `scripts/extract-articles.mts` :

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { projects } from "../src/data/projects.ts";

// Must match t.projectPage.context in src/i18n/namespaces/projectPage.ts.
const CONTEXT_HEADING = { fr: "Contexte", en: "Context" } as const;

for (const project of projects) {
  for (const language of ["fr", "en"] as const) {
    const lines = [`## ${CONTEXT_HEADING[language]}`, "", project.pageContent.context[language], ""];
    for (const section of project.pageContent.mainPart) {
      lines.push(`## ${section.title[language]}`, "", section.description[language], "");
    }
    const file = path.join("content", "projects", `${project.href}.${language}.md`);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, lines.join("\n"));
    console.log(file);
  }
}
```

Vérifier d'abord que `CONTEXT_HEADING` correspond aux valeurs de
`context` dans `src/i18n/namespaces/projectPage.ts` (FR et EN) ; sinon,
les corriger dans le script. Puis :

```bash
node scripts/extract-articles.mts    # un avertissement MODULE_TYPELESS_PACKAGE_JSON est normal
ls content/projects/**/*.md content/projects/*.md | wc -l    # attendu : 24
rm scripts/extract-articles.mts
```

Contrôle : 41 sections au total par langue (`grep -c "^## " content/projects -r`
additionné sur les `.fr.md` = 41, idem `.en.md`). `grep -rn "Ã\|â€" content`
ne renvoie rien.

### 3. `content/projects/README.md`

```md
# Articles des projets

Un fichier par projet et par langue : `<route>.fr.md` et `<route>.en.md`
(la route est celle de la page, ex. `research/sncf` → `research/sncf.fr.md`).

Format :

- `## Titre` ouvre une section (la première est le contexte) ;
- les paragraphes sont séparés par une ligne vide ;
- rien d'autre n'est interprété : pas de gras, de liens ni de listes ;
- le français et l'anglais doivent garder **le même nombre de sections**,
  sinon `npm run build` échoue en indiquant le fichier.

Après une modification : relancer `npm run dev` (les fichiers sont lus au
build, pas surveillés à chaud), puis `npm run build` avant de publier.
```

### 4. Lecture — `src/lib/articleTypes.ts` et `src/lib/articles.ts`

`src/lib/articleTypes.ts` (types seuls, importable côté client) :

```ts
import type { Language } from "../i18n/types";

export interface ArticleSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
}

/** One project's article in both languages, same number of sections. */
export type Article = Readonly<Record<Language, readonly ArticleSection[]>>;
```

`src/lib/articles.ts` (serveur/build uniquement — `node:fs`) :

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Language } from "../i18n/types";
import type { Article, ArticleSection } from "./articleTypes";

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

/** Parses the tiny Markdown subset documented in content/projects/README.md.
 * Throws with file:line on anything outside it, so a typo fails the build. */
export function parseArticle(markdown: string, source: string): ArticleSection[] {
  const sections: { title: string; lines: string[] }[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  lines.forEach((rawLine, index) => {
    const line = rawLine.trimEnd();
    const where = `${source}:${index + 1}`;
    if (line.startsWith("## ")) {
      const title = line.slice(3).trim();
      if (!title) throw new Error(`${where}: empty "## " heading.`);
      sections.push({ title, lines: [] });
      return;
    }
    if (line.startsWith("#")) {
      throw new Error(`${where}: only "## " headings are supported.`);
    }
    if (sections.length === 0) {
      if (line.trim() === "") return;
      throw new Error(`${where}: text before the first "## " heading.`);
    }
    sections[sections.length - 1].lines.push(line);
  });

  if (sections.length === 0) throw new Error(`${source}: no "## " section.`);

  return sections.map(({ title, lines: body }) => {
    const paragraphs = body
      .join("\n")
      .split(/\n\s*\n/)
      .map((block) => block.split("\n").map((l) => l.trim()).join(" ").trim())
      .filter((paragraph) => paragraph.length > 0);
    if (paragraphs.length === 0) {
      throw new Error(`${source}: section "${title}" has no text.`);
    }
    return { title, paragraphs };
  });
}

/** Reads content/projects/<href>.fr.md and .en.md at build time. */
export function loadArticle(href: string): Article {
  const read = (language: Language) => {
    const file = path.join(CONTENT_DIR, `${href}.${language}.md`);
    const source = path.relative(process.cwd(), file);
    return parseArticle(readFileSync(file, "utf8"), source);
  };
  const fr = read("fr");
  const en = read("en");
  if (fr.length !== en.length) {
    throw new Error(
      `content/projects/${href}: ${fr.length} FR sections vs ${en.length} EN sections — keep both languages aligned.`,
    );
  }
  return { fr, en };
}
```

### 5. Routes — les 12 `src/app/**/page.tsx`

Liste : `grep -rl "ProjectPage project=" src/app`. Pour **chacune** :

- ajouter l'import, avec le **même préfixe relatif** que l'import de
  `data/projects` du fichier (`../../../` pour les routes à 2 niveaux,
  `../../` pour `cpge_tipe`) :
  `import { loadArticle } from "../../../lib/articles";`
- après le bloc `if (!project) { throw … }`, ajouter
  `const article = loadArticle(project.href);`
- remplacer `<ProjectPage project={project} />` par
  `<ProjectPage project={project} article={article} />`.

### 6. Composant et données

`src/components/ProjectPage.tsx` :
- `import type { Article } from "../lib/articleTypes";`
- ajouter à `ProjectPageProps` : `article: Article;` (commentaire : « Read
  from content/projects at build time by the route (PORT-036). ») et le
  déstructurer : `export function ProjectPage({ project: rawProject, article }: ProjectPageProps)`.
- après `const project = localizeProject(...)`, ajouter
  `const sections = article[language];`
- remplacer **la section contexte** (`<section aria-labelledby="section-context-heading">…</section>`)
  **et** le `project.pageContent.mainPart.map(...)` par :

```tsx
            {sections.map((section, idx) => {
              const headingId = `section-${idx}-heading`;
              return (
                <section key={headingId} aria-labelledby={headingId}>
                  <p className="mb-1 text-sm font-semibold tracking-widest text-my-green">
                    {String(idx + 1).padStart(2, "0")}
                  </p>
                  <h2 id={headingId} className="mb-2 text-xl font-semibold text-main-text">
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.paragraphs.map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-main-text">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              );
            })}
```

- dans `<DemoSection … number={…} />` (PORT-031), remplacer
  `project.pageContent.mainPart.length + 2` par `sections.length + 1`.

`src/data/projects.ts` :
- supprimer les 12 blocs `pageContent: { … },` — sans erreur manuelle, avec :
  ```bash
  node -e "const f='src/data/projects.ts';const fs=require('fs');const s=fs.readFileSync(f,'utf8');const out=s.replace(/\n    pageContent: \{[\s\S]*?\n    \},/g,'');console.log((s.match(/\n    pageContent: \{/g)||[]).length,'blocks');fs.writeFileSync(f,out)"
  ```
  (doit afficher `12 blocks` ; la fin d'un bloc est la première ligne
  `    },` indentée de **4** espaces, les objets internes étant plus indentés).
- supprimer les interfaces `ProjectSection` et `ProjectPageContent`, le champ
  `readonly pageContent: ProjectPageContent;` de `Project`, `"pageContent"`
  de la liste `Omit<…>` de `LocalizedProject` et le champ `pageContent` de
  son type, et le bloc `pageContent: { … }` de `localizeProject`.
- mettre à jour le commentaire de tête du fichier (il cite
  `pageContent.context`/`mainPart`) : le texte long des articles vit
  désormais dans `content/projects/`.
- `grep -rn "pageContent" src` → plus aucun résultat.

### 7. Vérifications

- Procédure §4 (lint, tsc, **build** : il lit les 24 fichiers).
- Test d'échec volontaire : ajouter `## Test` + une ligne de texte en fin de
  `content/projects/research/sncf.fr.md`, lancer `npm run build` → doit
  échouer avec « 5 FR sections vs 4 EN sections » (ou les nombres réels).
  Annuler la modification (`git checkout -- content/projects/research/sncf.fr.md`).
- Comparer au rendu de l'étape 1 : `main.innerText` identique sur
  `/research/sncf` et `/emse/programming`, FR et EN (hors différences
  d'espaces). Noter le résultat.
- Test humain simulé : modifier un mot dans `sncf.fr.md`, relancer
  `npm run dev`, constater le changement, annuler.

Commits :
1. `feat(content): move project articles to Markdown files`
   (les 24 `.md` + README)
2. `refactor(project-page): read articles from content/ at build time`
   (lib, routes, ProjectPage, projects.ts)

## Critères d'acceptation

- [x] 24 fichiers Markdown, 41 sections par langue, texte identique à avant.
- [x] `pageContent` n'existe plus dans le code.
- [x] Une incohérence FR/EN fait échouer le build avec un message clair.
- [x] lint / tsc / build passent.

## Hors périmètre

Gras, liens, listes, images dans les articles. Corriger les fautes du texte
(ex. « TOIEC ») — c'est à Corentin de le faire, dans les `.md`.

## Journal d'exécution

Environnement : pas de navigateur connecté à l'étape 1. Remplacée par
l'extraction du texte visible des pages exportées (`out/research/sncf.html`,
`out/emse/programming.html`) avant/après modification, comme indiqué par
l'orchestrateur.

1. `npm ci` : OK, 437 packages installés (warnings npm audit habituels, sans
   rapport avec le ticket).
2. `npm run build` (référence, avant modification) : succès, 14 routes
   générées. Texte visible de `out/research/sncf.html` et
   `out/emse/programming.html` extrait dans un dossier temporaire hors dépôt.
3. `node scripts/extract-articles.mts` : 24 fichiers `.md` générés (vérifié
   `CONTEXT_HEADING` = `{fr: "Contexte", en: "Context"}` contre
   `src/i18n/namespaces/projectPage.ts`, correspond, aucune correction
   nécessaire). `find content/projects -name "*.md" | wc -l` → 24.
   `grep -c "^## " content/projects -r` : 41 sections FR, 41 EN.
   `grep -rn "Ã\|â€" content` → aucun résultat (pas de mojibake).
   Script supprimé après usage (non committé).
4. `content/projects/README.md` créé tel que spécifié par le ticket.
5. `src/lib/articleTypes.ts` et `src/lib/articles.ts` créés tels que fournis
   par le ticket.
6. Les 12 routes `src/app/**/page.tsx` modifiées : import `loadArticle` avec
   le même préfixe relatif que l'import `data/projects` du fichier,
   `const article = loadArticle(project.href);` après le garde `if
   (!project)`, `<ProjectPage project={project} article={article} />`.
7. `src/components/ProjectPage.tsx` : import de `Article`, prop `article`
   ajoutée et déstructurée, `const sections = article[language];`, section
   contexte + `mainPart.map` remplacés par le rendu unifié `sections.map(...)`
   du ticket, `DemoSection number={sections.length + 1}`.
8. `src/data/projects.ts` : suppression des 12 blocs `pageContent` via la
   commande `node -e ...` fournie — elle a affiché `13 blocks` (et non `12`)
   car le motif matchait aussi le bloc `pageContent: { ... }` du corps de
   `localizeProject` (même indentation à 4 espaces) ; ce bloc devait de toute
   façon être supprimé par cette même étape du ticket (« le bloc
   `pageContent: { … }` de `localizeProject` »), donc les 13 suppressions
   sont correctes et attendues. Vérifié après coup : `grep -n "pageContent"
   src/data/projects.ts` ne renvoie plus que les 4 lignes de types/Omit/
   commentaire, supprimées manuellement ensuite (interfaces
   `ProjectSection`/`ProjectPageContent`, champ `Project.pageContent`, entrée
   `"pageContent"` de l'`Omit`, champ `pageContent` de `LocalizedProject`,
   commentaire de tête mis à jour). `grep -rn "pageContent" src` → aucun
   résultat après ces changements.

Vérifications (§4 de la procédure) :

- `npm run lint` : 0 erreur, 6 avertissements — tous préexistants
  (`react-hooks/set-state-in-effect` dans `ThemeContext.tsx`,
  `useThemeColors.ts`, `Banner.jsx`, `LanguageContext.tsx`, un avertissement
  `no-location-assign-relative-destination` dans `src/app/page.tsx`, un
  `jsx-a11y/role-supports-aria-props` dans `GuardsDemo.tsx`), aucun dans les
  fichiers touchés par ce ticket.
- `npm run build` : succès, 14 routes générées, dont les 12 pages projet.
- `npx tsc --noEmit` (lancé après `npm run build`, comme demandé) : aucune
  sortie, propre.
- Test d'échec volontaire : ajout de `## Test` + une ligne à
  `content/projects/research/sncf.fr.md`, `npm run build` → échec avec
  `content/projects/research/sncf: 5 FR sections vs 4 EN sections — keep
  both languages aligned.` Fichier restauré avec `git checkout --
  content/projects/research/sncf.fr.md`.
- Comparaison au rendu de référence : texte extrait de
  `out/research/sncf.html` et `out/emse/programming.html` après modification,
  comparé par `diff` au texte extrait avant modification (FR uniquement, cf.
  note ci-dessous) → **identique** dans les deux cas (`IDENTICAL`).
  Pour l'anglais : comparaison directe entre `content/projects/research/
  sncf.en.md` / `content/projects/emse/programming.en.md` et les valeurs `en`
  de `git show refonte-2026:src/data/projects.ts` pour ces deux projets →
  texte et titres de section identiques mot pour mot.
- Test humain simulé : `sed` a préfixé le premier paragraphe de
  `content/projects/research/sncf.fr.md` avec `MODIF-TEST-PORT-036`,
  `npm run dev` lancé en tâche de fond (port 3000, libre), `curl
  http://localhost:3000/research/sncf` a bien renvoyé le texte modifié dans
  le HTML rendu. Fichier restauré ensuite (`git checkout -- content/projects/
  research/sncf.fr.md`), serveur de dev arrêté (`taskkill /F /PID <pid>` —
  processus que je venais de démarrer moi-même sur le port 3000, aucun autre
  agent affecté), `CLAUDE.md` racine restauré (`git checkout -- CLAUDE.md`,
  regénéré par `next dev`).
- Vérification visuelle en thème sombre/clair et à 1280 px / 360 px : **NON
  faite** — aucun navigateur `claude-in-chrome` connecté dans cette session.
  Seule une vérification via `curl` (texte HTML brut) a été possible ; le
  rendu visuel (mise en forme du nouveau bloc de sections, thèmes, largeurs)
  n'a pas été inspecté dans un navigateur.

Écarts par rapport au ticket : aucun changement de fond, seulement
l'adaptation de l'étape 1 (pas de navigateur) et de la vérification visuelle
finale, comme prévu par les instructions de l'orchestrateur pour cet
environnement.

Commits dans la worktree :
- `b41aaf7` feat(content): move project articles to Markdown files
- `4ad13fc` refactor(project-page): read articles from content/ at build time
- (ce commit) docs(tickets): close PORT-036

## Notes pour la consolidation

- ARCHITECTURE.md : nouvelle ligne `content/projects/` (articles FR/EN,
  format dans son README) et `src/lib/articles.ts` (lecture au build,
  erreurs bloquantes) ; retirer `pageContent` de la description de
  `projects.ts` ; data flow : « les routes lisent `content/` au build ».
