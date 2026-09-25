---
id: PORT-009
title: "Zone ① Accueil — hero et statut réels, double CTA"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: draft
resumeAt: null
priority: P1
estimate: 1.5
confidence: medium
depends_on: [PORT-008]
parallel_safe: true
human_checkpoint: "Confirmer le texte de statut affiché et fournir le PDF du CV si pas déjà fait"
created: 2026-09-26
---

# Zone ① Accueil — hero et statut réels, double CTA

**Contexte** — Correspond à la zone ① de la maquette "REFONTE". Le statut
affiché aujourd'hui est obsolète (recherche de premier emploi / CPGE) ; il
doit refléter la situation réelle : ingénieur diplômé des Mines de
Saint-Étienne, en poste chez GCII en prestation pour Enedis depuis Le Havre.

**⚠️ Bloquant partiel** — la maquette prévoit un bouton "Télécharger le CV" :
aucun PDF de CV n'a été fourni pendant le cadrage. À demander à Corentin avant
de marquer ce ticket `ready` (`/ticket` doit le signaler explicitement s'il
manque toujours).

**Livrable** — Le hero affiche le statut réel de Corentin, deux CTA ("Voir mes
projets", "Télécharger le CV"), et la nav restructurée
(Profil / Expériences / Projets / À propos).

**Critères d'acceptation**
- [ ] `homepage.jsx`/`profileSection.jsx` affichent le statut réel (GCII,
      Enedis, Le Havre, diplômé Mines de Saint-Étienne) — aucune mention
      d'un statut étudiant/recherche d'emploi.
- [ ] Deux CTA visibles : scroll vers Projets, et lien vers le PDF du CV.
- [ ] Nav mise à jour avec les 4 entrées de la maquette.
- [ ] Aucune régression sur l'animation de la roue d'icônes (conservée par
      arbitrage, voir `docs/CADRAGE.md`).
