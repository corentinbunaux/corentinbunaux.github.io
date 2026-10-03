---
id: PORT-069
title: "Playwright E2E — scénarios de navigation du site"
group: corentin
machine: asus_corentin
milestone: M9 — Mise en production
status: review
resumeAt: null
priority: P1
estimate: 4
confidence: medium
model: opus
branch: chore/PORT-069-playwright-e2e-tests
depends_on: []
parallel_safe: true
human_checkpoint: null
created: 2026-10-03
---

# Playwright E2E — scénarios de navigation

**Contexte** : Corentin considère le site terminé et veut une suite E2E avant
mise en production. Ce ticket tourne **en parallèle** d'un ticket Jest
(PORT-068) dans une worktree séparée — les deux branches seront fusionnées
par l'orchestrateur, pas par toi. **Ne fusionne pas** dans `refonte-2026` et
**ne touche pas** à `.github/workflows/` : ça sera fait après la fusion des
deux branches de tests.

## Objectif

Des tests Playwright qui couvrent les parcours de navigation réels du site,
pas une suite exhaustive page par page sans valeur ajoutée. Le site est un
export statique Next.js (`output: "export"` dans `next.config.mjs`, dossier
`out/`) — teste l'artefact qui sera réellement déployé, pas seulement
`next dev`. Comme il n'y a pas de serveur statique déjà en dépendance,
préfère un petit script Node (`http`/`fs` natifs, pas de nouvelle
dépendance type `serve`) lancé par `webServer.command` dans
`playwright.config.ts`, qui build (`npm run build`) puis sert `out/` sur un
port fixe. Si après coup ça s'avère trop fragile, servir via `next dev` est
une solution de repli acceptable — documente ce choix dans le journal.

## Stack à installer

`@playwright/test` en devDependency. `npx playwright install --with-deps
chromium` (juste Chromium pour rester raisonnable en temps de build CI — pas
besoin de Firefox/WebKit pour un site vitrine, sauf si tu identifies un vrai
risque cross-navigateur qui justifierait d'en ajouter).

Script `package.json` : `"test:e2e": "playwright test"`.
`playwright.config.ts` à la racine.

## Pages du site (pour le plan de nav)

Accueil `/`, et les 14 pages projet : `/internships/safran`,
`/internships/quimesis`, `/internships/kusmitea`, `/research/sncf`,
`/personnal/cctv`, `/personnal/web`, `/emse/android`, `/emse/embedded`,
`/emse/minesweeper`, `/emse/programming`, `/work/gcii`, `/cpge_tipe`.
Sections de la home : `#home`, `#journey` (Parcours), `#portfolio` (Projets),
`#about` (À propos), `#footer`.

## Scénarios à couvrir

1. **Navigation globale** : charger `/`, cliquer chaque lien de nav
   (`SiteHeader`) vers les ancres de la home, puis vers chaque page projet
   via la grille de projets (`projectsSection`), vérifier le contenu attendu
   (titre, `h1`) sur chacune, retour à la home.
2. **Thème** : basculer clair/sombre via le bouton du header, vérifier
   `data-theme` sur `<html>`, vérifier qu'il persiste après un rechargement
   (`localStorage`), et qu'il persiste en changeant de page.
3. **Langue** : basculer FR/EN via le sélecteur, vérifier qu'un texte connu
   change de langue, que ça persiste après rechargement et navigation.
4. **Mobile** : viewport 360px sur la home et au moins 2 pages projet —
   aucun scroll horizontal (`document.documentElement.scrollWidth <=
   document.documentElement.clientWidth`), menu de nav mobile utilisable.
5. **Accessibilité clavier** : navigation au clavier (Tab) sur le header
   (focus visible, atteindre les liens principaux), activer un lien au
   clavier (Enter).
6. **Démos interactives (2D)** : au moins un test d'interaction réelle sur
   une démo DOM (ex. cliquer une case du démineur sur `/emse/minesweeper`,
   ou taper du texte sur la démo de dactylo si elle est sur une page
   accessible) — vérifie que l'état affiché change.
7. **Démos three.js** : Playwright utilise un vrai Chromium avec WebGL (pas
   jsdom) — vérifie qu'un `<canvas>` apparaît dans la section Démo d'une page
   qui en a un (ex. Safran, Quimesis), sans exiger un rendu pixel-perfect.
8. **404 / lien mort** : naviguer vers une URL inexistante, vérifier qu'une
   page d'erreur cohérente s'affiche (pas un crash blanc).
9. **Formulaire de contact / liens externes** : si un lien `mailto:` ou vers
   LinkedIn/GitHub existe dans le header/footer, vérifie juste l'attribut
   `href` (pas besoin d'ouvrir un onglet externe réel).

Organise les fichiers sous `e2e/` à la racine (`e2e/navigation.spec.ts`,
`e2e/theme-lang.spec.ts`, `e2e/mobile.spec.ts`, etc. — découpage à ton
jugement, un fichier par thème plutôt qu'un fichier monolithique).

## Livrables attendus

- `playwright.config.ts`, dossier `e2e/` avec les specs.
- `package.json` : script `test:e2e`, devDependency ajoutée.
- `.gitignore` : ajouter `playwright-report/`, `test-results/`,
  `node_modules/.cache/ms-playwright` si pertinent (ne pas committer les
  rapports générés).
- Tout commité sur `chore/PORT-069-playwright-e2e-tests`, **dans cette
  worktree** (`C:/Users/coren/Documents/wt-PORT-069`), pas dans le dépôt
  principal.
- Le ticket mis à jour (`status: review`, journal d'exécution : nombre de
  specs/tests, durée d'exécution, choix de serveur statique vs dev,
  difficultés rencontrées).

## Vérifications

`npm run test:e2e` doit passer en local. `npm run lint && npx tsc --noEmit
&& npm run build` doivent rester propres.

## Quand tu as fini

Ne fusionne rien, ne touche pas `.github/workflows/`. Rapporte à
l'orchestrateur : nombre de specs/tests, scénarios couverts, tout problème
bloquant, le choix fait pour servir le site pendant les tests.

## Journal d'exécution

**2026-10-03 — Opus (worktree `wt-PORT-069`).** Scope élargi en cours de route
par l'orchestrateur (demande de Corentin) : 5 projets navigateur au lieu de
Chromium seul, et utiliser les runs multi-navigateurs pour corriger de vrais
bugs du site.

### Livré

- `@playwright/test` ^1.63.0 (devDependency), script `test:e2e`,
  `playwright.config.ts`, `.gitignore` (`playwright-report/`, `test-results/`,
  `blob-report/`, `playwright/.cache/`).
- 6 specs sous `e2e/` + `e2e/fixtures.ts` + `e2e/static-server.mjs` :
  `navigation` (21 tests), `theme-lang` (6), `keyboard` (4), `demos` (4),
  `mobile` (10), `errors-links` (4) = **50 tests × 5 projets = 250**.
- Projets : `chromium-desktop`, `webkit-desktop` (= Safari : moteur WebKit
  d'Apple, Playwright ne pilote pas Safari.app), `edge-desktop`,
  `mobile-chrome` (Pixel 7 ramené à 360 px de large, critère du ticket),
  `mobile-safari` (iPhone 14, 390 px).
- Exécutés par projet (dernier run complet) : desktop 38 passés / 12 skippés
  (specs mobiles + fallback 3D mobile), mobile 44 passés / 6 skippés (clavier
  + canvas 3D desktop). **202 passés, 48 skippés, 0 échec, 252 s** build
  inclus (`npm run test:e2e`, exit 0).
- Fixture auto : tout `pageerror`, `console.error` ou réponse HTTP ≥ 400
  (hors navigation 404 voulue) fait échouer le test.

### Service du site testé

Export statique réel (`npm run build` → `out/`) servi par
`e2e/static-server.mjs` (`http`/`fs` natifs, aucune dépendance) sur le port
**4173** (3000 laissé au `next dev` de Corentin), lancé par `webServer` ; il
imite GitHub Pages (`/route` → `route.html`, inconnu → `404.html` en 404).
`reuseExistingServer: false`. `E2E_SKIP_BUILD=1` saute le build en local.
Écart Windows à connaître : Next 16.3.6 écrit sous Windows les payloads de
segment `__next.a.b.__PAGE__.txt` en `__next.a/b/__PAGE__.txt`
(`export/index.js` : `path.relative()` donne des `\`, puis seuls les `/` sont
remplacés par `.`) ; le serveur remappe ce cas (Windows seulement), sinon
chaque navigation client produisait des 404 qu'un build Linux (CI, Pages)
n'a pas.

### Bugs du site trouvés et corrigés

1. **Boucle infinie au rechargement de l'accueil** (`HomeShell.tsx`) :
   `redirect("/")` dans un effet + `performance.navigation.type === 1`
   (vrai pour toute la vie du document) → chaque remontage re-redirigeait :
   ~40 fetchs RSC/s indéfiniment, et la navigation douce tardive pouvait
   annuler le premier clic du visiteur. Remplacé par un
   `location.replace("/")` unique, seulement sur un reload de `/`
   (`PerformanceNavigationTiming`). Essai intermédiaire rejeté :
   `history.replaceState` + `scrollTo(0)` perdait la course contre la
   restauration de scroll du navigateur (page restée à 45-61 px).
2. **`<html lang>` restait `fr` en anglais** (`LanguageContext.tsx`) —
   synchronisé avec la langue choisie.
3. **Grilles démineur et surveillants débordant sur mobile**
   (`MinesweeperDemo.tsx`, `GuardsDemo.tsx`) : la dernière colonne dépassait
   la grille de 4-8 px à 360-390 px. Deux causes : la règle globale
   `app.css` `button { margin: 0 0.5rem }` sous 768 px décalait chaque case
   de 8 px (`m-0` sur les cases), et des cases fixes de 2rem/1.75rem ne
   tiennent pas en 360 px (taille `min(…, (100vw − gouttières)/N)` sous `sm`).
4. **Étiquette « 120 min » rognée** (`SpaceTimeDemo.tsx`, toutes largeurs) :
   centrée sur le bord droit du viewBox, l'`<svg>` la coupait → alignée à
   droite.

### Différences de navigateur assumées (pas des bugs du site)

- WebKit : Tab ne parcourt que les contrôles de formulaire, pas les liens
  (réglage Safari par défaut ; `Alt+Tab` essayé, sans effet dans le WebKit de
  Playwright) → sur WebKit le test vérifie l'ordre/le focus visible des deux
  boutons du header seulement.
- WebKit : lors du `location.replace`, les préfetchs RSC en vol sont rejetés
  en « … due to access control checks » et remontés en `pageerror` (Chromium
  les annule en silence) → filtré dans la fixture, uniquement cette forme.

### Ce qui n'a pas marché / reste ouvert

- **Edge réel indisponible** : `npx playwright install msedge` →
  `ERROR: Failed to install Microsoft Edge. … insufficient privileges` ; le
  dossier `C:\Program Files (x86)\Microsoft\Edge\Application\` ne contient
  pas de `msedge.exe` (seulement `139.0.3405.111/`). `edge-desktop` utilise
  `channel: "msedge"` si Edge est trouvé, sinon Chromium embarqué + preset
  Edge, avec un avertissement à chaque run. Sur ce poste : **pas un vrai
  run Edge**.
- **Navigation douce lente, non expliquée** : après reload de l'accueil en
  anglais, le clic sur la carte Démineur change l'URL mais le DOM met > 7 s
  à basculer, ~3 fois sur 10 sous charge (run parallèle) ; 40/40 en isolation
  (sonde à 4 variantes) sans reproduction. Deux tentatives de diagnostic
  (désactiver l'effet `lang` : sans effet ; traces réseau : payloads servis
  en 200 en < 25 ms). Le test attend l'URL puis 20 s pour le `h1`, et est
  marqué `test.slow()`. Non corrigé.
- **Scroll-spy WebKit, flake vu une fois** : « header links scroll to each
  home section » a échoué une fois (aria-current non posé sur Profil après le
  retour en haut, sous charge) ; 0/174 en relance WebKit. Non corrigé.
- `retries: 1` en CI seulement ; 0 en local.

### Vérifications

- `npm run lint` : 0 erreur, 4 warnings `set-state-in-effect` préexistants
  (Banner, LanguageContext l.32, ThemeContext, useThemeColors).
- `npx tsc --noEmit` : propre. `npm run build` : propre (15 pages).
- `npm run test:e2e` : exit 0, 202 passés / 48 skippés, 252 s.

## Notes pour la consolidation

- `ARCHITECTURE.md` (non modifié, fichier partagé en parallèle) : « No test
  suite » est à remplacer ; ajouter `e2e/` + `playwright.config.ts` à la
  carte, et la décision « tests E2E sur l'export statique servi par un
  serveur Node natif ».
- **Risque de collision avec PORT-068 (Jest)** : le `testMatch` par défaut de
  Jest inclut `**/*.spec.ts` → il ramasserait `e2e/*.spec.ts`. Ajouter
  `testPathIgnorePatterns: ["/e2e/"]` côté Jest à la fusion.
- CI (étape séparée) : `npx playwright install --with-deps chromium webkit`
  (+ Edge si voulu : `npx playwright install msedge` fonctionne sur runner
  Ubuntu) puis `npm run test:e2e` ; publier `playwright-report/`.
- Bug soupçonné, hors périmètre : la règle globale `app.css`
  (`h1,h2,h3,p,button { margin: 0 0.5rem }` sous 768 px, héritée de 2025)
  s'applique à tous les boutons et paragraphes du site sur mobile ; elle a
  causé le débordement des grilles. À revoir dans son propre ticket.
