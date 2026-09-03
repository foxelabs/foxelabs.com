// Generates public/social-banner.png (the OG / social share card).
// Run with:  node make-banner.js
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, 'public');

const W = 1280, H = 640;
const ICON = 360;

// Brand fonts first; fall back to whatever the rasterizer has installed.
const DISPLAY = "'Bricolage Grotesque', 'Space Grotesk', system-ui, sans-serif";
const BODY = "'Public Sans', 'IBM Plex Sans', system-ui, sans-serif";

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="30%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1F2937"/>
      <stop offset="100%" stop-color="#0B0F1A"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="480" y="295" font-family="${DISPLAY}" font-size="84" font-weight="700" fill="#F9FAFB">Foxe Labs</text>
  <text x="480" y="352" font-family="${BODY}" font-size="30" fill="#F59E0B">Lines of code, lines on the chart.</text>
  <text x="480" y="408" font-family="${BODY}" font-size="24" fill="#9CA3AF">Open-source software and trading tools, built in-house.</text>
</svg>`;

const icon = await sharp(path.join(pub, 'icon.png'))
  .resize(ICON, ICON, { fit: 'contain' })
  .toBuffer();

await sharp(Buffer.from(svg))
  .composite([{ input: icon, left: 90, top: (H - ICON) / 2 }])
  .png()
  .toFile(path.join(pub, 'social-banner.png'));

console.log('done ->', path.join(pub, 'social-banner.png'));
