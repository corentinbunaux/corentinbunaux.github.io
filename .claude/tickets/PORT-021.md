---
id: PORT-021
title: "Checkpoint M5 : re-audit performance post-3D"
group: corentin
machine: asus_corentin
milestone: M5 — Accents 3D
status: draft
resumeAt: null
priority: P3
estimate: 0.5
confidence: high
depends_on: [PORT-019, PORT-020]
parallel_safe: false
human_checkpoint: "Lire le rapport Lighthouse et confirmer que le score mobile n'a pas régressé sous 90"
created: 2026-09-26
---

# Checkpoint M5 : re-audit performance post-3D

**Contexte** — Les accents 3D (PORT-019, PORT-020) peuvent faire régresser le
score Lighthouse Performance validé en PORT-007. Ce ticket ferme le chantier
en confirmant que ce n'est pas le cas.

**Livrable** — Un rapport Lighthouse post-3D, avec correction ou activation du
repli désactivant les accents si le score mobile repasse sous 90.

**Critères d'acceptation**
- [ ] Lighthouse Performance ≥ 90 en émulation mobile, avec les accents 3D
      activés sur desktop.
- [ ] Si régression : le rendu conditionnel (≥1024px) est resserré ou les
      accents sont désactivés, conformément au mode d'échec prévu en
      `docs/CADRAGE.md` §7.
