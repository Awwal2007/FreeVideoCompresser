import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/tmp/'],
    },
    sitemap: 'https://freefileconvert.com/sitemap.xml',
  };
}
