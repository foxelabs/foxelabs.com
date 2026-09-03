// Blog taxonomy: topics and tags, and the archive URLs they resolve to.
//
// Two levels, deliberately different in weight:
//   Topic — one per post, derived from the post's `track`. A small, fixed set
//           (Software, Trading, Writing) with a written description, so each
//           archive is a real landing page rather than a filtered list.
//   Tag   — many per post, free-form in frontmatter. Cheap to add, so the
//           archives stay thin by design and carry no hand-written copy.

import type { CollectionEntry } from 'astro:content';
import { topicOf } from './tracks';

export type Topic = ReturnType<typeof topicOf>;

export interface TopicMeta {
  /** Slug used in the URL, e.g. 'software' → /blog/topic/software/. */
  slug: string;
  /** One line under the archive's title, and the page's meta description. */
  description: string;
  /** Keyword-first <title> lead; the template appends " | Foxe Labs". */
  seoTitle: string;
}

export const TOPIC_META: Record<Topic, TopicMeta> = {
  Software: {
    slug: 'software',
    description:
      'Posts on WordPress plugin development, PHP, and the open-source tools we build and maintain.',
    seoTitle: 'WordPress & PHP Development Articles',
  },
  Trading: {
    slug: 'trading',
    description:
      'Posts on expert advisor design, MQL5, risk, and running automated strategies on MetaTrader.',
    seoTitle: 'MQL5 & Expert Advisor Articles',
  },
  Writing: {
    slug: 'writing',
    description:
      'Everything else — notes on the craft, the studio, and lessons picked up along the way.',
    seoTitle: 'Notes from the Studio',
  },
};

export const TOPICS = Object.keys(TOPIC_META) as Topic[];

/** Archive URL for a topic label, e.g. 'Software' → '/blog/topic/software/'. */
export const topicPath = (topic: Topic): string => `/blog/topic/${TOPIC_META[topic].slug}/`;

/** Topic label for a URL slug, or undefined when the slug is not a topic. */
export const topicFromSlug = (slug: string): Topic | undefined =>
  TOPICS.find((t) => TOPIC_META[t].slug === slug);

/** URL-safe form of a free-form tag, e.g. 'Expert Advisors' → 'expert-advisors'. */
export const tagSlug = (tag: string): string =>
  tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Archive URL for a tag. */
export const tagPath = (tag: string): string => `/blog/tag/${tagSlug(tag)}/`;

/** Title case for a tag slug when no post spells it differently, e.g.
 *  'expert-advisors' → 'Expert Advisors'. Words with their own capitalisation
 *  (acronyms and brand names) come from the map, so a tag page never ships
 *  'Wordpress' or 'Xauusd' in its title. */
const CASED: Record<string, string> = {
  php: 'PHP', seo: 'SEO', mql5: 'MQL5', api: 'API', css: 'CSS', html: 'HTML',
  js: 'JS', sql: 'SQL', wp: 'WP', ai: 'AI', xauusd: 'XAUUSD',
  wordpress: 'WordPress', javascript: 'JavaScript', typescript: 'TypeScript',
  metatrader: 'MetaTrader', mysql: 'MySQL', github: 'GitHub', mt5: 'MT5', mt4: 'MT4',
};
export const tagLabel = (tag: string): string =>
  tagSlug(tag)
    .split('-')
    .map((w) => CASED[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

type Post = CollectionEntry<'blog'>;

export const postTopic = (post: Post): Topic => topicOf(post.data.track);

/** Every tag in use, deduped on slug, with its posts — newest first.
 *  Sorted by post count, then alphabetically, so listings are stable. */
export function tagIndex(posts: Post[]): { slug: string; label: string; posts: Post[] }[] {
  const map = new Map<string, { slug: string; label: string; posts: Post[] }>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = tagSlug(tag);
      if (!slug) continue;
      const entry = map.get(slug) ?? { slug, label: tagLabel(tag), posts: [] };
      entry.posts.push(post);
      map.set(slug, entry);
    }
  }
  return [...map.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.slug.localeCompare(b.slug)
  );
}
