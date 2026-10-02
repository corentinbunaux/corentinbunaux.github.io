---
id: PORT-068
title: "Jest unit tests — couverture ≥95% du code du site"
group: corentin
machine: asus_corentin
milestone: M9 — Mise en production
status: ready
resumeAt: null
priority: P1
estimate: 6
confidence: low
model: opus
branch: chore/PORT-068-jest-unit-tests
depends_on: []
parallel_safe: true
human_checkpoint: null
created: 2026-10-03
---

# Jest unit tests — couverture ≥95%

**Contexte** : Corentin considère le site terminé et veut figer le code avant
mise en production avec une suite de tests. Ce ticket tourne **en parallèle**
d'un autre ticket Playwright (PORT-069) dans une worktree séparée — les deux
branches seront fusionnées par l'orchestrateur, pas par toi. **Ne fusionne
pas** dans `refonte-2026` et **ne touche pas** à `.github/workflows/` : ça
sera fait après la fusion des deux branches de tests.

## Objectif

≥95% de couverture (statements/lines/branches/functions, mesurée par
`jest --coverage`) sur `src/`. C'est un objectif, pas un chiffre à atteindre
à tout prix par des tests creux : un test qui ne vérifie rien d'utile juste
pour toucher une ligne est pire que pas de test. Là où une couverture
significative est impossible (voir section three.js ci-dessous), documente
l'exclusion avec une justification au lieu de forcer un test sans valeur.

## Stack à installer

`next/jest` (fourni par Next.js, pas une dépendance séparée) comme
transformateur — c'est l'approche standard 2025/2026 pour Next.js + Jest,
gère SWC, le CSS/les imports d'images automatiquement. En devDependencies :
`jest`, `jest-environment-jsdom`, `@testing-library/react`,
`@testing-library/jest-dom`, `@testing-library/user-event`, `@types/jest`.
Pas besoin de `ts-jest` ni de `babel-jest` séparés.

`jest.config.mjs` (ou `.ts`) à la racine, via `next/jest`'s `createJestConfig`.
Script `package.json` : `"test": "jest --coverage"`.
Seuils de couverture dans `jest.config` (`coverageThreshold.global`) à 95
pour statements/lines/functions/branches — le mieux pour verrouiller le
chiffre obtenu plutôt que le laisser dériver silencieusement plus tard.

## Le code à tester

`src/` fait ~7500 lignes sur 80 fichiers. Liste des fichiers :
`src/app/**/page.tsx` (14 pages), `src/app/layout.tsx`,
`src/components/*.{tsx,jsx}` (Banner, SiteHeader, footer, homepage,
projectsSection, aboutmeSection, journeySection, federer, ProjectPage,
TechBadge, optimizedImage, HomeShell, QuimesisAccent,
useDesktopMotionGate.ts), `src/components/hero/*`, `src/components/journey/*`,
`src/components/demos/*` (logique pure ET composants three.js, voir plus
bas), `src/data/*.ts`, `src/i18n/**/*.ts` + `LanguageContext.tsx`,
`src/lib/articles.ts` + `articleTypes.ts`, `src/theme/*`.

### Stratégie par catégorie (pour ne pas repartir de zéro sur chaque fichier)

1. **Logique pure, zéro three.js** (`guardsLogic.ts`, `minesweeperLogic.ts`,
   `predictLogic.ts`, `predictWords.ts`, `typingSentences.ts`,
   `lib/articles.ts`, `lib/articleTypes.ts`, `data/projects.ts`,
   `data/education.ts`, `i18n/dictionary.ts`, `theme/themeScript.ts`) :
   tests directs, proche de 100% atteignable, aucune excuse pour les sauter.
2. **Composants React "normaux" (DOM/SVG, pas de three.js)** : `SiteHeader`,
   `footer`, `homepage`, `projectsSection`, `aboutmeSection`,
   `journeySection`, `ProjectPage`, `TechBadge`, `Banner`, `federer`,
   `optimizedImage`, `HomeShell`, `MinesweeperDemo`, `GuardsDemo`,
   `TypingDemo`, `PredictDemo`, `SpaceTimeDemo`, `SncfMiniTrainDemo`,
   `DemoSection`, `journey/TrackIcon.tsx`, toutes les `app/**/page.tsx` —
   testables avec React Testing Library (`render`, `screen`, `userEvent`) :
   contenu affiché, interactions (clic sur une case du démineur, saisie
   clavier pour la dactylo, toggle de thème/langue, navigation), les deux
   langues (FR/EN) via `LanguageContext`.
3. **Composants three.js** (`ThreeStage.tsx`, `HeroGlobe.tsx`,
   `SafranEarthDemo.tsx`, `QuimesisJawDemo.tsx`, `QuimesisFragmentsDemo.tsx`,
   `ExoArmDemo.tsx`, `EmbeddedSweepDemo.tsx`, `EmbeddedReturnDemo.tsx`,
   `journey/TrackIcon3D.tsx`) : jsdom n'a pas de WebGL, donc **mock le module
   `three`** (et `three/examples/jsm/controls/OrbitControls`) avec un mock
   manuel assez complet pour que les fonctions `setup()` s'exécutent sans
   lever d'exception (classes avec méthodes no-op chaînables :
   `Scene`, `PerspectiveCamera`, `WebGLRenderer` (avec `domElement` un vrai
   `<canvas>` pour que le composant puisse l'attacher au DOM), `Group`,
   `Mesh`, `Sprite`, `Clock`, `Vector3`, `Color`, `MathUtils`,
   `TextureLoader`, les géométries/matériaux utilisés). Teste alors ce qui
   est RÉELLEMENT à toi : le montage/démontage du composant, le nettoyage
   (`dispose`/`removeEventListener` appelés), le re-rendu quand le thème
   change (`key={theme}` dans `DemoSection`), le fait que `setup` reçoive les
   bons arguments (`colors`, `scene`, `camera`). Ne cherche pas à vérifier le
   rendu visuel réel — c'est le rôle de Playwright (PORT-069, vrai
   navigateur/WebGL) et des vérifications Chrome headless déjà faites durant
   le développement. Si après un mock raisonnable une portion de fichier
   reste *littéralement* impossible à exécuter en jsdom (ex. une branche qui
   dépend du support WebGL réel), exclus cette ligne/ce fichier précis de la
   couverture avec un commentaire expliquant pourquoi — jamais un fichier
   entier par facilité si une partie est testable.

## Livrables attendus

- `jest.config.mjs`, éventuel fichier de setup (`jest.setup.ts` pour les
  matchers `@testing-library/jest-dom`).
- Les fichiers de test (suffixe `.test.ts`/`.test.tsx`, à côté du fichier
  testé — convention la plus simple à découvrir dans ce repo).
- `package.json` : script `test`, devDependencies ajoutées.
- Tout commité sur `chore/PORT-068-jest-unit-tests`, **dans cette worktree**
  (`C:/Users/coren/Documents/wt-PORT-068`), pas dans le dépôt principal.
- Le ticket mis à jour (`status: review`, journal d'exécution avec le
  pourcentage de couverture final par catégorie, la liste des exclusions
  justifiées, les difficultés rencontrées).

## Vérifications

`npm run test` doit passer avec les seuils configurés. `npm run lint &&
npx tsc --noEmit && npm run build` doivent rester propres (les tests ne
doivent rien casser côté build).

## Quand tu as fini

Ne fusionne rien, ne touche pas `.github/workflows/`. Rapporte à
l'orchestrateur : couverture finale obtenue, fichiers exclus et pourquoi,
nombre de tests, tout problème bloquant.
