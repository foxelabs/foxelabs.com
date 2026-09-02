// Share-card renderer: builds the 1200×630 Open Graph image for a page.
//
// Satori lays the card out from a React-element-shaped tree and returns SVG;
// resvg rasterises it to PNG, because X and Facebook will not render an SVG
// share image. Both run at build time only, so neither ships to the browser.
//
// The tree is written as plain objects rather than JSX so this stays a .ts
// file — Astro compiles .tsx with its own JSX runtime, which is not satori's.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Brand tokens, hard-coded because satori has no cascade to read them from.
// Keep in step with src/styles/global.css.
const INK = '#1D1E20';
const WHITE = '#FFFFFF';
const DIM = '#DDE3E9';
const FAINT = '#777A81';

/**
 * Card hues, keyed on the names in config/accents.ts so a card and the page it
 * opens carry the same colour. These are the DARK-theme cuts of each ramp: the
 * card ground is ink, and the light cuts are fills for white pages that vanish
 * against it. All four carry ink text at AA, which the lozenge needs.
 *
 * 'blue' is the brand hue's historical name — it resolves to lime, as it does
 * everywhere else since the rebrand.
 */
export const OG_ACCENTS = {
  blue: '#4C93EE',
  purple: '#C084EE',
  amber: '#FBBA47',
  lime: '#A9D66A',
} as const;

export type OgAccent = keyof typeof OG_ACCENTS;

// Resolved against the project root, not this module: the build bundles this
// file into dist/server, where a URL relative to import.meta.url no longer
// points at src/.
const asset = (path: string) => readFileSync(join(process.cwd(), path));

// Backgrounds are read once and kept as data URIs: satori has no loader, and
// several cards can share one file.
const dataUris = new Map<string, string>();
const dataUri = (path: string): string => {
  let uri = dataUris.get(path);
  if (!uri) {
    uri = `data:image/png;base64,${asset(path).toString('base64')}`;
    dataUris.set(path, uri);
  }
  return uri;
};

// Static instances cut from the Bricolage Grotesque variable font at the two
// weights the card uses. Satori cannot read woff2 (what fontsource ships) and
// does not apply variable axes, so the site's webfont is no use here.
const fonts = [
  { name: 'Bricolage', data: asset('src/assets/fonts/bricolage-400.ttf'), weight: 400 as const, style: 'normal' as const },
  { name: 'Bricolage', data: asset('src/assets/fonts/bricolage-800.ttf'), weight: 800 as const, style: 'normal' as const },
];

const MARK = 'public/mark-white.png';

/** Satori takes React elements; this is the smallest thing shaped like one. */
const el = (type: string, props: Record<string, unknown>, ...children: unknown[]) => ({
  type,
  props: { ...props, children: children.length > 1 ? children : children[0] },
  key: null,
});

/** Longer titles step down a size rather than wrapping to a fourth line. A
 *  card with artwork has a narrower column, so it steps down sooner. */
const titleSize = (title: string, narrow: boolean): number => {
  if (narrow) return title.length > 46 ? 46 : title.length > 28 ? 54 : 62;
  return title.length > 58 ? 52 : title.length > 34 ? 62 : 72;
};

/** Satori has no line clamp we can rely on, so trim on a word boundary. */
const clamp = (text: string, max: number): string => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.]$/, '')}…`;
};

export interface OgCard {
  /** Kicker above the title — the section, category or topic. */
  eyebrow: string;
  title: string;
  /** One line under the title. Trimmed to fit; omit rather than pad. */
  subtitle?: string;
  /** Accent name from config/accents.ts. Defaults to the brand hue. */
  accent?: OgAccent;
  /** Full-bleed artwork behind the card, as a project-root-relative path to a
   *  1200×630 PNG. It must already be dark enough to carry white type — the
   *  card lays no scrim over it. */
  background?: string;
}

function template({ eyebrow, title, subtitle, accent = 'blue', background }: OgCard) {
  const hue = OG_ACCENTS[accent] ?? OG_ACCENTS.blue;
  // Artwork sits on the right, so the copy gets a column rather than the width
  // of the card.
  const column = background ? '660px' : '1010px';
  return el(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: INK,
        padding: '68px 72px 76px',
        fontFamily: 'Bricolage',
      },
    },
    background
      ? el('img', {
          src: dataUri(background),
          width: OG_WIDTH,
          height: OG_HEIGHT,
          style: { position: 'absolute', left: 0, top: 0 },
        })
      : null,
    // Masthead. The mark is white already, so it needs no filter on ink.
    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '14px' } },
      el('img', { src: dataUri(MARK), width: 38, height: 38 }),
      el(
        'div',
        {
          style: {
            fontSize: '21px',
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: WHITE,
          },
        },
        'FOXE LABS'
      )
    ),
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: column } },
      // The lozenge is the only place a hue touches type, and it carries ink —
      // the brand rule is that the accent is a fill, never a text colour.
      el(
        'div',
        {
          style: {
            display: 'flex',
            background: hue,
            color: INK,
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            padding: '7px 14px',
            borderRadius: '4px',
            marginBottom: '26px',
          },
        },
        eyebrow
      ),
      el(
        'div',
        {
          style: {
            display: 'flex',
            fontSize: `${titleSize(title, Boolean(background))}px`,
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: '-0.025em',
            color: WHITE,
          },
        },
        clamp(title, 84)
      ),
      subtitle
        ? el(
            'div',
            {
              style: {
                display: 'flex',
                marginTop: '22px',
                fontSize: '27px',
                fontWeight: 400,
                lineHeight: 1.4,
                color: DIM,
              },
            },
            clamp(subtitle, 104)
          )
        : null
    ),
    el(
      'div',
      { style: { display: 'flex', fontSize: '22px', fontWeight: 400, color: FAINT } },
      'foxelabs.com'
    ),
    // Full-bleed rule along the bottom edge — the site's ink band with its
    // accent under it, at share-card scale.
    el('div', {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '14px',
        background: hue,
      },
    })
  );
}

export async function renderOgCard(card: OgCard): Promise<Buffer> {
  const svg = await satori(template(card) as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng());
}
