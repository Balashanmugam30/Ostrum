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
      'OSTRUM is a digital product engineering and venture studio. We design and develop custom business software, web and mobile applications, AI systems, business platforms, connected technology and digital experiences. We also build original products through OSTRUM Ventures.',
  },
  {
    id: 'services-supported',
    question: 'What specific services do you deliver?',
    answer:
      'Our work includes custom software development, website and web application development, mobile app development, UI/UX design, e-commerce platforms, AI agents and workflow automation, CRM and ERP integrations, APIs, IoT and embedded systems, SEO, content strategy and digital marketing. We scope each engagement around the business problem and the services it genuinely requires.',
  },
  {
    id: 'working-with-businesses',
    question: 'Do you work with small businesses or enterprises?',
    answer:
      'Yes. We work with small and medium businesses that need practical software to replace manual processes, as well as established companies that need integrations, modernization or more complex platforms. Scope, architecture and engagement size are tailored to the project.',
  },
  {
    id: 'custom-vs-off-the-shelf',
    question: 'Why choose custom software over off-the-shelf SaaS?',
    answer:
      'Custom software can be a better fit when your workflows, integrations, data requirements or product plans do not fit existing tools. It offers more control over features and roadmap, but it also requires investment in development, hosting, maintenance and support. We help compare custom development, existing SaaS and hybrid approaches before recommending a solution.',
  },
  {
    id: 'technology-selection',
    question: 'How do you select technologies for a project?',
    answer:
      'We are technology-agnostic and problem-led. We choose languages, frameworks, databases and infrastructure based on the project\'s requirements, integration needs, performance, security, maintainability and long-term ownership. The goal is the right technology for the system, not a particular trend.',
  },
  {
    id: 'ai-systems-integration',
    question: 'How does OSTRUM integrate practical AI and automation?',
    answer:
      'We identify repeatable tasks and operational bottlenecks where AI or automation can provide practical value. Solutions may include enquiry handling, document workflows, information extraction, data synthesis and task routing. We define data access, privacy safeguards, human review and failure handling around each use case.',
  },
  {
    id: 'existing-systems-modernization',
    question: 'Can OSTRUM modernize or integrate with our existing systems?',
    answer:
      'Yes. We can assess existing applications, databases and workflows, then plan APIs, CRM and ERP integrations, payment connections or phased modernization. We review dependencies and operational risks before implementation to reduce disruption.',
  },
  {
    id: 'project-pricing-and-scoping',
    question: 'How are project scoping and pricing structured?',
    answer:
      'We begin by understanding your goals, users, existing systems and constraints. We then define scope, deliverables, milestones, assumptions and pricing in a written proposal. Any material change to scope, third-party service or delivery plan is discussed and approved before additional work begins.',
  },
  {
    id: 'ip-and-code-ownership',
    question: 'Who owns the intellectual property and source code?',
    answer:
      'Ownership and licensing are defined in the signed project agreement. Where agreed, final custom deliverables and source code transfer to the client after the applicable payment obligations are met. Pre-existing tools, reusable frameworks and third-party components remain subject to their separate ownership and licence terms.',
  },
  {
    id: 'post-launch-support',
    question: 'What support and maintenance do you offer after launch?',
    answer:
      'We can provide launch stabilization, bug fixes within the agreed warranty scope, performance improvements, maintenance, monitoring and future feature development. The support period, response expectations and ongoing responsibilities are defined in the project agreement.',
  },
];
