---
id: PORT-018
title: "Revue qualité des traductions FR/EN (Corentin relit)"
group: corentin
machine: asus_corentin
milestone: M4 — i18n FR/EN
status: blocked
resumeAt: null
priority: P2
estimate: 0.5
confidence: high
depends_on: [PORT-017]
parallel_safe: false
human_checkpoint: "Corentin relit l'intégralité des traductions anglaises avant publication (contrainte actée en cadrage, docs/CADRAGE.md §5)."
created: 2026-09-26
---

# Revue qualité des traductions FR/EN

**Scope note (2026-09-26)** — Décision explicite : la traduction elle-même a
été faite dans **PORT-017**, en même temps que l'infrastructure i18n, pour
éviter de reparcourir tous les composants une seconde fois. Ce ticket n'est
donc plus "traduire tout le contenu du site" mais **une revue de qualité
seule** : Corentin relit les ~150+ clés du dictionnaire (`src/i18n/dictionary.ts`)
et les champs bilingues de `src/data/projects.ts`, en particulier le
vocabulaire technique/professionnel et la description du poste GCII/Enedis.

**Statut** — `blocked`, en attente de la relecture humaine. Ne pas repasser ce
ticket à `done` tant que Corentin n'a pas validé — c'est son rôle, pas celui
d'une session Claude.

**Contexte** — Contrainte actée en cadrage : Claude traduit, Corentin relit
avant que ce soit considéré "fini" (`docs/CADRAGE.md` §5, §6 point 4).

**Deliverable** — Corentin a relu l'intégralité des traductions anglaises et
signalé les corrections nécessaires (contresens technique, ton, terme métier).

## Acceptance criteria

- [ ] 100 % des clés du dictionnaire ont une valeur EN non vide (déjà vrai
      après PORT-017 — à re-vérifier si de nouvelles clés sont ajoutées).
- [ ] Vocabulaire technique/professionnel relu et validé par Corentin,
      particulièrement les intitulés de poste et la description GCII/Enedis
      (projet en cours — le plus sensible).
- [ ] Bascule FR/EN testée par Corentin sur au moins 3 pages projet
      différentes (fait une première fois par la session PORT-017, à refaire
      par Corentin lui-même).
- [ ] Toute correction demandée par Corentin est appliquée dans
      `src/i18n/dictionary.ts` / `src/data/projects.ts` avant de clore.

## Out of scope

Retraduire depuis zéro (déjà fait dans PORT-017) ; ajouter du contenu FR qui
n'existait pas avant.
