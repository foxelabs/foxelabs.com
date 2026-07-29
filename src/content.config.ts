import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared fields across both tracks.
const base = {
  name: z.string(),
  tagline: z.string(),
  // Short summary shown on listing cards.
  summary: z.string(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  draft: z.boolean().default(false),
};

// One collection, two shapes, discriminated on `track`.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.discriminatedUnion('track', [
    // ---- Trading tools (MT5 EAs, journal, indicators) ----
    z.object({
      ...base,
      track: z.literal('trading'),
      category: z.enum(['expert-advisors', 'tools']),
      status: z.enum(['live', 'waitlist', 'coming-soon']).default('coming-soon'),
      market: z.string(),
      platform: z.string(),
      price: z.string().optional(),
      features: z.array(z.string()).default([]),
      specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      ctaLabel: z.string().optional(),
      ctaUrl: z.string().optional(),
      // Secondary CTA, e.g. a free Strategy Tester demo on the MQL5 Market.
      demoUrl: z.string().url().optional(),
      demoLabel: z.string().optional(),
      docsUrl: z.string().url().optional(),
      // Defaults to /contact when unset.
      supportUrl: z.string().optional(),
      // Public live-results page, e.g. an MQL5 signal.
      signalUrl: z.string().url().optional(),
      version: z.string().optional(),
      // Commercial "what you get" lines shown in the pricing card.
      benefits: z.array(z.string()).default([]),
      // Icon grid summarising the product. Keeps the body copy short.
      highlights: z
        .array(z.object({ icon: z.string(), title: z.string(), body: z.string() }))
        .default([]),
    }),
    // ---- Open-source software (WordPress plugins, PHP libraries) ----
    z.object({
      ...base,
      track: z.literal('oss'),
      category: z.enum(['plugins', 'libraries']),
      status: z.enum(['stable', 'beta', 'active', 'archived']).default('active'),
      // e.g. 'WordPress Plugin', 'PHP Library'
      kind: z.string(),
      // e.g. 'PHP', 'JavaScript'
      language: z.string(),
      license: z.string().default('MIT'),
      // Canonical listing page (wp.org plugin page or Packagist package page).
      url: z.string().url().optional(),
      repo: z.string().url().optional(),
      docsUrl: z.string().url().optional(),
      changelogUrl: z.string().url().optional(),
      // Overrides the default /contact support button (e.g. an acquirer's forum).
      supportUrl: z.string().url().optional(),
      // composer vendor/package, npm name, or wp.org slug
      packageName: z.string().optional(),
      registry: z.string().optional(), // 'Packagist' | 'WordPress.org' | 'npm'
      minPhp: z.string().optional(),
      // Acquisition state. When true, the page shows an acquired notice and the
      // listing card gets an "Acquired" badge. acquiredBy names the new owner,
      // and acquiredUrl links their site from that name when set.
      acquired: z.boolean().default(false),
      acquiredBy: z.string().optional(),
      acquiredUrl: z.string().url().optional(),
      // Real metrics only — leave unset rather than guess. Rendered when present.
      installs: z.string().optional(),
      stars: z.string().optional(),
      rating: z.string().optional(),
      since: z.string().optional(),
      features: z.array(z.string()).default([]),
    }),
  ]),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Foxe Labs'),
    tags: z.array(z.string()).default([]),
    // Featured image shown on listing cards and atop the single post.
    // Path under /public (e.g. '/blog/my-cover.svg').
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    // Which track a post belongs to (for filtering + hub feed). Optional.
    track: z.enum(['oss', 'trading']).optional(),
    draft: z.boolean().default(false),
  }),
});

// Paid/free add-ons that extend a parent project (e.g. Loggedin's add-ons).
// Each gets its own page and is listed on the parent product page.
const addons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/addons' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    summary: z.string(),
    // Parent project id this add-on belongs to, e.g. 'loggedin'.
    parent: z.string(),
    // Where the add-on's UI appears, e.g. 'Sessions tab', 'Profile screen'.
    location: z.string().optional(),
    // 'free' | 'premium' — leave unset until pricing is confirmed.
    tier: z.enum(['free', 'premium']).optional(),
    price: z.string().optional(),
    // Purchase / marketing page.
    url: z.string().url().optional(),
    docsUrl: z.string().url().optional(),
    order: z.number().default(0),
    features: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog, addons };
