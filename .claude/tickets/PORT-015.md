---
id: PORT-015
title: "Zone ⑦ Footer réel + polish responsive"
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
human_checkpoint: "Cliquer chaque lien du footer (mailto, LinkedIn, GitHub, les 4 liens projets) sur mobile (360px) et desktop, et confirmer qu'ils fonctionnent tous et qu'aucun lien CV n'apparaît"
created: 2026-09-26
---

# Zone ⑦ Footer réel + polish responsive

**Contexte** — Zone ⑦ de la maquette "REFONTE" (`design/mockups/02-refonte.png`).
Le footer actuel (`src/components/footer.jsx`) est minimal : 3 liens
(LinkedIn, GitHub, mailto) centrés, sans nav, avec une année en dur ("2025").
Rattaché au milestone M3 — Contenu & structure.

**Décision résolue (non négociable, déjà tranchée avec Corentin)** — Il
n'existe pas encore de PDF de CV. Le footer ne doit contenir **aucun** bouton
ou lien "Télécharger le CV", ni de lien vers un chemin placeholder type
`/cv.pdf`. Le CTA "Télécharger le CV" visible dans la maquette est **différé à
un ticket futur**, une fois le PDF disponible. Ce ticket livre uniquement le
contact (mailto) et les liens sociaux, plus les colonnes de nav et l'année
dynamique.

**Écart connu avec la maquette** — La maquette liste "Profil · Parcours" dans
la colonne Navigation, mais la section "Parcours" est explicitement notée
comme *nouvelle, absente du site actuel* (zone ②) et n'existe pas dans
`src/app/page.tsx` sur cette branche (sections réelles : `#home`, `#profile`,
`#portfolio`, `#about`). La colonne Navigation du footer ne doit donc lister
que les sections qui existent réellement (Profil, Projets, À propos) — ne pas
ajouter un lien "Parcours" qui ne mène nulle part. Le jour où la section
Parcours est livrée, un ticket dédié ajoutera l'ancre correspondante ici.

**Livrable** — Un footer réel : bloc "Travaillons ensemble" avec CTA contact
(mailto), colonnes de nav (Navigation / Projets / Contact) avec de vrais
liens, liens sociaux, mention d'année dynamique — sans CTA CV.

## Acceptance criteria

- [ ] Un bloc "Travaillons ensemble" est présent avec un CTA de contact
      (`mailto:corentin.bunaux@gmail.com`) — pas de bouton ni lien "Télécharger
      le CV" nulle part dans le footer.
- [ ] Une colonne "Navigation" avec des liens fonctionnels vers les sections
      réelles de la page d'accueil : Profil (`#profile`), Projets
      (`#portfolio`), À propos (`#about`). Pas de lien "Parcours".
- [ ] Une colonne "Projets" avec des liens réels vers 4 pages projet issues de
      `src/data/projects.ts` (Safran → `/internships/safran`, Quimesis →
      `/internships/quimesis`, SNCF → `/research/sncf`, CCTV →
      `/personnal/cctv`), pas d'URL inventée.
- [ ] Une colonne "Contact" avec E-mail (mailto), LinkedIn
      (`https://linkedin.com/in/corentin-bunaux`) et GitHub
      (`https://github.com/corentinbunaux`) — mêmes URLs que l'ancien footer.
- [ ] L'année est calculée dynamiquement (`new Date().getFullYear()`), plus de
      "2025" en dur.
- [ ] Toutes les couleurs viennent des design tokens Tailwind (`bg-surface`,
      `border-second`, `text-main-text`, `text-second-text`, etc.), aucune
      couleur hexadécimale ou `var(--...)` inline nouvelle n'est introduite.
- [ ] Chaque lien a un focus visible au clavier (`outline-focus` ou
      équivalent) et un contraste conforme WCAG AA sur le fond utilisé.
- [ ] À 360px de large : une seule colonne, pas de débordement horizontal
      (vérifié dans le navigateur, capture ou lecture DOM à l'appui).
- [ ] `npm run lint`, `npx tsc --noEmit` et `npm run build` passent sans
      erreur nouvelle.
- [ ] Aucun fichier hors de `src/components/footer.jsx` (et ce ticket) n'est
      modifié — `src/app/app.css`, `src/data/projects.ts` et
      `public/img/Avatar_Coco.png` restent intouchés.

## Files

- **À modifier** : `src/components/footer.jsx` (seul fichier de code à
  changer), `.claude/tickets/PORT-015.md` (ce fichier).
- **Référence, ne pas toucher** : `src/data/projects.ts` (hrefs des projets),
  `tailwind.config.js` / `src/app/app.css` (tokens déjà câblés), `src/app/page.tsx`
  (ids de section `#profile`/`#portfolio`/`#about`), `design/mockups/02-refonte.png`.
- **Interdits explicitement** : `PASSATION.md`, `ARCHITECTURE.md`,
  `public/img/Avatar_Coco.png` (autres agents en parallèle / hors scope).

## Approach

1. Réécrire `footer.jsx` en semantique HTML claire (`<footer>`, `<nav>` par
   colonne, `<ul>/<li>` pour les listes de liens).
2. Bloc haut "Travaillons ensemble" : titre, courte phrase de contexte (issue
   de la maquette : "Ouvert aux missions en prestation depuis Le Havre, sur
   site à La Défense ou à distance."), bouton "Me contacter" en `mailto:`.
3. Trois colonnes de nav sous le bloc contact : Navigation (ancres de page),
   Projets (liens vers pages projet réelles), Contact (mailto, LinkedIn,
   GitHub) — icônes SVG existantes réutilisées où pertinent.
4. Ligne de copyright en bas avec année dynamique.
5. Convertir toutes les couleurs vers les tokens Tailwind (`bg-surface`,
   `border-second`, `text-main-text`, `text-second-text`) ; garder les liens
   externes en `target="_blank" rel="noopener noreferrer"`.
6. Vérifier au clavier (tab) et à 360px dans le navigateur.

Une seule approche raisonnable ici (pas d'alternative structurante à
trancher) : le composant reste un simple functional component sans état.

## Test plan

Pas de suite de tests configurée sur ce projet (voir `CLAUDE.md`). Vérification
manuelle uniquement :
- `npm run lint && npx tsc --noEmit` → doit être propre.
- `npm run build` → doit réussir (export statique).
- Navigateur (`npm run dev`) : cliquer chaque lien du footer (mailto,
  LinkedIn, GitHub, Safran, Quimesis, SNCF, CCTV, ancres Navigation) à 360px
  puis en desktop ; confirmer une seule colonne à 360px, pas de scroll
  horizontal, focus clavier visible sur chaque lien.

## Out of scope

- Ajouter un lien ou bouton CV (différé, PDF non disponible).
- Créer la section "Parcours" ou toute ancre associée.
- Le sélecteur FR/EN visible dans la maquette (zone ①, hors périmètre footer).
- Toute modification de `src/app/app.css`, `src/data/projects.ts`,
  `ARCHITECTURE.md`, `PASSATION.md`.
- Refonte du reste de la page (navbar, hero, sections) au-delà du footer.

## Human checkpoint

Lancer `npm run dev`, ouvrir la page d'accueil, réduire la fenêtre à 360px de
large puis cliquer chaque lien du footer (mailto, LinkedIn, GitHub, Safran,
Quimesis, SNCF, CCTV, et les ancres Navigation) : confirmer qu'ils mènent tous
au bon endroit, qu'aucun lien/bouton CV n'est présent, et que la mise en page
tient sur une colonne sans débordement horizontal à 360px.

## Risks

Faible. Le seul risque réel est de casser le scroll-vers-section existant
(géré par `navbar.jsx` via des refs JS) si les ancres `#profile` /
`#portfolio` / `#about` sont utilisées comme de simples liens `<a href="#...">`
plutôt que le mécanisme `window.scroll` du navbar — un `<a href="#profile">`
reste un fallback valide (saut natif du navigateur) donc pas de régression,
juste un comportement de scroll moins fluide que le navbar. Accepté pour ce
ticket.
