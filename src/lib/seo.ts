/**
 * Structured data + shared SEO facts (PRD §9), built from the two JSON files
 * so nothing here can drift from the menu or the business config.
 *
 * Binding rules encoded here:
 *   - the ONLY rating that may appear is site.config.json's (real GBP value);
 *     v1's fabricated 4.9/120 + fake "Local Customer" reviews never come back
 *     (PRD §3).
 *   - the kitchen is 100% PURE VEG, so every MenuItem carries
 *     suitableForDiet: VegetarianDiet and servesCuisine includes "Vegetarian".
 *   - price range is COMPUTED from menu.json, never typed by hand.
 */
import {
  site,
  availableItems,
  availableCombos,
  categories,
  heroDish,
  displayName,
  displayDescription,
  imageFor,
  maxDeliveryKm,
} from './data';

/**
 * The canonical origin still lives in exactly one place — `SITE_URL` in
 * astro.config.mjs — which Astro re-exposes as `import.meta.env.SITE`.
 */
export const SITE_URL = String(import.meta.env.SITE).replace(/\/$/, '');

/** Off-site profiles — one place, used by both structured data and page links. */
export const LINKS = {
  zomato: 'https://link.zomato.com/xqzv/rshare?id=11990877930563aa9',
  swiggy: 'https://www.swiggy.com/direct/brand/710285?source=swiggy-direct&subSource=generic',
  maps: 'https://maps.app.goo.gl/t8u7p3cfaYEkj5JP8',
  instagram: site.business.instagram,
  whatsapp: `https://wa.me/${site.business.whatsapp}`,
  gbp: site.business.google_business_url,
} as const;

export const abs = (path: string) => new URL(path, SITE_URL).toString();

/** The face of the brand (PRD §3) — default OG image for every page. */
export const HERO_IMAGE = {
  // 1200x630 JPEG, not the catalogue WebP: WhatsApp/Twitter link previews
  // are unreliable with WebP, and WhatsApp is this brand's #1 share channel.
  url: abs('/static/images/og/og-default.jpg'),
  width: 1200,
  height: 630,
  alt: `${displayName(heroDish.display_name)} — ${site.business.name}, Sundargarh`,
};

export const LOGO_IMAGE = abs('/static/images/brand_images/The%20Oven%20vibe_logo.webp');

/* ---------- price range (computed, never hand-typed) ---------- */

const allPrices = [
  ...availableItems.map((i) => i.price),
  ...availableCombos.map((c) => c.combo_price),
];
export const LOW_PRICE = Math.min(...allPrices);
export const HIGH_PRICE = Math.max(...allPrices);
export const PRICE_RANGE = `₹${LOW_PRICE}–₹${HIGH_PRICE}`;

/* ---------- reusable graph fragments ---------- */

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const postalAddress = {
  '@type': 'PostalAddress',
  ...(site.business.address.street ? { streetAddress: site.business.address.street } : {}),
  addressLocality: site.business.address.locality,
  addressRegion: site.business.address.region,
  postalCode: site.business.address.postal_code,
  addressCountry: site.business.address.country,
};

const geo = {
  '@type': 'GeoCoordinates',
  latitude: site.business.address.latitude,
  longitude: site.business.address.longitude,
};

export const organization = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: site.business.name,
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: LOGO_IMAGE, width: 2362, height: 2362 },
};

/* ---------- Menu (generated from menu.json) ---------- */

export function menuJsonLd() {
  return {
    '@type': 'Menu',
    '@id': `${SITE_URL}/menu/#menu`,
    name: `${site.business.name} — full menu`,
    url: abs('/menu/'),
    inLanguage: 'en-IN',
    hasMenuSection: [
      ...categories.map(({ name, items }) => ({
        '@type': 'MenuSection',
        name,
        hasMenuItem: items.map((item) => ({
          '@type': 'MenuItem',
          name: displayName(item.display_name || item.item_name),
          description: displayDescription(item),
          image: abs(imageFor(item).webp),
          suitableForDiet: 'https://schema.org/VegetarianDiet',
          offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
          },
        })),
      })),
      {
        '@type': 'MenuSection',
        name: 'Combos & Offers',
        hasMenuItem: availableCombos.map((combo) => ({
          '@type': 'MenuItem',
          name: displayName(combo.combo_name),
          description: displayDescription(combo),
          image: abs(imageFor(combo).webp),
          suitableForDiet: 'https://schema.org/VegetarianDiet',
          offers: {
            '@type': 'Offer',
            price: combo.combo_price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
          },
        })),
      },
    ],
  };
}

/* ---------- Restaurant / LocalBusiness ---------- */

export function restaurantJsonLd(opts: { withMenu?: boolean } = {}) {
  const { withMenu = true } = opts;
  return {
    '@type': ['Restaurant', 'LocalBusiness'],
    '@id': `${SITE_URL}/#restaurant`,
    name: site.business.name,
    alternateName: `${site.business.name} Sundargarh`,
    description: `100% pure vegetarian cloud kitchen in Sundargarh, Odisha ${site.business.address.postal_code}. Oven-baked pizza, burgers, fried rice, pasta, grilled sandwiches and snacks for takeaway and delivery.`,
    url: `${SITE_URL}/`,
    image: [HERO_IMAGE.url, LOGO_IMAGE],
    logo: LOGO_IMAGE,
    telephone: site.business.phone,
    email: site.business.email,
    address: postalAddress,
    geo,
    hasMap: LINKS.maps,
    priceRange: PRICE_RANGE,
    currenciesAccepted: 'INR',
    servesCuisine: [
      'Vegetarian',
      'Pizza',
      'Burger',
      'Fried Rice',
      'Pasta',
      'Sandwich',
      'Fries',
      'Snacks',
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DAYS,
        opens: site.business.hours.open,
        closes: site.business.hours.close,
      },
    ],
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: geo,
      geoRadius: String(maxDeliveryKm * 1000),
      description: site.delivery.radius_note,
    },
    // Real GBP numbers only — see the header note and PRD §3.
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: site.rating.value,
      reviewCount: site.rating.count,
      bestRating: 5,
      worstRating: 1,
    },
    potentialAction: {
      '@type': 'OrderAction',
      target: { '@type': 'EntryPoint', urlTemplate: LINKS.whatsapp },
      deliveryMethod: [
        'https://schema.org/OnSitePickup',
        'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
      ],
    },
    makesOffer: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: LOW_PRICE,
      highPrice: HIGH_PRICE,
      offerCount: availableItems.length + availableCombos.length,
      availability: 'https://schema.org/InStock',
    },
    sameAs: [LINKS.instagram, LINKS.gbp, LINKS.zomato, LINKS.swiggy],
    ...(withMenu ? { hasMenu: menuJsonLd(), menu: abs('/menu/') } : { menu: abs('/menu/') }),
  };
}

/* ---------- page-level helpers ---------- */

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

export interface Qa {
  q: string;
  /** Plain text — must match what the page visibly says (Google requirement). */
  a: string;
}

export function faqPageJsonLd(pageUrl: string, qas: Qa[]) {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: qas.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function blogPostingJsonLd(post: {
  headline: string;
  description: string;
  path: string;
  image: string;
  datePublished: string;
}) {
  return {
    '@type': 'BlogPosting',
    '@id': `${abs(post.path)}#post`,
    headline: post.headline,
    description: post.description,
    url: abs(post.path),
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(post.path) },
    image: post.image,
    inLanguage: 'en-IN',
    datePublished: post.datePublished,
    author: organization,
    publisher: organization,
    isPartOf: { '@type': 'Blog', '@id': `${SITE_URL}/blog/#blog`, name: `${site.business.name} Blog` },
    about: { '@id': `${SITE_URL}/#restaurant` },
  };
}

/** Wrap page graphs into one `@graph` document (one script tag per page). */
export function graph(nodes: unknown[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
