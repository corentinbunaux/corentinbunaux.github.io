---
id: PORT-013
title: "Déployer le nouveau gabarit sur les 11 autres pages projet"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: draft
resumeAt: null
priority: P1
estimate: 1.5
confidence: high
depends_on: [PORT-012]
parallel_safe: false
human_checkpoint: "Parcourir les 12 pages projet (dont GCII/Enedis) et vérifier la nav précédent/suivant de bout en bout"
created: 2026-09-26
---

# Déployer le nouveau gabarit sur les 11 autres pages projet

**Contexte** — Réplique mécaniquement le gabarit validé en PORT-012 (pilote
Safran) sur les pages restantes. Travail répétitif, faible risque une fois le
pilote validé.

**Livrable** — Les 12 pages projet (Quimesis, Kusmi Tea, SNCF, CCTV, Android,
Embedded, Minesweeper, Programming, Web perso, cpge_tipe, GCII/Enedis, et
Safran déjà fait) utilisent toutes le nouveau gabarit.

**Critères d'acceptation**
- [ ] Les 11 routes restantes migrées vers le paramètre de route (plus aucun
      usage de `window.location.pathname` dans `project.tsx`).
- [ ] Fil d'Ariane, bloc "En bref", nav précédent/suivant corrects sur chacune
      des 12 pages, dans l'ordre défini par la liste des projets.
- [ ] Aucune page ne renvoie de 404 ou de contenu vide.
