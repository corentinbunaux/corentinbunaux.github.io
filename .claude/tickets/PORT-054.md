---
id: PORT-054
title: "Safran — vaisseau redessiné (vraies ailes en X), visuel déplacé dans le contexte"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: review
resumeAt: null
priority: P1
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-054-safran-fighter-inline
depends_on: [PORT-053]
parallel_safe: true
human_checkpoint: "Regarder le vaisseau passer (vers 20 s) : ressemble-t-il davantage à un chasseur à ailes en X ?"
created: 2026-09-28
---

# Safran — vaisseau et placement

**Procédure** : `docs/PROCEDURE-TICKET.md` + `docs/GUIDE-3D.md`.

## Retours de Corentin (`recette-utilisateur-2.md`, points 4 et 5)

> Pour la preview de Safran, la carte prend la hauteur de 2 cartes
> traditionnelles. J'aimerais afficher le début de l'article […]

Ce point de la carte est traité par un **autre** ticket (PORT-057) qui
touche `projectsSection.jsx` — rien à faire ici pour ça.

> Pour l'article Safran, la démo n'est pas vraiment une démo de ce que j'ai
> produit chez Safran, donc il ne faut pas appeler l'affichage 3D démo.
> Cependant, il faudrait le conserver dans le contexte. Il faudra aussi
> revoir l'affichage du vaisseau spatial, car il ne ressemble pas du tout au
> X-wing de Star Wars.

## Diagnostic du vaisseau (fait le 2026-09-28, dans `buildFighter` de
`src/components/demos/SafranEarthDemo.tsx`)

```ts
const wing = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.07), hullMaterial);
wing.position.set(Math.cos(rad) * 0.06, -0.02, Math.sin(rad) * 0.06);
wing.rotation.y = rad;
```

Le fuselage est construit « vers l'avant » le long de l'axe **Y** local. La
grande dimension de l'aile (`0.34`) est **aussi** sur Y — donc parallèle au
fuselage, pas perpendiculaire. `wing.rotation.y` tourne l'aile **autour de
son propre grand axe** (un no-op visuel sur sa silhouette), et
`wing.position` ne la décale que de `0.06` sur le côté. Résultat : les 4
« ailes » sont 4 tiges fines collées contre le fuselage, jamais déployées —
c'est pour ça qu'on ne voit pas d'ailes en X.

## Fichiers (uniquement ceux-ci)

- Modifiés : `src/components/demos/SafranEarthDemo.tsx`,
  `src/i18n/namespaces/demos.ts` (uniquement les 2 légendes `safran-earth`),
  `src/components/demos/registry.ts` (uniquement l'entrée `safran-earth`)

## Étapes

### 1. Redessiner les ailes dans `buildFighter`

Remplacer la boucle `for (const deg of WING_ANGLES_DEG) { … }` entière par
une version où le **grand axe de l'aile est radial** (perpendiculaire au
fuselage), l'aile part d'une racine proche du fuselage et s'étend vers
l'extérieur, avec un petit canon au bout — c'est ce qui donnera enfin une
vraie silhouette en X :

```ts
const WING_ROOT = 0.05;   // distance fuselage -> racine de l'aile
const WING_LENGTH = 0.3;  // longueur de l'aile, vers l'extérieur
const WING_THICKNESS = 0.02;
const WING_CHORD = 0.09;  // largeur (corde) de l'aile

for (const deg of WING_ANGLES_DEG) {
  const rad = THREE.MathUtils.degToRad(deg);
  // Upper pair (45/315) fans up, lower pair (135/225) fans down: an X-wing silhouette.
  const tilt = (deg === 45 || deg === 315 ? 1 : -1) * THREE.MathUtils.degToRad(20);
  const centerDist = WING_ROOT + WING_LENGTH / 2;

  // Local box: long axis on X (radial), thin on Y, chord on Z — built flat,
  // then rotated so its own X axis points outward at angle `rad` in the XZ
  // plane, then fanned up/down by `tilt` around that same outward axis.
  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(WING_LENGTH, WING_THICKNESS, WING_CHORD),
    hullMaterial,
  );
  const outward = new THREE.Vector3(Math.cos(rad), 0, Math.sin(rad));
  wing.position.copy(outward).multiplyScalar(centerDist);
  wing.position.y -= 0.02;
  // Point local +X along `outward`, keeping local Y roughly vertical, then
  // fan the wing up/down around that same outward axis.
  const wingUp = new THREE.Vector3(0, 1, 0);
  const m = new THREE.Matrix4().makeBasis(
    outward,
    wingUp.clone().sub(outward.clone().multiplyScalar(wingUp.dot(outward))).normalize(),
    new THREE.Vector3().crossVectors(outward, wingUp).normalize(),
  );
  wing.quaternion.setFromRotationMatrix(m);
  wing.rotateX(tilt); // fan around the wing's own (now radial) local X axis
  model.add(wing);

  const cannon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8),
    hullMaterial,
  );
  cannon.position.copy(outward).multiplyScalar(WING_ROOT + WING_LENGTH + 0.05);
  cannon.position.y -= 0.02;
  cannon.quaternion.copy(wing.quaternion);
  cannon.rotateZ(Math.PI / 2); // cylinder's own axis (Y) -> along the wing's radial X
  model.add(cannon);

  const reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), glowMaterial);
  reactor.position.copy(outward).multiplyScalar(WING_ROOT + WING_LENGTH * 0.35);
  reactor.position.y -= 0.02 + 0.03 * Math.sign(tilt);
  model.add(reactor);
}
```

**Ce bloc est une base à corriger visuellement, pas un résultat garanti** :
la combinaison quaternion + `rotateX` locale peut donner une orientation
différente de l'intention en un seul essai. Après l'avoir écrit, capturer
la scène (étape 3) et, si les ailes ne se déploient pas clairement en X
perpendiculairement au fuselage :
1. Vérifier d'abord que `wing.position` s'éloigne bien du fuselage (la
   distance du centre de l'aile à l'axe du fuselage doit être
   `WING_ROOT + WING_LENGTH/2`, pas `0.06`).
2. Si l'orientation est fausse, remplacer l'approche `makeBasis` par la
   plus simple `wing.rotation.set(0, -rad, tilt)` (ou une combinaison
   d'essais avec `rotation.z`/`rotation.y` dans différents ordres) et
   recapturer — c'est un problème d'ordre d'Euler/de repère local, pas de
   géométrie : itérer sur les angles jusqu'à obtenir 4 ailes clairement
   étalées en X est attendu et fait partie du travail.
3. Après 2 essais infructueux sur l'orientation, garder la version qui
   donne le résultat le plus proche d'un X et documenter précisément ce qui
   cloche encore dans le journal, plutôt que d'en tenter un 3ᵉ.

Cible visuelle : de face, les 4 ailes doivent former un X net, chacune
sensiblement plus longue que large, avec un petit canon qui dépasse à son
extrémité — pas 4 tiges collées au fuselage.

### 2. Déplacer le visuel dans le contexte (dépend de PORT-053)

- `src/components/demos/registry.ts` : dans l'entrée `id: "safran-earth"`,
  ajouter `placement: "inline",` et `inlineClassName: "mx-auto aspect-video w-full max-w-md",`
  (rien d'autre ne change sur cette entrée).
- Comme Safran n'a que cette seule démo, la section « Démo » numérotée
  disparaîtra entièrement de sa page (comportement attendu : `DemoSection`
  ne rend rien s'il n'y a aucune entrée `placement: "demo"` pour cet href).

### 3. Légendes — `src/i18n/namespaces/demos.ts`

Remplacer uniquement les 2 légendes de `"safran-earth"` (ne toucher à rien
d'autre dans ce fichier) :

FR :
```
title: "Un clin d'œil à l'aérospatial",
caption:
  "Des satellites en orbite autour de la Terre, clin d'œil au secteur aérospatial de Safran — pas une reproduction de mon travail. Texture : NASA Blue Marble. Restez un peu : un visiteur inattendu finit par passer.",
```

EN :
```
title: "A nod to aerospace",
caption:
  "Satellites orbiting Earth, a nod to Safran's aerospace sector — not a recreation of my actual work there. Texture: NASA Blue Marble. Stay a while: an unexpected visitor eventually flies by.",
```

### 4. Vérifications

Procédure §4 + guide 3D §4 (Chrome headless, PID exact pour tout arrêt).
Sur `/internships/safran` : plus de section « Démo » ; le visuel apparaît
juste après le paragraphe de contexte, dans un cadre `aspect-video` de
taille modérée ; attendre ~20 s et capturer le passage du vaisseau ; juger
qu'il ressemble davantage à un chasseur à ailes en X (4 ailes visiblement
déployées, pas collées au fuselage).

Commit : `feat(safran): redesign the starfighter wings, move the visual into the context`

## Critères d'acceptation

- [ ] Les 4 ailes du vaisseau sont visiblement déployées en X, pas
      plaquées contre le fuselage.
- [ ] Le visuel apparaît dans le contexte de l'article Safran, sans le mot
      « Démo » ni numérotation.
- [ ] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

**Étape 1 (ailes)** : bloc du ticket repris tel quel (racine/longueur/corde
radiales via `makeBasis` + `rotateX`). Premier essai visuel concluant : pas eu
besoin de recourir à la solution de repli `rotation.set(0, -rad, tilt)`.
Vérifié au premier essai par capture (voir ci-dessous) : les ailes
s'éloignent bien du fuselage (`WING_ROOT + WING_LENGTH/2`, plus `0.06`) et,
vues de face (proche du début/fin du passage du vaisseau, quand la direction
de vol est la plus perpendiculaire à l'écran), forment un X net avec un
petit canon à l'extrémité de chaque aile. Vu de profil (milieu du passage,
vol perpendiculaire à la caméra), les 4 ailes projettent sur un disque
perpendiculaire au fuselage et apparaissent plus comme une ligne que comme
un X — c'est un effet de perspective attendu (le disque des ailes est vu
par la tranche), pas un défaut de construction : la géométrie est correcte,
seule la silhouette change avec l'angle de vue pendant le vol.

**Étape 2 (placement)** : `registry.ts`, entrée `safran-earth` →
`placement: "inline"` + `inlineClassName: "mx-auto aspect-video w-full
max-w-md"`. Rien d'autre changé sur cette entrée.

**Étape 3 (légendes)** : les 2 légendes FR/EN de `safran-earth` remplacées
par le texte du ticket, mot pour mot.

**Commandes lancées (worktree `../wt-PORT-054`)** :
- `npm ci` → OK (437 packages).
- `npm run lint` → `0 errors, 4 warnings` (avertissements pré-existants,
  aucun dans les fichiers touchés : `useThemeColors.ts` set-state-in-effect
  + 3 autres warnings hors scope).
- `npm run build` → `✓ Compiled successfully`, 15/15 pages statiques
  générées, `/internships/safran` présent.
- `npx tsc --noEmit` (après le build) → aucune sortie, propre.
- Re-exécuté les 3 commandes après le `git merge refonte-2026` de l'étape 6b
  (PORT-052/057/058/061 intégrés) : mêmes résultats (0 erreur, build OK,
  tsc propre).

**Vérification visuelle** (Chrome headless pilotée en DevTools Protocol,
script jetable hors dépôt, `--headless=new --use-angle=swiftshader
--enable-unsafe-swiftshader`, `--user-data-dir` dédié `scratchpad/p054/`,
port CDP 9354, PID racine arrêté explicitement en fin de session) :
1. `/internships/safran`, thème sombre et clair, 1280×800 : la section
   « Démo » a disparu (Safran n'a plus que cette démo, et elle est en
   placement `inline`) ; le visuel apparaît dans un cadre 16:9
   (`aspect-video max-w-md`) juste après le paragraphe de « Contexte », sans
   titre « Démo » ni numérotation, avec seulement la légende en petit texte
   en dessous. Recréé correctement au changement de thème (couleurs lisibles
   dans les deux cas).
2. Console (Runtime.consoleAPICalled / exceptionThrown) : aucune erreur ni
   avertissement three/WebGL sur `/internships/safran`, ni pendant 3
   allers-retours vers `/internships/kusmitea` et retour (aucune exception,
   pas de message « too many WebGL contexts »).
3. FPS : mesuré à ~21 fps sur ~5 s via le script de la procédure, mais
   **sous rendu logiciel swiftshader** (headless, pas de vrai GPU) — ce
   chiffre n'est pas comparable à la cible ≥ 50 fps « sur la machine de dev »
   visée par le guide 3D, qui suppose un rendu accéléré matériellement. Pas
   de régression de budget attendue : le changement n'ajoute qu'un petit
   cylindre (« canon ») par aile, soit 4 mesh et ~112 triangles
   supplémentaires (estimé par calcul de la géométrie, pas mesuré en
   direct : `CylinderGeometry` 8 segments ≈ 28 triangles chacun), négligeable
   devant le budget de 60 000 triangles.
4. Pause hors écran : comportement géré par `ThreeStage` (non modifié par ce
   ticket) ; confirmé indirectement en faisant varier le délai de scroll
   pendant les essais de cadrage du vaisseau (le chrono `elapsed` n'avance
   que lorsque le canvas est visible, cohérent avec `IntersectionObserver`
   déjà en place).
5. 3 allers-retours vers un autre projet et retour : aucune erreur, aucun
   avertissement « Too many active WebGL contexts ».
6. 360 px : testé le placement `inline` (pas le placement `demo` visé
   littéralement par le guide 3D §4.6). Résultat : l'onglet Réseau ne montre
   aucun chunk three/`SafranEarthDemo` (vérifié par interception
   `Network.requestWillBeSent`) — conforme. En revanche, `InlineVisual`
   (composant partagé, introduit par PORT-053, non modifié ici) n'affiche
   pas le message `t.demos.desktopOnly` à cette largeur : il rend un cadre
   vide (bordure + fond `bg-surface`) sans texte. C'est un comportement du
   composant partagé, pas une régression de ce ticket — note ajoutée
   ci-dessous pour la consolidation plutôt qu'une correction hors-ticket.

**Captures avant/après** (voir message de rapport à l'orchestrateur pour les
images) : avant = 4 tiges fines collées au fuselage (bug diagnostiqué dans
le ticket) ; après = 4 ailes radiales nettes formant un X, canon visible à
chaque extrémité, vues proches du nez du vaisseau (début/fin du passage).

**Écarts par rapport au ticket** :
- Le bloc de code du ticket a été reprises tel quel et a fonctionné dès le
  premier essai (pas eu besoin du repli `rotation.set` ni d'un 2e essai).
- Point 6 du guide 3D (message « écran large ») non vérifiable tel quel en
  placement `inline` : voir note ci-dessus, hors scope de ce ticket.

## Notes pour la consolidation

- ARCHITECTURE.md : le visuel Safran est en placement `"inline"`, posé dans
  le contexte de l'article, pas dans la section « Démo ».
- `InlineVisual` (`DemoSection.tsx`, introduit par PORT-053) ne montre
  aucun message de repli (`t.demos.desktopOnly`) à moins de 1024 px : il
  affiche un cadre vide. Le guide 3D §4.6 suppose le placement `"demo"`
  (`DemoStage`), qui lui affiche bien ce message. À uniformiser dans un
  futur ticket si on veut que tout visuel `inline` explique aussi pourquoi
  il est absent sur petit écran.
