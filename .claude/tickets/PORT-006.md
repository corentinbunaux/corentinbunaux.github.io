---
id: PORT-006
title: Navbar accessible (contrôles sémantiques, clavier, retrait du 100vw en dur)
group: corentin
machine: asus_corentin
milestone: M2 — Design system & accessibilité
status: draft
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
depends_on: [PORT-004]
parallel_safe: true
human_checkpoint: "Naviguer toute la navbar au clavier (Tab + Entrée) sans souris"
created: 2026-09-26
---

# Navbar accessible

**Contexte** — `src/components/navbar.jsx` utilise des `<div onClick>` pour
les items de nav (pas de chemin clavier, pas sémantique) et fixe
`width: "100vw"` en style inline plutôt que via un token. Dépend de PORT-004
pour les nouveaux tokens de focus.

**Livrable** — La navbar est utilisable entièrement au clavier et ne contient
plus de valeur `vw`/`vh` en dur.

**Critères d'acceptation**
- [ ] Les items de nav sont des `<button>` ou `<a>` réels, focusables et
      activables au clavier.
- [ ] Un état de focus visible (token PORT-004) apparaît sur chaque item.
- [ ] `width: "100vw"` remplacé par une classe/token existant.
- [ ] Comportement de scroll-to-section inchangé (pas de régression visuelle).
