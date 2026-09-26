---
id: PORT-023
title: "Accessibilité — hiérarchie de titres invalide (heading-order)"
group: corentin
machine: asus_corentin
milestone: M2 — Design system & accessibilité
status: draft
resumeAt: null
priority: P3
estimate: 1.0
confidence: medium
depends_on: []
parallel_safe: true
human_checkpoint: null
created: 2026-09-26
---

# Accessibilité — hiérarchie de titres invalide (`heading-order`)

**Contexte** — Audit Lighthouse (PORT-007) : Accessibility = 98/100, un seul
échec, `heading-order` ("Heading elements are not in a sequentially-
descending order"). Trois occurrences relevées sur la home :

- `section#profile` : `h1` "Profil" suivi directement d'un `h3` (le premier
  paragraphe de statut), puis `h1` "Compétences" suivi à nouveau d'un `h3` —
  saut de niveau (h1 → h3, jamais de h2) à deux endroits.
- `projectsSection.jsx` : le titre de carte (`h3`, ex. "GCII / Enedis") est
  également un saut de niveau depuis le `h1` de section.

**Cause racine (site entier, pas juste ces trois occurrences)** — Chaque
section du site utilise `h1` pour son titre de section (`Profil`,
`Compétences`, `Portfolio`/`Projets`, `À propos`, etc. — classe
`outlined-text`), et `h3` est utilisé partout comme classe de style pour du
texte de corps (taille de police), pas comme un vrai sous-titre de niveau 3.
Corriger proprement demande de revoir la hiérarchie de titres sur
l'ensemble du site (probablement : un seul `h1` réel par page — le nom
"Corentin Bunaux" du hero — et chaque titre de section en `h2`), ce qui
touche `homepage.jsx`, `profileSection.jsx`, `projectsSection.jsx`,
`journeySection.tsx`, `aboutmeSection.jsx`, `footer.jsx` et le gabarit
`ProjectPage.tsx` — bien au-delà du périmètre d'un ticket de checkpoint.

**Pourquoi ce n'est pas corrigé dans PORT-007** — `.claude/rules/00-core.md`
("Smallest change that works") : corriger seulement les 3 occurrences
relevées par cet audit sans revoir la structure ferait probablement
réapparaître le problème ailleurs (chaque section a le même défaut). Un vrai
correctif est une passe dédiée sur tout le site, pas un patch local.

**Livrable** — Une seule structure de titres cohérente sur toute la home et
les pages projet : un `h1` par page, des `h2` pour chaque titre de section,
plus aucun texte de corps stylé via une balise `h3`/`h1` sans en être un
sémantiquement (utiliser des classes CSS pour le style visuel, pas la balise).

**Test plan** — Audit Lighthouse Accessibility = 100 sur la home et sur au
moins une page projet ; vérification manuelle de l'ordre des titres (devtools
"Accessibility tree" ou extension axe).

**Risks** — Si les tailles de police sont pilotées par sélecteur de balise
(`h3 { font-size: ... }` dans `app.css`), changer une balise sans ajuster le
CSS peut changer visuellement la taille du texte — prévoir de passer par des
classes plutôt que par le sélecteur de balise pour ce ticket.
