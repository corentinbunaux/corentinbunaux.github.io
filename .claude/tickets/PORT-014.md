---
id: PORT-014
title: "Zone ⑥ À propos — grille d'intérêts redessinée"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: draft
resumeAt: null
priority: P1
estimate: 1.0
confidence: medium
depends_on: [PORT-008]
parallel_safe: true
human_checkpoint: "Décider avec Corentin si la balle de tennis reste l'animation 2D actuelle ou devient un accent 3D (voir note ci-dessous)"
created: 2026-09-26
---

# Zone ⑥ À propos — grille d'intérêts redessinée

**Contexte** — Zone ⑥ de la maquette "REFONTE" : bio recadrée dans une grille,
icônes de centres d'intérêt conservées (arbitrage validé).

**⚠️ Ambiguïté non tranchée** — `plan-refonte-claude.md` liste "balle sur
À propos" à la fois parmi les accents 2D à conserver tels quels ET parmi les
accents 3D contextuels du jalon M5. `/ticket` doit clarifier avec Corentin
avant de démarrer : l'animation tennis actuelle (SVG + `federer.jsx`) reste
2D, ou devient un accent 3D dans PORT-020 ?

**Livrable** — Section À propos réorganisée en grille (icônes centres
d'intérêt), texte recadré, illustration tennis conservée (2D par défaut sauf
décision contraire).

**Critères d'acceptation**
- [ ] Bio affichée dans la grille de la maquette, sans `text-align: justify`
      (dépend des tokens PORT-004).
- [ ] Icônes de centres d'intérêt conservées et redessinées en grille.
- [ ] Décision documentée sur le traitement 2D/3D de la balle de tennis.
