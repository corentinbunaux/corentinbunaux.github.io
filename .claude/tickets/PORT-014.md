---
id: PORT-014
title: "Zone ⑥ À propos — grille d'intérêts redessinée"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: ready
resumeAt: null
priority: P1
estimate: 1.0
confidence: medium
depends_on: [PORT-008]
parallel_safe: true
human_checkpoint: null
created: 2026-09-26
---

# Zone ⑥ À propos — grille d'intérêts redessinée

**Contexte** — Zone ⑥ de la maquette "REFONTE" : bio recadrée dans une grille,
icônes de centres d'intérêt conservées (arbitrage validé).

**✅ Ambiguïté tranchée (2026-09-26)** — `plan-refonte-claude.md` listait
"balle sur À propos" à la fois parmi les accents 2D à conserver tels quels ET
parmi les accents 3D contextuels du jalon M5. Décision confirmée avec
Corentin : l'illustration tennis reste exactement telle qu'elle est
aujourd'hui — l'animation 2D SVG/CSS existante (`src/components/federer.jsx`,
`TennisBallAnim`/`.btn_federer` dans `src/components/aboutmeSection.jsx`).
Elle n'est **pas** convertie en accent 3D. PORT-020 (accents 3D contextuels
M5) ne touche pas à cette section.

**Livrable** — Section À propos réorganisée en grille (icônes centres
d'intérêt), texte recadré, illustration tennis conservée à l'identique (2D).

**Critères d'acceptation**
- [x] Bio affichée dans la grille de la maquette, sans `text-align: justify`
      (déjà résolu par PORT-004 : `p`/`h3` sont `text-align: left` globalement
      dans `src/app/app.css` ; confirmé, pas de changement nécessaire ici).
- [ ] Icônes de centres d'intérêt conservées et redessinées en grille (4
      colonnes desktop / 2 colonnes mobile, comme la maquette).
- [x] Décision documentée sur le traitement 2D/3D de la balle de tennis (voir
      ci-dessus) — animation et markup de `federer.jsx` non modifiés.
