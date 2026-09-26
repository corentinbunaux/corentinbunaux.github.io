---
id: PORT-008
title: "Extraire les données projet en module typé + ajouter GCII/Enedis"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: review
resumeAt: null
priority: P1
estimate: 1.0
confidence: high
depends_on: [PORT-002]
parallel_safe: true
human_checkpoint: "Relire l'entrée GCII/Enedis (intitulé, dates, portée) avant de continuer"
created: 2026-09-26
---

# Extraire les données projet en module typé + ajouter GCII/Enedis

**Contexte** — `src/components/projectsSection.jsx` contient aujourd'hui un
tableau JS non typé (`projects`, lignes 4–310), source de vérité unique des 11
projets existants — décision ouverte #1 du cadrage, tranchée en faveur de
l'extraction. C'est le fichier fondation dont dépend presque tout le reste de
M3 (PORT-010 timeline, PORT-012 routage, PORT-013 page GCII).

**Livrable** — `src/data/projects.ts`, typé et testé par le compilateur,
contient les 11 projets existants inchangés plus une 12e entrée GCII/Enedis, et
`projectsSection.jsx` / `project.tsx` consomment ce module sans changement de
rendu.

## Constats d'investigation

- `projects` n'a qu'un seul consommateur externe : `project.tsx` ligne 5
  (`import { projects } from "./projectsSection"`). `src/app/page.tsx` importe
  uniquement le composant par défaut. Le déplacement du tableau ne touche donc
  que deux imports.
- Champs réellement lus par `project.tsx` : `title`, `description`, `href`,
  `entityLogo`, `githubRepo`, `techLogos`, `photos`, `pageContent.context`,
  `pageContent.mainPart[].title|description`. `img` n'est lu que par
  `ProjectCard` dans `projectsSection.jsx`.
- `entityLogo` et `githubRepo` valent `null` sur plusieurs entrées → le type
  doit être `string | null`, pas `string | undefined`.
- **Le champ `dates` cité par l'ancien critère n'existe pas** dans les données
  actuelles : il est à créer, pas à reprendre. Seules 4 périodes sont
  confirmées par Corentin (Kusmi Tea, Quimesis, Safran, GCII) ; les 7 autres
  restent sans période, et on n'en invente aucune.
- `techLogos` est résolu contre `bannerElmts` (`Banner.jsx`) puis filtré : un id
  inconnu disparaît silencieusement. Il n'existe **pas** d'id `php` ni `django`.
- `public/logos/` ne contient aucun logo GCII ni Enedis → `entityLogo: null`.
- Pas d'alias `@/` dans `tsconfig.json` → imports relatifs (`../data/projects`).

**Critères d'acceptation**

- [ ] `src/data/projects.ts` existe et exporte un type `Project` (nommé, non
      `any`) couvrant les 9 champs ci-dessus, plus la période.
- [ ] La période est modélisée en union discriminée (en cours / terminée)
      plutôt qu'en champs optionnels valides seulement ensemble
      (`.claude/rules/code-style-ts.md`).
- [ ] Les 11 projets existants sont migrés **sans perte ni modification** de
      contenu : `git show HEAD:src/components/projectsSection.jsx` et le
      nouveau fichier contiennent les mêmes titres, descriptions, href, logos,
      techLogos, img, photos et `pageContent`.
- [ ] 12e entrée : GCII, client Enedis, "Ingénieur logiciel fullstack",
      novembre 2025 → aujourd'hui, Le Havre — refonte d'une application utilisée
      par 10 000+ utilisateurs, migration PHP → Django/React.
- [ ] **Aucun chiffre de résultat** dans l'entrée GCII : la portée est décrite
      en prose (`docs/CADRAGE.md` §3 et §5 — pas de métrique disponible). Le
      « −35 % » de la maquette Canva est un placeholder et ne doit pas apparaître.
- [ ] `techLogos` de l'entrée GCII ne contient que des ids présents dans
      `bannerElmts` (pas de `php`/`django` inventés).
- [ ] `projectsSection.jsx` ne contient plus le tableau : il réexporte ou
      importe `projects` depuis `../data/projects`. Le JSX est inchangé.
- [ ] `project.tsx` importe `projects` depuis `../data/projects` ; sa logique de
      lookup par `window.location.pathname` est **inchangée**.
- [ ] `npm run lint` et `npx tsc --noEmit` sont propres ; `npm run build` passe.
- [ ] Les 11 pages projet existantes rendent toujours dans un navigateur.

**Files**

À modifier :
- `src/data/projects.ts` (nouveau)
- `src/components/projectsSection.jsx` (suppression du tableau + import)
- `src/components/project.tsx` (ligne d'import uniquement)

À ne pas toucher :
- `src/app/**/page.tsx` — les 11 wrappers restent identiques ; créer la page
  GCII est le travail de PORT-013.
- `src/app/app.css` — appartient à PORT-004.
- `src/components/Banner.jsx` — `bannerElmts` reste tel quel.
- `PASSATION.md`, `ARCHITECTURE.md` — édités en parallèle par d'autres tickets.

**Approach**

1. Créer `src/data/projects.ts` avec `Project`, `ProjectPeriod` et
   `ProjectSection`, en exports nommés.
2. Y déplacer le tableau tel quel, en `satisfies readonly Project[]` pour que le
   compilateur vérifie chaque entrée sans élargir le type.
3. Ajouter la période sur les 4 projets où elle est confirmée, et sur aucun autre.
4. Ajouter l'entrée GCII/Enedis, `href: "work/gcii"`, `entityLogo: null`,
   `img: null` (aucun visuel disponible — `ProjectCard` garde déjà `img`).
5. Dans `projectsSection.jsx`, remplacer le tableau par un import + réexport
   (`export { projects }`) pour ne pas casser d'éventuels consommateurs, et
   corriger l'import de `project.tsx`.
6. Vérifier : lint, tsc, build, puis les 12 routes dans le navigateur.

Alternative écartée : garder le tableau dans le `.jsx` et n'ajouter qu'un
fichier de types `.d.ts`. Rejetée — les données resteraient non vérifiées à la
compilation, ce qui est précisément le but du ticket.

**Test plan** — aucun harnais de test dans ce dépôt (`npm test` non configuré),
donc la vérification est :
- `npx tsc --noEmit` : le `satisfies` échoue si une entrée est mal formée.
- `npm run lint`, puis `npm run build` (export statique).
- Navigateur (`npm run dev`) : les 11 routes existantes rendent titre,
  description, logos et sections `pageContent` comme avant.
- Comparaison du contenu migré contre `git show HEAD:...` pour la non-régression.

**Out of scope**

- Réécrire le lookup `window.location.pathname` → PORT-012.
- Créer `src/app/work/gcii/page.tsx` → PORT-013.
- La timeline construite depuis les dates → PORT-010.
- Remplacer `<img>` par `next/image` → PORT-005.
- Traduction EN du contenu.

**Human checkpoint** — Corentin relit l'entrée GCII/Enedis dans
`src/data/projects.ts` : intitulé exact, dates, mention du client Enedis, et
surtout qu'aucune métrique de résultat n'a été inventée. Il s'agit d'un emploi
en cours (`docs/CADRAGE.md` §7).

**Risks**

- Une coquille lors du déplacement de ~300 lines de prose française (accents,
  apostrophes échappées) passerait lint et tsc sans être détectée → comparer au
  contenu d'origine plutôt que relire.
- Conflit de fusion probable sur `projectsSection.jsx` : PORT-005 édite le même
  fichier. Limiter le diff à la suppression du tableau et à l'import.

**Estimate** — inchangé à 1.0. L'investigation confirme un seul consommateur
externe et un déplacement mécanique ; le travail réel est la fidélité du
contenu, pas la structure.
