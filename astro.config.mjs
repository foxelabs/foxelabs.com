import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  output: 'static',
  site: 'https://foxelabs.com',
  adapter: vercel(),
  integrations: [
    mdx(),
    // Trailing slashes match the canonicals we emit; lastmod tells crawlers
    // (and answer engines) when a page was last touched.
    sitemap({
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize: (item) => ({
        ...item,
        priority: item.url === 'https://foxelabs.com/' ? 1.0
          : item.url.includes('/legal/') ? 0.3
          : 0.7,
      }),
    }),
    icon(),
  ],
  // Open every external link in Markdown/MDX prose in a new tab, safely.
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
