// Central SEO constants + JSON-LD (schema.org) builders.
// Keeps structured data consistent and out of the page templates.

export const SITE = {
  name: 'Foxe Labs',
  url: 'https://foxelabs.com',
  // Square logo for Organization markup.
  logo: 'https://foxelabs.com/apple-touch-icon.png',
  // Default share banner (1280×640).
  banner: 'https://foxelabs.com/social-banner.png',
  twitter: '@foxelabs',
  locale: 'en_US',
  founder: 'Joel James',
} as const;

/** Absolute URL for a root-relative path. */
export const abs = (path: string): string =>
  path.startsWith('http') ? path : new URL(path, SITE.url).href;

/** Sitewide Organization node — rendered once, on every page. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
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
    name: SITE.name,
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
