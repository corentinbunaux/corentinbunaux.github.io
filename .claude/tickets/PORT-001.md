---
id: PORT-001
title: Corriger et compléter la CI/CD (export statique cassé + gate lint/typecheck/build)
group: corentin
machine: asus_corentin
milestone: M1 — Fondations
status: ready
resumeAt: null
priority: P0
estimate: 1.0
confidence: high
depends_on: []
parallel_safe: true
human_checkpoint: "Après le push, ouvrir l'onglet Actions du repo GitHub, vérifier que les deux workflows passent au vert, puis ouvrir le site publié et confirmer qu'il est visuellement identique à avant"
created: 2026-09-26
---

# Corriger et compléter la CI/CD

**Contexte** — `.github/workflows/nextjs.yml` construit avec `next build` et
publie `./out` via `actions/upload-pages-artifact@v3`, mais `next.config.mjs`
a `output: "export"` commenté : le build ne produit pas de dossier `out/`
aujourd'hui, donc ce workflow échoue (ou publie du vide) dès qu'il tourne.
C'est un bug latent, indépendant de tout le reste du chantier de refonte, et
la fondation sur laquelle s'appuient tous les autres tickets (milestone
M1 — Fondations, `docs/CADRAGE.md` §6.2).

**Livrable** — Le site se construit en export statique et se déploie
automatiquement sur GitHub Pages à chaque push sur `main` ; un workflow léger
supplémentaire fait échouer la CI si lint, typecheck ou build cassent.

**Critères d'acceptation**
- [ ] `output: "export"` activé dans `next.config.mjs`.
- [ ] `images: { unoptimized: true }` ajouté au même endroit — `next/image`
      est déjà utilisé (icônes de la roue dans `homepage.jsx`) et l'optimiseur
      par défaut est incompatible avec `output: "export"` ; sans ce réglage,
      le build casse dès qu'on active l'export (trouvé en investiguant ce
      ticket, absent du brouillon initial).
- [ ] `next build` en local produit un dossier `out/` non vide contenant
      `index.html` et les 11 pages projet existantes.
- [ ] Le workflow `.github/workflows/nextjs.yml` (déploiement) passe au vert
      sur GitHub Actions après le push.
- [ ] Un nouveau workflow `.github/workflows/ci.yml` tourne sur `push` et
      `pull_request` : install → `npm run lint` → `npx tsc --noEmit` →
      `next build`. Il échoue (exit non-zéro) si une étape échoue, et ne
      touche pas au déploiement.
- [ ] Cas négatif vérifié : introduire volontairement une erreur de lint (ou
      de type) en local, confirmer que `ci.yml` échouerait dessus, puis
      annuler ce changement avant de committer.
- [ ] Le site déployé après ce ticket est visuellement identique à l'actuel
      (comparaison manuelle home + une page projet) — aucune régression de
      contenu, ce ticket ne touche que la configuration/CI.

**Fichiers**
- À modifier : `next.config.mjs`, `.github/workflows/nextjs.yml` (si des
  ajustements mineurs sont nécessaires pour l'export), nouveau
  `.github/workflows/ci.yml`.
- À ne pas toucher : tout `src/**` — ce ticket est pure configuration/CI, zéro
  changement de contenu ou de composant.

**Approche**
1. Activer `output: "export"` + `images: { unoptimized: true }` dans
   `next.config.mjs`.
2. Lancer `next build` en local, vérifier `out/index.html` et les 11 pages
   projet, comparer visuellement à l'existant (serveur statique local, ex.
   `npx serve out`).
3. Créer `.github/workflows/ci.yml` : job unique, Node 20 (cohérent avec le
   workflow de déploiement existant), `npm ci` → `npm run lint` →
   `npx tsc --noEmit` → `next build`.
4. Pousser sur une branche, vérifier dans l'onglet Actions que les deux
   workflows (déploiement + ci) se déclenchent et passent au vert.
5. Vérifier le cas négatif (voir critère d'acceptation) avant de considérer le
   ticket terminé.

**Plan de test** — Pas de suite de tests automatisée dans ce repo (confirmé,
`CLAUDE.md`). Vérification par exécution directe : `next build` en local,
puis les deux workflows GitHub Actions comme "tests" de bout en bout. Cas à
couvrir : build qui réussit (cas nominal) et build/lint/typecheck qui échoue
volontairement (cas négatif, pour prouver que le gate bloque vraiment).

**Hors périmètre** — Ne pas toucher au contenu des pages, aux composants, ni
au style. Ne pas encore migrer vers Next 15 (PORT-002). Ne pas ajouter de
tests automatisés (pas demandé, pas dans ce ticket).

**Point de contrôle humain** — Après le push, ouvrir l'onglet Actions du repo
GitHub, confirmer que les deux workflows sont verts, puis ouvrir l'URL publiée
et vérifier que le site est identique à avant (aucune régression visuelle).

**Risques** — `actions/configure-pages@v5` avec `static_site_generator: next`
peut injecter un `basePath` : sur un repo `<user>.github.io` (servi à la
racine du domaine), ça ne devrait rien changer, mais à vérifier si l'URL
publiée affiche des assets cassés. Si c'est le cas, forcer `basePath: ""`
explicitement dans `next.config.mjs`.

## Estimation

Inchangée : 1.0 demi-journée, confiance **high** — le correctif est petit et
bien circonscrit ; le seul ajout depuis le brouillon initial
(`images.unoptimized`) est mineur et déjà documenté ci-dessus.

**Statut : `ready`** — tous les critères sont vérifiables sans poser de
question supplémentaire.
