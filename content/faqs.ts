export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqsData: FaqItem[] = [
  {
    id: 'replace-existing-software',
    question: 'Will this replace our existing software or force us to start over?',
    answer:
      'We build around what is already working. If your finance team loves QuickBooks, Tally, or Google Sheets, we connect directly to their APIs. We only replace what is broken, slow, or causing severe manual bottlenecks for your staff.',
  },
  {
    id: 'typical-timeline',
    question: 'How long does a typical custom build take from start to launch?',
    answer:
      'A typical focused custom system or web application takes between 6 and 10 weeks. We deliver in two-week functional milestones, meaning you test working pieces of the system long before the official launch date.',
  },
  {
    id: 'code-ownership',
    question: 'Who actually owns the code and intellectual property?',
    answer:
      'You do. 100%. All custom software code, UI design files, database architectures, and documentation are transferred to your company repository upon completion. There are zero proprietary licensing fees or vendor lock-in.',
  },
  {
    id: 'maintenance-support',
    question: 'How do you handle maintenance and support after launch?',
    answer:
      'Every project includes 30 days of complimentary post-launch monitoring and bug fixes. After that, clients can transition to our Dedicated Care Retainer for 24/7 uptime monitoring, security patches, and ongoing developer hours.',
  },
  {
    id: 'ai-difference',
    question: 'What makes your AI assistants different from standard chatbots?',
    answer:
      'Standard chatbots only read static text and answer FAQs vaguely. Our assistants connect directly to your live database, inventory, and WhatsApp APIs, meaning they can actually check stock, update customer records, and generate receipts.',
  },
];
