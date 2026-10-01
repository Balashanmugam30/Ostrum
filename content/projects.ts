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
    client: 'St. Jude International Academy (K-12 Campus Network)',
    sector: 'Higher & Secondary Education',
    description:
      'A unified campus administration platform synchronizing admissions, automated fee collection, parent WhatsApp updates, and student records into one reliable system.',
    stack: ['Next.js 15', 'PostgreSQL', 'Meta Cloud WhatsApp API', 'Tailwind CSS'],
    metrics: [
      { label: 'Admissions Workflow', value: 'Automated Multi-Stage' },
      { label: 'Prospect Response', value: 'Instant Edge Trigger' },
      { label: 'Enrollment Records', value: 'Fully Digital System' },
    ],
    challenge:
      'Admissions staff spent excessive hours weekly copying data from physical paper forms into Excel sheets, answering repetitive WhatsApp queries manually, and reconciling bank fee receipts by hand.',
    solution:
      'Engineered an edge-deployed portal with instant WhatsApp automated prospect responses, integrated online tuition fee settlement, and role-based student record management.',
  },
  {
    id: 'aura-living',
    slug: 'aura-living-commerce',
    title: 'Aura Living Multi-Store Commerce',
    badge: 'Demonstration Case Study',
    client: 'Aura Home & Lifestyle (Multi-Store Boutique)',
    sector: 'Luxury Retail & E-Commerce',
    description:
      'Connected omni-channel retail system syncing inventory across four boutique stores and a high-performance e-commerce storefront with zero latency.',
    stack: ['React 19', 'Node.js', 'POS Bridge Connector', 'PostgreSQL'],
    metrics: [
      { label: 'Multi-Store Stock', value: 'Real-Time Sync' },
      { label: 'POS Synchronization', value: 'Bi-Directional' },
      { label: 'Checkout Experience', value: 'Unified Omnichannel' },
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
      'Automated driver dispatch, invoice OCR extraction, and client consignment tracking replacing fragmented spreadsheets.',
    stack: ['TypeScript', 'Python OCR Service', 'Supabase', 'Next.js App Router'],
    metrics: [
      { label: 'Invoice Settlement', value: 'Same-Day' },
      { label: 'Consignment Tracking', value: 'Real-Time Tracking' },
      { label: 'Legacy Workbooks', value: 'Fully Retired' },
    ],
    challenge:
      'Consignment statuses were manually typed into separate spreadsheets every evening, delaying client invoicing and leading to frequent billing disputes.',
    solution:
      'Built a centralized driver dispatch application featuring instant camera OCR bill-of-lading extraction, automated delivery confirmation, and real-time client status tracking.',
  },
];
