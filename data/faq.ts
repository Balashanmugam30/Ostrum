export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const OSTRUM_FAQ_DATA: FaqItem[] = [
  {
    id: 'what-does-ostrum-do',
    question: 'What does OSTRUM build?',
    answer:
      'OSTRUM builds custom software, AI systems, digital platforms and original products. Each engagement starts with the problem to solve.',
  },
  {
    id: 'services-supported',
    question: 'What specific services do you deliver?',
    answer:
      'We deliver custom software, web and mobile apps, UI/UX, e-commerce, AI automation, integrations, APIs, IoT and digital-growth services. Every engagement is scoped to the problem.',
  },
  {
    id: 'working-with-businesses',
    question: 'Do you work with small businesses or enterprises?',
    answer:
      'We assess each enquiry on its goals, scope and fit, then shape the engagement around the organisation and project.',
  },
  {
    id: 'custom-vs-off-the-shelf',
    question: 'Why choose custom software over off-the-shelf SaaS?',
    answer:
      'Custom software can fit workflows that standard tools cannot support. We first consider whether configuration or integration would be simpler.',
  },
  {
    id: 'technology-selection',
    question: 'How do you select technologies for a project?',
    answer:
      'We choose technology around the requirements, integrations, security, maintainability and long-term fit - not trends.',
  },
  {
    id: 'ai-systems-integration',
    question: 'How does OSTRUM integrate practical AI and automation?',
    answer:
      'We identify suitable workflows, connect the required tools and define human review where decisions or sensitive actions need it.',
  },
  {
    id: 'existing-systems-modernization',
    question: 'Can OSTRUM modernise or integrate with our existing systems?',
    answer:
      'We review the existing systems, integrations and data needs, then scope a practical modernisation or connection plan.',
  },
  {
    id: 'project-pricing-and-scoping',
    question: 'How are project scoping and pricing structured?',
    answer:
      'Pricing depends on scope, complexity, integrations and delivery needs. We clarify the requirements before outlining an approach.',
  },
  {
    id: 'ip-and-code-ownership',
    question: 'Who owns the intellectual property and source code?',
    answer:
      'Ownership, licensing and source-code access are defined in the project agreement before work begins.',
  },
  {
    id: 'post-launch-support',
    question: 'What support and maintenance do you offer after launch?',
    answer:
      'Post-launch support and maintenance are discussed and defined in the project scope and agreement.',
  },
];
