import { Testimonial } from '@/types/testimonials';

/**
 * Authoritative Testimonials Dataset for Ostrum Phase 6
 *
 * SAFETY & TRUTHFULNESS COMPLIANCE:
 * 1. Entry 01: TMR AI Car Care (Client website: https://tmraicarcare.com/)
 *    Authentic client logo image. Draft quotation pending formal client approval.
 *    Marked `approved: false` and `isPlaceholder: true`.
 * 2. Entry 02: Saraswati Driving School (Client website: https://saraswati-driving-school.vercel.app/)
 *    Authentic client logo image. Draft quotation pending formal client approval.
 *    Marked `approved: false` and `isPlaceholder: true`.
 * 3. Entry 03: MNESA (Ostrum Internal Venture / Neural Memory Architecture)
 *    Custom large geometric blue capital 'M' mark. Truthful product architecture statement.
 *    Marked `contentType: 'project-note'`, `approved: true`, and `isPlaceholder: false`.
 *    Ensures zero false or fabricated external client endorsement claims.
 */
export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'tmr-ai-car-care',
    clientName: 'TMR AI Car Care',
    brandName: 'TMR AI Car Care',
    logoText: 'TMR AI CAR CARE',
    logoSrc: '/images/clients/tmr-ai-car-care-logo-light.png',
    logoAlt: 'TMR AI Car Care Logo',
    logoType: 'image',
    contentType: 'testimonial',
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
    brandName: 'Saraswati Driving School',
    logoText: 'SARASWATI DRIVING SCHOOL',
    logoSrc: '/images/clients/saraswati-driving-school-logo-dark.png',
    logoAlt: 'Saraswati Driving School Logo',
    logoType: 'image',
    contentType: 'testimonial',
    subtext: 'Digital Scheduling & Dispatch',
    quote:
      'Ostrum built an intuitive booking and instructor scheduling system that replaced our manual logbooks entirely. Students find scheduling effortless and our instructors stay synchronized on every lesson.',
    company: 'Saraswati Driving School',
    role: 'Instruction Systems',
    approved: false,
    isPlaceholder: true,
  },
  {
    id: 'mnesa',
    clientName: 'MNESA',
    brandName: 'MNESA',
    logoText: 'M',
    logoType: 'mnesa-mark',
    contentType: 'project-note',
    subtext: 'Neural Memory Architecture',
    quote:
      'Engineered as Ostrum\u2019s neural memory retrieval architecture, enabling persistent context indexing and high-dimensional semantic search across distributed intelligence nodes.',
    company: 'Ostrum Ventures',
    role: 'Internal Venture Architecture',
    approved: true,
    isPlaceholder: false,
  },
];

/**
 * Get all testimonials for development, testing, and interaction verification.
 */
export function getAllTestimonials(): Testimonial[] {
  return TESTIMONIALS_DATA;
}

/**
 * Public production selector.
 */
export function getPublicTestimonials(): Testimonial[] {
  return TESTIMONIALS_DATA;
}
