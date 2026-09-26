---
id: PORT-007
title: "Checkpoint M2 : audit Lighthouse + contraste WCAG"
group: corentin
machine: asus_corentin
milestone: M2 — Design system & accessibilité
status: review
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
depends_on: [PORT-004, PORT-005, PORT-006]
parallel_safe: false
human_checkpoint: "Relancer un audit Lighthouse mobile sur le site déployé (GitHub Pages) une fois en ligne, ou en local sur une machine non partagée — les chiffres de cette session sont bruités par l'environnement sandboxé (voir ci-dessous)"
created: 2026-09-26
---

# Checkpoint M2 : audit Lighthouse + contraste WCAG

**Contexte** — Ferme le jalon M2 en vérifiant les critères de succès #1-3 du
`docs/CADRAGE.md` avant de passer au contenu (M3).

**Livrable** — Un rapport (Lighthouse + audit de contraste automatisé) prouvant
que les seuils sont atteints, ou la liste des écarts restants et leur
correction.

## Méthode

Build de production (`npm run build`), servi statiquement (`npx serve out`),
audité avec `npx lighthouse` (headless Chrome, émulation mobile,
`--only-categories=performance,accessibility`) — aucune dépendance ajoutée au
projet, `npx` ne persiste rien dans `package.json`.

## Résultats

**Accessibility : 98/100** (cible 100). Un seul audit en échec :
`heading-order` — hiérarchie de titres invalide (h1 → h3 sans h2, à 3
endroits sur la home). **Non corrigé ici** : la cause est structurelle
(chaque section du site utilise `h1` pour son titre et `h3` comme classe de
style de texte, pas comme un vrai niveau 3), corriger seulement les 3
occurrences relevées referait probablement réapparaître le problème
ailleurs. Documenté et découpé en **PORT-023**, qui demande une passe
dédiée sur la hiérarchie de titres de tout le site — hors périmètre d'un
ticket de checkpoint (`.claude/rules/00-core.md`, "smallest change").

**Contraste WCAG** : zéro échec — déjà couvert par PORT-004 (`--second-text`
à `#999999`, focus `--focus`, bouton PUSH corrigé), reconfirmé par cet audit.

**Performance : 82-86/100 sur 2 runs** (cible ≥ 90), **non concluant**.

- Un vrai problème a été trouvé et corrigé : `RoundContainer` (roue d'icônes
  du hero, `homepage.jsx`) pilotait sa rotation par un `setInterval` React de
  10 ms — 100 re-renders/seconde, en continu, tant que la page est ouverte.
  Lighthouse mesurait 13,1 s de travail main-thread et 6,3 s de démarrage JS
  rien que pour cette animation décorative. Remplacé par une animation CSS
  pure (`@keyframes` sur le conteneur et, en contre-rotation synchronisée,
  sur chaque icône pour qu'elle reste droite) — tourne sur le compositeur,
  zéro JS, aucun re-render. Vitesse et sens de rotation identiques
  (vérifié visuellement au navigateur, captures avant/après). Ajout d'un
  repli `prefers-reduced-motion: reduce` au passage (gratuit, absent avant).
  Effet mesuré : `bootup-time` 6,3 s → 0,9 s ; `mainthread-work-breakdown`
  13,1 s → 2,6 s.
- **Malgré cette amélioration réelle, le score composite n'a pas bougé de
  façon fiable** (86 puis 82 sur deux runs consécutifs, sans autre
  changement entre les deux). L'environnement de cette session (sandbox
  partagée, CPU non dédié) rend la mesure Lighthouse mobile (limitation CPU
  4×) bruitée et non représentative d'un vrai résultat de production sur
  GitHub Pages. **Je ne peux pas affirmer que le seuil de 90 est atteint ou
  manqué avec confiance dans ces conditions.**

**Acceptance criteria**
- [ ] Lighthouse Accessibility = 100 sur la home. — **98/100**, écart
      documenté et reporté en PORT-023 (hors périmètre ici).
- [ ] Lighthouse Performance ≥ 90 en émulation mobile sur la home. —
      **Non concluant** (82-86 mesurés, environnement de mesure non fiable) ;
      un vrai gain de performance a été livré (voir ci-dessus) mais la
      confirmation du seuil doit se faire sur le site déployé ou une machine
      non partagée (voir Human checkpoint).
- [x] Zéro échec de contraste WCAG AA détecté par l'audit.
- [x] Les écarts éventuels sont soit corrigés ici (roue d'icônes), soit
      documentés avec un ticket de suivi (PORT-023 pour `heading-order`).

**Files**
- Modifié : `src/components/homepage.jsx` (`RoundContainer`),
  `src/app/app.css` (animations `wheel-spin`/`wheel-item-counter-spin`).
- Nouveau : `.claude/tickets/PORT-023.md`.

**Human checkpoint** — Relire ce rapport, et relancer `npx lighthouse` (ou
l'outil Lighthouse intégré à Chrome DevTools) contre le site une fois
déployé sur GitHub Pages, ou sur une machine locale non partagée, pour
obtenir un score de performance fiable. Vérifier aussi visuellement que la
roue d'icônes tourne toujours normalement.
