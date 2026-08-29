// Central SEO constants + JSON-LD (schema.org) builders.
// Keeps structured data consistent and out of the page templates.

export const SITE = {
  name: 'Foxe Labs',
  url: 'https://foxelabs.com',
  // Square logo for Organization markup.
  logo: 'https://foxelabs.com/icon-512.png',
  // Default share banner (1280×640).
  banner: 'https://foxelabs.com/social-banner.jpg',
  twitter: '@foxelabs',
  locale: 'en_US',
  founder: 'Joel James',
} as const;

/** Absolute URL for a root-relative path.
 *  Paths are normalised to a trailing slash so every URL we emit in structured
 *  data matches the canonical the page renders — same entity, one identifier. */
export const abs = (path: string): string => {
  if (path.startsWith('http')) return path;
  const url = new URL(path, SITE.url);
  // Files (anything with an extension) keep their exact path.
  const isFile = /\.[a-z0-9]+$/i.test(url.pathname);
  if (!isFile && !url.pathname.endsWith('/')) url.pathname += '/';
  return url.href;
};

/** Sitewide Organization node — rendered once, on every page. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: 'FoxeLabs',
    url: SITE.url,
    logo: SITE.logo,
    description:
      'A one-person software studio building open-source WordPress tools and precision trading software.',
    founder: { '@type': 'Person', name: SITE.founder },
    sameAs: [
      'https://x.com/foxelabs',
      'https://github.com/foxelabs',
      'https://youtube.com/@foxelabs',
      'https://instagram.com/foxelabs',
      'https://www.facebook.com/foxelabs',
    ],
  };
}

/** Sitewide WebSite node — rendered once, on every page. */
export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    // `name` is the site name Google may show above the SERP title.
    name: SITE.name,
    alternateName: ['FoxeLabs', 'foxelabs.com'],
    url: SITE.url,
    publisher: { '@id': `${SITE.url}/#organization` },
    inLanguage: 'en',
  };
}

export interface Crumb {
  name: string;
  /** Root-relative path, e.g. '/software/plugins'. */
  path: string;
}

/** BreadcrumbList from an ordered list of crumbs. */
export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

interface SoftwareArgs {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offerPrice?: string; // '0' for free, or a number as string
  ratingValue?: string; // e.g. '4.9'
  ratingCount?: string; // e.g. '110'
  sameAs?: string[];
  /** Absolute URLs of product screenshots. */
  screenshot?: string[];
}

/** SoftwareApplication node for a product page. */
export function softwareApplicationLd(a: SoftwareArgs) {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: a.name,
    description: a.description,
    url: abs(a.url),
    applicationCategory: a.applicationCategory,
    operatingSystem: a.operatingSystem,
    publisher: { '@id': `${SITE.url}/#organization` },
  };
  if (a.sameAs?.length) node.sameAs = a.sameAs;
  if (a.screenshot?.length) node.screenshot = a.screenshot.map(abs);
  if (a.offerPrice != null) {
    node.offers = {
      '@type': 'Offer',
      price: a.offerPrice,
      priceCurrency: 'USD',
    };
  }
  if (a.ratingValue && a.ratingCount) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: a.ratingValue,
      ratingCount: a.ratingCount,
    };
  }
  return node;
}

interface ArticleArgs {
  headline: string;
  description: string;
  url: string;
  datePublished: string; // ISO
  dateModified?: string; // ISO
  authorName: string;
  image: string;
}

/** BlogPosting node for a blog post. */
export function articleLd(a: ArticleArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: a.headline,
    description: a.description,
    url: abs(a.url),
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    image: abs(a.image),
    author:
      a.authorName === SITE.name
        ? { '@id': `${SITE.url}/#organization` }
        : { '@type': 'Person', name: a.authorName },
    publisher: { '@id': `${SITE.url}/#organization` },
    mainEntityOfPage: abs(a.url),
  };
}

export interface FaqItem {
  q: string;
  /** Plain-text answer (no markup). Kept short and self-contained so answer
   *  engines and rich results can quote it directly. */
  a: string;
}

/** FAQPage node — powers Google's FAQ rich result and gives answer engines
 *  (ChatGPT, Perplexity, AI Overviews) clean, quotable Q&A pairs. */
export function faqLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

/** Person node for the About page. */
export function personLd(args: { name: string; url: string; image?: string; sameAs?: string[] }) {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: args.name,
    url: abs(args.url),
    worksFor: { '@id': `${SITE.url}/#organization` },
  };
  if (args.image) node.image = abs(args.image);
  if (args.sameAs?.length) node.sameAs = args.sameAs;
  return node;
}

/** WebPage node for a static page — mainly useful on policy pages, where
 *  answer engines want to know how current the terms they are quoting are. */
export function webPageLd(a: {
  name: string;
  description: string;
  url: string;
  dateModified: string; // ISO
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': abs(a.url),
    name: a.name,
    description: a.description,
    url: abs(a.url),
    dateModified: a.dateModified,
    isPartOf: { '@id': `${SITE.url}/#website` },
    publisher: { '@id': `${SITE.url}/#organization` },
    inLanguage: 'en',
  };
}

/** CollectionPage + ItemList for a listing page. Gives crawlers and answer
 *  engines the page's inventory in order, instead of leaving them to infer it
 *  from the card markup. */
export function collectionPageLd(a: {
  name: string;
  description: string;
  url: string;
  items: { name: string; path: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': abs(a.url),
    name: a.name,
    description: a.description,
    url: abs(a.url),
    isPartOf: { '@id': `${SITE.url}/#website` },
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: a.items.length,
      itemListElement: a.items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: abs(it.path),
      })),
    },
  };
}
