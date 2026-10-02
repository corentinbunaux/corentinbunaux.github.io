---
id: PORT-069
title: "Playwright E2E — scénarios de navigation du site"
group: corentin
machine: asus_corentin
milestone: M9 — Mise en production
status: ready
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
