// The accent quad.
//
// Four hues used as DECORATION only — the dot beside a chip, the field behind
// a card title, the rule above a CTA. None of them is a brand identity and
// none of them carries a track: emphasis on this site is structural (ink
// fills, hairline borders, a single link blue), so a hue is free to mean
// nothing more than "this item is not the one next to it".
//
// Every value resolves to a --acc-* token, which lightens on the dark theme.

import type { OSS_CATEGORIES, TRADING_CATEGORIES } from './tracks';

type CategorySlug = (typeof OSS_CATEGORIES)[number] | (typeof TRADING_CATEGORIES)[number];

export interface Accent {
  name: string;
  /** CSS colour — a var() reference, so it follows the theme. */
  color: string;
  /** Readable foreground on a solid field of this hue: white holds on the
      dark pair, the light pair needs ink. */
  ink: string;
}

export const ACCENTS: Accent[] = [
  { name: 'blue',   color: 'var(--acc-1)', ink: '#FFFFFF' },
  { name: 'purple', color: 'var(--acc-2)', ink: '#FFFFFF' },
  { name: 'amber',  color: 'var(--acc-3)', ink: 'var(--ink-band)' },
  { name: 'lime',   color: 'var(--acc-4)', ink: 'var(--ink-band)' },
];

/** Raw hex per hue, for contexts that cannot resolve a CSS variable —
    the share-card renderer, which rasterises outside the browser. */
export const ACCENT_HEX: Record<string, string> = {
  blue:   '#1A6BD6',
  purple: '#A95CE0',
  amber:  '#F9A50B',
  lime:   '#97C94E',
};

/** Fixed hue per category, shared by category pages and listings.
    Keyed on the slugs exported from tracks.ts — the compiler flags drift. */
const CATEGORY_ACCENT: Record<CategorySlug, string> = {
  plugins: 'blue',
  libraries: 'purple',
  'expert-advisors': 'amber',
  tools: 'lime',
};

/** Blog topics. Colour is keyed on the topic rather than the post, so a filter
    pill and a card field in the same hue mean the same thing. */
const TOPIC_ACCENT: Record<string, string> = {
  Software: 'blue',
  Trading: 'amber',
  Writing: 'purple',
};

const byName = (name: string) => ACCENTS.find((a) => a.name === name) ?? ACCENTS[0];

export function categoryAccent(category: string): Accent {
  return byName(CATEGORY_ACCENT[category as CategorySlug] ?? 'blue');
}

export function topicAccent(topic: string): Accent {
  return byName(TOPIC_ACCENT[topic] ?? 'lime');
}

/** Hex for a hue, for the share-card renderer. */
export function accentHex(accent: Accent): string {
  return ACCENT_HEX[accent.name] ?? ACCENT_HEX.blue;
}

/**
 * Hue for one item, taken from its position among its siblings so a listing
 * never repeats a colour until it runs past the quad. Both a grid and the page
 * it opens derive it from the same ordered id list, so a card and its page match.
 *
 * `ids` must be the siblings in their canonical (by `order`) sequence.
 */
export function accentFor(ids: string[], id: string): Accent {
  const i = ids.indexOf(id);
  return ACCENTS[(i < 0 ? 0 : i) % ACCENTS.length];
}
