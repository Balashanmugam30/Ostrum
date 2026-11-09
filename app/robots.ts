import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/preview/'],
      },
      // Search crawlers & user-directed AI retrieval explicitly allowed for discovery & citations
      {
        userAgent: [
          'OAI-SearchBot',
          'ChatGPT-User',
          'Claude-SearchBot',
          'Claude-User',
          'PerplexityBot',
        ],
        allow: '/',
        disallow: ['/api/', '/preview/'],
      },
      // Model training scrapers restricted to protect proprietary assets & brand content
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'CCBot', 'Bytespider'],
        disallow: ['/'],
      },
    ],
    sitemap: `${SITE_CONFIG.baseUrl}/sitemap.xml`,
  };
}
