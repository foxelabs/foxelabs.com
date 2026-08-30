// Single source of truth for tracks + their categories.
// Adding a category = add a key here and to the matching enum in content.config.ts.

export type Track = 'oss' | 'trading';

// Category slugs as const tuples so content.config.ts derives its Zod enums
// and accents.ts keys from the same list — three copies used to drift.
export const OSS_CATEGORIES = ['plugins', 'libraries'] as const;
export const TRADING_CATEGORIES = ['expert-advisors', 'tools'] as const;

/** Blog topic label for a post's track. No track = general writing. */
export const topicOf = (track?: Track): 'Software' | 'Trading' | 'Writing' =>
  track === 'oss' ? 'Software' : track === 'trading' ? 'Trading' : 'Writing';

export interface CategoryMeta {
  /** Plural heading, e.g. "WordPress Plugins". */
  label: string;
  /** Short singular noun for chips/back-links, e.g. "Plugin". */
  singular: string;
  /** One line under the category page's title. Keep it to a single sentence. */
  description: string;
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
      plugins: {
        label: 'WordPress Plugins',
        singular: 'Plugin',
        description:
          'Free, GPL-licensed plugins running on over 100,000 active sites — each one small, documented, and maintained for years.',
        order: 1,
      },
      libraries: {
        label: 'PHP Libraries',
        singular: 'Library',
        description:
          'Composer packages we pulled out of our own plugins — dependency-light, tested, and useful on their own.',
        order: 2,
      },
    },
  },
  trading: {
    basePath: '/trading',
    label: 'Trading',
    categories: {
      'expert-advisors': {
        label: 'Expert Advisors',
        singular: 'Expert Advisor',
        description:
          'Automated MetaTrader 5 strategies, engineered risk-first and traded on our own accounts before anyone else sees them.',
        order: 1,
      },
      tools: {
        label: 'Trading Tools',
        singular: 'Tool',
        description:
          'The journal, indicators, and dashboards we build for our own desks — starting with TickerLog.',
        order: 2,
      },
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

/* Paths carry the trailing slash the canonicals use, so internal links never
   bounce through Vercel's 308 redirect. */

/** /software/plugins/404-to-301/ */
export function projectPath(track: Track, category: string, slug: string): string {
  return `${trackConfig[track].basePath}/${category}/${slug}/`;
}

/** /software/plugins/ */
export function categoryPath(track: Track, category: string): string {
  return `${trackConfig[track].basePath}/${category}/`;
}

/** /software/plugins/loggedin/active-sessions/ */
export function addonPath(
  track: Track,
  category: string,
  slug: string,
  addon: string
): string {
  return `${trackConfig[track].basePath}/${category}/${slug}/${addon}/`;
}
