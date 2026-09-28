---
id: PORT-050
title: "Parcours — petites icônes 3D (diplôme, mallette) en tête des deux pistes"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: done
resumeAt: null
priority: P3
estimate: 0.5
confidence: medium
model: sonnet
branch: feat/PORT-050-journey-3d-icons
depends_on: [PORT-030, PORT-031]
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# Parcours — icônes 3D

**Procédure** : `docs/PROCEDURE-TICKET.md` + **`docs/GUIDE-3D.md`**.

## Retour de Corentin (#6) et choix validé

> Ajouter une icône three.js représentant le diplôme / l'expérience
> professionnelle peut-être ?

Choix : **deux icônes** (« 2 icônes c'est super ») : une toque de diplômé
pour la piste Formation, une mallette pour la piste Expérience. Desktop
uniquement ; ailleurs, l'icône lucide actuelle (PORT-030) reste.

## Fichiers

- Créé : `src/components/journey/TrackIcon3D.tsx`
- Modifié : `src/components/journey/TrackIcon.tsx` (seul fichier existant touché)

## Étapes

1. `TrackIcon3D.tsx` : exporte `TrackIcon3D({ kind })`, qui rend
   `<ThreeStage setup={kind === "experience" ? setupBriefcase : setupCap} fov={30} />`
   (deux fonctions `setup` au niveau du module, gabarit du guide).
   - Caméra : position (0, 0.6, 3.2), regarde l'origine ; objets d'environ
     1.4 unité pour remplir le cadre.
   - **Toque** : plateau carré (`BoxGeometry(1.3, 0.06, 1.3)`) posé en
     losange (rotation Y 45°) sur une calotte (`CylinderGeometry` évasé),
     bouton central (petite sphère) et **gland** (fil = `TubeGeometry`
     courbe + petit cylindre) couleur `colors.green` ; toque `colors.mainText`.
   - **Mallette** : corps `BoxGeometry(1.3, 0.9, 0.4)` aux arêtes adoucies
     (ou `ExtrudeGeometry` d'un rectangle arrondi), poignée
     `TorusGeometry` (demi-tore) sur le dessus, deux fermoirs et une bande
     couleur `colors.green` ; corps `colors.mainText`.
   - Lumières : ambiante 0.7 + directionnelle 1.0 depuis (2, 3, 4).
   - Animation : rotation Y lente (0.5 rad/s) avec un léger balancement en X
     (±0.15 rad) ; au survol du conteneur (`pointerenter`/`pointerleave` sur
     `container`), rotation ×3 pendant le survol. Retirer les écouteurs dans
     `dispose()`.
2. `TrackIcon.tsx` :
   - garder la version lucide actuelle comme rendu par défaut ;
   - ajouter le chargement `next/dynamic(() => import("./TrackIcon3D").then(m => m.TrackIcon3D), { ssr: false })`
     et, si `useDesktopMotionGate() === "render"`, rendre à la place un
     conteneur de **même taille** que la version lucide (garder
     `h-12 w-12`, ou passer les deux à `h-14 w-14` si c'est trop petit pour
     lire la forme — même taille dans les deux cas pour éviter tout saut),
     `aria-hidden="true"`, avec `<TrackIcon3D key={theme} kind={kind} />`
     (`useTheme()` pour la clé).
3. Contexte WebGL : la home aura alors 3 canvases (globe du hero si PORT-044
   est fusionné + 2 icônes). C'est acceptable ; vérifier qu'il n'y a pas
   d'avertissement dans la console.

## Vérifications

Guide 3D §4 sur la **home**, section Parcours (à 1280 px : deux icônes 3D qui
tournent doucement, plus vite au survol ; à 360 px : icônes lucide, aucun
chunk three) + pas de décalage de mise en page quand les icônes 3D
apparaissent.

Commit : `feat(journey): small 3D cap and briefcase icons on desktop`

## Critères d'acceptation

- [x] Toque (Formation) et mallette (Expérience) en 3D sur desktop.
- [x] Repli lucide identique en taille ailleurs.
- [x] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

**Implémentation** : `src/components/journey/TrackIcon3D.tsx` créé (toque
`setupCap` : calotte évasée + plateau losange + bouton et gland
`colors.green`, corps `colors.mainText` ; mallette `setupBriefcase` :
`RoundedBoxGeometry` (existe dans `node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js`,
vérifié avant import) + poignée demi-tore + bande/fermoirs `colors.green`,
corps `colors.mainText`). Rotation Y 0.5 rad/s, ×3 au survol
(`pointerenter`/`pointerleave` sur `container`), balancement X ±0.15 rad,
écouteurs retirés dans `dispose()`. `TrackIcon.tsx` modifié : `next/dynamic`
vers `TrackIcon3D` (`ssr:false`), rendu si `useDesktopMotionGate() === "render"`,
`key={theme}`. Écart mineur (autorisé par le ticket) : conteneur passé de
`h-12 w-12` à `h-14 w-14` (les deux variantes, lucide et 3D) pour que les
formes se lisent, sans écart de taille entre les deux états.

**Commandes** (worktree `../wt-PORT-050`, après intégration de `refonte-2026`) :

```
npm run lint
✖ 4 problems (0 errors, 4 warnings)
```
(les 4 warnings `react-hooks/set-state-in-effect` sont préexistants, dans
`ThemeContext.tsx` / `useThemeColors.ts` / `useOnScreen.ts` — non touchés par
ce ticket)

```
npm run build
✓ Compiled successfully
✓ Generating static pages using 7 workers (15/15)
```

```
npx tsc --noEmit
(aucune sortie — 0 erreur)
```

**Vérification visuelle** (Guide 3D §4) : `npm run dev` (worktree, port 3000)
piloté par Chrome headless (`--headless=new --use-angle=swiftshader
--enable-unsafe-swiftshader`, profil temporaire dédié, port de debug CDP
dédié), script jetable en dehors du dépôt (WebSocket natif Node 24, aucune
dépendance). Home, section `#journey`, 1280×900 :
- Thème sombre et clair : les deux icônes 3D s'affichent, cadrées, formes
  lisibles (mallette : corps + poignée en demi-tore + bande/fermoirs verts ;
  toque : calotte + plateau losange + bouton/gland verts). Couleurs lisibles
  sur `--surface` clair et sombre. Captures faites (non jointes au dépôt,
  outil jetable hors dépôt).
- Console : aucune erreur/avertissement three/WebGL sur les deux thèmes
  (seule ligne `[error] 404` = favicon manquant, préexistant, sans rapport
  avec ce ticket).
- 360×800 : icône lucide (repli), aucune requête réseau contenant "three"
  (vérifié via CDP `Network.requestWillBeSent`, 20 requêtes, 0 correspondant).
- Navigation home → `/internships/safran` → home, 3 cycles : aucun
  avertissement "Too many active WebGL contexts" dans la console.
- FPS non mesuré : SwiftShare (rendu logiciel) non représentatif, comme prévu
  par le guide.
- Pause hors écran / reprise au retour : non vérifiée manuellement (comportement
  générique de `ThreeStage`, non modifié par ce ticket, déjà couvert par les
  tickets 3D précédents).

**Écarts** :
- Taille du conteneur `h-12` → `h-14` (choix explicitement laissé au ticket).
- Aucun autre écart par rapport aux étapes du ticket.

**Intégration `refonte-2026`** : `git merge refonte-2026` fait dans la
worktree après les commits ci-dessus (PORT-035/044/045/046/047/048 déjà
fusionnés entretemps, dont PORT-044 qui ajoute un canvas hero) ; merge sans
conflit (`ort` strategy). Re-vérifié lint/tsc/build après fusion (sorties
ci-dessus, relancées post-merge, toutes vertes). Vérification visuelle
supplémentaire post-merge (étape 3 du ticket) : home avec les 3 canvases
(globe du hero PORT-044 + toque + mallette) affichée en même temps, thème
sombre, 1280×900 — aucune erreur/avertissement WebGL dans la console.

## Notes pour la consolidation

Rien.
