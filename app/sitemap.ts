import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_CONFIG.baseUrl}/`,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_CONFIG.baseUrl}/terms-and-conditions`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_CONFIG.baseUrl}/privacy-policy`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
