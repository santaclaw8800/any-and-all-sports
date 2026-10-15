import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const BG_COLOR = '#0a0a0a';
const AMBER = '#f59e0b';

function createSvg(size) {
  const fontSize = Math.round(size * 0.32);
  const yOffset = Math.round(size * 0.58);

  return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG_COLOR}"/>
  <text
    x="50%"
    y="${yOffset}"
    font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="${AMBER}"
    text-anchor="middle"
    letter-spacing="-0.02em">A&amp;S</text>
</svg>`);
}

const sizes = [
  { name: 'icon-1024.png', size: 1024 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generate() {
  for (const { name, size } of sizes) {
    const svg = createSvg(size);
    await sharp(svg)
      .png()
      .flatten({ background: BG_COLOR })
      .toFile(join(publicDir, name));
    console.log(`Generated ${name}`);
  }
}

generate().catch(console.error);
