export interface CapabilityItem {
  title: string;
  desc: string;
}

export interface DisciplineGroup {
  id: string;
  number: string;
  name: string;
  description: string;
  items: CapabilityItem[];
}

export const capabilitiesData: Record<string, DisciplineGroup> = {
  systems: {
    id: 'systems',
    number: '01',
    name: 'Business Software (ERP / CRM)',
    description:
      'Custom operational backbones designed around how your company actually functions, eliminating manual data entry and spreadsheet chaos.',
    items: [
      {
        title: 'Order & Stock Management (ERP)',
        desc: 'Track inventory across physical shops and central warehouses in real time without manual counts or stock discrepancies.',
      },
      {
        title: 'Customer & Sales Pipeline (CRM)',
        desc: 'Keep every inquiry organized, assign follow-up tasks automatically, and close deals faster with transparent stage tracking.',
      },
      {
        title: 'School & Campus Administration',
        desc: 'Online student applications, automated fee collection, parent WhatsApp alerts, and grade management in one unified portal.',
      },
      {
        title: 'Billing & Point-of-Sale (POS)',
        desc: 'Fast retail store checkouts, automatic tax calculation, and digital invoices dispatched directly to customer phones.',
      },
    ],
  },
  ai: {
    id: 'ai',
    number: '02',
    name: 'Practical AI & Automation',
    description:
      'Intelligent assistants connected directly to your databases and APIs to handle repetitive daily customer and administrative work.',
    items: [
      {
        title: 'WhatsApp Business Assistants',
        desc: 'Instant automated answers to customer queries, live stock lookups, and calendar booking via official Meta Cloud APIs.',
      },
      {
        title: 'Routine Task Automation',
        desc: 'Automatically generate tax invoices, create shipment labels, and update internal CRM records whenever specific events fire.',
      },
      {
        title: 'Voice Call Dispatchers',
        desc: 'Warm, natural voice agents that handle incoming phone inquiries, answer common questions, and log calls into your database.',
      },
      {
        title: 'Invoice & Paperwork OCR',
        desc: 'Extract vendor details, line items, and totals from PDF bills directly into your accounting books without human typing.',
      },
    ],
  },
  experience: {
    id: 'experience',
    number: '03',
    name: 'Modern Websites & Portals',
    description:
      'Art-directed, blazing-fast web storefronts and digital customer portals built to turn visitors into long-term commercial relationships.',
    items: [
      {
        title: 'High-Performance Web Stores',
        desc: 'Blazing fast storefronts designed to convert visitors and connected directly to warehouse inventory and store POS.',
      },
      {
        title: 'Custom Company Portals',
        desc: 'Secure web applications where clients can log in, track projects, review reports, and download invoices securely.',
      },
      {
        title: 'Mobile-First Web Apps',
        desc: 'Smooth, responsive applications engineered to work flawlessly even on low-bandwidth mobile network connections.',
      },
      {
        title: 'Interactive Dashboards',
        desc: 'Live business metrics and revenue visualization tools tailored to executive decision makers and department heads.',
      },
    ],
  },
  brand: {
    id: 'brand',
    number: '04',
    name: 'Brand Identity & Strategy',
    description:
      'Cohesive visual systems and plain-spoken value propositions that establish timeless authority and client trust.',
    items: [
      {
        title: 'Brand Identity Systems',
        desc: 'Distinctive logo design, typography pairings, and multi-color palettes that reflect high craft and authority.',
      },
      {
        title: 'Clear Strategic Messaging',
        desc: 'Plain-spoken value propositions and copy that communicate your business strengths to customers without consulting jargon.',
      },
      {
        title: 'Design Systems & Component Libraries',
        desc: 'Comprehensive digital guidelines and code assets to keep your brand consistent across every digital and print touchpoint.',
      },
      {
        title: 'Pitch & Presentation Decks',
        desc: 'High-impact presentation decks structured to win executive buy-in, client proposals, and investor confidence.',
      },
    ],
  },
};
