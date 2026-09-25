---
id: PORT-017
title: "Infrastructure i18n FR/EN (contexte, dictionnaire, toggle)"
group: corentin
machine: asus_corentin
milestone: M4 — i18n FR/EN
status: draft
resumeAt: null
priority: P2
estimate: 1.5
confidence: medium
depends_on: [PORT-016]
parallel_safe: false
human_checkpoint: "Basculer FR/EN dans la navbar et vérifier que le choix persiste après rechargement"
created: 2026-09-26
---

# Infrastructure i18n FR/EN

**Contexte** — Décision d'architecture déjà validée : toggle client-side
(contexte React + dictionnaire JSON), pas de routes `/fr`/`/en` séparées, pour
rester 100 % compatible export statique (`docs/CADRAGE.md`). Démarre après le
checkpoint M3 pour que les clés du dictionnaire correspondent au contenu
final, pas à une version qui va encore bouger.

**Livrable** — Un sélecteur FR/EN dans la navbar qui change la langue affichée
sur tout le site sans rechargement de page, persisté en `localStorage`.

**Critères d'acceptation**
- [ ] Contexte React de langue + structure de dictionnaire JSON définie
      (une clé par texte affiché).
- [ ] Sélecteur FR/EN visible dans la navbar (cf. maquette zone ①).
- [ ] Choix de langue persisté (localStorage), langue par défaut = FR.
- [ ] Aucune dépendance serveur ajoutée (compatible export statique).
