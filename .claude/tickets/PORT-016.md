---
id: PORT-016
title: "Checkpoint M3 : les 7 zones sont en place, relecture contenu GCII/Enedis"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: review
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
depends_on: [PORT-009, PORT-010, PORT-011, PORT-013, PORT-014, PORT-015]
parallel_safe: false
human_checkpoint: "Corentin relit spécifiquement le contenu GCII/Enedis (src/data/projects.ts) avant que ce jalon soit considéré terminé"
created: 2026-09-26
---

# Checkpoint M3 : les 7 zones sont en place

**Contexte** — Ferme le jalon M3. Vérifie que chaque zone de la maquette
"REFONTE" est traçable à une implémentation réelle, et que le contenu sur
l'emploi en cours (GCII/Enedis) est prêt à être relu par Corentin.

**Livrable** — La checklist ci-dessous, chaque zone cochée avec le
fichier/ticket qui l'implémente.

## Checklist des 7 zones

- [x] **① Accueil** (hero, nav, double CTA → devenu simple CTA, CV retiré) —
      `src/components/homepage.jsx`, `profileSection.jsx`, `navbar.jsx`
      (PORT-009, sur PORT-006 pour la sémantique de nav).
- [x] **② Parcours** (timeline, nouvelle section) — `src/components/journeySection.tsx`,
      inséré dans `src/app/page.tsx` (PORT-010).
- [x] **③ Projets** (filtres, carte redessinée) — `src/components/projectsSection.jsx`,
      champs `category`/`featured` dans `src/data/projects.ts` (PORT-011).
- [x] **④ Étude de cas — en-tête** (fil d'Ariane, visuel, bloc "En bref") —
      `src/components/ProjectPage.tsx` (PORT-012, gabarit + pilote Safran).
- [x] **⑤ Étude de cas — corps** (sections numérotées, galerie, nav
      précédent/suivant) — même fichier, déployé sur les 12 routes
      (PORT-013 ; `src/components/project.tsx` supprimé).
- [x] **⑥ À propos** (grille d'intérêts) — `src/components/aboutmeSection.jsx`
      (PORT-014 ; balle de tennis conservée en 2D, arbitrage confirmé).
- [x] **⑦ Responsive/Contact/Footer** — `src/components/footer.jsx`
      (PORT-015 ; CTA CV retiré, même décision qu'en ①).

**Aucune section ajoutée hors maquette** — les 7 zones ci-dessus couvrent
l'intégralité du travail de contenu de ce jalon ; les deux tickets de suivi
ouverts pendant le trajet (PORT-022 scroll fluide, PORT-023 hiérarchie de
titres) sont des corrections de bugs pré-existants, pas des ajouts de
périmètre.

**Contenu GCII/Enedis** — Champs renseignés dans `src/data/projects.ts` :
`title: "GCII / Enedis"`, poste "Ingénieur logiciel fullstack", Le Havre,
novembre 2025 → en cours, `role`/`result` décrivant la portée (10 000+
utilisateurs, migration PHP → Django/React) sans chiffre de résultat inventé.
**Reste à faire, par Corentin uniquement** : relire ce contenu pour la
formulation et la confidentialité avant de considérer ce jalon `done`.

**Critères d'acceptation**
- [x] Zones ①–⑦ toutes implémentées et référencées (ci-dessus).
- [ ] Contenu GCII/Enedis relu et validé par Corentin — **point de contrôle
      humain restant**, je ne peux pas le faire à sa place.
- [x] Aucune section ajoutée qui ne soit pas traçable à la maquette Canva.

## État du jalon M3

Complet côté implémentation. `ARCHITECTURE.md` mis à jour pour refléter la
structure finale (gabarit unique `ProjectPage.tsx`, `project.tsx` supprimé,
nav restructurée, animation du hero passée en CSS). Deux bugs pré-existants
découverts en route et documentés en tickets séparés plutôt que corrigés en
marge (PORT-022, PORT-023) — cohérent avec "smallest change that works".

**Prochaine étape suggérée** : M4 (i18n, PORT-017/018) — mais la priorité
implicite de Corentin (`docs/CADRAGE.md` §9) place le contenu/l'accessibilité
avant l'i18n/three.js. Avant de lancer M4, vaut la peine d'attendre les
checkpoints humains déjà en attente (5 de la vague précédente + GCII/Enedis
ci-dessus) pour ne pas accumuler du travail au-dessus d'un contenu qui
pourrait encore changer.
