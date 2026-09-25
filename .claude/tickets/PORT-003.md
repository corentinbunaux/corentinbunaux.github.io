---
id: PORT-003
title: "[Recherche] Prototype de faisabilité du hero three.js"
group: corentin
machine: asus_corentin
milestone: M1 — Fondations
status: ready
resumeAt: null
priority: P1
estimate: 1.0
confidence: medium
depends_on: [PORT-002]
parallel_safe: true
human_checkpoint: "Corentin ouvre /lab/hero-3d sur son propre téléphone et son ordinateur, confirme si c'est fluide ou non"
created: 2026-09-26
---

# [Recherche] Prototype de faisabilité du hero three.js

**Contexte** — Corentin n'a jamais utilisé three.js, et le maillage réactif au
curseur de la zone ① de la maquette Canva est l'inconnue la plus risquée du
chantier (`docs/CADRAGE.md` §6.1, risque élevé). Jalon M1 — Fondations : ce
spike tranche GO/NO-GO avant que PORT-019 (hero three.js) et PORT-020 (accents
Safran/Quimesis) ne s'appuient dessus.

**Livrable** — Une réponse tranchée, écrite dans ce ticket et chiffrée (FPS
mesurés + poids de bundle ajouté par `three`) : soit « three.js dans le hero est
viable en desktop ≥1024px », soit « on l'abandonne et on garde les accents 2D
existants ».

**Critères d'acceptation**
- [ ] Une route jetable `/lab/hero-3d` existe, isolée de la home réelle, et
      rend un maillage three.js réactif au curseur.
- [ ] Le rendu three.js n'a lieu qu'au-dessus de 1024px de large ; en dessous,
      un repli statique s'affiche et **aucun module three.js n'est chargé**
      (vérifiable dans l'onglet Network : pas de chunk `three`).
- [ ] `prefers-reduced-motion: reduce` produit le même repli statique, même en
      desktop — vérifié en émulant la préférence dans les devtools.
- [ ] Un compteur de FPS est affiché dans le prototype, et des chiffres réels
      (min / moyenne / max sur ≥10 s, avec curseur en mouvement) sont relevés
      au navigateur — pas estimés.
- [ ] Le surcoût de bundle de `three` est mesuré en comparant la sortie de
      `npm run build` avant et après ajout, et le chiffre est écrit ici.
- [ ] `npm run lint` et `npx tsc --noEmit` sont propres, `npm run build` produit
      bien `out/` (l'export statique ne doit pas régresser).
- [ ] Une décision **GO** ou **NO-GO** est écrite dans la section « Verdict »
      ci-dessous, avec les chiffres qui la justifient. NO-GO est une issue
      acceptable : elle annule PORT-019/PORT-020 au profit des accents 2D.

**Files**
- `src/app/lab/hero-3d/page.tsx` — nouveau, route jetable du prototype.
- `src/components/lab/HeroMesh.tsx` — nouveau, le canvas three.js.
- `src/components/lab/useFpsMeter.ts` — nouveau, le compteur de FPS.
- `package.json` / `package-lock.json` — ajout de `three` (+ `@types/three`).
- `.claude/tickets/PORT-003.md` — le verdict.
- **Ne pas toucher** : `src/components/homepage.jsx` (c'est le hero réel, cible
  de PORT-019), `PASSATION.md`, `ARCHITECTURE.md` (conflits avec les agents
  PORT-004/005/008 en parallèle), `public/img/Avatar_Coco.png`,
  `next.config.mjs`.

**Approach**
1. Mesurer la baseline : `npm run build`, noter le First Load JS des routes.
2. `npm i three @types/three`, puis construire `HeroMesh.tsx` — géométrie en
   grille de points/lignes, déplacement des sommets en fonction de la position
   du curseur, `requestAnimationFrame`, nettoyage complet au démontage
   (`renderer.dispose()`, retrait des listeners, annulation de la RAF).
3. Garder la route serveur-compatible : le composant three.js est chargé par
   `next/dynamic` avec `ssr: false`, derrière un garde `matchMedia` qui évalue
   à la fois `(min-width: 1024px)` et `(prefers-reduced-motion: reduce)`. Le
   garde doit être évalué **avant** l'import, sinon le chunk part quand même.
4. Ajouter le compteur de FPS (moyenne glissante sur `requestAnimationFrame`).
5. Relever les FPS au navigateur, en bougeant le curseur, à 1440px puis en
   émulant `prefers-reduced-motion`.
6. Re-`npm run build`, comparer, écrire le verdict chiffré ici.

Deux routes possibles pour le canvas : (a) `three` brut, (b)
`@react-three/fiber` + `drei`. **Recommandation : (a)**, parce que le spike doit
mesurer le coût plancher de three.js, pas celui d'une couche React en plus, et
parce qu'ajouter trois dépendances pour un prototype jetable contredit
`.claude/rules/security.md` (« Ask before adding one »).

**Test plan** — Aucune suite de tests n'est configurée sur ce repo (`CLAUDE.md`),
et un prototype jetable n'en justifie pas l'introduction. La vérification est
manuelle et instrumentée :
- `npm run lint` et `npx tsc --noEmit` propres.
- `npm run build` produit `out/` avec `out/lab/hero-3d/index.html`.
- Navigateur à ≥1024px : le maillage réagit au curseur, FPS relevés sur ≥10 s.
- Navigateur à 800px : repli statique, aucune requête de chunk `three`.
- `prefers-reduced-motion: reduce` émulé : repli statique en desktop.
- Console vide (pas de fuite de contexte WebGL au démontage / navigation).

**Out of scope**
- Câbler three.js dans `src/components/homepage.jsx` — c'est PORT-019.
- Les accents Safran/Quimesis et VTK.js — c'est PORT-020.
- Produire l'image de repli définitive : un placeholder suffit ici.
- Optimiser le bundle (tree-shaking fin, imports `three/examples`) au-delà de
  ce qu'il faut pour obtenir un chiffre honnête.
- Corriger `strict: false` dans `tsconfig.json` (contradiction relevée avec
  `.claude/rules/code-style-ts.md`) — mérite son propre ticket.

**Human checkpoint** — Corentin lance `npm run dev`, ouvre
`http://localhost:3000/lab/hero-3d` sur son ordinateur puis sur son téléphone,
et répond à deux questions : (1) sur desktop, le maillage est-il fluide au
ressenti, sans saccade quand le curseur bouge vite ? (2) sur téléphone, voit-il
bien le repli statique et non un canvas ? Son ressenti prime sur le compteur :
un chiffre correct avec un rendu qui « accroche » reste un NO-GO.

**Risks**
- `three` est volumineux : si le surcoût dépasse nettement le budget implicite
  d'un site statique de portfolio, c'est un NO-GO même à 60 FPS.
- Les FPS mesurés sur la machine de dev ne prédisent pas ceux d'un GPU intégré
  modeste — d'où le checkpoint humain sur les vraies machines de Corentin.
- Fuite de contexte WebGL si le nettoyage au démontage est incomplet : se
  manifeste seulement après plusieurs navigations, facile à rater.
- Le garde `matchMedia` mal placé chargerait le chunk `three` sur mobile,
  invalidant discrètement le critère le plus important du filet de sécurité.

**Estimation** — Inchangée à 1.0. La confiance passe de `low` à `medium` : la
route est balisée (App Router, route jetable isolée, aucune dépendance au hero
réel) et le seul vrai inconnu restant est le chiffre lui-même, ce qui est
précisément l'objet du ticket.

---

## Verdict

_À remplir à l'exécution : GO ou NO-GO, avec les FPS relevés et le surcoût de
bundle mesuré._
