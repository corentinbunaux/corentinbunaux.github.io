---
id: PORT-012
title: "Nouveau gabarit page projet (zones ④+⑤) — migration pilote Safran"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: ready
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
- [x] Le composant récupère le projet via un paramètre de route
      (`params.slug` ou équivalent App Router), plus de lecture de
      `window.location.pathname`. — voir décision 1 : prop explicite résolue
      à la build plutôt que `params.slug` (URLs statiques conservées).
- [x] Fil d'Ariane ("Accueil / Projets / <nom du projet>") fonctionnel.
- [ ] Bloc "En bref" (rôle, durée, équipe, stack, résultat) collant au
      défilement sur desktop. — CSS correct, **visuellement non satisfait**
      aujourd'hui : bug préexistant hors périmètre dans `app.css`, voir
      décision 3. Contenu affiché : rôle/durée/stack/résultat ; équipe omise
      (donnée non disponible, voir décision 2).
- [x] Navigation projet précédent/suivant fonctionnelle. — voir décision 4
      (GCII sans route encore, donc pas de lien "précédent" pour Safran).
- [x] La page Safran migrée passe en revue visuelle sans régression de
      contenu par rapport à l'actuelle.

## Refinement — décisions prises avant implémentation

**1. Routing : nouveau composant + prop explicite, pas de dynamic route.**

Deux options envisagées :
- (a) `src/app/projects/[slug]/page.tsx` dynamique avec `generateStaticParams()` —
  gros chantier : casse les 11 URLs existantes (`/internships/safran`,
  `/emse/android`, ...), demande des redirects/rewrites pour ne pas perdre les
  liens déjà partagés (CV, LinkedIn), et sort largement du périmètre "migration
  pilote Safran".
- (b) **Retenu** : chaque route garde son fichier `page.tsx` statique existant ;
  celui de Safran importe directement `projects` depuis `src/data/projects.ts`,
  résout son propre projet par `href`, et le passe en prop à un nouveau
  composant. Zéro lecture de `window.location`, résolution à la build (import
  statique), URLs inchangées, diff minimal.

Le composant existant `src/components/project.tsx` (lecture de
`window.location.pathname`) n'est **pas modifié** : il reste tel quel pour les
11 pages non migrées, ce qui élimine tout risque de régression sur elles. Un
nouveau composant `src/components/ProjectPage.tsx` porte le nouveau gabarit et
n'est branché que sur `src/app/internships/safran/page.tsx`. PORT-013 basculera
les pages restantes sur `ProjectPage` puis pourra supprimer `project.tsx`.

**2. Contenu du bloc "En bref" : pas de chiffres inventés.**

Le mockup montre 5 champs (rôle, durée, équipe, stack, résultat). Trois sont
dérivables des données réelles déjà présentes (`description`/contexte → rôle,
`period` → durée calculée, `techLogos` → stack). Deux ne le sont pas :
- **Équipe** : aucune taille d'équipe n'est mentionnée dans le contenu Safran
  existant. Champ ajouté au type (`team?: string`) mais **laissé vide pour
  Safran** plutôt que d'inventer un chiffre — violerait la règle "never invent
  a benchmark figure". Signalé ici pour qu'un humain le renseigne s'il le
  souhaite.
- **Résultat** : reformulé sans invention à partir du texte existant
  ("framework et CLI adoptés par plusieurs équipes internes", cf.
  `pageContent.mainPart` — pas de chiffre précis inventé).

Le composant `ProjectPage` masque chaque ligne de "En bref" dont la donnée est
absente (`role`/`team`/`result` optionnels) plutôt que d'afficher un texte de
repli — cohérent avec "No silent fallbacks".

**3. Limitation connue — "En bref" ne colle pas visuellement (bug préexistant, hors périmètre).**

Le CSS du bloc "En bref" est un `position: sticky` standard (`lg:sticky lg:top-8
lg:self-start`), vérifié correct à l'inspection (`getComputedStyle` renvoie bien
`position: sticky`, `top: 32px`). Mais à l'exécution il ne colle pas : en
scrollant, la carte défile avec le reste de la page au lieu de se figer.

**Cause racine identifiée** : `src/app/app.css` définit `body { overflow-x:
hidden; }` sans fixer `overflow-y`. Par la règle CSS qui interdit un axe
`visible` et l'autre non-`visible` sur un même élément, `overflow-y` calculé
devient `auto` — `body` obtient donc `overflow: hidden auto`, ce qui en fait un
scroll container au sens CSSOM. C'est ce scroll container (immobile, puisque le
défilement réel se produit sur `<html>`/le viewport) qui sert de référence à
`position: sticky`, cassant l'ancrage pour **tout** élément sticky du site, pas
seulement celui de cette page. Confirmé empiriquement : en supprimant
temporairement `overflow` sur `body`/`html` via la console (changement non
committé, juste pour le diagnostic), le bloc se fige exactement à `top: 32px`
comme codé.

`src/app/app.css` est un fichier que ce ticket n'a pas le droit de modifier
(contrainte du prompt d'exécution). Le CSS de `ProjectPage.tsx` reste donc tel
quel (il est correct et deviendra fonctionnel dès que ce bug sera corrigé) ;
le critère d'acceptation "collant au défilement sur desktop" **n'est pas
satisfait visuellement aujourd'hui** à cause de ce bug préexistant et hors
périmètre — signalé ici plutôt que masqué. Correctif recommandé pour un futur
ticket : remplacer `overflow-x: hidden` par `overflow-x: clip` sur `body` (ou
déplacer la règle sur un wrapper interne) — `clip` empêche le débordement
horizontal sans transformer l'élément en scroll container CSSOM, donc sans
casser `position: sticky`. Sous contrainte de ce ticket de ne créer aucun
nouveau fichier ticket, ce correctif n'a pas été ouvert comme ticket séparé ;
à faire lors de la prochaine session qui touche `app.css`.

**4. Navigation précédent/suivant : ordre du tableau, avec un correctif temporaire.**

Ordre retenu = ordre du tableau `projects` (le plus simple, déterministe, pas
besoin de champ `order` supplémentaire). Cas particulier : `work/gcii` (GCII /
Enedis) a une entrée de données (PORT-008) mais pas encore de route
(`src/app/work/gcii/page.tsx` arrive avec PORT-013) — donc GCII est en index 0,
juste avant Safran. Un lien "précédent" vers `/work/gcii` serait un lien mort
aujourd'hui. `ProjectPage` saute donc les hrefs sans route encore livrée via
une petite liste `UNROUTED_HREFS` documentée dans le composant, à supprimer par
PORT-013 quand elle crée cette route. Résultat sur Safran : pas de lien
"précédent" (rien avant dans les routes livrées), lien "suivant" vers SNCF.
