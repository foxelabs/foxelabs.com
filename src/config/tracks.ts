// Single source of truth for tracks + their categories.
// Adding a category = add a key here and to the matching enum in content.config.ts.

export type Track = 'oss' | 'trading';

export interface CategoryMeta {
  /** Plural heading, e.g. "WordPress Plugins". */
  label: string;
  /** Short singular noun for chips/back-links, e.g. "Plugin". */
  singular: string;
  order: number;
}

interface TrackMeta {
  basePath: string;
  label: string;
  categories: Record<string, CategoryMeta>;
}

export const trackConfig: Record<Track, TrackMeta> = {
  // Internal key stays `oss` for stability; the user-facing track is "Software" —
  // the umbrella for WordPress plugins, PHP libraries, paid GPL addons, and future SaaS.
  oss: {
    basePath: '/software',
    label: 'Software',
    categories: {
      plugins:   { label: 'WordPress Plugins', singular: 'Plugin',  order: 1 },
      libraries: { label: 'PHP Libraries',      singular: 'Library', order: 2 },
    },
  },
  trading: {
    basePath: '/trading',
    label: 'Trading',
    categories: {
      'expert-advisors': { label: 'Expert Advisors', singular: 'Expert Advisor', order: 1 },
      tools:             { label: 'Trading Tools',   singular: 'Tool',           order: 2 },
    },
  },
};

/** Ordered [slug, meta] pairs for a track's categories. */
export function categoryList(track: Track): [string, CategoryMeta][] {
  return Object.entries(trackConfig[track].categories).sort(
    (a, b) => a[1].order - b[1].order
  );
}

export function categoryMeta(track: Track, category: string): CategoryMeta | undefined {
  return trackConfig[track].categories[category];
}

/** /software/plugins/404-to-301 */
export function projectPath(track: Track, category: string, slug: string): string {
  return `${trackConfig[track].basePath}/${category}/${slug}`;
}

/** /software/plugins */
export function categoryPath(track: Track, category: string): string {
  return `${trackConfig[track].basePath}/${category}`;
}

/** /software/plugins/loggedin/active-sessions */
export function addonPath(
  track: Track,
  category: string,
  slug: string,
  addon: string
): string {
  return `${trackConfig[track].basePath}/${category}/${slug}/${addon}`;
}
