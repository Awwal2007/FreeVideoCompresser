/**
 * JsonLd Component
 * Injects JSON-LD structured data into the page for SEO.
 * Supports: WebSite, SoftwareApplication, FAQPage, BreadcrumbList schemas.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const schemas = Array.isArray(data) ? data : [data];
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas)
      }}
    />
  );
}

/**
 * Pre-defined schema generators for common page types
 */
export const schemas = {
  /**
   * WebSite schema for homepage
   */
  website: (url: string = 'https://freefileconvert.com', name: string = 'FreeFileConvert') => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description: 'Free online video compressor and MP3 converter. No sign-up required.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }),

  /**
   * SoftwareApplication schema for tool pages
   */
  softwareApplication: (
    name: string,
    description: string,
    url: string,
    category: string = 'MultimediaApplication'
  ) => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory: category,
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250'
    },
    featureList: [
      'Free to use',
      'No registration required',
      'Supports MP4, MOV, AVI, MKV, WEBM',
      'Up to 500MB file size',
      'Automatic file deletion after 1 hour'
    ]
  }),

  /**
   * FAQPage schema
   */
  faqPage: (faqs: { question: string; answer: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }),

  /**
   * BreadcrumbList schema
   */
  breadcrumbs: (items: { name: string; url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }),

  /**
   * HowTo schema for tool instructions
   */
  howTo: (name: string, description: string, steps: { name: string; text: string; image?: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      url: '#step' + (index + 1),
      name: step.name,
      itemListElement: [{
        '@type': 'HowToDirection',
        text: step.text
      }],
      ...(step.image ? { image: step.image } : {})
    }))
  })
};
