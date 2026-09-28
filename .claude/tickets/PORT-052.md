---
id: PORT-052
title: "Hero — les icônes orbitent l'avatar (plus d'astre), couleur des icônes en thème clair"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: ready
resumeAt: null
priority: P1
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-052-hero-orbit-avatar
depends_on: []
parallel_safe: true
human_checkpoint: "Juger le nouveau panneau du hero à 1280 px, clair et sombre."
created: 2026-09-28
---

# Hero — orbite autour de l'avatar

**Procédure** : `docs/PROCEDURE-TICKET.md` + `docs/GUIDE-3D.md`.

## Retours de Corentin (`recette-utilisateur-2.md`, points 1 et 2)

> Agrandir et améliorer l'affichage du globe entouré d'icônes et de l'avatar :
> faire en sorte que l'avatar prenne la taille maximale sur la seconde
> moitié du profil, avec les icônes qui gravitent autour comme c'est le cas
> pour l'instant avec l'astre, mais ne plus afficher l'astre. Je veux que
> les icônes tournent autour de l'avatar à la place.

> Modifier la couleur des icônes qui tournent sur le profil lorsque le
> thème sélectionné est le thème clair. Les icônes sont blanches sur fond
> blanc […] en revanche ne rien toucher pour le thème sombre.

## Diagnostic (fait le 2026-09-28)

- `src/components/hero/HeroVisual.tsx` : le panneau droit affiche l'avatar
  (2/5 puis 38 % de large) **à côté** d'un globe filaire séparé (1/2 de
  large) qui porte les icônes en orbite. Il faut fusionner les deux :
  l'avatar devient le centre de l'orbite, occupe l'essentiel du panneau, et
  le globe filaire (`GlobeGeometry`/`LineSegments`) disparaît.
- `src/components/hero/heroIcons.js` : les 15 icônes sont des PNG en
  base64, silhouettes quasi blanches (`#f5f5f5` sur les pixels opaques,
  vérifié pixel par pixel). Elles ne sont PAS des couleurs de token : elles
  sont cuites dans l'image. Comme `THREE.SpriteMaterial.color` **multiplie**
  la texture, il suffit de fixer ce `color` sur le ton du thème pour que la
  silhouette blanche en prenne la teinte — aucune modification des PNG
  n'est nécessaire.

## Fichiers

- Modifié : `src/components/hero/HeroVisual.tsx`
- Remplacé : `src/components/hero/HeroGlobe.tsx` (garde son nom de fichier
  et son export `HeroGlobe`, mais son contenu change : plus de sphère
  filaire, les anneaux sont recentrés sur l'origine qui est maintenant
  visuellement le centre de l'avatar)

## Étapes

### 1. `HeroGlobe.tsx` — retirer l'astre, garder les anneaux

Lire le fichier entier d'abord. Puis :

- Supprimer tout le bloc qui construit `globeGeometry`/`globeMaterial`/
  `globe` (la sphère en fil de fer) et son `tiltGroup.add(globe)`. Le
  `tiltGroup` reste (il porte toujours les anneaux et la réaction au
  pointeur) mais ne contient plus que les groupes d'anneaux.
- Teinter chaque icône avec la couleur du thème : dans la boucle qui crée
  chaque `THREE.Sprite`, remplacer
  `const material = new THREE.SpriteMaterial({ map: texture, transparent: true });`
  par
  ```ts
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    color: new THREE.Color(colors.mainText),
  });
  ```
  (`colors` est déjà disponible dans `setupGlobe: ThreeStageSetup = ({ scene, camera, colors }) => {…}` — vérifier le nom exact du paramètre en lisant le fichier, ne pas le deviner.)
- Les rayons des anneaux (`RINGS[].radius`, actuellement 1.75 et 2.05) sont
  calibrés pour tourner autour d'un astre de rayon 1.1. Une fois l'astre
  supprimé et l'avatar agrandi (étape 2), ces rayons doivent grandir en
  proportion pour orbiter visiblement **autour** du cercle de l'avatar
  sans passer dessus ni s'en éloigner exagérément — augmenter les deux
  valeurs (par exemple ×1.3 à ×1.6, à ajuster par capture d'écran) et
  vérifier par une capture (étape 4) que les icônes ne recouvrent jamais le
  centre du panneau (où sera l'avatar).
- Le `MAX_TILT_RADIANS`/réaction au pointeur restent inchangés.

### 2. `HeroVisual.tsx` — l'avatar devient grand, seul, au centre ; les icônes en 3D par-dessus

Lire le fichier entier (il a des commentaires importants sur le
`justify-between`/`motion-reduce` à ne pas casser sans comprendre pourquoi).
Nouvelle structure : le panneau est un simple conteneur où l'avatar occupe
la quasi-totalité de la largeur/hauteur disponible, centré, et — quand le
gate 3D est actif — un calque `<HeroGlobe>` en position absolute, même
taille que le panneau, **derrière ou au même niveau** que l'avatar
(`pointer-events-none` sur ce calque pour ne jamais bloquer un clic
éventuel sur l'avatar), dont la caméra/le cadrage font que l'anneau
d'icônes apparaît visuellement autour du cercle de l'avatar.

```tsx
export function HeroVisual() {
  const t = useTranslation();
  const gate = useDesktopMotionGate();
  const { theme } = useTheme();
  const showGlobe = gate === "render";

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-second bg-surface lg:aspect-square lg:max-w-none lg:motion-reduce:justify-center">
      {showGlobe && (
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <HeroGlobe key={theme} />
        </div>
      )}
      <div className="relative aspect-square w-3/4 shrink-0 overflow-hidden rounded-full border-2 border-my-green bg-surface-raised lg:w-[70%]">
        <OptimizedImage
          src="/img/avatar"
          alt={t.hero.avatarAlt}
          priority
          sizes="(min-width: 1024px) 30vw, 60vw"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    </div>
  );
}
```

Points à ajuster par capture (ne pas se fier à ces chiffres au pixel près) :
- `aspect-square` sur le panneau entier (au lieu de `aspect-[4/3]`/
  `aspect-video`) puisqu'il n'y a plus deux zones côte à côte — vérifier que
  ça reste cohérent avec la maquette (`design/mockups/02-refonte.png`, zone
  ①) : l'important est que l'avatar soit net et grand, pas la forme exacte
  du panneau. Si un ratio différent rend mieux avec les nouveaux rayons
  d'anneaux, le choisir et le justifier dans le journal.
- `w-3/4 lg:w-[70%]` pour l'avatar : c'est le sens de « taille maximale »
  du retour, sans toucher le bord du panneau ni chevaucher l'anneau
  extérieur. Ajuster de pair avec les rayons de `RINGS` (étape 1).
- Les 3 petits points « étoiles » décoratifs existants peuvent rester ou
  être retirés selon ce qui rend le mieux avec le nouveau cadrage — au
  jugement, pas de contrainte du ticket là-dessus.
- Garder le principe déjà en place : l'avatar ne doit **jamais sauter** de
  position/taille quand le gate 3D passe de `pending` à `render` ou
  `fallback` (relire le commentaire existant sur `justify-between` avant de
  le supprimer — le remplacer par un mécanisme équivalent si la nouvelle
  disposition (avatar seul, centré, calque 3D en `absolute inset-0`) ne le
  nécessite plus, ce qui est probable ici puisque l'avatar ne change plus
  de conteneur flex entre les deux états).

### 3. Vérifications

Procédure §4 + guide 3D §4. Aucun navigateur interactif n'est connecté :
utiliser le Chrome installé piloté en headless via le protocole DevTools
(WebSocket natif Node 24, script jetable hors dépôt, `--headless=new
--use-angle=swiftshader --enable-unsafe-swiftshader`, `--user-data-dir`
dédié) sur `npm run dev`, comme dans les tickets 3D de la recette M6.
Arrêter Chrome/le serveur **uniquement par leur PID exact**, jamais par nom
d'image.

1. `/` à 1280×900, thème sombre puis clair : l'avatar est net, grand,
   centré ; les 15 icônes tournent en anneau visiblement autour de lui sans
   le recouvrir ni s'en détacher trop loin.
2. Thème clair : les icônes sont visibles (pas blanches sur fond clair) —
   comparer un pixel d'icône avant/après (capture + zoom, ou lecture directe
   du buffer de rendu si `Page.captureScreenshot` le permet).
3. 360 px : uniquement l'avatar, aucun chunk three chargé (comme avant).
4. Bouger la souris (`Input.dispatchMouseEvent`) : le panneau s'incline
   toujours légèrement.
5. Pas d'erreur console.

Commit : `feat(hero): orbit the icons around the avatar, tint them per theme`

## Critères d'acceptation

- [ ] Plus d'astre filaire séparé ; l'avatar est visuellement le centre de
      l'orbite et occupe la majorité du panneau.
- [ ] Icônes lisibles en thème clair ET sombre.
- [ ] Comportement desktop-only et anti-saut de mise en page conservés.
- [ ] Guide 3D §4, lint / tsc / build.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : le hero n'a plus de globe séparé ; les icônes orbitent
  directement l'avatar (`HeroGlobe.tsx` ne construit plus de sphère).
