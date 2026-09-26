---
id: PORT-017
title: "Infrastructure i18n FR/EN (contexte, dictionnaire, toggle) + traduction complète"
group: corentin
machine: asus_corentin
milestone: M4 — i18n FR/EN
status: ready
resumeAt: null
priority: P2
estimate: 3.0
confidence: medium
depends_on: [PORT-016]
parallel_safe: false
human_checkpoint: "Basculer FR/EN dans la navbar sur la home et au moins 2 pages projet (dont GCII/Enedis, période 'ongoing'), vérifier que le choix persiste après rechargement, et relire la qualité de l'anglais (voir PORT-018)."
created: 2026-09-26
---

# Infrastructure i18n FR/EN + traduction complète

**Contexte** — Décision d'architecture déjà validée (`docs/CADRAGE.md` §2/§5) :
toggle client-side (contexte React + dictionnaire), pas de routes `/fr`/`/en`,
100 % compatible export statique. Périmètre étendu par décision explicite du
30/09 (voir note ci-dessous) : ce ticket couvre **à la fois** l'infrastructure
(PORT-017 d'origine) **et** la traduction FR/EN complète de tout le contenu
affiché (PORT-018 d'origine), en un seul passage — construire le dictionnaire
sans le remplir aurait laissé le toggle non fonctionnel, et re-parcourir
chaque composant une seconde fois pour PORT-018 aurait dupliqué le travail.
PORT-018 devient une revue de qualité de traduction (Corentin relit), pas un
travail de traduction à faire.

**Investigation menée** — Composants avec texte FR en dur confirmés :
`navbar.jsx` (4 libellés), `homepage.jsx` (accroche + CTA), `profileSection.jsx`
(Profil + Compétences), `journeySection.tsx` (noms de mois, "aujourd'hui",
"Poste actuel"), `projectsSection.jsx` (pills de filtre, heading), `ProjectPage.tsx`
(fil d'Ariane, labels "En bref", nav prev/next, galerie, mois de durée),
`aboutmeSection.jsx` (bio + grille d'intérêts), `footer.jsx` (bloc contact, nav,
copyright). `src/data/projects.ts` contient, pour 12 projets, du texte FR dans
`title`/`description`/`role`/`result`/`pageContent.context`/
`pageContent.mainPart[].title|description` — aucun de ces champs n'a
aujourd'hui de contrepartie EN. Design tokens nécessaires au toggle
(`bg-surface`, `border-second`, `:focus-visible` global) existent déjà
(PORT-004/006) — aucun ajout CSS nécessaire.

**Deliverable** — Un sélecteur FR/EN dans la navbar change la langue affichée
sur tout le site (accueil + 12 pages projet) sans rechargement, persistée en
`localStorage`, sans avertissement d'hydratation ; toutes les chaînes visibles
ont une traduction anglaise professionnelle.

## Acceptance criteria

- [ ] `src/i18n/LanguageContext.tsx` expose un contexte React (`language: "fr" | "en"`,
      `setLanguage`) et un hook `useLanguage()`, langue par défaut `"fr"`.
- [ ] Le choix de langue est lu depuis `localStorage` dans un `useEffect`
      (jamais au premier rendu serveur/statique) et réécrit à chaque changement ;
      aucun avertissement d'hydratation React dans la console.
- [ ] `src/i18n/dictionary.ts` définit une interface `Dictionary` (nested par
      composant : `navbar`, `hero`, `profile`, `journey`, `projects`,
      `projectPage`, `about`, `footer`, `common`) et un objet `{ fr: Dictionary,
      en: Dictionary }` où les deux langues respectent la même forme (vérifié
      par le compilateur). `useTranslation()` retourne le dictionnaire de la
      langue active.
- [ ] Sélecteur FR/EN visible dans `navbar.jsx` : deux `<button>` réels,
      `aria-pressed` sur le bouton actif, stylé avec `bg-surface`/`border-second`
      existants (pas de nouveau token sauf nécessité démontrée).
- [ ] `src/data/projects.ts` : `title`, `description`, `role`, `result`,
      `pageContent.context`, `pageContent.mainPart[].title/description`
      deviennent `{ fr: string; en: string }` (type `LocalizedText`) pour les
      12 projets ; une fonction `localizeProject(project, language)` retourne
      la forme plate (string) consommée par les composants d'affichage.
- [ ] `navbar.jsx`, `homepage.jsx`, `profileSection.jsx`, `journeySection.tsx`,
      `projectsSection.jsx`, `ProjectPage.tsx`, `aboutmeSection.jsx`,
      `footer.jsx` lisent leur texte via `useTranslation()`/`localizeProject`
      au lieu de chaînes FR en dur — plus aucune chaîne visible codée en dur
      dans ces fichiers (hors noms propres : GCII, Enedis, Safran Data Systems,
      Quimesis, Kusmi Tea, Mines de Saint-Étienne, ISMIN, et libellés techniques
      déjà en anglais comme HTML/CSS/React).
- [ ] Aucune dépendance ajoutée (`package.json` inchangé côté `dependencies`).
- [ ] `npm run lint && npx tsc --noEmit && npm run build` passent, les 15
      routes se génèrent toujours en état statique par défaut FR.
- [ ] Vérification manuelle navigateur (checkpoint humain) : bascule FR→EN→FR
      sur la home et 2 pages projet dont GCII/Enedis (`period.status ===
      "ongoing"`, "aujourd'hui" → "today"), persistance après F5, pas
      d'avertissement d'hydratation.

## Files

**Nouveaux** : `src/i18n/LanguageContext.tsx`, `src/i18n/dictionary.ts`,
`src/i18n/types.ts` (type `Language`).
**Modifiés** : `src/app/layout.tsx` (wrap `LanguageProvider`), `src/data/projects.ts`,
`src/components/navbar.jsx`, `homepage.jsx`, `profileSection.jsx`,
`journeySection.tsx`, `projectsSection.jsx`, `ProjectPage.tsx`,
`aboutmeSection.jsx`, `footer.jsx`.
**Ne pas toucher** : `HeroMesh.tsx`, `HeroCanvas.tsx`, `page.tsx` (hero/scroll
wiring — PORT-020 en parallèle), `public/img/Avatar_Coco.png`,
`src/app/app.css` (sauf ajout de token strictement nécessaire), la structure
de `ProjectPage.tsx` au-delà du texte (PORT-020 y ajoute un slot 3D en
parallèle).

## Approach

1. Poser l'infra i18n (`i18n/types.ts`, `LanguageContext.tsx`, `dictionary.ts`
   avec les clés vides/placeholder), brancher `layout.tsx` et le toggle navbar.
2. Convertir `src/data/projects.ts` au type bilingue + `localizeProject()`.
3. Remplacer, composant par composant, les chaînes FR en dur par
   `useTranslation()`/`localizeProject`, en écrivant la traduction EN au fil de
   l'eau (pas de clé vide laissée pour un second passage).
4. Vérification navigateur (Chrome via `claude-in-chrome`) : toggle + reload +
   console hydratation, sur home + GCII/Enedis + 1 autre page projet.
5. `npm run lint && npx tsc --noEmit && npm run build`.

## Test plan

Pas de suite de tests automatisés dans ce projet (`ARCHITECTURE.md` : "No test
suite"). Vérification par lecture (diff) + vérification manuelle navigateur
listée ci-dessus, qui tient lieu de plan de test pour ce ticket.

## Out of scope

Routes localisées `/fr`/`/en` (exclu par `docs/CADRAGE.md`) ; traduire les
noms propres ; ajouter/inventer un fait ou un chiffre absent de la version FR ;
toucher au hero three.js ou aux accents 3D Safran/Quimesis (PORT-020) ;
corriger les bugs déjà documentés (PORT-022 smooth scroll, PORT-023 hiérarchie
de titres) même si on les recroise.

## Risks

Volume : 12 projets × (title+description+role?+result?+context+~2-3
mainPart×2 champs) ≈ 100+ chaînes rien que pour `projects.ts`, plus ~50
chaînes d'UI statique — risque principal est le temps de traduction soignée,
pas un risque technique. Risque secondaire : un composant oublié qui garde du
FR en dur quand EN est sélectionné — mitigé par le grep final "aucune chaîne
visible codée en dur" avant de clore.
