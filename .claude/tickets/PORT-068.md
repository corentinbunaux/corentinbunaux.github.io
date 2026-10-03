---
id: PORT-068
title: "Jest unit tests — couverture ≥95% du code du site"
group: corentin
machine: asus_corentin
milestone: M9 — Mise en production
status: review
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

## Journal d'exécution

**Résultat** (`npm run test` = `jest --coverage`, seuils globaux 95 % dans
`jest.config.mjs`) : 31 suites, **281 tests**, tous verts.

| Couverture | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| **Global** | **99,79 %** | **97,51 %** | **100 %** | **100 %** |
| Logique pure (`lib`, `data`, `i18n`, `theme`, `*Logic.ts`) | 100 % (sauf `guardsLogic.ts` 98,1 / 94,7 br.) | | | |
| `app/**` (14 routes + layout) | 100 % | 100 % (sauf `app/page.tsx` 50 % br.) | 100 % | 100 % |
| `components` (React DOM) | 99,49 % | 97,31 % | 100 % | 100 % |
| `components/demos` (2D + three.js) | 99,8 % | 97,57 % | 100 % | 100 % |
| `components/hero`, `components/journey` | 100 % | 100 % | 100 % | 100 % |

`npm run lint` : 0 erreur, 4 warnings préexistants (`set-state-in-effect`,
déjà présents sur `refonte-2026`). `npx tsc --noEmit` : propre. `npm run build` : 15/15 pages.

### Choix d'implémentation

- `next/jest` (SWC) + `jest-environment-jsdom`, setup dans `jest.setup.ts`.
  Helpers de test dans `src/test-utils/` (exclus de la couverture) : fakes
  contrôlables de `matchMedia`, `ResizeObserver`, `IntersectionObserver`,
  `requestAnimationFrame` (horloge manuelle) et pointer capture
  (`browser.ts`) ; `renderWithProviders` avec les vrais tokens de `app.css`
  (`render.tsx`) ; `renderIsolated` pour les modules qui lisent les données
  au chargement (`isolated.ts`).
- **three.js : mock partiel, pas creux.** `__mocks__/three.ts` ne remplace
  QUE `WebGLRenderer` (faux renderer avec un vrai `<canvas>`, enregistre
  `render/dispose/forceContextLoss`). Tout le reste est le vrai three.js :
  les `setup()` construisent leur vrai graphe de scène et les tests vérifient
  le comportement (cycle du bras d'exo, passage du chasseur à 20 s puis
  45 s, robot qui balaie/approche/recule, retour en L sans diagonale, survol
  d'une dent par vrai raycast, ouverture de la mâchoire au clic, etc.) en
  plus du montage/démontage/dispose et du remontage sur changement de thème.
- three est ESM-only (r186 : `build/three.cjs` n'est plus qu'un shim qui
  `require()` le module ESM), donc `jest.config.mjs` laisse passer `three`
  dans le transform SWC (patch de l'ignore-pattern de next/jest).
- `eslint.config.mjs` : ajout de `coverage/**` aux ignores (le rapport HTML
  généré contient des JS avec des `eslint-disable` inutilisés).

### Exclusions / lignes non couvertes (justifiées)

- `src/lib/articles.ts` : `/* istanbul ignore if */` sur le garde
  « empty "## " heading » — **inatteignable** : la ligne est `trimEnd()`-ée
  avant le test `startsWith("## ")`, donc un titre vide tombe toujours dans
  la branche « only "## " headings are supported ». Garde conservé, test
  adapté. (Candidat pour un ticket de nettoyage.)
- Branches non couvertes laissées telles quelles (pas d'ignore) car
  inatteignables en jsdom ou par construction :
  `if (!container) return` (ThreeStage l.49, QuimesisAccent l.31 — la ref
  est toujours posée dans l'effet) ; `if (!running) return` de
  QuimesisAccent (la frame est annulée au démontage) ; `intersectPlane`
  faux dans EmbeddedReturnDemo (la caméra plonge à 63°, tout rayon touche le
  sol) ; `UNROUTED_HREFS` vide (ProjectPage l.70) ; `if (!best)` de
  `optimalGuards` ; `?? ""` de `app/page.tsx` (le parser garantit au moins
  un paragraphe par section) ; le `?? -1` défensif de QuimesisJawDemo (l.544) ; le `hasPointerCapture` faux d'EmbeddedReturnDemo (l.267).

### Constats hors périmètre (non corrigés, à ticketer)

- `Banner.jsx` l.67 : `window.innerWidth >= "1024px"` compare un nombre à
  une chaîne → toujours faux, la 3ᵉ section du carrousel n'est jamais
  rendue. Par ailleurs le composant `Banner` par défaut n'est plus importé
  nulle part (seul `bannerElmts` sert).
- `EmbeddedSweepDemo` : après un retour au balayage, le
  robot peut re-détecter l'obstacle immédiatement (le cap reprend la
  sinusoïde du temps écoulé) — comportement réel, pas un bug bloquant.

### Ce qui n'a pas marché (et pourquoi)

- `jest.requireActual("three")` → `Must use import to load ES Module:
  node_modules/three/build/three.module.js` ; charger `three.cjs` par chemin
  absolu échouait pareil (c'est un shim vers l'ESM). Résolu en transformant
  `three` via SWC (le premier patch `"/node_modules/(?!three/)"` ne suffisait
  pas car next/jest ajoute un second pattern qui ignore tout node_modules :
  il a fallu insérer `three` dans SON lookahead).
- `jest.requireMock("three")` renvoyait une autre instance que celle
  importée par les composants (registre de mocks séparé) → instances du faux
  renderer vides. Résolu en lisant la classe sur le module importé.
- `jest.isolateModules` + `require("@testing-library/react")` à l'intérieur :
  « Hooks cannot be defined inside tests » ; sans RTL isolé : « Cannot read
  properties of null (reading 'useState') » (deux React). Résolu par
  `renderIsolated` (react + react-dom/client + providers requis dans le même
  registre isolé).
- `fireEvent.animationEnd(..., { animationName })` et
  `fireEvent.pointerDown(..., { pointerType })` perdent ces champs en jsdom ;
  `onPointerLeave` de React écoute `pointerout`, pas `pointerleave`. Résolu
  par des événements construits à la main.
