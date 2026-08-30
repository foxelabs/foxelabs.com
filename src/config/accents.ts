// Per-item accent hues.
//
// The site's design system is ADS, whose accent ramp ships a `bold` cut that
// clears AA on white and a `soft` tint for fills. Everything here pairs those
// two so a hue can be used for text, icons, and backgrounds interchangeably.
//
// Red is deliberately absent: on a product card it reads as an error state.

import type { OSS_CATEGORIES, TRADING_CATEGORIES } from './tracks';

type CategorySlug = (typeof OSS_CATEGORIES)[number] | (typeof TRADING_CATEGORIES)[number];

export interface Accent {
  name: string;
  /** Text/icon colour — AA on white. */
  ink: string;
  /** Tint for fills and lozenge backgrounds. */
  soft: string;
  /** Pressed/darker cut, for text on a soft fill. */
  deep: string;
}

export const ACCENTS: Accent[] = [
  { name: 'blue',   ink: 'var(--b500)',             soft: 'var(--b50)',              deep: 'var(--b700)' },
  { name: 'green',  ink: 'var(--acc-green-bold)',   soft: 'var(--acc-green-soft)',   deep: 'var(--acc-green-bold)' },
  { name: 'purple', ink: 'var(--acc-purple-bold)',  soft: 'var(--acc-purple-soft)',  deep: 'var(--acc-purple-bold)' },
  { name: 'orange', ink: 'var(--acc-orange-bold)',  soft: 'var(--acc-orange-soft)',  deep: 'var(--acc-orange-bold)' },
  { name: 'teal',   ink: 'var(--acc-teal-bold)',    soft: 'var(--acc-teal-soft)',    deep: 'var(--acc-teal-bold)' },
];

/** Fixed hue per category, shared by the nav, category pages, and listings.
    Keyed on the slugs exported from tracks.ts — the compiler flags drift. */
const CATEGORY_ACCENT: Record<CategorySlug, string> = {
  plugins: 'blue',
  libraries: 'purple',
  'expert-advisors': 'green',
  tools: 'orange',
};

/**
 * Blog topics. Colour is keyed on the topic rather than on the individual post
 * so the filter row teaches the mapping — a green pill and a green post kicker
 * mean the same thing. Software and Trading match their track's category hues.
 */
const TOPIC_ACCENT: Record<string, string> = {
  Software: 'blue',
  Trading: 'green',
  Writing: 'purple',
};

const byName = (name: string) => ACCENTS.find((a) => a.name === name) ?? ACCENTS[0];

export function categoryAccent(category: string): Accent {
  return byName(CATEGORY_ACCENT[category as CategorySlug] ?? 'blue');
}

export function topicAccent(topic: string): Accent {
  return byName(TOPIC_ACCENT[topic] ?? 'teal');
}

/**
 * Hue for one item, taken from its position among its siblings so a listing
 * never repeats a colour until it runs past the palette. Both the category grid
 * and the item's own page derive it from the same ordered id list, so a card and
 * the page it opens always match.
 *
 * `ids` must be the siblings in their canonical (by `order`) sequence.
 */
export function accentFor(ids: string[], id: string): Accent {
  const i = ids.indexOf(id);
  return ACCENTS[(i < 0 ? 0 : i) % ACCENTS.length];
}

/**
 * Inline `style` that rebinds the sitewide --accent-* tokens for one subtree.
 * Anything already written against those tokens picks up the hue for free.
 */
export function accentVars(accent: Accent): string {
  return [
    `--accent: ${accent.ink}`,
    `--accent-ink: ${accent.ink}`,
    `--accent-deep: ${accent.deep}`,
    `--accent-soft: ${accent.soft}`,
    `--accent-btn: ${accent.ink}`,
    `--accent-press: ${accent.deep}`,
  ].join('; ');
}
