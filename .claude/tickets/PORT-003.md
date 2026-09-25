---
id: PORT-003
title: "[Recherche] Prototype de faisabilité du hero three.js"
group: corentin
machine: asus_corentin
milestone: M1 — Fondations
status: draft
resumeAt: null
priority: P1
estimate: 1.0
confidence: low
depends_on: [PORT-002]
parallel_safe: true
human_checkpoint: "Corentin ouvre le prototype sur son propre téléphone et son ordinateur, confirme si c'est fluide ou non"
created: 2026-09-26
---

# [Recherche] Prototype de faisabilité du hero three.js

**Contexte** — Corentin n'a jamais utilisé three.js. C'est l'inconnue la plus
risquée du chantier (voir `docs/CADRAGE.md` §6) : la construire en isolation
avant de la répliquer sur Safran/Quimesis évite de découvrir le problème
après avoir tout câblé. Ticket de recherche, timeboxé : le livrable est une
réponse écrite, pas forcément du code définitif.

**Livrable** — Une réponse tranchée : "three.js dans le hero est viable en
desktop (≥1024px)" ou "on l'abandonne et on garde les accents 2D existants",
avec les chiffres de FPS/latence qui la justifient.

**Critères d'acceptation**
- [ ] Un canvas three.js isolé (maillage réactif au curseur, rendu conditionnel
      ≥1024px, repli `prefers-reduced-motion`) est prototypé, hors de la page
      d'accueil réelle.
- [ ] FPS/fluidité mesurés sur le téléphone et l'ordinateur de Corentin
      (devtools + ressenti manuel).
- [ ] Une décision écrite dans le ticket : GO (→ alimente PORT-019/PORT-020)
      ou NO-GO (→ ces deux tickets sont annulés et remplacés par le maintien
      des accents 2D existants).
- [ ] Si GO : la taille de bundle ajoutée par `three` est mesurée et jugée
      acceptable (`next build` output).
