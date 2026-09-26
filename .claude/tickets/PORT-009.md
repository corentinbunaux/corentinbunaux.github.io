---
id: PORT-009
title: "Zone ① Accueil — hero et statut réels, nav restructurée"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: review
resumeAt: null
priority: P1
estimate: 1.5
confidence: high
depends_on: [PORT-008, PORT-006, PORT-010]
parallel_safe: false
human_checkpoint: "Confirmer le texte de statut affiché (GCII/Enedis/Le Havre) et vérifier que les 4 liens de nav scrollent au bon endroit"
created: 2026-09-26
---

# Zone ① Accueil — hero et statut réels, nav restructurée

**Contexte** — Correspond à la zone ① de la maquette "REFONTE"
(`design/mockups/02-refonte.png`). Le statut affiché aujourd'hui
(`profileSection.jsx`) est obsolète ("recherche d'un premier emploi") ; il
doit refléter la situation réelle : ingénieur diplômé des Mines de
Saint-Étienne, en poste chez GCII en prestation pour Enedis depuis Le Havre.

**✅ Décision CV (résolue, non négociable)** — Pas de PDF de CV disponible.
Aucun bouton/lien "Télécharger le CV" n'est ajouté, ici ni ailleurs. Le hero
n'a donc qu'**un seul** CTA ("Voir mes projets"), pas deux.

**Dépendances mises à jour après le Lot A** — Ce ticket touche `navbar.jsx`
(PORT-006, mergé : items sont maintenant des `<button>`) et doit intégrer la
section Parcours (PORT-010, mergé : `<section id="journey">` existe entre
`#profile` et `#portfolio` dans `src/app/page.tsx`, mais **volontairement pas
raccordée** au scroll-spy — PORT-010 a laissé ce raccordement pour ce ticket
afin d'éviter un conflit de fichier pendant l'exécution parallèle).

## Investigation

- `src/app/page.tsx` : `allTops` a 4 clés (`homepageTop`, `profileTop`,
  `portfolioTop`, `aboutTop`), mesurées via `document.getElementById(id).offsetTop`
  dans un `useEffect`. Il manque `journeyTop` alors que `#journey` existe déjà
  dans le JSX. `<Homepage />` ne reçoit aucune prop aujourd'hui.
- `src/components/navbar.jsx` (post-PORT-006) : 4 `<button type="button">`
  ("Accueil", "Profil", "Portfolio", "À propos"), `handleClick(index)` fait un
  `switch` positionnel sur `props.allTops.{homepageTop,profileTop,portfolioTop,aboutTop}`.
  La maquette veut 4 entrées différentes : **Profil, Expériences, Projets, À
  propos** — "Accueil" disparaît (le hero est déjà ce qu'on voit en haut de
  page, pas besoin d'un lien dédié), "Expériences" est nouveau (cible
  `#journey`), "Projets" remplace "Portfolio" (même cible, `#portfolio`,
  libellé différent).
- `src/components/homepage.jsx` : greeting "Hey ! / Je m'appelle Corentin."
  (aucune mention de statut), photo hero déjà migrée vers `OptimizedImage`
  (PORT-005). Aucun CTA n'existe dans ce fichier aujourd'hui.
- `src/components/profileSection.jsx` : le paragraphe de statut obsolète est
  la première `<h3>` ("Actuellement à la recherche..."). Le paragraphe
  suivant (CPGE → Mines de Saint-Étienne → ISMIN) reste vrai tel quel, à
  garder. Un lien "Voir les projets" existe déjà (scroll vers `portfolioTop`
  via `props.portfolioTop`) — c'est un lien texte secondaire, pas le CTA
  bouton de la maquette ; il reste tel quel, le nouveau CTA bouton va dans le
  hero (`homepage.jsx`), pas ici.

**Livrable** — Le hero affiche le statut réel de Corentin, un unique CTA
("Voir mes projets"), et la nav a les 4 entrées de la maquette
(Profil / Expériences / Projets / À propos) qui scrollent chacune au bon
endroit, y compris vers la nouvelle section Parcours.

**Critères d'acceptation**
- [ ] `profileSection.jsx` : le paragraphe de statut affiche la situation
      réelle (GCII, prestation pour Enedis, Le Havre, diplômé des Mines de
      Saint-Étienne) — aucune mention d'un statut étudiant/recherche d'emploi.
- [ ] `homepage.jsx` : un bouton "Voir mes projets" scrolle vers `#portfolio`
      (même mécanisme que le lien existant de `profileSection.jsx` :
      `window.scroll({ top, behavior: "smooth" })`), stylé avec les tokens
      Tailwind existants (pas de couleur en dur). Aucun bouton/lien CV nulle
      part.
- [ ] `src/app/page.tsx` : `allTops` gagne `journeyTop` (mesuré comme les
      autres, `document.getElementById("journey").offsetTop`), passé à
      `Navbar`. `Homepage` reçoit `portfolioTop={allTops.portfolioTop}` en
      prop pour son CTA.
- [ ] `navbar.jsx` : 4 items dans l'ordre **Profil, Expériences, Projets, À
      propos**, `handleClick` mis à jour pour cibler
      `profileTop, journeyTop, portfolioTop, aboutTop` respectivement (dans
      cet ordre). Le comportement existant (hash `#portfolio` au montage →
      scroll vers Projets) reste fonctionnel avec le nouvel index.
- [ ] Chacun des 4 liens de nav scrolle à la bonne section (vérifié au
      navigateur, pas seulement lu dans le code).
- [ ] Aucune régression sur l'animation de la roue d'icônes (`RoundContainer`
      dans `homepage.jsx`, conservée par arbitrage — `docs/CADRAGE.md`).
- [ ] `npm run lint`, `npx tsc --noEmit` et `npm run build` passent sans
      erreur nouvelle.

**Files**
- À modifier : `src/components/homepage.jsx`, `src/components/profileSection.jsx`,
  `src/components/navbar.jsx`, `src/app/page.tsx`.
- Ne pas toucher : `src/app/app.css`, `src/components/journeySection.tsx`,
  `src/data/projects.ts`, `src/components/projectsSection.jsx`,
  `src/components/aboutmeSection.jsx`, `src/components/footer.jsx`.

**Approche**
1. `page.tsx` : ajouter `journeyTop` à l'état `allTops` et à sa mesure ;
   passer `portfolioTop` à `<Homepage />`.
2. `navbar.jsx` : remplacer les 4 libellés et le `switch` de `handleClick`
   pour pointer vers `profileTop, journeyTop, portfolioTop, aboutTop`.
3. `homepage.jsx` : ajouter le CTA "Voir mes projets" (bouton, même logique
   de scroll que `profileSection.jsx`), recevoir `portfolioTop` en prop.
4. `profileSection.jsx` : réécrire le paragraphe de statut avec les faits
   réels (GCII, Enedis, Le Havre, diplômé Mines de Saint-Étienne) ; garder le
   paragraphe CPGE/Mines/ISMIN tel quel (toujours vrai).
5. Vérifier au navigateur : les 4 liens de nav, le nouveau CTA, la roue
   d'icônes toujours animée.
6. `npm run lint && npx tsc --noEmit && npm run build`.

**Test plan** — Aucune suite de tests configurée. Vérification manuelle :
`npm run dev`, cliquer chacun des 4 liens de nav et le CTA hero, confirmer la
destination de scroll ; lire le texte de statut affiché.

**Out of scope**
- Tout bouton/lien CV (pas de PDF disponible).
- Le sélecteur FR/EN de la maquette (zone ①, hors périmètre — M4).
- Corriger le bug de scroll pré-existant relevé par PORT-006 (le scroll ne
  bouge pas `window.scrollY` même avec le code d'origine) — si ce bug existe
  toujours après ce ticket, le documenter à nouveau ici plutôt que de le
  corriger en marge (hors périmètre, mérite son propre ticket de debug).

**Human checkpoint** — Relire le texte de statut affiché (exactitude des
faits GCII/Enedis/Le Havre) et cliquer les 4 liens de nav + le CTA hero pour
confirmer qu'ils scrollent au bon endroit.

**Risks** — Le bug de scroll pré-existant signalé par PORT-006
(`window.scrollY` ne bouge pas) pourrait rendre la vérification au navigateur
peu concluante visuellement ; dans ce cas, vérifier via
`document.activeElement`/l'état React plutôt que l'position de scroll réelle,
et documenter que le bug persiste sans tenter de le corriger ici.

## Estimation

Inchangée à 1.5 (le retrait du CV simplifie le hero, mais le raccordement de
`journeyTop` au scroll-spy — laissé de côté par PORT-010 — compense).
Confiance relevée à **high** : tout le contexte nécessaire (fichiers, lignes,
décisions) est maintenant connu, aucune question ouverte ne subsiste.

**Statut : `ready`**.
