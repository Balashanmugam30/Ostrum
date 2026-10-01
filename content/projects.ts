export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  badge: string;
  client: string;
  sector: string;
  description: string;
  stack: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  challenge: string;
  solution: string;
}

export const projectsData: ProjectItem[] = [
  {
    id: 'campus360',
    slug: 'campus360-erp',
    title: 'Campus360 Enterprise ERP',
    badge: 'Demonstration Case Study',
    client: 'St. Jude International Academy (5,000 Students)',
    sector: 'Higher & Secondary Education',
    description:
      'A unified campus administration platform synchronizing admissions, automated fee collection, parent WhatsApp updates, and student records into one reliable system.',
    stack: ['Next.js 15', 'PostgreSQL', 'Meta Cloud WhatsApp API', 'Tailwind CSS'],
    metrics: [
      { label: 'Admin Busywork Reduction', value: '85%' },
      { label: 'Inquiry Response Time', value: '310ms' },
      { label: 'Paper Forms Eliminated', value: '100%' },
    ],
    challenge:
      'Admissions staff spent 40+ hours weekly copying data from physical paper forms into Excel sheets, answering repetitive WhatsApp queries manually, and reconciling bank fee receipts by hand.',
    solution:
      'Engineered an edge-deployed portal with instant WhatsApp automated prospect responses, integrated Razorpay/Stripe tuition fee settlement, and role-based student record management.',
  },
  {
    id: 'aura-living',
    slug: 'aura-living-commerce',
    title: 'Aura Living Multi-Store Commerce',
    badge: 'Demonstration Case Study',
    client: 'Aura Home & Lifestyle (4 Boutiques)',
    sector: 'Luxury Retail & E-Commerce',
    description:
      'Connected omni-channel retail system syncing inventory across four boutique stores and a high-performance e-commerce storefront with zero latency.',
    stack: ['React 19', 'Node.js', 'POS Bridge Connector', 'PostgreSQL'],
    metrics: [
      { label: 'Stock Accuracy Across Stores', value: '100%' },
      { label: 'Inventory Sync Latency', value: '42ms' },
      { label: 'Omnichannel Conversion', value: '+44%' },
    ],
    challenge:
      'Store associates had no real-time visibility into whether inventory was present in neighboring outlets or the central warehouse, causing missed sales and disappointed clients.',
    solution:
      'Deployed a synchronized POS data hub with continuous bi-directional sync, digital WhatsApp receipts, and automated store-to-store transfer reservations.',
  },
  {
    id: 'greenfield-logistics',
    slug: 'greenfield-fleet-dispatch',
    title: 'Greenfield Fleet Dispatch & CRM',
    badge: 'Demonstration Case Study',
    client: 'Greenfield Freightways',
    sector: 'B2B Logistics & Supply Chain',
    description:
      'Automated driver dispatch, invoice OCR extraction, and client consignment tracking replacing eight fragmented Google Spreadsheets.',
    stack: ['TypeScript', 'Python OCR Service', 'Supabase', 'Next.js App Router'],
    metrics: [
      { label: 'Invoice Settlement Time', value: 'Same-Day' },
      { label: 'Consignment Tracking Accuracy', value: '99.9%' },
      { label: 'Spreadsheets Deprecated', value: '8 Files' },
    ],
    challenge:
      'Consignment statuses were manually typed into separate spreadsheets every evening, delaying client invoicing by up to 14 days and leading to frequent billing disputes.',
    solution:
      'Built a centralized driver dispatch application featuring instant camera OCR bill-of-lading extraction, automated delivery confirmation, and real-time client status tracking.',
  },
];
