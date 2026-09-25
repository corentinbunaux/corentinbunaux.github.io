---
id: PORT-005
title: Migration images vers next/image + AVIF
group: corentin
machine: asus_corentin
milestone: M2 — Design system & accessibilité
status: draft
resumeAt: null
priority: P1
estimate: 1.5
confidence: high
depends_on: [PORT-002]
parallel_safe: true
human_checkpoint: "Comparer visuellement 3-4 images avant/après sur mobile et desktop, confirmer qu'aucune n'est floue ou mal cadrée"
created: 2026-09-26
---

# Migration images vers next/image + AVIF

**Contexte** — `public/img/` + `public/logos/` pèsent 9,3 Mo (13 `.jpg`,
12 `.png`, 1 `.svg`, zéro AVIF/WebP). 8 fichiers représentent à eux seuls
~7,7 Mo (`programming.jpg` 2,48 Mo, `Embedded2.png` 1,81 Mo, etc.). La photo
hero (`homepage.jsx`) et la vignette de `ProjectCard` utilisent encore une
balise `<img>` brute au lieu de `next/image`.

**Livrable** — Toutes les images du site passent par `next/image`, formats
modernes (AVIF) générés automatiquement, poids total significativement réduit.

**Critères d'acceptation**
- [ ] Toutes les balises `<img>` restantes (`homepage.jsx`, `ProjectCard`
      dans `projectsSection.jsx`) remplacées par `next/image`.
- [ ] Naming normalisé dans `public/img`/`public/logos` (casse cohérente).
- [ ] Poids total de `public/` réduit (mesurer avant/après).
- [ ] Aucune image ne casse le layout (dimensions/`sizes` corrects) sur
      mobile et desktop.
