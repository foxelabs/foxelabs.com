// Blog cover generator — the "tint fill" recipe from the 2026-09 redesign.
//
// Every cover is: a flat fill of the post's kit hue at 13% over the sunken
// surface, a small line-art pictogram drawn in the same hue (supporting
// shapes at 35–40%, exactly one full-strength element), and a mono slug in
// the hue at the bottom left. No text beyond the slug, no gradients.
//
// Run: node scripts/make-covers.mjs
// Writes 1600×900 SVGs (displayed on the site) and PNGs (share cards) into
// src/content/blog/covers/, overwriting in place.
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'src/content/blog/covers');
const fontDir = path.join(root, 'src/assets/fonts');

// The kit's chart hues — theme-invariant.
const HUE = {
  blue: '#4d6bfa',
  emerald: '#10c877',
  purple: '#9a5cf5',
  amber: '#f5a30b',
  red: '#ef3f52',
  cyan: '#0cb8c4',
  sky: '#1da8ee',
};

const BASE = '#121315'; // the kit's sunken surface

const hex = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
const mix = (fg, alpha, bg = BASE) => {
  const [fr, fgc, fb] = hex(fg.slice(1));
  const [br, bgc, bb] = hex(bg.slice(1));
  const ch = (f, b) => Math.round(f * alpha + b * (1 - alpha));
  return `#${[ch(fr, br), ch(fgc, bgc), ch(fb, bb)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

// Pictograms. Each draws inside a box centred at (800, 420); `h` is the full
// hue, `s` the supporting 38% tone (pre-mixed to solid over the ground).
const PICTOGRAMS = {
  // candlesticks with one full-hue candle
  candles: (h, s) => `
    <g stroke-linecap="round">
      <rect x="640" y="420" width="26" height="70" rx="7" fill="${s}"/>
      <line x1="653" y1="386" x2="653" y2="512" stroke="${s}" stroke-width="7"/>
      <rect x="712" y="380" width="26" height="70" rx="7" fill="${s}"/>
      <line x1="725" y1="352" x2="725" y2="470" stroke="${s}" stroke-width="7"/>
      <rect x="784" y="398" width="26" height="82" rx="7" fill="${h}"/>
      <line x1="797" y1="364" x2="797" y2="510" stroke="${h}" stroke-width="7"/>
      <rect x="856" y="350" width="26" height="66" rx="7" fill="${s}"/>
      <line x1="869" y1="326" x2="869" y2="438" stroke="${s}" stroke-width="7"/>
      <rect x="928" y="372" width="26" height="60" rx="7" fill="${s}"/>
      <line x1="941" y1="344" x2="941" y2="452" stroke="${s}" stroke-width="7"/>
    </g>`,
  // code lines + brackets, one full-hue token
  code: (h, s) => `
    <g>
      <rect x="600" y="360" width="150" height="24" rx="10" fill="${s}"/>
      <rect x="600" y="408" width="220" height="24" rx="10" fill="${s}"/>
      <rect x="632" y="456" width="130" height="24" rx="10" fill="${s}"/>
      <rect x="852" y="408" width="84" height="24" rx="10" fill="${h}"/>
      <g fill="none" stroke="${h}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="1000,368 962,420 1000,472"/>
        <polyline points="1042,368 1080,420 1042,472"/>
      </g>
    </g>`,
  // redirect: split arrow, one branch full-hue
  redirect: (h, s) => `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M600 420 H790" stroke="${s}" stroke-width="12"/>
      <path d="M790 420 C860 420 860 350 930 350 H1000" stroke="${s}" stroke-width="12"/>
      <path d="M790 420 C860 420 860 490 930 490 H1000" stroke="${h}" stroke-width="12"/>
      <path d="M975 325 L1005 350 L975 375" stroke="${s}" stroke-width="12"/>
      <path d="M975 465 L1005 490 L975 515" stroke="${h}" stroke-width="12"/>
      <circle cx="600" cy="420" r="12" fill="${s}" stroke="none"/>
    </g>`,
  // clock with a full-hue hand
  clock: (h, s) => `
    <g fill="none" stroke-linecap="round">
      <circle cx="800" cy="420" r="96" stroke="${s}" stroke-width="12"/>
      <line x1="800" y1="420" x2="800" y2="352" stroke="${s}" stroke-width="12"/>
      <line x1="800" y1="420" x2="856" y2="452" stroke="${h}" stroke-width="12"/>
      <circle cx="800" cy="420" r="10" fill="${h}" stroke="none"/>
      <path d="M948 330 L980 362" stroke="${s}" stroke-width="12"/>
      <path d="M652 330 L620 362" stroke="${s}" stroke-width="12"/>
    </g>`,
  // countdown timer: ring with full-hue arc
  timer: (h, s) => `
    <g fill="none" stroke-linecap="round">
      <circle cx="800" cy="432" r="92" stroke="${s}" stroke-width="12"/>
      <path d="M800 340 A92 92 0 0 1 892 432" stroke="${h}" stroke-width="12"/>
      <rect x="770" y="298" width="60" height="20" rx="8" fill="${s}" stroke="none"/>
      <circle cx="800" cy="432" r="8" fill="${h}" stroke="none"/>
      <line x1="800" y1="432" x2="836" y2="396" stroke="${h}" stroke-width="10"/>
    </g>`,
  // commit graph: line of dots, one full-hue
  commits: (h, s) => `
    <g fill="none" stroke-linecap="round">
      <path d="M600 468 L724 468 C764 468 764 372 804 372 L1000 372" stroke="${s}" stroke-width="10"/>
      <circle cx="640" cy="468" r="16" fill="${BASE}" stroke="${s}" stroke-width="9"/>
      <circle cx="724" cy="468" r="16" fill="${BASE}" stroke="${s}" stroke-width="9"/>
      <circle cx="880" cy="372" r="16" fill="${BASE}" stroke="${s}" stroke-width="9"/>
      <circle cx="972" cy="372" r="18" fill="${BASE}" stroke="${h}" stroke-width="10"/>
    </g>`,
  // two brackets shaking hands: brackets + full-hue plus
  friends: (h, s) => `
    <g fill="none" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="700,352 650,420 700,488" stroke="${s}"/>
      <polyline points="900,352 950,420 900,488" stroke="${s}"/>
      <g stroke="${h}">
        <line x1="800" y1="388" x2="800" y2="452"/>
        <line x1="768" y1="420" x2="832" y2="420"/>
      </g>
    </g>`,
  // validation bail: three checks, one full-hue cross stopping the run
  bail: (h, s) => `
    <g fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="618,420 646,448 694,392" stroke="${s}"/>
      <polyline points="756,420 784,448 832,392" stroke="${s}"/>
      <g stroke="${h}">
        <line x1="906" y1="392" x2="962" y2="448"/>
        <line x1="962" y1="392" x2="906" y2="448"/>
      </g>
      <line x1="1010" y1="380" x2="1010" y2="460" stroke="${s}"/>
    </g>`,
  // partial search: text bars + full-hue magnifier
  search: (h, s) => `
    <g>
      <rect x="600" y="368" width="180" height="26" rx="11" fill="${s}"/>
      <rect x="600" y="420" width="120" height="26" rx="11" fill="${s}"/>
      <rect x="600" y="472" width="150" height="26" rx="11" fill="${s}"/>
      <rect x="810" y="420" width="90" height="26" rx="11" fill="${s}"/>
      <g fill="none" stroke="${h}" stroke-width="12" stroke-linecap="round">
        <circle cx="946" cy="420" r="52"/>
        <line x1="984" y1="458" x2="1024" y2="498"/>
      </g>
    </g>`,
  // active sessions: rows with one full-hue live row
  sessions: (h, s) => `
    <g>
      <rect x="620" y="332" width="360" height="48" rx="12" fill="none" stroke="${s}" stroke-width="8"/>
      <circle cx="652" cy="356" r="9" fill="${s}"/>
      <rect x="680" y="348" width="160" height="16" rx="7" fill="${s}"/>
      <rect x="620" y="398" width="360" height="48" rx="12" fill="none" stroke="${h}" stroke-width="8"/>
      <circle cx="652" cy="422" r="9" fill="${h}"/>
      <rect x="680" y="414" width="200" height="16" rx="7" fill="${s}"/>
      <rect x="620" y="464" width="360" height="48" rx="12" fill="none" stroke="${s}" stroke-width="8"/>
      <circle cx="652" cy="488" r="9" fill="${s}"/>
      <rect x="680" y="480" width="130" height="16" rx="7" fill="${s}"/>
    </g>`,
  // incident postmortem: browser window + full-hue alert
  incident: (h, s) => `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="620" y="340" width="300" height="200" rx="16" stroke="${s}" stroke-width="10"/>
      <line x1="620" y1="392" x2="920" y2="392" stroke="${s}" stroke-width="10"/>
      <circle cx="652" cy="366" r="7" fill="${s}" stroke="none"/>
      <circle cx="680" cy="366" r="7" fill="${s}" stroke="none"/>
      <g stroke="${h}" stroke-width="12">
        <line x1="980" y1="440" x2="980" y2="500"/>
        <circle cx="980" cy="536" r="2" fill="${h}"/>
        <path d="M980 396 L1052 520 L908 520 Z" stroke-width="11"/>
      </g>
    </g>`,
};

// One entry per post: cover file name (unchanged, so frontmatter keeps
// working), hue, pictogram, slug.
const COVERS = [
  { file: 'cover-404-to-301-security-lesson.png', hue: 'red', art: 'incident', slug: '// security-postmortem' },
  { file: 'cover-404-to-301-v4.png', hue: 'blue', art: 'redirect', slug: '// custom-redirects' },
  { file: 'cover-auto-logout-inactive-users-wordpress.png', hue: 'emerald', art: 'clock', slug: '// auto-logout' },
  { file: 'cover-countdown-redirect-js.png', hue: 'amber', art: 'timer', slug: '// countdown-redirect' },
  { file: 'cover-wordpress-core-contribution.png', hue: 'sky', art: 'commits', slug: '// core-contribution' },
  { file: 'cover-from-enemies-to-best-friends.png', hue: 'purple', art: 'friends', slug: '// enemies-to-friends' },
  { file: 'cover-gold-scalpel.png', hue: 'amber', art: 'candles', slug: '// gold-scalpel' },
  { file: 'cover-laravel-bail.png', hue: 'red', art: 'bail', slug: '// laravel-bail' },
  { file: 'cover-partial-string-search-php.png', hue: 'purple', art: 'search', slug: '// str-search' },
  { file: 'cover-active-login-sessions-wordpress.png', hue: 'cyan', art: 'sessions', slug: '// active-sessions' },
];

const W = 1600;
const H = 900;

for (const c of COVERS) {
  const hue = HUE[c.hue];
  const ground = mix(hue, 0.13);          // the tint fill, flattened
  const support = mix(hue, 0.38, ground); // supporting shapes at 38% over it
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${ground}"/>
  ${PICTOGRAMS[c.art](hue, support)}
  <text x="64" y="836" font-family="Inconsolata" font-size="40" font-weight="500" fill="${hue}">${c.slug}</text>
</svg>`;
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: {
      fontFiles: [path.join(fontDir, 'inconsolata-500.ttf'), path.join(fontDir, 'inconsolata-700.ttf')],
      loadSystemFonts: false,
      defaultFontFamily: 'Inconsolata',
    },
  });
  // The SVG is what the site displays: vector, so it stays sharp at any
  // size and DPR. resvg's toString() outlines the slug text into paths, so
  // the file needs no font. The PNG stays for share cards, which need raster.
  const vector = resvg.toString();
  const png = resvg.render().asPng();
  const svgFile = c.file.replace(/\.png$/, '.svg');
  writeFileSync(path.join(outDir, svgFile), vector);
  writeFileSync(path.join(outDir, c.file), png);
  console.log(`${svgFile}  ${(vector.length / 1024).toFixed(1)} KB  ·  ${c.file}  ${(png.length / 1024).toFixed(0)} KB  (${c.hue})`);
}
