import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import rehypeExternalLinks from 'rehype-external-links';
import { codeTheme, rehypeCodePanel } from './src/lib/codePanel.mjs';
import minifyInlineScripts from './src/lib/minifyInline.mjs';

// Tag archives with fewer than two posts are noindexed by the template, so
// they must not be submitted in the sitemap either — "submitted URL marked
// noindex" is a Search Console error. The counts come straight from the blog
// frontmatter (same slugging as src/config/blog.ts tagSlug).
const tagSlug = (tag) =>
  tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const thinTagUrls = (() => {
  const counts = new Map();
  const dir = './src/content/blog';
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.mdx')) continue;
    const source = readFileSync(`${dir}/${file}`, 'utf8');
    if (/^draft:\s*true/m.test(source)) continue;
    const block = source.match(/^tags:\n((?:\s+-\s+.+\n)+)/m);
    if (!block) continue;
    for (const line of block[1].trim().split('\n')) {
      const slug = tagSlug(line.replace(/^\s*-\s*/, ''));
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return new Set(
    [...counts].filter(([, n]) => n < 2).map(([slug]) => `https://foxelabs.com/blog/tag/${slug}/`)
  );
})();

export default defineConfig({
  output: 'static',
  build: {
    // The stylesheet is one small shared bundle, so a separate request for it
    // costs a full round trip before the page can paint. Inlining it removes
    // that blocking request; the bytes are small enough that losing the
    // cross-page cache hit is the cheaper side of the trade.
    inlineStylesheets: 'always',
  },
  site: 'https://foxelabs.com',
  adapter: vercel(),
  integrations: [
    mdx(),
    // Trailing slashes match the canonicals we emit. No lastmod: a build-time
    // stamp marks every URL "changed" on every deploy, which teaches engines
    // to ignore it.
    sitemap({
      changefreq: 'weekly',
      filter: (url) => !thinTagUrls.has(url),
      serialize: (item) => ({
        ...item,
        priority: item.url === 'https://foxelabs.com/' ? 1.0
          : item.url.includes('/legal/') ? 0.3
          : 0.7,
      }),
    }),
    icon(),
    minifyInlineScripts(),
  ],
  // Open every external link in Markdown/MDX prose in a new tab, safely.
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      // Wrap the highlighted block in the same chrome-bar panel the hand-written
      // markup uses, so a fenced block in Markdown lands on the identical slab.
      rehypeCodePanel,
    ],
    // One theme, not two: the slab is dark in both site themes, so a light
    // variant would never be used. The theme paints the same five token colours
    // the --code-* custom properties carry.
    shikiConfig: {
      theme: codeTheme,
    },
  },
});
