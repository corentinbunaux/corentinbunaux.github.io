---
id: PORT-002
title: Upgrade Next.js 16 + React 19
group: corentin
machine: asus_corentin
milestone: M1 — Fondations
status: review
resumeAt: null
priority: P0
estimate: 2.5
confidence: medium
depends_on: [PORT-001]
parallel_safe: false
human_checkpoint: "Parcourir les 4 sections de la home + une page projet dans un navigateur après l'upgrade, confirmer qu'aucun rendu n'est cassé, et relire le nouveau eslint.config.mjs"
created: 2026-09-26
---

# Upgrade Next.js 16 + React 19

**Contexte** — Décision révisée pendant le raffinage de ce ticket : Next.js 16
(16.3.6) est désormais la version stable "latest" (Next 15 n'est plus qu'en
maintenance), ce qui est plus cohérent avec l'esprit de la décision de cadrage
("dernière version stable") que la version 15 littéralement citée à l'origine.
Décision confirmée avec Corentin. Corrige aussi le mismatch déjà présent
(`@types/react` en 19.1.10 alors que `react` est en `^18`).

**⚠️ Découverte pendant l'investigation, hors périmètre initial du brouillon** —
Next.js 16 **supprime purement et simplement la commande `next lint`**
("`next lint` Command" — removed). Or `package.json` a `"lint": "next lint"`
et le `ci.yml` ajouté en PORT-001 appelle `npm run lint` : sans migration, le
gate CI casse dès cet upgrade. `eslint-config-next@16.3.6` exige aussi
`eslint >= 9.0.0` (actuellement `^8`), et passe par défaut au format ESLint
Flat Config (`eslint.config.mjs`) au lieu de `.eslintrc.json`. Ce ticket doit
donc inclure la migration ESLint, pas seulement le bump de version — d'où le
passage de l'estimation de 1.5 à 2.5 demi-journées.

**Livrable** — Le repo tourne sur Next 16 + React 19, en export statique,
avec un lint ESLint (flat config, CLI directe) et un typecheck propres.

**Critères d'acceptation**
- [ ] `next`, `react`, `react-dom` en dernière version stable (16.3.x / 19.3.x),
      `eslint-config-next` aligné sur la même version que `next`.
- [ ] `@types/react` et `@types/react-dom` alignés sur React 19 (résout le
      mismatch déjà présent).
- [ ] `eslint` upgradé vers `^9` (pas `^10`, pour limiter à un seul saut majeur
      dans ce ticket) ; `.eslintrc.json` remplacé par `eslint.config.mjs`
      (flat config), `next/core-web-vitals` et la règle
      `react/no-unescaped-entities: off` déjà présente conservées.
- [ ] `package.json` : script `lint` ne pointe plus vers `next lint` (supprimé
      en v16) mais vers `eslint .` (ou équivalent CLI direct).
- [ ] `next build` (export statique, `output:"export"` + `images.unoptimized`
      de PORT-001 conservés) réussit et produit `out/` avec les 12 pages.
- [ ] `npm run lint && npx tsc --noEmit` propres (zéro erreur ; les deux
      warnings `no-img-element` déjà connus peuvent rester, hors périmètre).
- [ ] Turbopack (bundler par défaut en v16 pour `next dev`/`next build`) ne
      casse pas le build — pas de config `webpack` custom dans
      `next.config.mjs` aujourd'hui, donc pas de conflit attendu ; à vérifier
      quand même.
- [ ] Aucune régression visuelle sur la home et une page projet (comparaison
      manuelle, cf. point de contrôle humain).
- [ ] Cas négatif : `ci.yml` (PORT-001) est retesté après cet upgrade — une
      erreur de lint volontaire doit encore faire échouer le job.

**Fichiers**
- À modifier : `package.json`, `package-lock.json`, `next.config.mjs`
  (ajout éventuel d'options Turbopack si nécessaire), nouveau
  `eslint.config.mjs`.
- À supprimer : `.eslintrc.json` (remplacé par `eslint.config.mjs`).
- À ne pas toucher : `src/**` (aucun changement de contenu attendu — les APIs
  Request async de Next 16 concernent `cookies()`/`headers()`/`params`
  dynamiques/`middleware`, aucun n'est utilisé dans ce repo 100 % statique).

**Approche**
1. Lancer le codemod officiel : `npx @next/codemod@canary upgrade latest` —
   il gère le bump de version, le déplacement de la config Turbopack, et
   propose la migration `next lint` → ESLint CLI.
2. Si le codemod ne migre pas entièrement l'ESLint : lancer
   `npx @next/codemod@canary next-lint-to-eslint-cli .` explicitement, puis
   écrire `eslint.config.mjs` à la main en s'appuyant sur la doc
   `@next/eslint-plugin-next` (flat config) si le codemod ne le fait pas.
3. Vérifier `@types/react`/`@types/react-dom` alignés sur 19.x.
4. `next build` en local, comparer `out/` à celui de PORT-001 (mêmes 12 pages).
5. `npm run lint && npx tsc --noEmit`, puis retester le cas négatif du
   `ci.yml` de PORT-001 (erreur de lint volontaire → échec attendu).
6. Revue visuelle manuelle (home + une page projet) avant de committer.

**Plan de test** — Toujours pas de suite automatisée. Vérification par
exécution directe : build, lint, typecheck, plus le cas négatif du gate CI
(ticket PORT-001) rejoué pour confirmer qu'il fonctionne toujours après la
migration ESLint.

**Hors périmètre** — Ne pas activer `reactCompiler` ni `cacheComponents`
(nouvelles options stables en v16, mais non demandées). Ne pas migrer vers
Turbopack de façon plus poussée que ce que le comportement par défaut impose.
Ne pas toucher au contenu (`src/components`, `src/app/**/page.tsx`).

**Point de contrôle humain** — Parcourir la home et une page projet dans un
navigateur après l'upgrade ; relire le nouveau `eslint.config.mjs` pour
confirmer qu'aucune règle utile n'a été perdue dans la migration flat config.

**Risques** — Le codemod peut ne pas migrer parfaitement `.eslintrc.json`
vers le flat config (project a une seule règle custom,
`react/no-unescaped-entities: off` — risque faible mais à vérifier
manuellement). Turbopack pourrait révéler une incompatibilité avec Tailwind
3.4/PostCSS non anticipée — si c'est le cas, utiliser le flag `--webpack` en
repli documenté dans le guide de migration plutôt que de bloquer le ticket.

## Estimation

**Révisée : 2,5 demi-journées** (contre 1,5 initialement), confiance
**medium** — la découverte de la suppression de `next lint` et de la
migration flat config obligatoire ajoute un vrai morceau de travail non prévu
au brouillon initial.

**Statut : `ready`** — tous les critères sont vérifiables ; la seule
incertitude (comportement exact du codemod sur ce repo précis) est un risque
d'exécution, pas une question ouverte.
