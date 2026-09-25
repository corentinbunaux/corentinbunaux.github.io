---
id: PORT-002
title: Upgrade Next.js 15 + React 19
group: corentin
machine: asus_corentin
milestone: M1 — Fondations
status: draft
resumeAt: null
priority: P0
estimate: 1.5
confidence: medium
depends_on: [PORT-001]
parallel_safe: false
human_checkpoint: "Parcourir les 4 sections de la home + une page projet dans un navigateur après l'upgrade, confirmer qu'aucun rendu n'est cassé"
created: 2026-09-26
---

# Upgrade Next.js 15 + React 19

**Contexte** — Arbitrage déjà validé avec Corentin (voir `docs/CADRAGE.md`).
Corrige au passage le mismatch déjà présent (`@types/react` en 19.1.10 alors
que `react` est en `^18`). Fait après PORT-001 pour isoler les deux risques
(export statique, puis upgrade) au lieu de les débattre ensemble.

**Livrable** — Le repo tourne sur Next 15 + React 19, `next build` en export
statique fonctionne toujours, `npm run lint` et `npx tsc --noEmit` sont
propres.

**Critères d'acceptation**
- [ ] `next`, `react`, `react-dom`, `eslint-config-next`, `@types/react`
      alignés sur des versions compatibles Next 15 / React 19.
- [ ] Codemods Next 15 exécutés si applicables ; les breaking changes documentés
      sont traités (voir la doc officielle de migration Next 15).
- [ ] `next build` (export statique) réussit et `out/` est généré.
- [ ] `npm run lint && npx tsc --noEmit` propres.
- [ ] Aucune régression visuelle constatée sur la home et une page projet.
