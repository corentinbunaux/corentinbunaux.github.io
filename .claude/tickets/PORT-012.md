---
id: PORT-012
title: "Nouveau gabarit page projet (zones ④+⑤) — migration pilote Safran"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: draft
resumeAt: null
priority: P1
estimate: 2.0
confidence: medium
depends_on: [PORT-008]
parallel_safe: true
human_checkpoint: "Ouvrir la page Safran migrée, vérifier fil d'Ariane, bloc En bref, et navigation précédent/suivant"
created: 2026-09-26
---

# Nouveau gabarit page projet — migration pilote Safran

**Contexte** — Risque identifié en cadrage (`docs/CADRAGE.md` §6.3) :
`project.tsx` s'auto-détecte aujourd'hui via `window.location.pathname` au
lieu de recevoir le projet en prop/paramètre — un anti-pattern qui touche les
12 pages. On migre une seule page (Safran) en premier pour valider le nouveau
gabarit avant de le répliquer (PORT-013).

**Livrable** — `project.tsx` reçoit son projet en paramètre de route (pas via
`pathname`), et affiche fil d'Ariane, bloc "En bref" collant, visuel
d'en-tête, navigation projet précédent/suivant. Validé sur la page Safran
uniquement.

**Critères d'acceptation**
- [ ] Le composant récupère le projet via un paramètre de route
      (`params.slug` ou équivalent App Router), plus de lecture de
      `window.location.pathname`.
- [ ] Fil d'Ariane ("Accueil / Projets / <nom du projet>") fonctionnel.
- [ ] Bloc "En bref" (rôle, durée, équipe, stack, résultat) collant au
      défilement sur desktop.
- [ ] Navigation projet précédent/suivant fonctionnelle.
- [ ] La page Safran migrée passe en revue visuelle sans régression de
      contenu par rapport à l'actuelle.
