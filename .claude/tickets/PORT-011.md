---
id: PORT-011
title: "Zone ③ Projets — filtres et carte redessinée"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: done
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
- [x] Filtres Tous/Pro/Recherche/École/Perso fonctionnels, chaque projet
      correctement catégorisé (GCII/Enedis et Safran en "Pro", SNCF en
      "Recherche", EMSE en "École", CCTV/web perso en "Perso").
- [x] Un projet phare (à définir avec Corentin — GCII/Enedis ou Safran) en
      carte double largeur.
- [x] Titre affiché hors de l'image, vignette 16:9 via `next/image`
      (dépend de PORT-005), pastilles de techno visibles.
- [x] Aucun projet existant perdu ou dupliqué.

## Refinement notes

**Mapping catégorie → projet** (champ `category` ajouté à `Project` dans
`src/data/projects.ts`, valeurs `"pro" | "recherche" | "ecole" | "perso"`) :
- `pro` — GCII/Enedis (emploi), Safran, Quimesis, Kusmi Tea (les trois
  stages sont traités comme "Pro" au même titre que l'emploi actuel : ce
  sont des expériences en entreprise, pas des projets scolaires).
- `recherche` — SNCF.
- `ecole` — Android, Démineur, Programmation, Systèmes Embarqués (EMSE) et
  Robotique/`cpge_tipe` (classe préparatoire — regroupée avec l'École car
  c'est un projet de formation, pas un projet personnel, même s'il précède
  les Mines).
- `perso` — CCTV, Développement Web.

**Projet phare** : GCII/Enedis (`featured: true` sur cette seule entrée).
Choix par défaut faute d'arbitrage avec Corentin (voir `human_checkpoint`) :
c'est le poste actuel, le plus substantiel (10 000+ utilisateurs, refonte
complète), et il illustre l'évolution la plus récente du profil. À valider
ou changer pour Safran si Corentin préfère mettre en avant le stage de fin
d'études. Le champ `featured?: true` sur `Project` rend ce choix trivial à
déplacer vers une autre entrée.

Note : GCII/Enedis n'a pas d'`img` (`img: null`) — la carte phare affiche un
placeholder "Aperçu à venir" au lieu d'un visuel, cohérent avec le reste du
composant qui gère déjà `img: null` pour CCTV etc.
