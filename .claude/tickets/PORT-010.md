---
id: PORT-010
title: "Zone ② Parcours — nouvelle section timeline"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: in-progress
resumeAt: null
priority: P1
estimate: 1.0
confidence: high
depends_on: [PORT-008]
parallel_safe: true
human_checkpoint: "Relire les 4 dates/intitulés/localisations affichés dans la timeline, en particulier la présence ou l'absence de localisation pour Safran"
created: 2026-09-26
---

# Zone ② Parcours — nouvelle section timeline

**Contexte** — Section absente du site actuel, zone ② de la maquette
"REFONTE" (`design/mockups/02-refonte.png`), entre Profil et Portfolio. Dates
et intitulés confirmés pendant le cadrage (`docs/CADRAGE.md`). Fait partie du
jalon M3 — Contenu & structure.

**Investigation** — Les 4 entrées existent déjà dans
`src/data/projects.ts` (PORT-008) via le champ optionnel `period` :
Kusmi Tea (`completed`, 2023-01→2023-01), Quimesis (`completed`,
2024-04→2024-07), Safran (`completed`, 2025-04→2025-09), GCII/Enedis
(`ongoing`, depuis 2025-11). Seul GCII/Enedis a un champ `location` renseigné
("Le Havre") ; Kusmi Tea et Quimesis n'en ont pas, alors que le cadrage
confirme "Normandie" et "Belgique" respectivement — ces deux valeurs seront
ajoutées à `projects.ts` en s'appuyant sur le champ `location?: string` déjà
prévu par le type `Project` (PORT-008), pas sur une nouvelle donnée
hardcodée dans le composant. Safran n'a pas de localisation confirmée nulle
part (ni ticket, ni cadrage) : elle reste omise, conformément au commentaire
du type ("Omitted where the location is not confirmed").

La maquette (zone ②) ne montre que 3 entrées, en ordre antéchronologique
(Safran en haut marqué "aujourd'hui", puis Quimesis, puis Kusmi Tea) —
elle est antérieure à l'ajout de GCII/Enedis comme poste actuel et donc
factuellement dépassée sur ce point précis (confirmé par le cadrage : GCII
est le poste actuel, pas Safran). Les critères d'acceptation de ce ticket
listent les 4 entrées dans l'ordre chronologique (Kusmi Tea → Quimesis →
Safran → GCII/Enedis) : c'est cet ordre qui fait foi, la maquette ne sert
que pour le style visuel de la carte (carte "Parcours", ligne verticale,
puces, titre en gras + sous-titre + dates).

Ailleurs sur le site (`projectsSection.jsx`), `project.title` et
`project.description` sont affichés tels quels (ex. "Safran" /
"Stage de fin d'études", pas "Safran Data Systems" /
"Ingénieur Fullstack Stagiaire"). Pour rester cohérent avec le reste du
site et éviter d'introduire une copy parallèle non maintenue, la timeline
réutilise les mêmes champs (`title`, `description`) plutôt que les
libellés plus longs employés dans le texte du ticket ou de la maquette. Le
human checkpoint sert précisément à valider ce choix de libellé auprès de
Corentin.

`src/app/page.tsx` mesure `offsetTop` de `#home`, `#profile`, `#portfolio`,
`#about` via `document.getElementById(...).offsetTop` dans un `useEffect`
(measure au montage + resize), consommé par `navbar.jsx` uniquement pour le
scroll au clic (pas de surlignage actif au scroll — pas d'IntersectionObserver
ni de scroll listener trouvé dans le repo). La navbar n'a pas de lien
"Parcours". Insérer une nouvelle `<section>` avec son propre `id` entre
`#profile` et `#portfolio` ne casse rien : `offsetTop` de `#portfolio` est
recalculé dynamiquement à partir du DOM réel, donc il inclut automatiquement
la hauteur de la nouvelle section. **Décision : la nouvelle section n'est
pas ajoutée à `allTops`/`page.tsx` ni à `navbar.jsx`** — elle n'a pas de lien
de nav dédié, donc rien ne la consomme, et ne pas y toucher minimise le
risque de conflit avec PORT-006 qui édite `navbar.jsx` en parallèle.

**Livrable** — Une nouvelle section "Parcours" (timeline verticale à 4
entrées, dans l'ordre chronologique), insérée entre les sections Profil et
Portfolio dans `src/app/page.tsx`, sans régression sur le scroll de la
navbar.

**Critères d'acceptation**
- [ ] Kusmi Tea — Normandie, janvier 2023.
- [ ] Quimesis — Belgique, avril–juillet 2024.
- [ ] Safran — Ingénieur Fullstack Stagiaire, avril–septembre 2025 (pas de
      localisation affichée, car non confirmée).
- [ ] GCII (pour Enedis) — Ingénieur logiciel fullstack, Le Havre, novembre
      2025 → aujourd'hui, visuellement marqué comme poste actuel (ex. puce
      pleine / badge "En cours", distinct des 3 entrées terminées).
- [ ] Les 4 entrées sont dans l'ordre chronologique croissant (Kusmi Tea en
      premier, GCII/Enedis en dernier).
- [ ] Chaque entrée est un lien cliquable vers `/${project.href}` (même
      convention que `projectsSection.jsx`).
- [ ] Les données (titre, description, dates, localisation, href) viennent
      de `src/data/projects.ts`, aucune n'est ré-écrite en dur dans le
      composant.
- [ ] Section responsive à 360px de large (pas de scroll horizontal) et sur
      desktop.
- [ ] Utilise les tokens existants (`bg-surface`, `bg-surface-raised`,
      `border-second`, `--section-padding-y/x` via Tailwind) — aucune
      couleur ni espacement en dur.
- [ ] `npm run lint`, `npx tsc --noEmit` et `npm run build` passent sans
      erreur.
- [ ] La navbar (`navbar.jsx`) scrolle toujours correctement vers Profil et
      Portfolio après l'insertion de la nouvelle section (vérification
      manuelle : cliquer sur "Profil" et "Portfolio" dans la navbar après
      l'ajout de la section).

**Files**
- `src/components/journeySection.tsx` (nouveau) — composant de la timeline.
- `src/app/page.tsx` — insertion de `<section id="journey">` (ou nom
  équivalent) entre `#profile` et `#portfolio`.
- `src/data/projects.ts` — ajout de `location: "Normandie"` (Kusmi Tea) et
  `location: "Belgique"` (Quimesis) ; aucune autre donnée modifiée.
- Ne pas toucher : `src/app/app.css`, `src/components/projectsSection.jsx`,
  `src/components/project.tsx`. Éviter `src/components/navbar.jsx` (PORT-006
  l'édite en parallèle) — ce ticket ne devrait pas avoir besoin d'y toucher
  (voir décision ci-dessus).

**Approche**
1. Ajouter `location` à Kusmi Tea et Quimesis dans `projects.ts` (valeurs
   confirmées par le cadrage).
2. Construire la liste triée : filtrer `projects` sur `period` défini, trier
   par `period.start` croissant (tri sur chaîne `YYYY-MM`, ordre lexical =
   ordre chronologique).
3. Créer `journeySection.tsx` : carte "Parcours" + ligne verticale, une
   entrée par projet trié, avec titre/description/dates/localisation (si
   présente)/lien, et un traitement visuel distinct pour `status: "ongoing"`
   (ex. libellé "Aujourd'hui" au lieu d'une date de fin, puce ou badge
   "poste actuel").
4. Formatter les dates `YYYY-MM` en français lisible (ex. "janvier 2023",
   "avril – septembre 2025") avec une petite fonction locale, sans nouvelle
   dépendance (pas de date-fns : la logique est triviale, un tableau de 12
   noms de mois suffit).
5. Insérer `<section id="journey"><JourneySection /></section>` dans
   `page.tsx` entre `#profile` et `#portfolio`, sans toucher `allTops` ni
   `navbar.jsx` (décision documentée ci-dessus).
6. Vérifier au navigateur à 360px et en desktop, puis `npm run lint && npx
   tsc --noEmit && npm run build`.

**Test plan** — Aucune suite de tests automatisés dans ce projet (confirmé
par `CLAUDE.md` et `docs/CADRAGE.md`, hors périmètre). Vérification :
lint + typecheck + build, puis vérification manuelle au navigateur (360px et
desktop) des 4 entrées, de leur ordre, du marquage "poste actuel" pour
GCII/Enedis, et du clic sur chaque entrée (navigation vers la bonne page
projet).

**Out of scope** — Toucher `projectsSection.jsx`/`project.tsx` (autres
tickets) ; ajouter la section au scroll-spy/`allTops`/`navbar.jsx` ; changer
l'ordre ou le contenu des 8 autres projets sans `period` ; ajouter une
localisation à Safran (non confirmée) ; internationalisation FR/EN de cette
section (hors périmètre de ce ticket, traité globalement ailleurs) ;
accents three.js.

**Human checkpoint** — Relire les 4 dates/intitulés/localisations affichées
dans la timeline (`npm run dev`, section "Parcours" entre Profil et
Portfolio) : en particulier valider que l'absence de localisation pour
Safran est acceptable, et que les libellés `title`/`description` repris de
`projectsSection.jsx` ("Safran" / "Stage de fin d'études" plutôt que "Safran
Data Systems" / "Ingénieur Fullstack Stagiaire") conviennent.

**Risks** — Faible : périmètre de données déjà typé et présent (PORT-008),
pas de nouvelle dépendance, pas de logique serveur. Le seul risque réel est
un désaccord de Corentin sur le libellé ou l'absence de localisation Safran
au moment du human checkpoint, ce qui ne remettrait en cause qu'une chaîne
de caractères, pas la structure du composant.
