---
id: PORT-008
title: "Extraire les données projet en module typé + ajouter GCII/Enedis"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: draft
resumeAt: null
priority: P1
estimate: 1.0
confidence: high
depends_on: [PORT-002]
parallel_safe: true
human_checkpoint: "Relire l'entrée GCII/Enedis (intitulé, dates, portée) avant de continuer"
created: 2026-09-26
---

# Extraire les données projet en module typé + ajouter GCII/Enedis

**Contexte** — `src/components/projectsSection.jsx` contient aujourd'hui un
tableau JS non typé (`projects`), source de vérité unique des 11 projets
existants — décision ouverte #1 du cadrage, tranchée en faveur de
l'extraction. C'est le fichier fondation dont dépend presque tout le reste de
M3.

**Livrable** — `src/data/projects.ts`, typé, contenant les 11 projets
existants inchangés + une nouvelle entrée GCII/Enedis.

**Critères d'acceptation**
- [ ] Un type/interface `Project` défini (title, dates, description, techLogos,
      href, photos, etc.), repris tel quel des champs déjà utilisés.
- [ ] Les 11 projets existants migrés sans perte de contenu.
- [ ] Nouvelle entrée : GCII, Enedis, "Ingénieur logiciel fullstack",
      novembre 2025 → aujourd'hui, Le Havre — refonte d'une application
      utilisée par 10 000+ utilisateurs, migration PHP → Django/React. Portée
      du projet décrite en prose, **aucun chiffre de résultat inventé** (voir
      `docs/CADRAGE.md` §3 — pas de chiffre disponible, on décrit la portée).
- [ ] `projectsSection.jsx` et `project.tsx` importent depuis ce nouveau
      module sans changement de comportement visible à ce stade.
