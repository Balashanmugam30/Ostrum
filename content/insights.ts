export interface InsightItem {
  id: string;
  slug: string;
  topic: string;
  readTime: string;
  title: string;
  excerpt: string;
  date: string;
}

export const insightsData: InsightItem[] = [
  {
    id: 'saas-fragmentation',
    slug: 'saas-fragmentation-bottleneck',
    topic: 'BUSINESS SYSTEMS',
    readTime: '6 MIN READ',
    title: 'Why five software subscriptions slow down your team instead of speeding them up.',
    excerpt:
      'Most off-the-shelf software tools are designed to keep you trapped in their proprietary ecosystem. How unified databases eliminate hours of manual copy-paste work.',
    date: 'October 2026',
  },
  {
    id: 'campus-automation',
    slug: 'campus-admissions-automation',
    topic: 'EDUCATION OPERATIONS',
    readTime: '8 MIN READ',
    title: 'Saving 300+ hours during admissions season: How modern schools run paperless.',
    excerpt:
      'Replacing paper application forms and manual bank transfers with automated WhatsApp communication and instant digital tuition fee receipts.',
    date: 'September 2026',
  },
  {
    id: 'retail-ai-agents',
    slug: 'practical-ai-for-retail',
    topic: 'PRACTICAL AUTOMATION',
    readTime: '5 MIN READ',
    title: 'What actually makes an AI assistant useful for retail and commerce.',
    excerpt:
      'Why generic chat widgets frustrate shoppers, and why connecting AI assistants directly to live multi-store inventory changes the entire customer experience.',
    date: 'August 2026',
  },
];
