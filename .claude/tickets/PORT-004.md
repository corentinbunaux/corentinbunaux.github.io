---
id: PORT-004
title: Nettoyage des tokens CSS et de l'accessibilité globale
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
human_checkpoint: "Vérifier au clavier (Tab) qu'un focus visible apparaît sur tous les éléments interactifs de la home"
created: 2026-09-26
---

# Nettoyage des tokens CSS et de l'accessibilité globale

**Contexte** — `src/app/app.css` concentre les problèmes relevés dans la
maquette "SITE ACTUEL" : contraste sous le seuil WCAG AA, hauteurs de section
en `vh` par breakpoint, `text-align: justify`, `user-select: none` sur
`body`, scrollbar masquée. Indépendant du contenu, peut tourner en parallèle
de PORT-005/PORT-008.

**Livrable** — Le design system respecte les arbitrages de la maquette
"REFONTE" : tokens de surface, contraste conforme, plus de `vh`/`justify`/
`user-select:none`.

**Critères d'acceptation**
- [ ] `--second-text` remonté à ≥ `#8f8f8f` (ou équivalent conforme WCAG AA).
- [ ] Nouvelles surfaces `#202020`/`#2a2a2a` et bordures `#2f2f2f` ajoutées
      comme tokens CSS, un état de focus visible défini.
- [ ] `text-align: justify` supprimé de `h3`/`p`, fer à gauche.
- [ ] Hauteurs de section en `vh` remplacées par du padding (plus de casse
      hors 16:9 sur mobile).
- [ ] `user-select: none` retiré de `body`, scrollbar réactivée.
- [ ] Aucun échec de contraste WCAG AA détecté par un audit automatisé sur la
      home.
