export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const OSTRUM_FAQ_DATA: FaqItem[] = [
  {
    id: 'what-does-ostrum-do',
    question: 'What does Ostrum do?',
    answer:
      'Ostrum is a digital transformation studio and venture foundry. We design, engineer, and deploy high-performance software systems, intelligent AI agents, modern digital experiences, and connected hardware infrastructure that empower ambitious organizations to scale efficiently.',
  },
  {
    id: 'services-supported',
    question: 'What services can Ostrum help with?',
    answer:
      'We deliver end-to-end solutions across our six core capabilities: Digital Experiences, AI Systems & Agents, Business Platforms, Software & Product Engineering, Hardware & Connected Technology, and Custom Engineering. Each engagement is tailored to address specific operational and technical goals.',
  },
  {
    id: 'how-to-start',
    question: 'How do we start a project with Ostrum?',
    answer:
      'Engagements begin when you submit an enquiry outlining your objectives. We then conduct an initial technical discovery to understand your workflow, constraints, and deliverables before establishing an agreed project scope and milestone roadmap.',
  },
  {
    id: 'project-cost',
    question: 'How much does a project cost?',
    answer:
      'Project estimates depend directly on technical complexity, deliverable scope, third-party integrations, and timeline requirements. We invite you to submit an enquiry so we can prepare a tailored proposal aligned with your exact needs.',
  },
  {
    id: 'project-timeline',
    question: 'How long will a project take?',
    answer:
      'Duration varies based on system complexity, architecture requirements, feedback turnaround, and milestone milestones. Prototyping and focused digital products often move quickly, while enterprise platforms and multi-agent systems are delivered in disciplined, phased deployments.',
  },
  {
    id: 'existing-product-work',
    question: 'Can Ostrum work on an existing website or product?',
    answer:
      'Yes. We regularly assess existing systems to audit architecture, modernize technical infrastructure, eliminate performance bottlenecks, and integrate custom APIs or AI workflows alongside active engineering teams.',
  },
  {
    id: 'mobile-responsiveness',
    question: 'Will my website work on mobile devices?',
    answer:
      'Yes. Every digital interface we engineer follows a responsive, multi-device design approach. We optimize layouts, touch interactions, typography, and asset loading across smartphone, tablet, and desktop viewports.',
  },
  {
    id: 'project-revisions',
    question: 'Can I request revisions during a project?',
    answer:
      'Revision rounds and design iterations are structured directly into the agreed project proposal and milestone phases. This collaborative review process ensures deliverables remain closely aligned with your strategic expectations before production deployment.',
  },
  {
    id: 'asset-ownership',
    question: 'Who owns the finished website and project assets?',
    answer:
      'Asset ownership, source code licensing, and handover details are clearly defined in the client engagement agreement. Upon milestone completion and settlement, agreed custom code and deliverables transfer directly to your organization.',
  },
  {
    id: 'post-launch-support',
    question: 'What support is available after launch?',
    answer:
      'Continuing maintenance, infrastructure monitoring, software updates, and extended engineering support can be structured to fit your ongoing operational needs. We discuss post-launch arrangements during the scoping phase.',
  },
];
