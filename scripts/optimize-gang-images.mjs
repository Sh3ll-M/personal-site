// One-off utility to optimize raw gang photos into web-ready WebP.
// Produces two sizes per photo: a grid thumbnail and a larger lightbox image.
//
// Requires sharp (not a project dependency): `npm install sharp --no-save`
//
// Usage:
//   node scripts/optimize-gang-images.mjs "<source-dir>" <gang-slug>
// Example:
//   node scripts/optimize-gang-images.mjs "C:/Users/Me/Downloads/Van Saar" van-saar
//
// Output: public/images/gangs/<slug>/{thumb,full}/NN.webp  (NN = 01, 02, ...)

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , sourceDir, slug] = process.argv;

if (!sourceDir || !slug) {
  console.error('Usage: node scripts/optimize-gang-images.mjs "<source-dir>" <gang-slug>');
  process.exit(1);
}

const THUMB_WIDTH = 700; // grid
const FULL_WIDTH = 1800; // lightbox

const outBase = path.join(process.cwd(), "public", "images", "gangs", slug);
const thumbDir = path.join(outBase, "thumb");
const fullDir = path.join(outBase, "full");
fs.mkdirSync(thumbDir, { recursive: true });
fs.mkdirSync(fullDir, { recursive: true });

const IMG_RE = /\.(jpe?g|png|heic|webp)$/i;
const sources = fs
  .readdirSync(sourceDir)
  .filter((f) => IMG_RE.test(f))
  .sort(); // filename sort — Pixel names are timestamped, so chronological

if (sources.length === 0) {
  console.error(`No images found in ${sourceDir}`);
  process.exit(1);
}

console.log(`Optimizing ${sources.length} photos for "${slug}"...`);

let i = 0;
for (const file of sources) {
  i += 1;
  const n = String(i).padStart(2, "0");
  const src = path.join(sourceDir, file);

  // .rotate() with no args applies EXIF orientation, then strips it.
  await sharp(src)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(path.join(thumbDir, `${n}.webp`));

  await sharp(src)
    .rotate()
    .resize({ width: FULL_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(fullDir, `${n}.webp`));

  console.log(`  ${file} -> ${n}.webp`);
}

console.log(`Done. Wrote ${sources.length} thumb + full pairs to ${path.relative(process.cwd(), outBase)}`);
