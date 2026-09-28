---
id: PORT-062
title: "Tennisman — revers une main à la Federer, tout le corps, ou retirer l'animation si ça ne rend pas"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: ready
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

_(à remplir — captures de la pose finale, décision prise entre niveau 1,
niveau 2 et repli, et pourquoi)_

## Notes pour la consolidation

- ARCHITECTURE.md : si le niveau 1 (mouvement d'ensemble) est retenu,
  documenter `.federer-body-swing` comme le mécanisme qui simule un
  mouvement de tout le corps sans rig complet.
