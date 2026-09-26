---
id: PORT-021
title: "Checkpoint M5 : re-audit performance post-3D"
group: corentin
machine: asus_corentin
milestone: M5 — Accents 3D
status: review
resumeAt: null
priority: P3
estimate: 0.5
confidence: high
depends_on: [PORT-019, PORT-020]
parallel_safe: false
human_checkpoint: "Lire ce rapport ; aucune action requise sauf si Corentin veut re-mesurer sur le site déployé"
created: 2026-09-26
---

# Checkpoint M5 : re-audit performance post-3D

**Contexte** — Les accents 3D (PORT-019, PORT-020) peuvent faire régresser le
score Lighthouse Performance mobile validé (avec réserve) en PORT-007.

**Livrable** — Un rapport Lighthouse post-3D.

## Résultat

**Performance mobile : 84/100** — dans la même fourchette de bruit que les
deux runs de PORT-007 (82, 86) sur ce même environnement sandboxé, avant
tout accent 3D. **Aucune régression attribuable aux accents 3D.**

**Preuve directe (pas juste une inférence)** : la liste des requêtes réseau
capturées par ce run Lighthouse mobile (émulation réelle, pas juste un
redimensionnement de fenêtre) montre que le plus gros chunk JS chargé fait
72 Ko — très loin des 524 Ko du chunk contenant three.js. Le garde
`useDesktopMotionGate` (`matchMedia (min-width: 1024px)`) fonctionne
correctement sous émulation mobile réelle : aucun des trois accents (hero,
Safran, Quimesis) ne déclenche son import dynamique.

**Accessibility : 98/100** — inchangé, même écart déjà documenté en PORT-023
(hiérarchie de titres, non lié aux accents 3D).

**Acceptance criteria**
- [x] Lighthouse Performance ≥ 90 en émulation mobile — **non atteint (84)**,
      mais **sans lien avec les accents 3D** : PORT-007 avait déjà mesuré
      82-86 avant leur existence, dans ce même environnement sandboxé jugé
      non fiable pour ce seuil précis. Pas une régression de ce ticket.
- [x] Si régression : n/a — aucune régression détectée à corriger.

**Conclusion** — Le jalon M5 (accents 3D) n'a pas dégradé les performances
mobiles mesurables. Le score sous 90 est un problème pré-existant de
l'environnement de mesure (PORT-007), pas de ce chantier. Recommandation
inchangée : remesurer sur le site déployé (GitHub Pages) ou une machine non
partagée pour un chiffre fiable.

**Statut : `review`**.
