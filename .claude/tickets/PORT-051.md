---
id: PORT-051
title: "Consolidation de la recette — ARCHITECTURE, PASSATION, BACKLOG, contrôle thème clair et mobile"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
model: sonnet
branch: docs/PORT-051-recette-consolidation
depends_on: [PORT-024, PORT-025, PORT-026, PORT-027, PORT-028, PORT-029, PORT-030, PORT-031, PORT-032, PORT-033, PORT-034, PORT-035, PORT-036, PORT-037, PORT-038, PORT-039, PORT-040, PORT-041, PORT-042, PORT-043, PORT-044, PORT-045, PORT-046, PORT-047, PORT-048, PORT-049, PORT-050]
parallel_safe: false
human_checkpoint: "Nouvelle recette complète par Corentin sur refonte-2026."
created: 2026-09-27
---

# Consolidation de la recette

**Procédure** : `docs/PROCEDURE-TICKET.md`. Ce ticket est le **seul**
autorisé à modifier `ARCHITECTURE.md`, `PASSATION.md` et `docs/BACKLOG.md`.
Il peut démarrer même si quelques tickets sont `blocked` : les lister alors
dans PASSATION.md au lieu d'attendre.

## Étapes

1. **Inventaire** : pour chaque ticket PORT-024 à PORT-050, relever `status`,
   le journal d'exécution et les « Notes pour la consolidation ». Vérifier
   que chaque branche `done`/`review` est fusionnée
   (`git branch --merged refonte-2026`).
2. **ARCHITECTURE.md** : reporter toutes les notes (carte des fichiers,
   décisions datées, invariants, points faibles). Supprimer ce qui est devenu
   faux (HeroMesh/HeroCanvas, ProjectAccent3D, navbar.jsx, `#profile`,
   `offsetTop`, `pageContent`, « smooth scroll cassé », « sticky cassé »).
   Garder le fichier vrai et concis.
3. **Contrôle transversal** au navigateur, **thème clair**, puis sombre, à
   1280 px et 360 px : home (toutes sections) + les 12 pages projet. Pour
   chaque zone illisible ou cassée : la corriger si c'est une classe de
   couleur en dur dans un composant (remplacer par le token), sinon créer un
   ticket `draft` PORT-052+ décrivant le problème. Lister le résultat page
   par page dans le journal.
4. `grep -rn "#[0-9a-fA-F]\{6\}" src/components src/app --include=*.tsx --include=*.jsx`
   hors `Banner.jsx` (logos de marque) et hors couleurs « réalistes »
   documentées (texture/dents/gencives) : chaque occurrence restante est
   soit justifiée dans le journal, soit corrigée.
5. **Lighthouse** (mobile) sur la home et `/internships/safran` : noter
   Performance / Accessibilité / Bonnes pratiques / SEO, comparer aux
   valeurs de ARCHITECTURE.md (82-86 perf mobile). Ne rien optimiser ici :
   créer un ticket si régression nette.
6. **docs/BACKLOG.md** : ajouter le jalon « M6 — Recette utilisateur » avec
   PORT-024 à 051 et leur statut ; PORT-022 clos (faux positif).
7. **PASSATION.md** : réécrire (≤ 60 lignes, archiver l'ancienne dans
   `.claude/passations/2026-09-XX-m6-recette.md`) : ce qui a changé, ce qui
   a échoué/est bloqué, questions ouvertes (hypothèses du plan
   `docs/PLAN-RECETTE.md` §2 encore à valider), checkpoints humains en
   attente, prochaine étape.
8. Procédure §4 puis fusion.

Commit : `docs: consolidate the M6 user-acceptance round`

## Critères d'acceptation

- [ ] ARCHITECTURE.md exact pour l'état de `refonte-2026`.
- [ ] Contrôle thème clair + mobile fait sur 13 pages, résultat consigné.
- [ ] BACKLOG et PASSATION à jour.
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir)_
