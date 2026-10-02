---
id: PORT-062
title: "Tennisman — revers une main à la Federer, tout le corps, ou retirer l'animation si ça ne rend pas"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: review
resumeAt: null
priority: P2
estimate: 1.5
confidence: low
model: opus
branch: feat/PORT-062-tennis-backhand
depends_on: [PORT-061]
parallel_safe: true
human_checkpoint: "Regarder la pose finale, à 1280 et 1920 px, clair et sombre : ressemble-t-elle à un revers une main sur le point de frapper ?"
created: 2026-09-28
---

# Tennisman — revers une main

**Procédure** : `docs/PROCEDURE-TICKET.md`. Confiance basse, comme pour
PORT-043 (M6) dont ce ticket reprend le travail. Dépend de PORT-061 (mêmes
fichiers : `aboutmeSection.jsx`, potentiellement `federer.jsx`/`app.css`) —
vérifier qu'il est bien fusionné avant de commencer.

## Retour de Corentin (`recette-utilisateur-2.md`, point 11)

> Pour le tennisman, il faudra soit retirer l'animation du bras qui n'est
> pas terrible à mon goût, soit alors l'améliorer de manière significative.
> Je voudrais, si possible, reproduire au mieux le geste d'un revers à une
> main, position dans laquelle le joueur (Federer) est sur le point de
> frapper. Essaie de mimer son geste au mieux possible (mouvement de tout
> le corps, pas seulement que le bras), en essayant de t'inspirer du
> mouvement réel de Federer.

## État actuel (posé par PORT-043, M6)

`src/components/federer.jsx` a **un seul** groupe isolé,
`<g id="federer-arm" style={{ transformOrigin: '34px 20px' }}>`, qui
contient (d'après le journal de PORT-043) les deux bras du dessin original
(prise à deux mains), le poignet, le manche, le cordage. Aucun autre groupe
du corps (torse, hanches, jambes) n'est isolé — c'est une illustration
plate, pas un rig. `app.css` anime ce seul groupe via
`@keyframes federer_swing` (rotation -20° → +35°, 0,6 s), déclenché par
l'état React `phase` (`idle`/`flying`/`hit`) dans `aboutmeSection.jsx`
quand la balle arrive sur la raquette.

## Ce que ce ticket demande

Deux niveaux, à tenter dans cet ordre — s'arrêter au premier qui donne un
résultat convaincant, ne pas empiler les deux sans raison :

### Niveau 1 (à essayer en premier, risque faible) — tout le personnage bouge, pas juste le bras

Un revers une main en préparation a une signature reconnaissable même en
silhouette : le buste pivoté vers l'arrière (côté revers), le poids du
corps qui bascule légèrement, l'épaule qui recule, et le bras qui porte la
raquette haute et en arrière, prêt à fouetter vers l'avant. Puisqu'isoler
un nouveau groupe « torse » dans une illustration plate est risqué, la
technique classique en animation 2D pour donner l'impression que « tout le
corps bouge » sans re-dessiner les membres est de faire bouger **le
personnage entier** en plus du bras : une légère rotation d'ensemble
(quelques degrés) + un léger décalage horizontal (transfert de poids),
appliqués au **conteneur** du SVG (pas au SVG lui-même, pour ne pas casser
`ref={federerRef}` utilisé par `aboutmeSection.jsx` pour mesurer la cible
de la balle), en même temps que le bras se lève.

- Dans `aboutmeSection.jsx`, le SVG est rendu dans
  `<div className={... federer-swing ...}><Federer ref={federerRef} /></div>`.
  Ajouter un **second** conteneur autour, dédié au mouvement d'ensemble :
  ```tsx
  <div className={`federer-body ${phase === 'hit' ? 'federer-body-swing' : ''}`}>
    <div className={`flex w-full justify-center ${phase === 'hit' ? 'federer-swing' : ''}`}>
      <Federer ref={federerRef} />
    </div>
  </div>
  ```
- Dans `app.css`, ajouter :
  ```css
  @keyframes federer_body_swing {
    0% { transform: rotate(0deg) translateX(0); }
    40% { transform: rotate(-6deg) translateX(-3%); }
    100% { transform: rotate(3deg) translateX(1%); }
  }
  .federer-body-swing {
    animation: federer_body_swing 0.6s ease-out both;
    transform-origin: 50% 85%; /* pivot near the feet, not the center */
  }
  @media (prefers-reduced-motion: reduce) {
    .federer-body-swing { animation: none; }
  }
  ```
  Ajouter aussi `.federer-body-swing` à la liste déjà présente dans le bloc
  `@media (prefers-reduced-motion: reduce)` qui désactive les animations
  (`.federer-swing #federer-arm, .ball, .ball-aim, .btn_federer-done`).
- **Important** : ce mouvement d'ensemble ne doit PAS désynchroniser la
  cible de frappe déjà calculée par `pushBall()`
  (`federerRef.current.getBoundingClientRect()`) — cette mesure est prise
  **au clic**, avant que `federer-body-swing` ne s'applique (la classe
  n'est ajoutée qu'au passage en `phase === 'hit'`, après le vol de la
  balle), donc l'ordre est déjà correct ; vérifier seulement par capture
  que le petit décalage de fin d'animation ne fait pas paraître la balle
  ratée par rapport à la raquette une fois le mouvement terminé — si c'est
  gênant, réduire l'amplitude de `translateX`.

### Niveau 2 (seulement si le niveau 1 ne suffit pas visuellement) — isoler un groupe torse

Si, après capture, le niveau 1 seul ne « lit » pas comme un vrai revers
(par exemple parce que la pose de bras elle-même reste trop proche d'un
coup droit), retravailler aussi la pose de `#federer-arm` :
- Position cible en fin d'animation (`100%` de `federer_swing`) : racket
  et bras **hauts et du côté opposé** à la position de repos plutôt que
  simplement pivotés à plat — un revers en préparation lève le bras/la
  raquette nettement au-dessus de l'épaule, pas seulement de côté. Ajuster
  l'angle de rotation (actuellement -20°/+35°) et, si nécessaire, ajouter
  une légère translation en plus de la rotation sur `#federer-arm` pour
  suggérer que le bras se lève, pas seulement qu'il tourne autour de
  l'épaule.
- Tenter d'isoler un second groupe (torse/épaules) **seulement si**, en
  regardant le SVG rendu en grand (capture zoomée), une frontière nette
  entre le torse et le reste est repérable parmi les chemins existants —
  ne pas redécouper des chemins dont la limite n'est pas visuellement
  évidente, ça casserait le dessin. Si aucune frontière nette n'apparaît
  après une inspection sérieuse, ne pas forcer : rester au niveau 1.
- Deux essais maximum sur ce niveau 2. Au 3ᵉ échec, revenir au niveau 1 et
  le documenter comme suffisant.

### Repli explicitement autorisé par Corentin

Si, après les deux niveaux ci-dessus, le résultat ne convainc toujours pas
(silhouette qui ne se lit pas comme un revers, mouvement qui a l'air
cassé), **désactiver l'animation** plutôt que de livrer quelque chose de
raté : la balle vole et disparaît normalement (comme avant), mais le
tennisman reste immobile (retirer les classes `federer-swing`/
`federer-body-swing` de la condition `phase === 'hit'`, ou les laisser
vides). Documenter ce choix dans le journal — ce n'est pas un échec de
ticket, Corentin a explicitement autorisé cette issue.

## Fichiers

`src/components/aboutmeSection.jsx`, `src/app/app.css`, et
`src/components/federer.jsx` uniquement si le niveau 2 est tenté.

## Vérifications

Procédure §4 + méthode Chrome headless (WebSocket natif Node 24, script
jetable, `--use-angle=swiftshader`, PID exact pour tout arrêt) puisqu'aucun
navigateur interactif n'est connecté. Capturer la pose finale (à la fin de
`federer_swing`/`federer_body_swing`) à 1280 et 1920 px, thème sombre et
clair, et — but explicite — juger si elle évoque un revers une main en
préparation (bras/raquette hauts, buste légèrement tourné) plutôt qu'un
geste plat. Vérifier aussi que la balle atteint toujours visuellement la
raquette (comme calé par PORT-043) malgré le mouvement d'ensemble ajouté.
Vérifier `prefers-reduced-motion` : rien ne bouge.

Commit : `feat(about): improve the tennis swing into a one-handed backhand pose`
(ou, en cas de repli : `fix(about): disable the unconvincing tennis swing animation`)

## Critères d'acceptation

- [ ] La pose finale évoque un revers une main en préparation (jugement
      visuel documenté par capture, pas une affirmation).
- [ ] Le mouvement implique visiblement plus que le seul bras (niveau 1 au
      minimum), sauf si le repli a été appliqué.
- [ ] `prefers-reduced-motion` coupe tout mouvement.
- [ ] La balle atteint toujours la raquette.
- [ ] lint / tsc / build passent.

## Journal d'exécution

**Décision : repli (animation du tennisman désactivée).** Niveau 1 puis
deux essais de niveau 2 tentés dans l'ordre, chacun capturé (Chrome headless
via CDP, animations figées avec `Animation.pause()` + `currentTime` à
0 / ~40 % / ~70 % / 100 %, 1280 et 1920 px, sombre et clair). Captures hors
dépôt, dans le scratchpad de la session (`shots-l1/`, `shots-l2a/`,
`shots-l2b/`, `shots-fb/`, `shots-rm/`).

1. **Niveau 1** (conteneur `.federer-body` + `@keyframes federer_body_swing`
   exactement comme le ticket, bras PORT-043 inchangé). Rejeté : la ligne de
   sol fait partie du SVG, donc la rotation d'ensemble (-6° puis +3°)
   **incline le sol** — on lit un « plan qui penche », pas un transfert de
   poids. La pose finale est la pose de repos (le bras revient à 0°) inclinée
   de 3° : rien d'un revers en préparation.
2. **Niveau 2, essai 1.** Frontière nette trouvée (inventaire des 43 chemins
   par `getBBox()`) : tête, chemise et son contour (chemins n° 1, 6, 12, 13,
   17, 18, 23, 24, 25) s'arrêtent à la ceinture (y ≈ 33), recouverte par le
   short. Isolés dans `<g id="federer-torso">` (pivot 30,33) avec
   `#federer-arm` imbriqué ; aucun raccord visible à la ceinture. Bras
   -30° + buste -5° en fin de mouvement : le **tamis passe sur la tête**
   et on lit un smash, pas un revers ; le sol penche toujours (niveau 1).
3. **Niveau 2, essai 2.** Rotation d'ensemble retirée (translateX seul),
   bras -12° + translate(1px,-2px), buste -6°. Fin de pose : raquette haute
   au-dessus de l'épaule droite, mais **le bras se détache de la manche**
   (contour de l'épaule cassé), le tamis est **coupé par le bord haut du
   viewBox**, et la silhouette reste celle d'une **prise à deux mains**
   (les deux mains sur le manche, dessin d'origine) : ça lit comme une fin
   de coup droit / smash à deux mains, pas un revers à une main.

Conclusion : un revers **à une main** demanderait de redessiner le bras
gauche (lâcher le manche) et l'orientation des épaules — hors de portée sans
redécouper l'illustration. Repli appliqué comme autorisé par Corentin : la
balle vole, se pose sur la raquette puis disparaît ; le tennisman reste
immobile. `federer.jsx` n'est **pas** modifié (l'essai de groupe torse a été
abandonné, pas commité). CSS `federer_swing` / `.federer-swing #federer-arm`
supprimé (mort), retiré aussi de la liste `prefers-reduced-motion`.

Vérifications visuelles (Chrome headless, serveur `next dev -p 3062` de la
worktree, arrêtés par PID exact) :
- Balle sur la raquette : centre de la balle à 4 px (1280) / 5 px (1920)
  du centre du cordage au passage en `hit`, et le joueur ne bouge plus
  ensuite (`getAnimations()` ne contient plus d'animation sur le SVG ;
  0 `<g>` transformé). Vérifié en sombre et clair à 1280, sombre à 1920 ;
  la passe 1920 clair du script final a raté le clic (instabilité du script),
  mais le contrôle `prefers-reduced-motion` ci-dessous a tourné à 1920 clair.
- `prefers-reduced-motion: reduce` (1920 clair) : après clic, aucune balle,
  aucune animation (`document.getAnimations()` vide), bouton
  `visibility: hidden`, aucun groupe du SVG transformé.
- 360 px sombre/clair : le tennisman s'affiche, pas de défilement horizontal
  (`scrollWidth` = 360) ; le bouton PUSH est masqué sous `xl` (inchangé).

Commandes (dans la worktree) :

```
$ npm run lint      (5 dernières lignes)
  48 |   return colors;
  49 | }  react-hooks/set-state-in-effect

✖ 4 problems (0 errors, 4 warnings)
   (4 avertissements préexistants, aucun dans aboutmeSection.jsx :
    `npx eslint src/components/aboutmeSection.jsx` → exit 0)

$ npm run build     (5 dernières lignes)
└ ○ /work/gcii


○  (Static)  prerendered as static content

$ npx tsc --noEmit  (lancé après le build)
npm notice run tsc --noEmit
exit 0
```

Critères d'acceptation :
- Pose finale de revers une main : **non atteinte → repli appliqué**
  (issue explicitement autorisée), captures des 3 tentatives ci-dessus.
- Mouvement « plus que le bras » : sans objet, repli appliqué.
- `prefers-reduced-motion` : rien ne bouge (vérifié, voir ci-dessus).
- La balle atteint la raquette : oui (4–5 px d'écart au centre du cordage).
- lint / tsc / build : passent.

## Notes pour la consolidation

- ARCHITECTURE.md : le tennisman de « À propos » est désormais **statique** ;
  seule la balle est animée (`ball_path` + `ball_aim`, puis fondu
  `.ball-struck`). `@keyframes federer_swing` et `.federer-swing` n'existent
  plus. Le `<g id="federer-arm">` de `federer.jsx` (PORT-043) reste en place
  mais n'est plus ciblé par aucun style : à supprimer dans un ticket de
  nettoyage si on n'y revient pas.
- Si on veut un jour un vrai revers à une main : il faut une nouvelle
  illustration (ou un rig dessiné exprès), pas une rotation des chemins
  actuels. Piste repérée : tête + chemise sont séparables proprement
  (frontière à la ceinture, y ≈ 33 dans le viewBox), mais les deux mains
  sur le manche et le tamis qui sort du viewBox au-dessus de y = 0 bloquent.
