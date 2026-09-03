import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import rehypeExternalLinks from 'rehype-external-links';
import { codeTheme, rehypeCodePanel } from './src/lib/codePanel.mjs';
import minifyInlineScripts from './src/lib/minifyInline.mjs';

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
