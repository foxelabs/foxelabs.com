import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE } from '../config/seo';
import { TOPICS, TOPIC_META, postTopic, topicPath } from '../config/blog';
import { categoryList, projectPath, trackPath, TRACK_LIST } from '../config/tracks';

// llms.txt — a plain-text map of the site for answer engines (ChatGPT,
// Perplexity, Claude, AI Overviews). Generated from the same collections the
// pages render, so it can never drift from what is actually published.
// Spec: https://llmstxt.org
export const GET: APIRoute = async () => {
  const [projects, posts, addons] = await Promise.all([
    getCollection('projects', ({ data }) => !data.draft),
    getCollection('blog', ({ data }) => !data.draft),
    getCollection('addons', ({ data }) => !data.draft),
  ]);

  const line = (name: string, path: string, note: string) =>
    `- [${name}](${path.startsWith('http') ? path : SITE.url + path}): ${note}`;

  const byCategory = (track: (typeof TRACK_LIST)[number]['id'], category: string) =>
    projects
      .filter((p) => p.data.track === track && p.data.category === category)
      .sort((a, b) => a.data.order - b.data.order)
      .map((p) => line(p.data.name, projectPath(track, p.data.category, p.id), p.data.summary));

  const sections = [
    `# ${SITE.name}`,
    '',
    '> Foxe Labs (legally Foxe Labs LLP) is a small software lab based in Kerala, India. It makes open-source WordPress plugins and PHP libraries, precision trading software for MetaTrader 5, and media: short, fact-checked story channels.',
    '',
    'Everything in the software section is open source and free. Premium plugin add-ons are sold through Freemius with a 7-day money-back guarantee. In the trading section, Gold Scalpel is live on the MQL5 Market; the remaining trading products are in development and available by waitlist. The media channels are free to watch on their own websites and social networks.',
    '',
    '## Hubs',
    ...TRACK_LIST.map((t) => line(t.label, trackPath(t.id), t.llms)),
    line('Blog', '/blog/', 'All posts, filterable by topic and tag.'),
    '',
    '## WordPress plugins',
    ...byCategory('oss', 'plugins'),
    '',
    '## Plugin add-ons',
    ...addons
      .sort((a, b) => a.data.order - b.data.order)
      .map((a) => {
        const parent = projects.find((p) => p.id === a.data.parent);
        const category = parent?.data.track === 'oss' ? parent.data.category : 'plugins';
        return line(a.data.name, `/software/${category}/${a.data.parent}/${a.id}/`, a.data.summary);
      }),
    '',
    '## PHP libraries',
    ...byCategory('oss', 'libraries'),
    '',
    '## Trading software',
    ...byCategory('trading', 'expert-advisors'),
    ...byCategory('trading', 'tools'),
    '',
    '## Media',
    ...categoryList('media').flatMap(([category]) => byCategory('media', category)),
    '',
    '## Writing',
    ...posts
      .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
      .map((p) => line(p.data.title, `/blog/${p.id}/`, p.data.description)),
    '',
    '## Blog topics',
    // Only topics with posts have an archive page.
    ...TOPICS.filter((t) => posts.some((p) => postTopic(p) === t)).map((t) =>
      line(`${t} posts`, topicPath(t), TOPIC_META[t].description)
    ),
    '',
    '## Company',
    line('About', '/about/', 'Who builds Foxe Labs, and how its sections fit together.'),
    line('Contact', '/contact/', 'Support, licensing, and custom build enquiries.'),
    line('Terms of Service', '/legal/terms/', 'Terms governing the site, licenses, and software.'),
    line('Privacy Policy', '/legal/privacy/', 'What data is collected, why, and who processes it.'),
    line('Refund Policy', '/legal/refunds/', '7-day no-questions-asked money-back guarantee on paid plugins.'),
    '',
    '## Optional',
    line('Documentation', 'https://docs.foxelabs.com', 'Product documentation.'),
    line('RSS feed', '/rss.xml', 'Full blog feed.'),
    '',
  ];

  return new Response(sections.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
