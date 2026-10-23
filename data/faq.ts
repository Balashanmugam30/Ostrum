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
      'OSTRUM is a digital product engineering and venture studio. We scope, design, and build custom business software, intelligent AI systems, high-conversion web platforms, mobile applications, and connected technology for growing companies and ambitious founders.',
  },
  {
    id: 'services-supported',
    question: 'What specific services do you deliver?',
    answer:
      'We deliver full-cycle engineering across six areas: Digital Experiences (websites, web applications, portals), AI Systems & Agents (autonomous workflow automations, intelligent assistants), Business Platforms (internal operations software, CRM and ERP integrations), Software & Product Engineering (SaaS platforms, MVPs, APIs), Connected Technology (IoT and embedded systems), and Custom Engineering (bespoke architectures and modernization).',
  },
  {
    id: 'working-with-businesses',
    question: 'Do you work with small businesses or enterprises?',
    answer:
      'We work with both. We help small and medium businesses replace manual spreadsheets and disconnected tools with focused, affordable custom systems. For growing companies and enterprises, we architect scalable platforms, modernize legacy infrastructure, and automate complex operational workflows.',
  },
  {
    id: 'custom-vs-off-the-shelf',
    question: 'Why choose custom software over off-the-shelf SaaS?',
    answer:
      'Generic software forces your business to adapt its processes to rigid subscription templates, often resulting in paying for features you do not need while missing the exact workflows you do. Custom software fits your exact operations, scales without per-seat licensing penalties, and remains an asset you own.',
  },
  {
    id: 'technology-selection',
    question: 'How do you select technologies for a project?',
    answer:
      'We are technology-agnostic and problem-led. We select frameworks, databases, and architectures based on your performance requirements, security considerations, maintainability, internal team skills, and long-term ownership goals rather than following temporary developer trends.',
  },
  {
    id: 'ai-systems-integration',
    question: 'How does OSTRUM integrate practical AI and automation?',
    answer:
      'We build practical AI systems that resolve clear business bottlenecks, such as automated customer enquiry intake, document processing, data synthesis, and task routing. We focus on verifiable utility, privacy controls, and human oversight rather than surface-level marketing gimmicks.',
  },
  {
    id: 'existing-systems-modernization',
    question: 'Can OSTRUM modernize or integrate with our existing systems?',
    answer:
      'Yes. We frequently audit active applications, build custom APIs, connect legacy databases to modern interfaces, and integrate core platforms like CRMs, ERPs, and payment gateways without disrupting day-to-day business operations.',
  },
  {
    id: 'project-pricing-and-scoping',
    question: 'How are project scoping and pricing structured?',
    answer:
      'Engagements begin with a transparent technical discovery where we define required outcomes, system architecture, and milestone deliverables. Pricing is structured around defined scope milestones, providing predictable investment without surprise hidden charges.',
  },
  {
    id: 'ip-and-code-ownership',
    question: 'Who owns the intellectual property and source code?',
    answer:
      'You do. Full intellectual property rights, source code, design assets, and deployment configurations transfer directly to your organization upon milestone completion and settlement, as established in our client services agreement.',
  },
  {
    id: 'post-launch-support',
    question: 'What support and maintenance do you offer after launch?',
    answer:
      'We provide structured warranty support following production launch, covering stabilization and performance tuning. Ongoing maintenance, infrastructure monitoring, security updates, and phased feature additions can be scheduled to suit your operational needs.',
  },
];
