---
id: PORT-007
title: "Checkpoint M2 : audit Lighthouse + contraste WCAG"
group: corentin
machine: asus_corentin
milestone: M2 — Design system & accessibilité
status: draft
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
depends_on: [PORT-004, PORT-005, PORT-006]
parallel_safe: false
human_checkpoint: "Lire le rapport Lighthouse produit et confirmer que les seuils du cadrage sont atteints"
created: 2026-09-26
---

# Checkpoint M2 : audit Lighthouse + contraste WCAG

**Contexte** — Ferme le jalon M2 en vérifiant les critères de succès #1-3 du
`docs/CADRAGE.md` avant de passer au contenu (M3).

**Livrable** — Un rapport (Lighthouse + audit de contraste automatisé) prouvant
que les seuils sont atteints, ou la liste des écarts restants et leur
correction.

**Critères d'acceptation**
- [ ] Lighthouse Accessibility = 100 sur la home.
- [ ] Lighthouse Performance ≥ 90 en émulation mobile sur la home.
- [ ] Zéro échec de contraste WCAG AA détecté par l'audit.
- [ ] Les écarts éventuels sont soit corrigés ici, soit documentés avec un
      ticket de suivi.
