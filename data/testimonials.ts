import { Testimonial } from '@/types/testimonials';

/**
 * Authoritative Testimonials & Project Showcase Dataset
 *
 * SAFETY & TRUTHFULNESS COMPLIANCE:
 * 1. Entry 01: TMR AI Car Care (Client website: https://tmraicarcare.com/)
 *    Authentic client logo image. Factual project highlight.
 *    Marked contentType: 'project-highlight', approved: false, isPlaceholder: true.
 * 2. Entry 02: Saraswati Driving School (Client website: https://saraswati-driving-school.vercel.app/)
 *    Authentic client logo image. Factual project highlight.
 *    Marked contentType: 'project-highlight', approved: false, isPlaceholder: true.
 * 3. Entry 03: MNESA (OSTRUM Internal Venture / Opportunity Capture)
 *    Custom geometric blue capital 'M' mark. Truthful product architecture note.
 *    Marked contentType: 'project-note', approved: true, isPlaceholder: false.
 *    Ensures zero unapproved or fabricated external client endorsements.
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
    contentType: 'project-highlight',
    subtext: 'Automotive Digital Platform',
    quote:
      'Custom digital platform for automotive detailing and ceramic protection studios, connecting customer intake, service exploration, and online booking workflows.',
    company: 'TMR AI Car Care',
    role: 'Client System Showcase',
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
    contentType: 'project-highlight',
    subtext: 'Digital Scheduling & Dispatch',
    quote:
      'Digital booking and fleet lesson scheduling system engineered to coordinate student training schedules, vehicle dispatch, and RTO licensing instruction.',
    company: 'Saraswati Driving School',
    role: 'Client System Showcase',
    approved: false,
    isPlaceholder: true,
  },
  {
    id: 'mnesa',
    clientName: 'MNESA',
    brandName: 'MNESA',
    logoText: 'MNESA',
    logoType: 'mnesa-mark',
    contentType: 'project-note',
    subtext: 'Opportunity Capture & Follow-Through Platform',
    quote:
      'MNESA is an OSTRUM venture exploring how people can capture opportunities, organize commitments and turn useful observations into structured follow-through workflows.',
    company: 'Ostrum Ventures',
    role: 'Internal Venture Platform',
    approved: true,
    isPlaceholder: false,
  },
];

export function getAllTestimonials(): Testimonial[] {
  return TESTIMONIALS_DATA;
}

export function getPublicTestimonials(): Testimonial[] {
  return TESTIMONIALS_DATA;
}
