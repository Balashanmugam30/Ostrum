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
    name: 'Architecture Audit',
    price: '$2,500',
    period: 'one-time investment',
    description:
      'A deep diagnostic review of your current software, databases, and operational bottlenecks before writing a line of code.',
    features: [
      'Full technical workflow and operational mapping',
      'Database, spreadsheet, and API integration audit',
      'Clear architectural blueprint and system specification',
      'Executive presentation and phased deployment road-map',
      '100% credited toward build fees if you partner with Ostrum',
    ],
    ctaText: 'Book Architecture Audit ↗',
    ctaHref: '#brief',
  },
  {
    id: 'custom-build',
    name: 'Custom System Build',
    badge: 'MOST REQUESTED',
    featured: true,
    price: '$8,500+',
    period: 'per custom project',
    description:
      'End-to-end design, custom development, and deployment of your website, ERP, CRM, or WhatsApp automation system.',
    features: [
      'Bespoke brand identity and responsive UI/UX design',
      'Production Next.js 15 & PostgreSQL enterprise build',
      'Official WhatsApp Meta Cloud API and payment integrations',
      'Legacy spreadsheet data migration and hands-on staff training',
      '100% full source code and intellectual property ownership',
    ],
    ctaText: 'Start Custom Build ↗',
    ctaHref: '#brief',
  },
  {
    id: 'retainer',
    name: 'Dedicated Care Retainer',
    price: '$1,800',
    period: 'per month / no lock-in',
    description:
      'Ongoing engineering care, 24/7 uptime monitoring, security patching, and continuous feature enhancements as your business scales.',
    features: [
      '24/7 automated uptime and database health monitoring',
      'Continuous security, dependency, and performance updates',
      'Reserved senior developer hours each month for new features',
      'Priority 2-hour emergency response SLA',
      'Month-to-month commitment; cancel anytime without penalties',
    ],
    ctaText: 'Discuss Care Retainer ↗',
    ctaHref: '#brief',
  },
];
