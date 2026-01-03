const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../src/assets/racewise-logo.png');
const outDir = path.resolve(__dirname, '../src/assets');

async function run() {
  if (!fs.existsSync(src)) {
    console.error('Source logo not found:', src);
    process.exit(1);
  }

  const img = sharp(src);
  const meta = await img.metadata();
  const width = meta.width || 1200;

  // Produce full-size WebP and AVIF
  await img
    .clone()
    .webp({ quality: 80 })
    .toFile(path.join(outDir, 'racewise-logo.webp'));

  await img
    .clone()
    .avif({ quality: 50 })
    .toFile(path.join(outDir, 'racewise-logo.avif'));

  // Produce a 600px wide responsive variant
  await img
    .clone()
    .resize({ width: Math.min(600, width) })
    .webp({ quality: 80 })
    .toFile(path.join(outDir, 'racewise-logo@600.webp'));

  await img
    .clone()
    .resize({ width: Math.min(600, width) })
    .avif({ quality: 50 })
    .toFile(path.join(outDir, 'racewise-logo@600.avif'));

  console.log('Generated webp/avif variants in', outDir);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
