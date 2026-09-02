// Every page's share card, in one list.
//
// The card set and the <meta og:image> that points at it are both built from
// this file, so a page can never advertise a card the build did not render.
// Static pages get share-written copy here rather than reusing their SEO
// title: a <title> is keyword-first for search, a share card is read by a
// person deciding whether to click.
//
// Card hues come from config/accents.ts by the same rules the pages use, so a
// card in a timeline is the colour of the page it opens.
import { getCollection } from 'astro:content';
import type { OgCard } from '../lib/og';
import { categoryMeta, categoryPath, projectPath, addonPath, topicOf, trackConfig } from './tracks';
import { accentFor, categoryAccent, topicAccent } from './accents';
import { TOPICS, TOPIC_META, postTopic, topicPath, tagIndex, tagPath } from './blog';
import type { OgAccent } from '../lib/og';

export interface OgEntry extends OgCard {
  /** Card path without the /og prefix or .png suffix, e.g. 'software/plugins'. */
  slug: string;
}

/** Card shown for anything without one of its own. */
export const OG_FALLBACK = '/og/index.png';

/** '/software/plugins/' → 'software/plugins'; '/' → 'index'. */
export const ogSlug = (pathname: string): string =>
  pathname.replace(/^\/|\/$/g, '') || 'index';

const STATIC_CARDS: OgEntry[] = [
  {
    slug: 'index',
    // Not 'Foxe Labs' — the masthead already says that, and a card should not
    // spend its one lozenge repeating itself.
    eyebrow: 'Software & Trading',
    accent: 'blue',
    background: 'src/assets/og/home-bg.png',
    title: 'Open-source software and trading tools',
    subtitle: 'WordPress plugins, PHP libraries, and precision MetaTrader software — built and used in-house.',
  },
  {
    slug: 'software',
    eyebrow: 'Software',
    accent: 'blue',
    title: 'WordPress plugins and PHP libraries',
    subtitle: 'Open source, GPL-licensed, documented, and maintained for years.',
  },
  {
    slug: 'trading',
    eyebrow: 'Trading',
    accent: 'orange',
    title: 'Expert advisors and trading tools',
    subtitle: 'Engineered for prop firm and serious retail traders.',
  },
  {
    slug: 'blog',
    eyebrow: 'Blog',
    accent: 'purple',
    title: 'Notes from the workshop',
    subtitle: 'Open-source software, expert advisor design, risk, and what we are building.',
  },
  {
    slug: 'about',
    eyebrow: 'About',
    accent: 'teal',
    title: 'A small studio that ships and keeps shipping',
    subtitle: 'Foxe Labs builds open-source tools and trading software, and runs on both.',
  },
  {
    slug: 'contact',
    eyebrow: 'Contact',
    accent: 'purple',
    title: 'Talk to the people who wrote it',
    subtitle: 'Support, licensing, or a custom build — every message reaches the studio directly.',
  },
  // The legal set stays on the brand hue: three near-identical cards in three
  // different colours would read as three different kinds of document.
  { slug: 'legal/privacy', eyebrow: 'Legal', title: 'Privacy Policy' },
  { slug: 'legal/terms', eyebrow: 'Legal', title: 'Terms of Service' },
  { slug: 'legal/refunds', eyebrow: 'Legal', title: 'Refund Policy' },
];

/** Every card the build should render, static pages and content alike. */
export async function ogEntries(): Promise<OgEntry[]> {
  const [projects, addons, posts] = await Promise.all([
    getCollection('projects', ({ data }) => !data.draft),
    getCollection('addons', ({ data }) => !data.draft),
    getCollection('blog', ({ data }) => !data.draft),
  ]);

  const categories: OgEntry[] = (Object.keys(trackConfig) as (keyof typeof trackConfig)[]).flatMap(
    (track) =>
      Object.keys(trackConfig[track].categories).flatMap((category) => {
        const meta = categoryMeta(track, category);
        if (!meta) return [];
        return [
          {
            slug: ogSlug(categoryPath(track, category)),
            eyebrow: trackConfig[track].label,
            title: meta.label,
            subtitle: meta.description,
            accent: categoryAccent(category).name as OgAccent,
          },
        ];
      })
  );

  // The same ordered sibling list the category grid walks, so a product's card
  // is the hue its listing card and its own page already use.
  const siblingIds = (track: string, category: string) =>
    projects
      .filter((p) => p.data.track === track && p.data.category === category)
      .sort((a, b) => a.data.order - b.data.order)
      .map((p) => p.id);

  const projectCards: OgEntry[] = projects.map((project) => {
    const { data } = project;
    return {
      slug: ogSlug(projectPath(data.track, data.category, project.id)),
      // The singular category noun ('Plugin', 'Expert Advisor') names the
      // thing better than the track does at card size.
      eyebrow: categoryMeta(data.track, data.category)?.singular ?? trackConfig[data.track].label,
      title: data.name,
      subtitle: data.tagline,
      accent: accentFor(siblingIds(data.track, data.category), project.id).name as OgAccent,
    };
  });

  // An add-on's card names its parent, since the add-on's own name means
  // little on its own in a timeline.
  const addonCards: OgEntry[] = addons.flatMap((addon) => {
    const parent = projects.find((p) => p.id === addon.data.parent);
    if (!parent || parent.data.track !== 'oss') return [];
    // Add-ons are hued among their own siblings, matching the cards on the
    // parent product's page.
    const ids = addons
      .filter((a) => a.data.parent === parent.id)
      .sort((a, b) => a.data.order - b.data.order)
      .map((a) => a.id);
    return [
      {
        slug: ogSlug(addonPath('oss', parent.data.category, parent.id, addon.id)),
        eyebrow: `${parent.data.name} add-on`,
        title: addon.data.name,
        subtitle: addon.data.tagline,
        accent: accentFor(ids, addon.id).name as OgAccent,
      },
    ];
  });

  const postCards: OgEntry[] = posts.map((post) => {
    const topic = topicOf(post.data.track);
    return {
      slug: `blog/${post.id}`,
      eyebrow: topic,
      title: post.data.title,
      subtitle: post.data.description,
      // Topic hue, not per-post: a pill in the blog filter row and a card in a
      // timeline mean the same thing when they are the same colour.
      accent: topicAccent(topic).name as OgAccent,
    };
  });

  // Blog archives. Both taxonomies get a card, so a shared topic or tag link
  // is not the only thing on the site falling back to the generic site card.
  const topicCards: OgEntry[] = TOPICS.filter((topic) =>
    posts.some((p) => postTopic(p) === topic)
  ).map((topic) => ({
    slug: ogSlug(topicPath(topic)),
    eyebrow: 'Blog',
    title: topic,
    subtitle: TOPIC_META[topic].description,
    accent: topicAccent(topic).name as OgAccent,
  }));

  const tags = tagIndex(posts);
  const tagOrder = tags.map((t) => t.slug);
  const tagCards: OgEntry[] = tags.map((tag) => ({
    slug: ogSlug(tagPath(tag.slug)),
    eyebrow: 'Tag',
    title: tag.label,
    subtitle: `${tag.posts.length} ${tag.posts.length === 1 ? 'post' : 'posts'} tagged ${tag.label}.`,
    accent: accentFor(tagOrder, tag.slug).name as OgAccent,
  }));

  return [
    ...STATIC_CARDS,
    ...categories,
    ...projectCards,
    ...addonCards,
    ...postCards,
    ...topicCards,
    ...tagCards,
  ];
}

// Built once per build and shared, so each page's lookup is not another pass
// over all four collections.
let cache: Promise<Map<string, OgEntry>> | undefined;

const bySlug = () =>
  (cache ??= ogEntries().then((entries) => new Map(entries.map((e) => [e.slug, e]))));

/** The share image for a page path, or the site card when it has none. */
export async function ogImageFor(pathname: string): Promise<string> {
  const slug = ogSlug(pathname);
  return (await bySlug()).has(slug) ? `/og/${slug}.png` : OG_FALLBACK;
}
