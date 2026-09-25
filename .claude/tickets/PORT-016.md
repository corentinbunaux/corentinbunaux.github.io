---
id: PORT-016
title: "Checkpoint M3 : les 7 zones sont en place, relecture contenu GCII/Enedis"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: draft
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
depends_on: [PORT-009, PORT-010, PORT-011, PORT-013, PORT-014, PORT-015]
parallel_safe: false
human_checkpoint: "Corentin relit spécifiquement le contenu GCII/Enedis avant que ce jalon soit considéré terminé"
created: 2026-09-26
---

# Checkpoint M3 : les 7 zones sont en place

**Contexte** — Ferme le jalon M3. Vérifie que chaque zone de la maquette
"REFONTE" est traçable à une implémentation réelle (garde-fou contre la
dérive de périmètre notée en `docs/CADRAGE.md` §7), et que le contenu sur
l'emploi en cours (GCII/Enedis) a été relu par Corentin avant publication.

**Livrable** — Une checklist des 7 zones, chacune cochée avec un lien vers le
fichier/commit qui l'implémente, et l'accord explicite de Corentin sur le
contenu GCII/Enedis.

**Critères d'acceptation**
- [ ] Zones ①–⑦ toutes implémentées et référencées.
- [ ] Contenu GCII/Enedis relu et validé par Corentin (confidentialité,
      formulation).
- [ ] Aucune section ajoutée qui ne soit pas traçable à la maquette Canva.
