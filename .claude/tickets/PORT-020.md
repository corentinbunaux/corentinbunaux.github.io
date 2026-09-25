---
id: PORT-020
title: "Accents 3D contextuels (Safran three.js, Quimesis VTK.js)"
group: corentin
machine: asus_corentin
milestone: M5 — Accents 3D
status: draft
resumeAt: null
priority: P3
estimate: 2.0
confidence: low
depends_on: [PORT-019, PORT-012]
parallel_safe: false
human_checkpoint: "Corentin confirme que les accents Safran et Quimesis restent fluides et ne dénaturent pas le contenu réel des projets"
created: 2026-09-26
---

# Accents 3D contextuels (Safran, Quimesis)

**Contexte** — Arbitrage déjà validé : satellites/orbites (three.js) sur la
page Safran, mâchoire segmentée (VTK.js) sur la page Quimesis — cohérent avec
la vraie stack du projet Quimesis (imagerie 3D médicale, VTK). **VTK.js est
une dépendance nouvelle, jamais utilisée dans ce repo, distincte de
three.js** — son poids de bundle et sa performance ne sont pas vérifiés :
traiter ce ticket comme partiellement exploratoire, pas comme une simple
répétition de PORT-019.

**Livrable** — Les pages Safran et Quimesis affichent chacune leur accent 3D
contextuel, avec le même filet de sécurité que le hero (≥1024px,
`prefers-reduced-motion`).

**Critères d'acceptation**
- [ ] Page Safran : accent satellites/orbites en three.js, conditionnel
      ≥1024px, repli statique sinon.
- [ ] Page Quimesis : accent mâchoire segmentée en VTK.js, même filet de
      sécurité ; poids de bundle ajouté mesuré et jugé acceptable.
- [ ] Aucun des deux accents ne casse le fil d'Ariane / bloc "En bref" du
      gabarit (PORT-012).
