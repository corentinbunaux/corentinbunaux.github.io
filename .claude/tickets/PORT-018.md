---
id: PORT-018
title: "Traduction complète FR/EN de tout le contenu du site"
group: corentin
machine: asus_corentin
milestone: M4 — i18n FR/EN
status: draft
resumeAt: null
priority: P2
estimate: 2.0
confidence: medium
depends_on: [PORT-017]
parallel_safe: false
human_checkpoint: "Corentin relit l'intégralité des traductions anglaises avant publication (constraint actée en cadrage)"
created: 2026-09-26
---

# Traduction complète FR/EN de tout le contenu du site

**Contexte** — Constraint actée en cadrage : Claude traduit, Corentin relit
avant que ce soit considéré "fini". Couvre nav, hero, profil, parcours,
projets, à propos, footer, et les 12 pages projet.

**Livrable** — Toutes les clés du dictionnaire i18n (PORT-017) ont une valeur
FR et une valeur EN, relues par Corentin.

**Critères d'acceptation**
- [ ] 100 % des clés du dictionnaire ont une traduction EN (aucune clé
      manquante ou en FR par défaut quand la langue EN est sélectionnée).
- [ ] Vocabulaire technique/professionnel relu et validé par Corentin
      (particulièrement les intitulés de poste et la description GCII/Enedis).
- [ ] Bascule FR/EN testée sur au moins 3 pages projet différentes.
