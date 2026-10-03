/**
 * Generates the web-ready images served from `public/`.
 *
 * Why this exists: `next.config.mjs` uses `output: "export"`, which forces
 * `images: { unoptimized: true }`. Under that flag `next/image` emits neither a
 * `srcset` nor any format conversion, so no amount of component work produces
 * AVIF. The conversion has to happen at build time — here.
 *
 * Masters live in `assets/images-src/` and are never written to; every file
 * under `public/img` and `public/logos` is generated from them, which keeps the
 * script idempotent (re-running it reproduces the same bytes).
 *
 * Run with: npm run optimize:images
 */

import sharp from "sharp";
import { mkdir, readdir, copyFile, writeFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "assets", "images-src");
const OUT = path.join(ROOT, "public");
const MANIFEST = path.join(ROOT, "src", "data", "imageManifest.json");

/** Card thumbnails and the carousel never exceed ~800 CSS px; 1600 covers 2x. */
const MAX_WIDTH = 1600;
const AVIF = { quality: 50, effort: 6 };
const WEBP = { quality: 78 };

const DIRS = ["img", "logos"];

/**
 * `LOGO_SAFRAN_rvb.png` -> `safran`, `Quimesis1.png` -> `quimesis-1`.
 * Lowercase kebab-case, no `LOGO_` prefix, no colour-space suffix, and a dash
 * before a trailing index digit.
 */
function normalizeName(basename) {
  return basename
    .toLowerCase()
    .replace(/^logo_/, "")
    .replace(/_rvb$/, "")
    .replace(/_/g, "-")
    .replace(/([a-z])(\d+)$/, "$1-$2");
}

async function totalBytes(dir) {
  let sum = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    sum += entry.isDirectory() ? await totalBytes(full) : (await stat(full)).size;
  }
  return sum;
}

async function main() {
  const before = await totalBytes(SRC);
  const manifest = {};

  for (const dir of DIRS) {
    const srcDir = path.join(SRC, dir);
    const outDir = path.join(OUT, dir);

    // Rebuild from scratch so a renamed or deleted master cannot leave a stale
    // file behind in `public/`.
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    for (const file of (await readdir(srcDir)).sort()) {
      const ext = path.extname(file).toLowerCase();
      const name = normalizeName(path.basename(file, path.extname(file)));
      const key = `/${dir}/${name}`;

      if (ext === ".svg") {
        await copyFile(path.join(srcDir, file), path.join(outDir, `${name}.svg`));
        // Intrinsic size, so <OptimizedImage> can set width/height on the
        // <img> like the raster branch does and avoid layout shift while the
        // SVG downloads.
        const { width, height } = await sharp(path.join(srcDir, file)).metadata();
        manifest[key] = { svg: true, width, height };
        console.log(`  ${file} -> ${name}.svg (copied verbatim)`);
        continue;
      }

      const input = path.join(srcDir, file);
      // Trust sharp's sniffing, not the extension: `android.jpg` and
      // `quimesis.jpg` are actually WebP files.
      const meta = await sharp(input).metadata();
      const width = Math.min(meta.width, MAX_WIDTH);
      const height = Math.round((meta.height * width) / meta.width);

      const pipeline = () =>
        sharp(input).rotate().resize({ width, withoutEnlargement: true });

      await pipeline().avif(AVIF).toFile(path.join(outDir, `${name}.avif`));
      await pipeline().webp(WEBP).toFile(path.join(outDir, `${name}.webp`));

      manifest[key] = { width, height };
      console.log(
        `  ${file} (${meta.format} ${meta.width}x${meta.height}) -> ${name}.{avif,webp} ${width}x${height}`
      );
    }
  }

  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  const after = await totalBytes(OUT);
  const pct = (((before - after) / before) * 100).toFixed(1);
  console.log(
    `\nsources ${before} B -> public/ ${after} B  (-${pct}%, ${Object.keys(manifest).length} images)`
  );
}

await main();
