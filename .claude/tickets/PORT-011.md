---
id: PORT-011
title: "Zone ③ Projets — filtres et carte redessinée"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: draft
resumeAt: null
priority: P1
estimate: 1.5
confidence: medium
depends_on: [PORT-008, PORT-005]
parallel_safe: true
human_checkpoint: "Vérifier que chaque projet apparaît dans le(s) bon(s) filtre(s)"
created: 2026-09-26
---

# Zone ③ Projets — filtres et carte redessinée

**Contexte** — Zone ③ de la maquette "REFONTE". Remplace la grille 3×3 actuelle
par des filtres Pro/Recherche/École/Perso, un projet phare en double largeur,
titre hors image, résultat en une ligne par carte.

**Livrable** — La section Projets affiche les 12 projets (11 existants +
GCII/Enedis) filtrables par nature, avec un projet phare mis en avant.

**Critères d'acceptation**
- [ ] Filtres Tous/Pro/Recherche/École/Perso fonctionnels, chaque projet
      correctement catégorisé (GCII/Enedis et Safran en "Pro", SNCF en
      "Recherche", EMSE en "École", CCTV/web perso en "Perso").
- [ ] Un projet phare (à définir avec Corentin — GCII/Enedis ou Safran) en
      carte double largeur.
- [ ] Titre affiché hors de l'image, vignette 16:9 via `next/image`
      (dépend de PORT-005), pastilles de techno visibles.
- [ ] Aucun projet existant perdu ou dupliqué.
