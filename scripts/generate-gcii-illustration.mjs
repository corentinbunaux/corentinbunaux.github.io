// Deterministic generator for the GCII / Enedis card illustration (PORT-032).
// Draws a stylised "Hexagone" crossed by a fictional power grid. No real data.
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? "assets/images-src/img/gcii-grid.svg";
const W = 1200, H = 675;
const BG = "#14202a", OUTLINE = "#a7bcc7", LINE = "#81a3a7", HV = "#f2c14e", NODE = "#e8eef1";

// Mulberry32: tiny seeded PRNG, so the file is identical on every run.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);

// Hexagon loosely shaped like mainland France (N, NE, E, SE, S, SW, W, NW).
const HEX = [[585,60],[830,150],[905,300],[870,500],[640,615],[400,585],[330,380],[250,235],[420,170]];

function inside([x, y]) {
  let hit = false;
  for (let i = 0, j = HEX.length - 1; i < HEX.length; j = i++) {
    const [xi, yi] = HEX[i], [xj, yj] = HEX[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const nodes = [];
let guard = 0;
while (nodes.length < 46 && guard++ < 10000) {
  const p = [230 + rand() * 700, 50 + rand() * 580];
  if (!inside(p)) continue;
  if (nodes.some(([x, y]) => Math.hypot(x - p[0], y - p[1]) < 55)) continue;
  nodes.push(p);
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const edges = new Set();
nodes.forEach((a, i) => {
  nodes.map((b, j) => [j, dist(a, b)]).filter(([j]) => j !== i)
    .sort((x, y) => x[1] - y[1]).slice(0, 3)
    .forEach(([j]) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
});

// The 7 nodes closest to fixed "hub" positions carry the high-voltage backbone.
const HUB_TARGETS = [[590,160],[780,250],[830,440],[620,540],[440,480],[380,300],[600,340]];
const hubs = HUB_TARGETS.map((t) => nodes.reduce((best, n, i) => (dist(n, t) < dist(nodes[best], t) ? i : best), 0));
const backbone = [];
for (let k = 0; k < 6; k++) backbone.push([hubs[k], hubs[(k + 1) % 6]]);
for (let k = 0; k < 6; k += 2) backbone.push([hubs[k], hubs[6]]);

const r = (v) => Math.round(v * 10) / 10;
const parts = [];
parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">`);
parts.push(`<title id="t">Stylised map of a power grid over mainland France (illustration, not real data)</title>`);
parts.push(`<rect width="${W}" height="${H}" fill="${BG}"/>`);
parts.push(`<polygon points="${HEX.map((p) => p.join(",")).join(" ")}" fill="${OUTLINE}" fill-opacity="0.06" stroke="${OUTLINE}" stroke-opacity="0.55" stroke-width="3" stroke-linejoin="round"/>`);
parts.push(`<g stroke="${LINE}" stroke-opacity="0.55" stroke-width="1.6">`);
for (const e of edges) { const [i, j] = e.split("-").map(Number); parts.push(`<line x1="${r(nodes[i][0])}" y1="${r(nodes[i][1])}" x2="${r(nodes[j][0])}" y2="${r(nodes[j][1])}"/>`); }
parts.push(`</g>`);
parts.push(`<g stroke="${HV}" stroke-width="3.5" stroke-linecap="round">`);
for (const [i, j] of backbone) parts.push(`<line x1="${r(nodes[i][0])}" y1="${r(nodes[i][1])}" x2="${r(nodes[j][0])}" y2="${r(nodes[j][1])}"/>`);
parts.push(`</g>`);
parts.push(`<g fill="${NODE}">`);
nodes.forEach(([x, y], i) => { if (!hubs.includes(i)) parts.push(`<circle cx="${r(x)}" cy="${r(y)}" r="4"/>`); });
parts.push(`</g>`);
parts.push(`<g fill="${BG}" stroke="${HV}" stroke-width="3">`);
for (const i of new Set(hubs)) parts.push(`<circle cx="${r(nodes[i][0])}" cy="${r(nodes[i][1])}" r="9"/>`);
parts.push(`</g>`);
parts.push(`</svg>`);

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, parts.join("\n") + "\n");
console.log(`wrote ${OUT}: ${nodes.length} nodes, ${edges.size} lines, ${new Set(hubs).size} hubs`);
