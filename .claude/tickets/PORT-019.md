---
id: PORT-019
title: "Hero three.js (si GO en PORT-003)"
group: corentin
machine: asus_corentin
milestone: M5 — Accents 3D
status: draft
resumeAt: null
priority: P3
estimate: 1.5
confidence: low
depends_on: [PORT-003, PORT-009]
parallel_safe: true
human_checkpoint: "Corentin confirme sur son propre téléphone et ordinateur que le hero reste fluide"
created: 2026-09-26
---

# Hero three.js

**Contexte** — Dernier jalon, le plus cosmétique et le moins bloquant à
repousser (priorité implicite de Corentin, voir `docs/CADRAGE.md` §9).
Contingent au verdict de PORT-003 : si NO-GO, ce ticket est annulé et remplacé
par le maintien du rendu 2D actuel du hero.

**Livrable** — Le hero de la home affiche le maillage three.js réactif au
curseur en production, dans les mêmes conditions que le prototype validé.

**Critères d'acceptation**
- [ ] Rendu conditionnel : uniquement si largeur d'écran ≥ 1024px.
- [ ] Repli statique (image fixe) si `prefers-reduced-motion: reduce`.
- [ ] Import dynamique (`next/dynamic`), aucun impact sur le temps de chargement
      initial pour les visiteurs mobiles.
- [ ] FPS mesuré en production conforme à ce qui a été validé en PORT-003.
