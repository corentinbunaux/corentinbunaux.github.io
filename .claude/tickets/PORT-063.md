---
id: PORT-063
title: "Hero — corriger la couleur de Groot et B-Rabbit (Eminem) en thème clair"
group: corentin
machine: asus_corentin
milestone: M8 — Recette utilisateur, 3e passe
status: ready
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
model: haiku
branch: fix/PORT-063-hero-icon-colors
depends_on: []
parallel_safe: true
human_checkpoint: "Regarder le hero en thème clair : Groot et B-Rabbit sont-ils lisibles ?"
created: 2026-10-02
---

# Hero — icônes Groot et B-Rabbit en thème clair

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin

> Les icônes Groot et Eminem n'ont pas les bonnes couleurs lorsque le thème
> light est activé. Il faut corriger le rendu car les icônes sont très
> grisées.

(« Eminem » = l'icône `bRabbit`, le personnage de Marshall Mathers dans
*8 Mile* — c'est son nom dans `heroIcons.js`.)

## Diagnostic (déjà fait, vérifié par capture)

`HeroGlobe.tsx` teinte **toutes** les icônes avec
`color: new THREE.Color(colors.mainText)` sur leur `SpriteMaterial` — ce qui
**multiplie** chaque pixel de la texture par cette couleur. Ça marche très
bien pour 13 des 15 icônes (silhouettes blanches pures, vérifié sur une
planche contact) : blanc × couleur du thème = la couleur du thème, exactement
l'effet voulu.

Mais `groot` et `bRabbit` ne sont **pas** des silhouettes pleines : ce sont
des dessins à deux teintes (fond blanc + traits noirs/gris pour les yeux, les
cheveux, le bonnet, les traits du visage). En thème clair,
`colors.mainText` est presque noir (`#1a1a1a`) : multiplier à la fois le
blanc ET les traits déjà sombres par une couleur presque noire écrase tout
vers le noir — on perd le contraste entre le fond et les traits, d'où l'effet
« très grisé » / illisible.

**La correction retenue** : pour ces deux icônes seulement, ne pas les
teinter. À la place, utiliser l'image normale en thème sombre et une **version
inversée** (déjà générée et vérifiée visuellement, voir ci-dessous) en thème
clair — l'inversion transforme exactement « fond blanc + traits sombres » en
« fond sombre + traits clairs », qui se lit bien sur un fond clair, avec le
même esprit que les 13 autres icônes (silhouette sombre sur fond clair).

## Fichiers (uniquement ceux-ci)

- `src/components/hero/heroIcons.js`
- `src/components/hero/HeroGlobe.tsx`

## Étapes

### 1. `heroIcons.js` — ajouter les deux versions inversées

Ajouter ces deux constantes à la fin du fichier, après `HERO_ICONS`
(ne pas toucher à `HERO_ICONS` lui-même) :

```js
/**
 * Groot et B-Rabbit (Eminem) ne sont pas des silhouettes pleines comme les
 * 13 autres icônes : ce sont des dessins à deux teintes (fond blanc + traits
 * sombres). La teinte uniforme par thème de HeroGlobe.tsx écrase ce contraste
 * en thème clair (PORT-063) — ces deux versions, inversées (fond sombre +
 * traits clairs), sont utilisées à la place en thème clair, sans teinte
 * supplémentaire. Générées une fois avec sharp (`.negate({preserveAlpha:true})`
 * sur les PNG sources de `HERO_ICONS`, alpha conservé) et vérifiées par
 * capture d'écran dans les deux thèmes.
 */
export const HERO_ICONS_INVERTED = {
  groot:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD+klEQVR4nNWZT0gUcRTHX3/AnfdmdHXxUBKBYliH8CDaH7QuEUiHugjuUcU8xV5EvawXD5JIJILUZUFBUCkhFXFF6qKiBHYIwkVhF12Cgv5ARVBhvGGVYZqZ/e3+ZmfyB49x5v1++74f329+vzczcHDMGxwc8waFDkBEbwDgR7Z+iqKsEtENRVFe/W8AXURUiYgvELEfES/xUVXVt6Z+9xAR2Mw+TwGam5tn7YQZrb6+Hrq7u7e4T1FRUYKIThr8/b4AcODGxkaIxWJXDABXrQCGh4dhaGgomunTZfLXeAagquoyEQ0iYgcHLy4uhu3tbZiYmLieEVdlFl9eXg6JRAImJycvapr2gYgUC8h+1wEA4Gc4HJ42XiOia+bgsVgM0um0DkFEqtnf1tam+9PpNITD4fNWGRKFEAbgVSIYDF7c2Ng4EY1GN/laMBj8TESnzYE7OjqOBFoJW1pa0n07OztQUVFhJx4YXhqgtLT0CxE94JustbVVDzw1NXWBfYj4zCpwTU2NI8Chb2BgwFZ8BqBSCoCXPiI6d/iDi4uLeuC9vT0OPmlx8x1ZJBJxBEilUlBdXZ0NoEEKwDx/m5qaYGZmRhcQj8fLrG5Qo/X29toCjI6OOorP2B1ZgCqnOSwgwNL29/ehtrZWpG+7LMA/Kwxbe3u7FMD4+Lho3x5ZAMtdlNdxXuvzBeCpKNKPiB7KAtjepLyT5gsgakT0VAogU3yBXS1TaABFUaZlAcYKLRIdTFXVuCzAcz8BEHFTCoDLBz8BNE17JwUQCAR2/ARQFCUpBQAA3/wEIKL3UgDcEPGmXwAlJSWfpAFUVX3pFwAAfJcG8DMLAPDbFQA/skACzwLCANwQMWgO0tLSAisrK7C7u6sf+TybMNExRHTfbYDawx/XNA1GRkaOnqy47i8rK4PV1VX9OvvNgsxj6urq9HKE/7YaI1JG5ARARHeNhdyhELa+vj4IhUKwtramn1sVeuYxLL6hoeHo3DiGH181TfvoNkDETozZRACcxhBRnaiuXKbQI7vpYDTRKZRlTG8hAGa9uolVVV12HYCItjxaPgMib7NzBuCXWB7tAbdENeUE4NWOTESDBQPwaEd+XTAAD7IQAoA/BQXIloWxsTFYWFjQX37xxra+vq4f+Zyvs99h+rTkqiev7wNOWWDBThsWlxsO/4AnngA4ZYHLCieAnp4eW4BAILDrCYBTFriom5+ftxQ/Nzen+y2mzilEfJyPjrwBnLLAIrlC5bmfTCb1I//nbcQTv8bPV4fUN7LMp9MzEmv+2VyXTVcBuPGDNyJ25gFwWVGUlGx81z6z5piN26FQ6KsbcV39TiyYjU4A+OVWTDg45g38FiDb/gLoKUBSD4zBIQAAAABJRU5ErkJggg==",
  bRabbit:
    "data:image/png;base64,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",
};
```

(Les deux chaînes ci-dessus sont les vrais fichiers inversés, déjà générés
et testés — les recopier exactement, ne pas essayer de les régénérer.)

### 2. `HeroGlobe.tsx` — utiliser l'inversée en thème clair, sans teinte, pour ces deux icônes

Lire le fichier entier d'abord.

- Importer `HERO_ICONS_INVERTED` en plus de `HERO_ICONS` :
  ```ts
  import { HERO_ICONS, HERO_ICONS_INVERTED } from "./heroIcons";
  ```
- `setupGlobe` reçoit déjà `colors` (depuis `ThreeStageContext`). Ajouter, au
  tout début de la fonction (avant la boucle `for (const ring of RINGS)`) :
  ```ts
  const isLightTheme = colors.mainText.toLowerCase() !== "#f5f5f5";
  const TWO_TONE_ICONS = new Set(["groot", "bRabbit"]);
  ```
  (`colors.mainText` vaut exactement `#f5f5f5` en thème sombre et `#1a1a1a`
  en thème clair — comparer à la valeur sombre connue évite de dupliquer un
  calcul de luminance alors qu'un simple test d'égalité suffit ici.)
- Dans la boucle `ring.icons.forEach((key, index) => { … })`, remplacer :
  ```ts
  const dataUrl = HERO_ICONS[key as keyof typeof HERO_ICONS];
  const texture = loader.load(dataUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    color: new THREE.Color(colors.mainText),
  });
  ```
  par :
  ```ts
  const isTwoTone = TWO_TONE_ICONS.has(key);
  const dataUrl = isTwoTone && isLightTheme
    ? HERO_ICONS_INVERTED[key as keyof typeof HERO_ICONS_INVERTED]
    : HERO_ICONS[key as keyof typeof HERO_ICONS];
  const texture = loader.load(dataUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    // Groot/B-Rabbit (PORT-063) are two-tone drawings, not plain silhouettes:
    // tinting them would crush their internal contrast, so they keep their
    // own colours (or the pre-inverted swap above) instead of the theme tint
    // every other icon gets.
    color: isTwoTone ? 0xffffff : new THREE.Color(colors.mainText),
  });
  ```

### 3. Vérifications

Procédure §4. Aucun navigateur interactif connecté : Chrome installé piloté
en headless (protocole DevTools, WebSocket natif Node 24, script jetable
hors dépôt, `--headless=new --use-angle=swiftshader
--enable-unsafe-swiftshader`, `--user-data-dir` dédié). Lancer `npm run dev`
en tâche de fond ; arrêter Chrome et le serveur **uniquement par leur PID
exact**, jamais par nom d'image.

1. `/` à 1280×900, thème sombre : Groot et B-Rabbit identiques à avant
   (blanc avec traits noirs/gris), toutes les autres icônes inchangées.
2. Basculer en thème clair : Groot et B-Rabbit se lisent maintenant (traits
   clairs sur fond sombre, comme un dessin inversé net, pas un bloc gris) ;
   les 13 autres icônes restent des silhouettes sombres sur fond clair,
   comme avant ce ticket.
3. Pas d'erreur console, pas de texture manquante (404 sur les data URLs
   impossible puisque ce sont des chaînes inline, mais vérifier qu'aucune
   icône n'apparaît vide/cassée).

Commit : `fix(hero): keep Groot and B-Rabbit readable in light theme`

## Critères d'acceptation

- [ ] Groot et B-Rabbit lisibles (traits visibles, pas un bloc gris) dans
      les deux thèmes.
- [ ] Les 13 autres icônes du hero sont inchangées.
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : deux icônes du hero (Groot, B-Rabbit) ne suivent pas la
  teinte générique par thème — elles ont leur propre variante inversée pour
  le thème clair, car ce sont des dessins à deux teintes, pas des
  silhouettes pleines comme les 13 autres.
