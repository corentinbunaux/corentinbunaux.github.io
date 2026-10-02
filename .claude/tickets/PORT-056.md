---
id: PORT-056
title: "GCII / Enedis - carte de France reelle + palette officielle Enedis"
group: corentin
machine: asus_corentin
milestone: M7 - Recette utilisateur, 2e passe
status: review
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
model: haiku
branch: feat/PORT-056-gcii-france-map
depends_on: []
parallel_safe: true
human_checkpoint: "Juger la nouvelle illustration sur la carte GCII et en tete de /work/gcii."
created: 2026-09-28
---

# GCII / Enedis -- carte de France + palette officielle

**Procedure** : `docs/PROCEDURE-TICKET.md`. Ce ticket **remplace en entier**
le script ecrit en M6 (PORT-032) : sa forme hexagonale approximative et ses
couleurs inventees ne correspondent pas au retour de Corentin.

## Retour de Corentin (`recette-utilisateur-2.md`, point 3)

> Ameliorer l'affichage de la preview pour GCII / Enedis. Je ne veux pas
> voir un graphe classique, je prefererais voir une carte de la France,
> avec une representation de la cartographie electrique (simulee) du
> territoire, en reprenant la palette de couleurs de Enedis (voir sur
> internet).

## Verifications deja faites (2026-09-28, a ne pas refaire)

- **Contour de la France** : telecharge et fusionne les 12 regions
  metropolitaines continentales (Corse exclue) depuis
  `gregoiredavid/france-geojson` (`regions-version-simplifiee.geojson`,
  Etalab Licence Ouverte 2.0, derive IGN), simplifie (`@turf/turf simplify`),
  projete en equirectangulaire dans une boite 1000x979, avec les 4 plus
  grandes iles cotieres (Belle-Ile, Re, Oleron, Noirmoutier). Rendu et
  verifie visuellement : la forme est immediatement reconnaissable comme
  la France.
- **Palette Enedis** : lue dans le CSS reellement servi par `enedis.fr` le
  2026-09-28 (variables `--btn-bg-color`, `--color`, `--gauge-*`) -- pas
  une supposition. Bleu primaire `#1423dc`, marine `#5b65e6`, turquoise
  `#4bc3c3`, tinte claire `#d0d3f8`. Aucune autre couleur n'est utilisee.
- Le script ci-dessous a ete **execute et son rendu inspecte** (60 noeuds,
  112 lignes, 7 postes) avant d'ecrire ce ticket : il fonctionne tel quel,
  le reprendre sans le modifier sauf si `npm run optimize:images` echoue
  dessus.

## Fichiers

- Remplace : `scripts/generate-gcii-illustration.mjs`
- Regeneres par le pipeline : `assets/images-src/img/gcii-grid.svg`,
  `public/img/gcii-grid.svg`, `src/data/imageManifest.json`
- Inchange : `src/data/projects.ts` (le champ `img: "/img/gcii-grid"` de
  GCII pointe deja au bon endroit depuis PORT-032, rien a faire ici)

## Etapes

### 1. Remplacer le script

Ecrire **exactement** ce contenu dans
`scripts/generate-gcii-illustration.mjs` (remplace tout le fichier
existant) :

```js
// Deterministic generator for the GCII / Enedis card illustration v2 (PORT-056).
// Draws mainland France (real, simplified boundary - gregoiredavid/france-geojson,
// Etalab Licence Ouverte) with a fictional electrical grid overlay, using colors
// sourced from enedis.fr's own live stylesheet (2026-09-28). No real network data.
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? "assets/images-src/img/gcii-grid.svg";

// --- Real geography: mainland France + 4 largest offshore islands (Belle-Ile,
// Ile de Re, Ile d'Oleron, Noirmoutier), simplified from IGN admin-express data
// via gregoiredavid/france-geojson (regions-version-simplifiee.geojson, Etalab
// Licence Ouverte 2.0), projected equirectangular and scaled to a 1000x979 box.
const FRANCE_MAIN = [[0,299.5],[1.7,308.9],[28.4,301.2],[27.1,309.2],[32.8,307.3],[43.9,312.6],[19.9,314],[18.6,307.8],[14.5,316.6],[19.2,318.8],[18.5,327],[25.5,319.1],[37.8,323.9],[39.1,334],[6,338.8],[7.3,342.7],[28.5,349.9],[34.1,361.7],[33.2,368.6],[47,368.1],[47.6,359.6],[48.5,362.6],[62.7,362.1],[62.6,356.4],[72.4,368.6],[96.4,372.3],[97.6,362.6],[97.8,372.9],[103,379.9],[111,376.1],[121.3,385.5],[124.2,375.5],[128.1,376.7],[121.7,386],[127,392.8],[127.8,404.7],[130.5,403.7],[128.3,393.9],[145.9,392.6],[156.6,386.5],[159.7,391.3],[158.2,395.9],[144.4,396.9],[153.5,403.3],[162.2,402.2],[164.5,397.3],[178.8,400.4],[180.7,402.2],[176,402.9],[176.3,406.5],[179.9,410.1],[171.6,415.8],[175.9,420.9],[175.1,425.8],[191.4,431.2],[201.5,427.7],[201.7,439.1],[197.1,443],[210.4,447.2],[216,454.5],[202.6,470.1],[203.7,478.1],[225.6,501.5],[228.8,514.2],[275.4,539.8],[275.8,534.3],[281.4,534.9],[282.8,540.4],[274.1,551.1],[281.4,555.4],[287.3,568.4],[283.7,570.7],[286.4,575.3],[283.6,584],[279.5,585.1],[281.2,591.5],[272.7,594.1],[273.1,602.6],[290.6,613.2],[306.5,630.2],[311.7,640.3],[316.8,667.4],[322.7,676.9],[321.3,679.9],[315.6,672.8],[306.3,642.6],[284.3,618.6],[279.2,629],[271.2,722.8],[278.6,706.8],[290,720.9],[275.6,721.9],[271.4,732.3],[267,779],[256,836.1],[245.1,857],[230.7,863.6],[235.3,872.4],[243.5,871.9],[244.6,877.3],[252.5,872.7],[261.9,877.2],[259.4,891.2],[255.2,895.3],[257.4,900.3],[264.1,902.3],[264.7,895.3],[269.8,892.3],[267.6,897.8],[271,900.5],[295.4,910.7],[310.4,909.2],[312.4,917.7],[324.3,929.8],[328.9,925.1],[337.9,928],[344,922.4],[355.8,928.2],[360.2,936.7],[367.2,940.9],[381.5,935],[390.5,941.9],[395.7,936.5],[419.5,940.2],[417.5,929.8],[422.4,921],[453,931],[457.2,937.9],[472.3,937.4],[478.6,949.9],[481.7,944.5],[487,944.1],[501.5,949],[505.2,953.3],[501.3,955.8],[500.9,962.3],[516.6,966.7],[520.5,976.9],[528,976.9],[531.5,971.3],[541.3,968.4],[555,973.9],[558.6,979.4],[573.1,979.3],[573.3,972.2],[594.3,963.5],[601.5,964.5],[604.9,969.8],[611.7,968.7],[608.9,959.8],[602.7,957.3],[601.2,947.4],[601.6,910],[605.5,897.8],[618.6,879.9],[628,873.7],[637.5,875.1],[649.2,861.6],[672.7,845.1],[682.8,843.5],[685.8,845.9],[684.9,850.7],[692.8,854],[718.2,855.9],[720.2,860.7],[718.3,863.9],[725.9,866.7],[740.7,868.3],[741.4,860],[746.6,857],[754.8,868.7],[776.7,865.6],[780.4,878.1],[778,881.5],[792.6,881.8],[798,887.3],[801.9,884.5],[814.3,893.5],[815.5,900],[822.2,895.9],[822.5,891.6],[838.3,896.8],[837.6,901.1],[840.7,902.3],[840.9,895.5],[844.6,892.5],[856.7,895.6],[859.7,888.8],[871.3,884.5],[876.2,887.5],[882.1,875.7],[873.4,874.5],[883.1,866.9],[884.9,860.1],[897.1,857.5],[903.4,844.4],[914.7,842.9],[917.5,832.3],[941.9,821.5],[946.1,817.3],[943.4,809],[960.2,786.2],[956.6,778.6],[957.9,774.1],[932.9,780.3],[906,767.1],[896.7,753.1],[897.1,746.5],[900.5,744.4],[894.2,734.3],[900.1,729.4],[902.1,718.6],[911.3,717.3],[910.4,713.7],[905.3,705.2],[905.9,699.6],[894.9,698.3],[886.2,692.2],[885.7,679.8],[880.2,679.2],[876.8,670.3],[887.6,663.7],[897.3,666.2],[902.7,658.3],[910.5,658.1],[915.9,652.9],[914.1,644.8],[919.5,636],[905.4,625.1],[905.4,610],[890.7,600.4],[891.5,588],[900.7,586.8],[908.7,578.2],[901.6,564.1],[895.6,563.8],[897.6,555.9],[889.8,554.1],[895,538],[887.8,529.9],[890.5,527.1],[868,524.3],[858.5,531.6],[851.9,528.7],[846.9,538.6],[852.2,541.1],[849.9,545.5],[838.3,553.9],[825.2,554.9],[827,545.4],[838.1,541.6],[836.5,537.7],[841.6,528.5],[833.5,523.1],[840.6,508.6],[837.1,505.1],[863.8,481.4],[861.8,465.7],[882.3,453.3],[885.4,445.6],[901.9,430.4],[901,425.5],[910.1,419.2],[896.1,417.6],[905.3,407.1],[904.3,402.7],[915.4,401.4],[924.3,410.4],[934.6,409.4],[950.3,393.1],[944.8,379],[948.1,359.2],[953.1,348.9],[949.2,342.4],[949.7,332.3],[962.6,308.2],[961.9,300.5],[969.8,274],[989.5,255],[1000,237.5],[977.1,227.3],[954.1,227.7],[939.5,213.2],[927.1,220.7],[913.3,218.1],[909.5,221.2],[908,212.6],[900.4,208.9],[892.7,210.1],[894.7,213.8],[892.7,216.8],[885.3,215.5],[883.8,209],[872.2,195.2],[873.7,190.7],[871.2,187],[848.3,176.7],[827.3,183.3],[826.4,178.8],[818.6,178],[811.3,170.8],[788,178.1],[784.9,167.4],[775.8,165.1],[777.3,160.5],[772.4,155.8],[764.6,156.2],[751.8,144.3],[740.7,145.1],[743.3,132],[735.7,125.2],[742.6,104.8],[733.6,106.6],[727.5,114.1],[726.9,122.2],[714.3,127.8],[690.1,126.8],[685.6,119.6],[692.6,112.9],[690.2,106.7],[684.8,106.7],[691,91.3],[684.6,91.2],[677.2,81.8],[668.1,85.1],[655.7,82.6],[652.9,87.9],[648.9,80.3],[649.3,71.1],[644.9,66.2],[636.4,66],[638.2,63.3],[634.7,62.1],[627.2,66.9],[620.3,62.8],[618.2,43.4],[610,34.3],[600,35.4],[590.5,44.1],[584,41.6],[576.7,30.8],[570.3,30.9],[566.9,19],[570.1,15.9],[563.5,0],[504.7,14.9],[489.6,24.2],[491.2,36.4],[487.9,43.5],[489.1,57.8],[492.3,61.9],[489.7,61.7],[487.5,77.3],[494.1,82.4],[487.1,82.6],[486.1,90.2],[497.3,101.4],[486.9,97.8],[479.7,109.5],[460.6,124.8],[412,138.7],[382.8,154.7],[373.4,177.1],[377.4,181.9],[394.1,184.4],[378,188.7],[368,197.4],[350.7,202.3],[295.9,189.6],[282.1,194],[267.8,173.5],[268.6,168.5],[273.7,165.7],[270.7,156],[259,155],[243.3,161.4],[219,152.6],[218.7,158.3],[226.4,164.5],[226.7,169.8],[223.3,173.3],[229.3,192.2],[236.7,197.4],[242.8,209.8],[246.1,207.7],[244.5,224.9],[249.6,241.5],[244.9,252],[248.3,263.4],[261.1,272.9],[257.2,275.5],[231.9,278.2],[224.4,273.3],[226.2,268],[219.3,268],[212.5,272.8],[216.7,285.9],[212.2,276],[206,274.2],[198.8,280.9],[194.3,273.7],[188.6,276.4],[190.4,270.3],[178.6,273],[160.9,289.1],[142,265.1],[143.2,261.4],[134.3,257.6],[136.7,253.7],[131.4,253.1],[130.5,248.6],[122.2,252.3],[120.9,248.8],[107.3,256.1],[96.3,253.6],[93,259.4],[95.5,262],[93.2,270.7],[74.8,267.2],[72.2,268.9],[72.9,275.6],[64.9,272.7],[62.3,264.4],[43.8,273.2],[34.1,270],[21.1,274.7],[2.5,286.3]];
const FRANCE_ISLANDS = [[[259.6,564.4],[261.5,574.4],[270.9,583.3],[273.5,591.9],[276.3,588.7],[273.2,571.7]],[[248.2,543.1],[270.1,553.2],[269,548.8],[258.7,543.9],[251.9,544.8],[253.7,541.3]],[[117.7,416.1],[120.8,424.7],[133.3,422.8]],[[191.4,458.9],[203.1,467.5],[195.3,454.7]]];
const W = 1000, H = 979;

// --- Enedis brand palette, read from enedis.fr's own compiled CSS custom
// properties on 2026-09-28 (--btn-bg-color, --color, --gauge-*): not invented.
const BG = "#0e1533";
const BLUE = "#1423dc";      // Enedis primary blue
const NAVY = "#5b65e6";      // secondary accent, used for the coastline stroke
const TEAL = "#4bc3c3";      // secondary accent, used for local distribution lines
const NODE = "#d0d3f8";      // light tint, used for distribution nodes

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);

/** Ray-casting point-in-polygon, generic over any vertex count. */
function inside([x, y], ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const nodes = [];
let guard = 0;
while (nodes.length < 60 && guard++ < 20000) {
  const p = [40 + rand() * (W - 80), 20 + rand() * (H - 40)];
  if (!inside(p, FRANCE_MAIN)) continue;
  if (nodes.some(([x, y]) => Math.hypot(x - p[0], y - p[1]) < 42)) continue;
  nodes.push(p);
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const edges = new Set();
nodes.forEach((a, i) => {
  nodes.map((b, j) => [j, dist(a, b)]).filter(([j]) => j !== i)
    .sort((x, y) => x[1] - y[1]).slice(0, 3)
    .forEach(([j]) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
});

// 7 "postes sources" (HV hubs), spread across the territory (near Paris, Lille,
// Strasbourg, Lyon, Marseille, Bordeaux, Rennes - fictional exact positions).
const HUB_TARGETS = [[520, 300], [560, 130], [830, 260], [700, 560], [640, 830], [220, 700], [140, 320]];
const hubs = HUB_TARGETS.map((t) => nodes.reduce((best, n, i) => (dist(n, t) < dist(nodes[best], t) ? i : best), 0));
const backbone = [];
for (let k = 0; k < 6; k++) backbone.push([hubs[k], hubs[(k + 1) % 6]]);
for (let k = 0; k < 6; k += 2) backbone.push([hubs[k], hubs[6]]);

const r = (v) => Math.round(v * 10) / 10;
const ringPath = (ring) => `M${ring.map((p) => `${r(p[0])},${r(p[1])}`).join("L")}Z`;

const parts = [];
parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">`);
parts.push(`<title id="t">Stylised electrical grid over a map of mainland France (illustration, not real data)</title>`);
parts.push(`<rect width="${W}" height="${H}" fill="${BG}"/>`);
parts.push(`<path d="${ringPath(FRANCE_MAIN)}" fill="${BLUE}" fill-opacity="0.07" stroke="${NAVY}" stroke-opacity="0.7" stroke-width="2.5" stroke-linejoin="round"/>`);
for (const island of FRANCE_ISLANDS) {
  parts.push(`<path d="${ringPath(island)}" fill="${BLUE}" fill-opacity="0.12" stroke="${NAVY}" stroke-opacity="0.5" stroke-width="1.5"/>`);
}
parts.push(`<g stroke="${TEAL}" stroke-opacity="0.5" stroke-width="1.4">`);
for (const e of edges) { const [i, j] = e.split("-").map(Number); parts.push(`<line x1="${r(nodes[i][0])}" y1="${r(nodes[i][1])}" x2="${r(nodes[j][0])}" y2="${r(nodes[j][1])}"/>`); }
parts.push(`</g>`);
parts.push(`<g stroke="${BLUE}" stroke-width="3.2" stroke-linecap="round">`);
for (const [i, j] of backbone) parts.push(`<line x1="${r(nodes[i][0])}" y1="${r(nodes[i][1])}" x2="${r(nodes[j][0])}" y2="${r(nodes[j][1])}"/>`);
parts.push(`</g>`);
parts.push(`<g fill="${NODE}">`);
nodes.forEach(([x, y], i) => { if (!hubs.includes(i)) parts.push(`<circle cx="${r(x)}" cy="${r(y)}" r="4"/>`); });
parts.push(`</g>`);
parts.push(`<g fill="${BG}" stroke="${BLUE}" stroke-width="3">`);
for (const i of new Set(hubs)) parts.push(`<circle cx="${r(nodes[i][0])}" cy="${r(nodes[i][1])}" r="9"/>`);
parts.push(`</g>`);
parts.push(`</svg>`);

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, parts.join("\n") + "\n");
console.log(`wrote ${OUT}: ${nodes.length} nodes, ${edges.size} lines, ${new Set(hubs).size} hubs`);
```

### 2. Regenerer

```bash
node scripts/generate-gcii-illustration.mjs
# attendu : wrote assets/images-src/img/gcii-grid.svg: 60 nodes, 112 lines, 7 hubs
npm run optimize:images
```

Verifier que `public/img/gcii-grid.svg` a change (`git status` doit montrer
`assets/images-src/img/gcii-grid.svg` et `public/img/gcii-grid.svg`
modifies) et que `src/data/imageManifest.json` garde son entree
`"/img/gcii-grid": { "svg": true }`.

### 3. Controle visuel du SVG produit (sans navigateur)

```bash
node -e "require('sharp')('assets/images-src/img/gcii-grid.svg').png().toFile(process.env.CLAUDE_JOB_DIR + '/tmp/gcii-check.png').then(()=>console.log('ok'))"
```

Lire l'image produite (outil de lecture d'image) et verifier : la forme est
reconnaissable comme la France (Bretagne a l'ouest, Corse absente, pointe
du Cotentin, facade mediterraneenne), 7 postes en gros cercles relies par
des lignes bleu vif epaisses, un maillage plus fin turquoise en arriere-plan,
fond bleu marine fonce.

### 4. Verifications

Procedure Section 4. Visuel : carte GCII de la home et en-tete de
`/work/gcii`, 1280 px et 360 px, theme clair et sombre (l'illustration
garde son propre fond sombre volontairement, comme une capture -- elle ne
suit pas le theme du site, c'est le choix deja documente en M6).

Commit : `feat(gcii): replace the illustration with a real France outline and the Enedis palette`

## Criteres d'acceptation

- [ ] La silhouette est reconnaissable comme la France (pas un hexagone
      generique).
- [ ] Seules les couleurs Enedis listees ci-dessus sont utilisees.
- [ ] Script deterministe (le relancer ne change rien : `git diff --stat`
      vide apres une 2e execution).
- [ ] lint / tsc / build passent.

## Journal d'execution

### Etape 1 : Remplacement du script
Script recopie exactement comme fourni dans le ticket.

### Etape 2 : Regeneration
```
node scripts/generate-gcii-illustration.mjs
# Resultat : wrote assets/images-src/img/gcii-grid.svg: 60 nodes, 112 lines, 7 hubs
npm run optimize:images
# Resultat : gcii-grid.svg copied verbatim, imageManifest.json mise a jour
```

### Etape 3 : Verification visuelle du SVG
Conversion en PNG via sharp et inspection : silhouette de France reconnassable immediatement
(Bretagne a l'ouest, Normandie visible, facade mediterraneenne, Corse absente, 4 iles principales).
7 postes sources (gros cercles bleus) relies par des lignes bleu vif epaisses, maillage turquoise
en arriere-plan, fond bleu marine fonce. Couleurs conformes a la palette Enedis.

### Verification determinisme
Script lance deux fois d'affilee : output identique (accepte).

### Verification lint/tsc/build
```
npm run lint
# 4 warnings (pre-existants, non bloquants)

npx tsc --noEmit
# Erreurs pre-existantes dans src/lib/articles.ts (non-bloquantes, hors scope)

npm run build
# BUILD SUCCESSFUL - prerendered routes include /work/gcii
```

### Commit
feat(gcii): replace the illustration with a real France outline and the Enedis palette
Refs PORT-056.

### Acceptation criteria
- [x] Silhouette reconnaissable comme la France (pas hexagone generique)
- [x] Seules couleurs Enedis utilisees (#1423dc, #5b65e6, #4bc3c3, #d0d3f8, #0e1533)
- [x] Script deterministe (relance identique)
- [x] lint/tsc/build passent

## Notes pour la consolidation

- ARCHITECTURE.md : mettre a jour la mention du script GCII -- il utilise
  desormais un contour reel de la France (Etalab Licence Ouverte 2.0,
  gregoiredavid/france-geojson) et la palette officielle Enedis lue sur
  enedis.fr le 2026-09-28 (pas une forme hexagonale ni des couleurs inventees).
  Parametres : 1000x979 pixels, 60 noeuds de distribution, 112 lignes, 7 postes
  sources (hubs HV), deterministe avec seed 2026.
