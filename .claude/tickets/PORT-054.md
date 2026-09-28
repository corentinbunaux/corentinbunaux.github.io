---
id: PORT-054
title: "Safran — vaisseau redessiné (vraies ailes en X), visuel déplacé dans le contexte"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: ready
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

_(à remplir — inclure une capture avant/après du vaisseau)_

## Notes pour la consolidation

- ARCHITECTURE.md : le visuel Safran est en placement `"inline"`, posé dans
  le contexte de l'article, pas dans la section « Démo ».
