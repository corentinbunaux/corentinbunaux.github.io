---
id: PORT-013
title: "Déployer le nouveau gabarit sur les 11 autres pages projet"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: review
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
- [x] Les 11 routes restantes migrées vers le paramètre de route (plus aucun
      usage de `window.location.pathname` dans `project.tsx`). — `project.tsx`
      est supprimé (vérifié qu'aucun import ne le référençait plus avant
      suppression).
- [x] Fil d'Ariane, bloc "En bref", nav précédent/suivant corrects sur chacune
      des 12 pages, dans l'ordre défini par la liste des projets. — vérifié
      dans le navigateur (dev server) sur les 12 routes.
- [x] Aucune page ne renvoie de 404 ou de contenu vide. — `npm run build`
      génère les 12 routes projet + `/`, `/lab/hero-3d`, `/_not-found` (15
      routes), aucune erreur de build ni de console.

## Refinement — décisions prises avant implémentation

**1. Route GCII/Enedis (`src/app/work/gcii/page.tsx`) créée sur le même
gabarit que les autres**, en suivant exactement le motif de
`internships/safran/page.tsx` (import statique de `projects`, résolution par
`href`, prop vers `ProjectPage`). `UNROUTED_HREFS` dans `ProjectPage.tsx` est
désormais un `Set` vide (le mécanisme est conservé — pas supprimé — comme
garde-fou pour une future entrée de données livrée avant sa route, mais son
seul usage actuel, `work/gcii`, en a été retiré).

**2. GCII/Enedis : `role` et `result` renseignés, pas laissés vides.**

Décision (l'option recommandée par le cadrage de ce ticket) : remplir ces deux
champs plutôt que les laisser absents, en reformulant sans invention le texte
déjà présent dans `pageContent` :
- `role`: "Ingénieur logiciel fullstack — refonte d'une application métier"
  (dérivé de `description` + du contexte de la section 1 de `pageContent`).
- `result`: décrit la portée du projet en cours ("plus de 10 000
  utilisateurs", migration PHP → Django/React) — ces deux faits existent déjà
  dans `pageContent.context`/`mainPart`, aucun chiffre n'est inventé ; contrairement
  à Safran, ce `result` ne décrit pas un aboutissement chiffré (le projet est
  en cours) mais un périmètre, ce qui reste cohérent avec la contrainte "no
  invented benchmark figure".

**3. `project.tsx` supprimé.** Recherche repo-wide (`grep -r
"components/project["'"'"']"`) confirmée : plus aucun import après la
migration des 11 routes ; seul `projectsSection.jsx` (page d'accueil, fichier
distinct, hors périmètre) matchait une regex plus large par erreur.

**4. Vérification navigateur.** Les 12 routes ont été ouvertes via
`npm run dev` + `claude-in-chrome` : fil d'Ariane correct, contenu "En bref"
propre à chaque projet (pas de copier-coller de Safran), chaîne
précédent/suivant correcte de bout en bout (GCII → Safran → SNCF → CCTV →
Android → Démineur → Quimesis → Kusmi Tea → Développement Web → Programmation
→ Systèmes Embarqués → Robotique/cpge_tipe, sans lien "précédent" sur GCII ni
"suivant" sur cpge_tipe), aucune image cassée sur les entrées `img: null`
(GCII), aucune erreur console.

**Reste pour le `human_checkpoint`** : confirmation humaine finale en
parcourant les 12 pages (les critères ci-dessus documentent ce qui a déjà été
vérifié par l'agent).
