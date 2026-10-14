export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const OSTRUM_FAQ_DATA: FaqItem[] = [
  {
    id: 'what-is-ostrum',
    question: 'What is Ostrum?',
    answer:
      'Ostrum is a digital transformation studio and venture foundry. We design, engineer, and deploy high-performance software systems, intelligent AI agents, modern digital experiences, and connected hardware infrastructure that empower ambitious organizations to scale efficiently.',
  },
  {
    id: 'services-provided',
    question: 'What services does Ostrum provide?',
    answer:
      'We deliver end-to-end solutions across six core capabilities: Digital Experiences (websites, e-commerce, customer portals), AI Systems & Agents (autonomous agents, receptionists, automated operations), Business Platforms (CRM, ERP, real-time command dashboards), Software & Product Engineering (web/mobile applications, SaaS platforms, custom APIs), Hardware & Connected Technology (IoT, embedded systems, smart devices), and Custom Engineering.',
  },
  {
    id: 'getting-started',
    question: 'How do we get started with a project?',
    answer:
      'Engagements begin with a technical discovery discussion to understand your business objectives, technical constraints, and workflow bottlenecks. From there, we formulate a comprehensive architectural roadmap, deliverable milestones, and resource plan before moving directly into rapid design and engineering.',
  },
  {
    id: 'startups-and-enterprises',
    question: 'Can Ostrum work with startups and established businesses?',
    answer:
      'Yes. We partner with high-growth venture startups building modern MVPs and scalable platforms, as well as established market leaders modernizing legacy infrastructure, automating complex internal workflows, and deploying next-generation connected systems.',
  },
  {
    id: 'project-timeline',
    question: 'How long does a project take?',
    answer:
      'Project duration is determined by scope, technical complexity, and required integrations. Focused digital platforms or production-ready MVP prototypes typically ship in 4 to 8 weeks, while comprehensive enterprise architectures, multi-agent AI ecosystems, or custom hardware solutions are deployed in disciplined, phased milestones.',
  },
  {
    id: 'project-cost',
    question: 'How much does a project cost?',
    answer:
      'Because every engagement is custom-engineered to solve specific operational challenges, pricing varies based on technical architecture and milestone scope. Following our initial discovery consultation, we provide a transparent, fixed-scope proposal with clearly defined deliverables.',
  },
  {
    id: 'existing-products',
    question: 'Can Ostrum help with an existing product or website?',
    answer:
      'Yes. Through our software engineering and business platforms practices, we regularly audit existing codebases, architect custom API integrations, modernize legacy workflows, eliminate technical debt, and optimize performance across active digital products.',
  },
  {
    id: 'discuss-a-project',
    question: 'How can I discuss a project with Ostrum?',
    answer:
      'You can submit your project requirements using the enquiry form immediately below, or reach out directly to our principals at hello@ostrum.co to schedule an introductory technical review.',
  },
];
