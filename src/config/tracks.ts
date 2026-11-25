// Single source of truth for the site's product sections.
//
// A section is one top-level door on the site: Software, Trading, Media. Each
// owns a base path, its categories, and the copy every shared surface needs
// (home and about cards, the nav menu, the footer column, share cards, the
// blog topic, llms.txt). Those surfaces loop over TRACK_LIST, so adding a
// section is:
//   1. add its id to TRACK_IDS and a TrackMeta entry below,
//   2. add its category tuple and a schema branch in content.config.ts,
//   3. give its categories a hue in accents.ts,
//   4. add its hub, category and product templates under src/pages/<basePath>/.
//
// The internal id is not the URL: `oss` is the Software section and lives at
// /software/. Ids are stored in content frontmatter (`track:`), so they never
// change; labels and copy can.

/** Section ids, in the order they appear across the site. */
export const TRACK_IDS = ['oss', 'trading', 'media'] as const;
export type Track = (typeof TRACK_IDS)[number];

// Category slugs as const tuples so content.config.ts derives its Zod enums
// and accents.ts keys from the same list — three copies used to drift.
export const OSS_CATEGORIES = ['plugins', 'libraries'] as const;
export const TRADING_CATEGORIES = ['expert-advisors', 'tools'] as const;
export const MEDIA_CATEGORIES = ['channels'] as const;

export interface CategoryMeta {
  /** Plural heading, e.g. "WordPress Plugins". */
  label: string;
  /** Short singular noun for chips/back-links, e.g. "Plugin". */
  singular: string;
  /** One line under the category page's title. Keep it to a single sentence. */
  description: string;
  /** Iconify name for the category's tile and menu column. */
  icon: string;
  order: number;
}

export interface TrackMeta {
  id: Track;
  /** User-facing name, e.g. "Software". */
  label: string;
  /** Hub URL without the trailing slash, e.g. "/software". */
  basePath: string;
  /** Iconify name for the section's door card and menu promo. */
  icon: string;
  /** CSS colour for the section's door card and menu promo. */
  hue: string;
  /** Uppercase micro-label on the door card, e.g. "Open source · GPL". */
  kicker: string;
  /** One paragraph for the section's door card on the home page. */
  summary: string;
  /** The categories in one line, e.g. "WordPress plugins · PHP libraries". */
  trail: string;
  /** Short hub description for llms.txt. */
  llms: string;
  /** Share card for the hub page. */
  share: { title: string; subtitle: string; accent: 'blue' | 'purple' | 'amber' | 'emerald' };
  /** The promo panel beside the columns in the header's mega menu. */
  promo: { eyebrow: string; meta: string; title: string; body: string; cta: string };
  /** Footer column links after the category links. */
  footer: { href: string; label: string }[];
  /** Blog topic for posts tagged with this section. */
  topic: string;
  categories: Record<string, CategoryMeta>;
}

export const trackConfig: Record<Track, TrackMeta> = {
  // Internal key stays `oss` for stability; the user-facing section is "Software" —
  // the umbrella for WordPress plugins, PHP libraries, paid GPL addons, and future SaaS.
  oss: {
    id: 'oss',
    label: 'Software',
    basePath: '/software',
    icon: 'mingcute:code-line',
    hue: 'var(--hue-emerald)',
    kicker: 'Open source · GPL',
    summary:
      'WordPress plugins and PHP libraries, GPL-licensed and maintained in the open since 2014 — years of public changelogs and support threads behind each one.',
    trail: 'WordPress plugins · PHP libraries · Apps',
    llms: 'All open-source WordPress plugins, PHP libraries, and apps.',
    share: {
      title: 'WordPress plugins and PHP libraries',
      subtitle: 'Open source, GPL-licensed, documented, and maintained for years.',
      accent: 'blue',
    },
    promo: {
      eyebrow: 'Open source',
      meta: '110,000+ installs · GPL',
      title: 'Every plugin and library in one place',
      body: 'GPL-licensed WordPress plugins and PHP packages, maintained in the open.',
      cta: 'Browse all software',
    },
    footer: [{ href: '/software/', label: 'All software' }],
    topic: 'Software',
    categories: {
      plugins: {
        label: 'WordPress Plugins',
        singular: 'Plugin',
        description:
          'Free, GPL-licensed plugins running on over 100,000 active sites — each one small, documented, and maintained for years.',
        icon: 'mingcute:plugin-2-line',
        order: 1,
      },
      libraries: {
        label: 'PHP Libraries',
        singular: 'Library',
        description:
          'Composer packages we pulled out of our own plugins — dependency-light, tested, and useful on their own.',
        icon: 'mingcute:box-2-line',
        order: 2,
      },
    },
  },
  trading: {
    id: 'trading',
    label: 'Trading',
    basePath: '/trading',
    icon: 'mingcute:chart-line-line',
    hue: 'var(--hue-amber)',
    kicker: 'Built by traders',
    summary:
      'Expert advisors and trading tools for MetaTrader 5, engineered like the software beside them — versioned, tested, and traded on our own accounts first.',
    trail: 'Expert advisors · Trading tools',
    llms: 'All MetaTrader 5 expert advisors and trading tools.',
    share: {
      title: 'Expert advisors and trading tools',
      subtitle: 'Engineered for prop firm and serious retail traders.',
      accent: 'amber',
    },
    promo: {
      eyebrow: 'Risk-first',
      meta: 'MetaTrader 5 · traded in-house',
      title: 'Engineering discipline, pointed at the markets',
      body:
        'Every system is tested before it ships. Trading carries substantial risk — nothing here is financial advice.',
      cta: 'Browse all trading',
    },
    footer: [{ href: '/trading/#waitlist', label: 'Waitlist' }],
    topic: 'Trading',
    categories: {
      'expert-advisors': {
        label: 'Expert Advisors',
        singular: 'Expert Advisor',
        description:
          'Automated MetaTrader 5 strategies, engineered risk-first and traded on our own accounts before anyone else sees them.',
        icon: 'mingcute:stock-line',
        order: 1,
      },
      tools: {
        label: 'Trading Tools',
        singular: 'Tool',
        description:
          'The journal, indicators, and dashboards we build for our own desks — starting with TickerLog.',
        icon: 'mingcute:tool-line',
        order: 2,
      },
    },
  },
  media: {
    id: 'media',
    label: 'Media',
    basePath: '/media',
    icon: 'mingcute:play-circle-line',
    hue: 'var(--hue-purple)',
    kicker: 'Researched · sourced',
    summary:
      'Channels we research, write, and produce in-house — short, true stories, fact-checked and published with their sources.',
    trail: 'Channels',
    llms: 'All Foxe Labs media channels.',
    share: {
      title: 'Channels and shows',
      subtitle: 'Short, true, fact-checked stories, researched and produced in-house.',
      accent: 'purple',
    },
    promo: {
      eyebrow: 'Fact-checked',
      meta: 'YouTube · Instagram · Facebook · X',
      title: 'Short, true stories, with their sources',
      body: 'Every story is researched, fact-checked, and published with the sources it came from.',
      cta: 'Browse all media',
    },
    footer: [{ href: '/media/', label: 'All media' }],
    topic: 'Media',
    categories: {
      channels: {
        label: 'Channels',
        singular: 'Channel',
        description:
          'Short-video channels with a website behind each one — every story researched, fact-checked, and sourced.',
        icon: 'mingcute:video-line',
        order: 1,
      },
    },
  },
};

/** Every section, in site order. Shared surfaces loop over this. */
export const TRACK_LIST: TrackMeta[] = TRACK_IDS.map((id) => trackConfig[id]);

/** Blog topic label for a post's section. No section = general writing. */
export const topicOf = (track?: Track): string => (track ? trackConfig[track].topic : 'Writing');

/** Ordered [slug, meta] pairs for a section's categories. */
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

/** /software/ */
export function trackPath(track: Track): string {
  return `${trackConfig[track].basePath}/`;
}

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
