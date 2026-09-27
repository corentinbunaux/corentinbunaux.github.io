---
id: PORT-043
title: "À propos — tennisman : bras et raquette redessinés, frappe animée quand la balle arrive"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
resumeAt: null
priority: P3
estimate: 1
confidence: low
model: sonnet
branch: feat/PORT-043-tennis-swing
depends_on: [PORT-029]
parallel_safe: true
human_checkpoint: "Cliquer PUSH plusieurs fois à 1280 et 1920 px : la balle arrive sur la raquette et le joueur frappe."
created: 2026-09-27
---

# Tennisman animé

**Procédure** : `docs/PROCEDURE-TICKET.md`. Modèle **Sonnet**, confiance
**basse** : dessin SVG et calage d'animation à l'œil. Règle des deux essais :
si le calage de la trajectoire échoue deux fois, livrer la frappe seule
(étape 3) et documenter.

## Retour de Corentin (#14, fin)

> Potentiellement améliorer l'animation (si tu arrives à modifier le svg une
> fois que la balle est arrivée sur l'interface pour faire bouger le
> tennisman, alors ce sera une superbe avancée pour le site).

Accord de Corentin (2026-09-27) : **redessiner le bras et la raquette** s'il
le faut — le SVG actuel (`src/components/federer.jsx`, 43 chemins, 48
groupes, 1 seul `id`) n'a aucun groupe « bras » identifiable.

## État actuel

- `aboutmeSection.jsx` : `TennisBallAnim()` ajoute la classe `ball` à
  `#tennisball` par manipulation DOM directe, puis 1,2 s plus tard anime le
  bouton PUSH (`endBtnFederer_pt1`).
- `app.css` : `@keyframes ball_path` (translations en % codées en dur,
  ~ligne 329), `.ball`, `.btn_federer`, `@keyframes endBtnFederer_*`.
- Le bouton n'est affiché qu'à partir de `xl` (1280 px).
- Couleurs en dur dans `federer.jsx` (`#81A3A7`, `#A7BCC7`, `#231f20`,
  `#edb29f`…).

## Fichiers

`src/components/federer.jsx`, `src/components/aboutmeSection.jsx`,
`src/app/app.css` (règles tennis uniquement).

## Étapes

1. **Observer** (npm run dev, 1280 px puis 1920 px) : cliquer PUSH, capturer
   où la balle s'arrête par rapport à la raquette. Noter dans le journal.
2. **Isoler le bras** : identifier dans `federer.jsx` les chemins du bras qui
   tient la raquette et de la raquette (les colorer temporairement pour les
   repérer). Deux options, dans cet ordre :
   a. si les chemins existent et sont séparables : les regrouper dans
      `<g id="federer-arm">` ;
   b. sinon : supprimer ces chemins et **redessiner** bras + raquette en
      formes simples (2 segments arrondis pour le bras, une ellipse + un
      manche pour la raquette), dans le style plat du dessin existant, dans
      `<g id="federer-arm">`.
   Le groupe doit tourner autour de l'épaule : définir
   `transform-box: fill-box` n'est pas fiable ici, préférer
   `style={{ transformOrigin: "<x>px <y>px" }}` en coordonnées du viewBox
   (point de l'épaule), et le noter en commentaire.
3. **Frappe** : dans `app.css`, `@keyframes federer_swing` (0 % : position
   de repos ; 40 % : bras armé, rotation ~ -35° ; 70 % : frappe, rotation
   ~ +50° ; 100 % : retour), durée ~0,6 s, `ease-out`. Classe
   `.federer-swing #federer-arm { animation: federer_swing .6s ease-out both; }`.
4. **Déclenchement React** (plus de `getElementById`) dans
   `aboutmeSection.jsx` :
   - état `phase: "idle" | "flying" | "hit"` ;
   - PUSH → `flying` → la balle reçoit la classe `ball` via React
     (`className`), `onAnimationEnd` de la balle → `hit` ;
   - le conteneur du tennisman reçoit `federer-swing` quand `phase === "hit"` ;
   - le bouton garde son animation de fin actuelle (déclenchée sur `hit` au
     lieu du `setTimeout`) ;
   - `prefers-reduced-motion: reduce` → pas de vol ni de frappe (passer
     directement à `hit` sans classe d'animation), vérifier en émulation.
5. **Calage de la trajectoire** : ajuster la **dernière** étape de
   `@keyframes ball_path` pour que la balle finisse sur le tamis de la
   raquette (position au repos, ou armée à 40 %) à 1280 et 1920 px. Si les
   pourcentages actuels ne le permettent pas de façon stable entre les deux
   largeurs, positionner la cible en coordonnées relatives au conteneur du
   tennisman plutôt qu'à la section. Après la frappe, la balle peut repartir
   vers la gauche et disparaître (`opacity: 0`) — optionnel.
6. **Thème clair** : remplacer dans `federer.jsx` `#81A3A7` → `var(--my-green)`,
   `#A7BCC7` → `var(--my-blue)` ; garder la peau et les vêtements tels quels
   s'ils restent lisibles sur fond clair, sinon noter.
7. Vérifications : procédure §4 ; captures du vol et de la frappe à 1280 et
   1920 px, clair et sombre ; `grep -n "getElementById\|querySelector" src/components/aboutmeSection.jsx`
   → vide.

Commits :
1. `feat(about): isolate the tennis player's arm and animate a swing`
2. `fix(about): land the ball on the racket and drive the animation from React`

## Critères d'acceptation

- [x] La balle arrive sur la raquette (1280 et 1920 px).
- [x] Le joueur frappe quand la balle arrive.
- [x] Plus de manipulation DOM directe.
- [x] Rien ne bouge avec « réduire les animations ».
- [x] lint / tsc / build passent.

## Journal d'exécution

Exécuté le 2026-09-27 (agent Opus, worktree `../wt-PORT-043`).

**Étape 1 — observation.** claude-in-chrome non connecté (« Browser extension
is not connected »). Observation faite à la place avec Chrome headless piloté
par le protocole DevTools (script jetable hors dépôt, WebSocket natif de
Node, aucune dépendance ajoutée) sur `npm run dev` de la worktree.

**Étape 2 — bras.** Option a : les chemins existaient et étaient séparables
(rendu PNG des 43 chemins colorés et numérotés avec sharp). Les 9 chemins
bras + raquette (peau des deux bras, poignet, 4 contours, doigts/manche,
cordage, cadre — prise à deux mains) sont regroupés dans
`<g id="federer-arm">`, placé en dernier dans le dessin (devant le torse).
Rendu au repos identique à l'original (contrôlé sur PNG). Pivot épaule :
`style={{ transformOrigin: '34px 20px' }}` en unités du viewBox, commenté.

**Étape 3 — frappe.** `@keyframes federer_swing` 0,6 s `ease-out`.
**Écart** : angles -20° (armé, 40 %) / +35° (frappe, 70 %) au lieu de
-35° / +50° : rendus PNG à -35° (la raquette passe devant le visage) et +50°
(le bras se détache de la manche) jugés moins bons.

**Étape 4 — React.** État `phase` `idle | flying | hit`. PUSH → mesure +
`flying` ; `onAnimationEnd` (filtré sur `ball_path`) → `hit` ; conteneur du
joueur reçoit `federer-swing` sur `hit` ; bouton reçoit `btn_federer-done`
(même animation `endBtnFederer_pt1` qu'avant) sur `hit`, plus de
`setTimeout`. `Federer` accepte un `ref` (React 19, ref en prop).
`prefers-reduced-motion: reduce` → passage direct à `hit` sans balle ;
filet CSS : animations coupées, bouton masqué sans animation.
`grep -n "getElementById\|querySelector" src/components/aboutmeSection.jsx`
→ vide (exit 1).

**Étape 5 — calage.** Ciblage relatif au tennisman (option prévue par le
ticket) : `ball_path` n'est pas modifié ; un wrapper `.ball-aim` ajoute une
correction linéaire (`@keyframes ball_aim`, même durée et easing) vers
`--ball-aim-x/y`, calculées au clic à partir des `getBoundingClientRect` du
calque de la balle (ref) et du SVG (ref) : centre du cordage = (46,15 ; 8,43)
en unités viewBox. La balle frappée s'estompe (opacity 0) pendant le coup
droit. Mesure headless après l'animation (centre balle vs centre cordage) :
- 1280×800 : balle (1051,53 ; 237,14) / raquette (1051,53 ; 237,14)
- 1920×1080 : balle (1479,83 ; 254,08) / raquette (1479,83 ; 254,08)
Premier essai réussi, pas de second essai nécessaire.

**Étape 6 — thème.** `#81A3A7` → `var(--my-green)`, `#A7BCC7` →
`var(--my-blue)` via `style={{ fill: … }}` (4 chemins + 2 cercles). Peau et
vêtements inchangés, lisibles sur fond clair (capture).

**Vérification visuelle (Chrome headless, captures lues)** : séquences
avant / vol / arrivée / frappe / après à 1280 et 1920 px, thème sombre et
clair : la balle arrive sur la raquette, le joueur arme puis frappe, la balle
disparaît, le bouton s'en va. Réduction des animations émulée (1280, sombre) :
aucune balle, aucun mouvement du bras, bouton masqué. 360 px sombre et clair :
joueur rendu comme avant (bouton masqué sous `xl`, inchangé).
**Non vérifié** : onglet réel de Corentin au premier plan (checkpoint humain),
clics répétés (le bouton disparaît après le premier coup, comme avant : un
seul coup par chargement de page).

**Commandes (dans la worktree)** — `npm run lint` (5 avertissements
préexistants dans `page.tsx`, `Banner.jsx`, `LanguageContext.tsx`, `ThemeContext.tsx`,
`useThemeColors.ts`, identiques avant/après ; après intégration de `refonte-2026` : 6, le 6e dans `demos/GuardsDemo.tsx`, venu d'un autre ticket) :

```
  48 |   return colors;
  49 | }  react-hooks/set-state-in-effect

✖ 5 problems (0 errors, 5 warnings)

```

`npm run build` :

```
└ ○ /work/gcii


○  (Static)  prerendered as static content

```

`npx tsc --noEmit` : aucune sortie d'erreur, exit 0.

## Notes pour la consolidation

- ARCHITECTURE.md : animation tennis pilotée par état React
  (`idle/flying/hit`), bras = `#federer-arm`.
- ARCHITECTURE.md : la cible de la balle est mesurée au clic (refs sur le
  calque de la balle et le SVG) et appliquée par une correction linéaire
  `ball_aim` superposée à `ball_path` ; si `ball_path` change de point
  final, mettre à jour `BALL_PATH_END_X` dans `aboutmeSection.jsx`, et
  `RACKET_CENTER` si le dessin de la raquette bouge.
- Point faible : la cible est mesurée au clic ; un redimensionnement pendant
  le vol (1 s) n'est pas suivi.
- Idée (hors ticket) : rendre le bouton rejouable (retour à `idle` après la
  frappe) si Corentin veut cliquer plusieurs fois sans recharger.
- À 360 px, le libellé « Échecs » des centres d'intérêt touche le haut du
  dessin du joueur (constaté sur capture, non lié à ce ticket).
