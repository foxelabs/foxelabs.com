import rss from '@astrojs/rss';
import { getCollection, render } from 'astro:content';
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer as getMDXRenderer } from '@astrojs/mdx';
import { postTopic } from '../config/blog';

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  // Full post bodies in the feed, rendered through the same MDX pipeline the
  // pages use, so readers get the article rather than a teaser.
  const container = await AstroContainer.create({
    renderers: await loadRenderers([getMDXRenderer()]),
  });
  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await render(post);
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
        author: `support@foxelabs.com (${post.data.author})`,
        categories: [postTopic(post), ...post.data.tags],
        content: await container.renderToString(Content),
      };
    })
  );

  return rss({
    title: 'Foxe Labs — Blog',
    description:
      'Notes on open-source software, expert advisor design, risk, and what Foxe Labs is building.',
    // The channel link should be the blog, not the site root; item links are
    // root-relative paths, so they resolve the same against either base.
    site: new URL('/blog/', context.site ?? 'https://foxelabs.com'),
    items,
    customData: '<language>en-us</language>',
  });
};
