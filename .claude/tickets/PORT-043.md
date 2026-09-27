---
id: PORT-043
title: "À propos — tennisman : bras et raquette redessinés, frappe animée quand la balle arrive"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: in-progress
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

- [ ] La balle arrive sur la raquette (1280 et 1920 px).
- [ ] Le joueur frappe quand la balle arrive.
- [ ] Plus de manipulation DOM directe.
- [ ] Rien ne bouge avec « réduire les animations ».
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir — captures avant/après)_

## Notes pour la consolidation

- ARCHITECTURE.md : animation tennis pilotée par état React
  (`idle/flying/hit`), bras = `#federer-arm`.
