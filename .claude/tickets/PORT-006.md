---
id: PORT-006
title: Navbar accessible (contrôles sémantiques, clavier, retrait du 100vw en dur)
group: corentin
machine: asus_corentin
milestone: M2 — Design system & accessibilité
status: review
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
depends_on: [PORT-004]
parallel_safe: true
human_checkpoint: "Naviguer toute la navbar au clavier (Tab + Entrée) sans souris ; vérifier qu'un anneau de focus visible apparaît sur chaque item"
created: 2026-09-26
---

# Navbar accessible

**Contexte** — `src/components/navbar.jsx` rend chaque item de nav comme un
`<div onClick>` (pas de chemin clavier, pas sémantique) dans un `<nav>` qui
fixe `width: "100vw"` en style inline plutôt que via une classe. PORT-004 est
déjà mergé dans `refonte-2026` : `src/app/app.css` définit `--focus`,
`--focus-width`, `--focus-offset` et une règle globale
`:focus-visible { outline: var(--focus-width) solid var(--focus); outline-offset: var(--focus-offset); }`,
et `tailwind.config.js` expose `outlineColor.focus`. Cette règle cible le
pseudo-classe `:focus-visible`, pas une classe Tailwind : elle s'applique
automatiquement à tout élément nativement focusable (`<button>`, `<a>`), sans
classe supplémentaire à ajouter. **N'y touche pas** — ce ticket consomme les
tokens, il ne les modifie pas.

Une ticket séparée (PORT-009, planifiée juste après celle-ci) réécrit les
libellés du menu ("Profil / Expériences / Projets / À propos"). Ce ticket-ci
ne doit pas toucher au texte des items : uniquement à la structure et au
clavier, pour que le diff de PORT-009 reste net.

## Constat d'investigation (lu dans le code avant rédaction)

- `handleClick(index)` (lignes 5-29) fait un `switch` sur l'index positionnel
  pour lire `props.allTops.{homepageTop,profileTop,portfolioTop,aboutTop}` et
  appelle `window.scroll({ top, behavior: "smooth" })`. Ce n'est pas une
  ancre de fragment classique (`href="#id"` + saut natif) : c'est un scroll
  JS calculé. Passer à `<a href="#...">` changerait le comportement (saut
  natif + jump de hash) sans apporter de bénéfice clavier supplémentaire par
  rapport à `<button>`. **`<button type="button" onClick={...}>` est
  l'approche recommandée**, pas `<a>`.
- `useEffect` (lignes 31-35) déclenche `handleClick(2)` si
  `window.location.hash === '#portfolio'` au montage — comportement à
  préserver tel quel, indépendant de la structure des items.
- Tailwind preflight (actif, non désactivé dans `tailwind.config.js`) remet
  déjà `button` à `border-width: 0`, `background-color: transparent`,
  `font: inherit`, `color: inherit`, `margin/padding: 0` — un `<button>` sans
  classe de reset supplémentaire aura le même rendu visuel qu'un `<div>`
  aujourd'hui. Pas besoin d'ajouter `appearance-none` ou un reset manuel.
- Le style inline du `<nav>` est
  `{ backdropFilter: 'blur(4px)', width: "100vw", zIndex: "100" }`. Seul
  `width` est visé par ce ticket (`vw` en dur) ; `backdropFilter` (pas de
  token Tailwind natif) et `zIndex` (hors périmètre du ticket) restent
  inchangés. Tailwind fournit déjà l'utilitaire `w-screen` (= `100vw`) — c'est
  la classe existante qui remplace le style inline, sans introduire de valeur
  arbitraire ni de nouveau token.

**Livrable** — La navbar est utilisable entièrement au clavier (Tab pour
atteindre chaque item, Entrée/Espace pour l'activer), affiche un focus visible
sur chaque item, et ne contient plus de valeur `vw`/`vh` en dur dans le style
inline.

**Critères d'acceptation**
- [ ] Les 4 items de nav sont des `<button type="button">` réels (pas de
      `<div onClick>`), focusables au Tab et activables au clavier
      (Entrée et Espace déclenchent `handleClick`).
- [ ] Un anneau de focus visible (via `:focus-visible` global, token
      PORT-004) apparaît sur chaque item au Tab — vérifié dans un navigateur,
      pas seulement lu dans le CSS.
- [ ] `style={{ width: "100vw" }}` supprimé du `<nav>`, remplacé par la
      classe Tailwind `w-screen`.
- [ ] Les libellés des items ("Accueil", "Profil", "Portfolio", "À propos")
      sont inchangés au caractère près (diff ne doit montrer aucun changement
      de texte) — c'est le périmètre de PORT-009, pas de celui-ci.
- [ ] Le scroll-to-section (clic ou clavier) atteint la même position qu'avant
      pour chaque item ; le comportement du hash `#portfolio` au montage est
      inchangé.
- [ ] `npm run lint`, `npx tsc --noEmit` et `npm run build` passent sans
      erreur nouvelle.

**Files**
- Change: `src/components/navbar.jsx`.
- Ne pas toucher : `src/app/app.css`, `tailwind.config.js` (PORT-004, déjà
  mergé — les tokens existent déjà), `src/components/homepage.jsx` (consomme
  `Navbar` mais son usage/props n'a pas besoin de changer).

**Approche**
1. Remplacer chaque `<div className="cursor-pointer" onClick={...}>` par
   `<button type="button" className="cursor-pointer" onClick={...}>`, en
   gardant le texte de l'item et l'appel `handleClick(index)` identiques.
2. Retirer `width: "100vw"` de l'objet `style` du `<nav>` ; ajouter `w-screen`
   à la liste de classes existante du `<nav>`.
3. Ne rien ajouter côté CSS/Tailwind : la règle globale `:focus-visible`
   (PORT-004) s'applique automatiquement aux nouveaux `<button>`.
4. Vérifier au navigateur (clavier + focus visible) et par lecture de diff
   qu'aucun texte n'a changé.

**Test plan** — Aucune suite de tests n'est configurée dans ce projet
(`CLAUDE.md`). Vérification manuelle uniquement :
- Clavier : `npm run dev`, Tab depuis le haut de page jusqu'à atteindre les 4
  items, Entrée (puis Espace) sur chacun, vérifier que le scroll atteint la
  bonne section.
- Visuel : capture d'écran ou lecture DOM à chaque item focusé pour confirmer
  l'anneau `outline` (`--focus`) visible.
- Statique : `npm run lint && npx tsc --noEmit && npm run build`.

**Out of scope**
- Renommer ou reformuler les libellés du menu (PORT-009).
- Changer `backdropFilter` ou `zIndex` du `<nav>`.
- Toute modification de `src/app/app.css` ou `tailwind.config.js`.
- Convertir le scroll JS en ancres natives `href="#id"`.

**Human checkpoint** — Lancer `npm run dev`, naviguer toute la navbar au
clavier (Tab + Entrée) sans souris, et confirmer qu'un anneau de focus visible
apparaît sur chaque item avant de cliquer/activer.

**Risks** — Faible : composant isolé, ~25 lignes, pas de logique métier
changée. Le seul risque réel est une régression visuelle si `w-screen`
introduit un débordement horizontal différent de `width: 100vw` (peu probable,
ce sont des équivalents stricts) — à vérifier en `build` + navigateur.

## Vérification (post-implémentation)

- **Clavier** — `npm run dev`, navigateur réel (`claude-in-chrome`) :
  clic sur "Accueil" puis 3× Tab traverse dans l'ordre Profil → Portfolio →
  À propos, chaque item étant un vrai `BUTTON` (confirmé via
  `document.activeElement.tagName`).
- **Focus visible** — à chaque Tab, `document.activeElement.matches(':focus-visible')`
  vaut `true` et `getComputedStyle(...)` rapporte
  `outlineColor: rgb(167, 188, 199)` (= `#a7bcc7`, le token `--focus` de
  PORT-004), `outlineStyle: solid` — confirmé aussi visuellement par capture
  d'écran zoomée sur chaque item.
- **Labels** — diff Git ne touche que les balises (`div`→`button`,
  suppression de `width: "100vw"`) ; aucune ligne de texte n'a changé.
- **Scroll-to-section — constat non lié à ce ticket** : cliquer sur un item
  (avec le code d'origine *et* avec le nouveau code, testés en A/B sur le même
  serveur `localhost:3000`) ne fait pas défiler la page
  (`window.scrollY` reste `0`) alors que les offsets cibles sont non nuls
  (`document.getElementById('profile').offsetTop` = 983 par ex.). Ce
  comportement est identique avant et après ce ticket — **pas une
  régression** introduite ici. À investiguer séparément (piste : le
  `useEffect` de `src/app/page.tsx` qui recalcule `allTops` via
  `offsetTop` pourrait s'exécuter avant que l'animation d'entrée de
  `Homepage` ait fini de redimensionner `#home`, rendant les offsets stables
  mesurés au montage obsolètes). Proposé comme ticket de suivi, hors
  périmètre de PORT-006.
- **Statique** — `npm run lint` (0 erreur, 3 warnings pré-existants sans
  rapport avec `navbar.jsx` : `page.tsx`, `Banner.jsx`, `project.tsx`),
  `npx tsc --noEmit` (propre), `npm run build` (succès, 15 pages générées).
