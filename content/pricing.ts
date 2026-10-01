export interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  featured?: boolean;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

export const pricingData: PricingTier[] = [
  {
    id: 'audit',
    name: 'Architectural Diagnostic',
    price: 'Scoped Scope Review',
    period: 'one-time engagement',
    description:
      'A rigorous diagnostic review of your current software, databases, and operational bottlenecks before writing a line of code.',
    features: [
      'Comprehensive workflow and operational mapping',
      'Database schema, spreadsheet, and API integration audit',
      'System architecture blueprint and technical specification',
      'Executive presentation and phased deployment road-map',
      'Credited toward build fees upon proceeding with development',
    ],
    ctaText: 'Request Architecture Audit ↗',
    ctaHref: '#brief',
  },
  {
    id: 'custom-build',
    name: 'Custom System Build',
    badge: 'CORE STUDIO ENGAGEMENT',
    featured: true,
    price: 'Milestone-Based Investment',
    period: 'per custom architecture',
    description:
      'End-to-end design, custom engineering, and deployment of your bespoke digital platform, ERP, CRM, or automated workflow system.',
    features: [
      'Bespoke brand identity and responsive UI/UX system',
      'Production Next.js 15 & PostgreSQL enterprise architecture',
      'Official WhatsApp Meta Cloud API and payment integrations',
      'Legacy spreadsheet data migration and hands-on staff training',
      'Full source code and intellectual property ownership transfer',
    ],
    ctaText: 'Start Custom Build ↗',
    ctaHref: '#brief',
  },
  {
    id: 'retainer',
    name: 'Dedicated Studio Partnership',
    price: 'Retainer Alignment',
    period: 'ongoing / no vendor lock-in',
    description:
      'Continuous engineering stewardship, uptime monitoring, security patching, and iterative feature development as your business expands.',
    features: [
      'Automated uptime, performance, and database health monitoring',
      'Continuous security, dependency, and performance optimization',
      'Reserved senior engineering bandwidth each month for new features',
      'Direct priority engineering response for critical incidents',
      'Flexible commitment; scale or pause as your business requires',
    ],
    ctaText: 'Discuss Studio Partnership ↗',
    ctaHref: '#brief',
  },
];
