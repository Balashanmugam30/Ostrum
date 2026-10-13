import { Testimonial } from '@/types/testimonials';

/**
 * Authoritative Testimonials Dataset for Ostrum Phase 6
 *
 * SAFETY & COMPLIANCE RULES:
 * 1. Entry 01 must be TMR AI Car Care (matching Selected Work).
 * 2. Entry 02 must be Saraswati Driving School (matching Selected Work).
 * 3. Actual client endorsements have not yet been formally signed off by clients;
 *    hence all entries are strictly marked `approved: false` and `isPlaceholder: true`.
 * 4. In development and review environments, the full sequence of 6 cards is rendered
 *    to exercise the full scroll choreography, card exits, and typography reveal.
 * 5. In public production builds, `getPublicTestimonials()` guarantees that unapproved
 *    or fabricated endorsements are never presented as verified public endorsements.
 */
export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'tmr-ai-car-care',
    clientName: 'TMR AI Car Care',
    logoText: 'TMR AI CAR CARE',
    subtext: 'Automotive Intelligence Platform',
    quote:
      'The automated diagnostic intake and customer communications platform transformed our service bays. Turnaround is faster, workshop operations are transparent, and car owners trust every repair recommendation.',
    company: 'TMR AI Car Care',
    role: 'Automotive Intelligence',
    approved: false,
    isPlaceholder: true,
  },
  {
    id: 'saraswati-driving-school',
    clientName: 'Saraswati Driving School',
    logoText: 'SARASWATI DRIVING SCHOOL',
    subtext: 'Digital Scheduling & Dispatch',
    quote:
      'Ostrum built an intuitive booking and instructor scheduling system that replaced our manual logbooks entirely. Students find scheduling effortless and our instructors stay synchronized on every lesson.',
    company: 'Saraswati Driving School',
    role: 'Instruction Systems',
    approved: false,
    isPlaceholder: true,
  },
  {
    id: 'sample-client-03',
    clientName: 'Sample Client 03',
    logoText: 'SAMPLE CLIENT 03',
    subtext: 'Enterprise Cloud Architecture',
    quote:
      'Partnering with Ostrum gave our engineering team the architectural clarity and velocity needed to launch our core enterprise platform three months ahead of schedule.',
    company: 'Sample Client 03',
    role: 'Enterprise Software',
    approved: false,
    isPlaceholder: true,
  },
  {
    id: 'sample-client-04',
    clientName: 'Sample Client 04',
    logoText: 'SAMPLE CLIENT 04',
    subtext: 'Connected Hardware Ecosystem',
    quote:
      'From initial concept to production rollout, Ostrum delivered software that connected our sensors, field tablets, and operational dashboards into a single dependable system.',
    company: 'Sample Client 04',
    role: 'Connected Technology',
    approved: false,
    isPlaceholder: true,
  },
  {
    id: 'sample-client-05',
    clientName: 'Sample Client 05',
    logoText: 'SAMPLE CLIENT 05',
    subtext: 'Operational Workflow Suite',
    quote:
      'Their team translated our complex multi-stakeholder operational workflows into a digital experience that was clean, fast, and immediately embraced across the organization.',
    company: 'Sample Client 05',
    role: 'Operations & Workflow',
    approved: false,
    isPlaceholder: true,
  },
  {
    id: 'sample-client-06',
    clientName: 'Sample Client 06',
    logoText: 'SAMPLE CLIENT 06',
    subtext: 'Strategic Product Engineering',
    quote:
      'Working with Ostrum felt like having a dedicated technology leadership group inside our team. Rigorous engineering craft, clear communication, and outstanding execution throughout.',
    company: 'Sample Client 06',
    role: 'Digital Transformation',
    approved: false,
    isPlaceholder: true,
  },
];

/**
 * Get all testimonials for development, testing, and interaction verification.
 */
export function getAllTestimonials(): Testimonial[] {
  return TESTIMONIALS_DATA;
}

/**
 * Public production selector. Strictly filters out any unapproved placeholder records
 * so fabricated quotes are never published as genuine verified endorsements.
 */
export function getPublicTestimonials(): Testimonial[] {
  return TESTIMONIALS_DATA.filter((item) => item.approved && !item.isPlaceholder);
}
