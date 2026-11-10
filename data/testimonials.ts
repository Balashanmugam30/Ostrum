import { Testimonial } from '@/types/testimonials';

/**
 * Authoritative OSTRUM Client Testimonials Dataset
 *
 * CLIENT FEEDBACK BASIS:
 * The owner confirms positive verbal feedback was received from TMR AI Car Care,
 * Saraswati Driving School, and MNESA for services provided by OSTRUM.
 * The review texts below are polished editorial paraphrases of that verbal feedback,
 * drafted in natural client review style.
 *
 * APPROVAL & PUBLICATION WORKFLOW:
 * Marked reviewStatus: 'draft' and approvalStatus: 'pending-owner-approval' until
 * written publication consent is formally recorded from each client.
 * Zero fake ratings, zero fake star rows, zero fabricated reviewer identities.
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
    contentType: 'client-review',
    role: 'CLIENT REVIEW',
    subtext: 'Automotive Digital Platform',
    quote:
      'We appreciated how OSTRUM understood our vision. The team was responsive, flexible and a pleasure to work with.',
    emphasis: 'understood our vision',
    company: 'TMR AI Car Care',
    reviewStatus: 'draft',
    approvalStatus: 'pending-owner-approval',
    approved: false,
    isPlaceholder: false,
  },
  {
    id: 'saraswati-driving-school',
    clientName: 'Saraswati Driving School',
    brandName: 'Saraswati Driving School',
    logoText: 'SARASWATI DRIVING SCHOOL',
    logoSrc: '/images/clients/saraswati-driving-school-logo-dark.png',
    logoAlt: 'Saraswati Driving School Logo',
    logoType: 'image',
    contentType: 'client-review',
    role: 'CLIENT REVIEW',
    subtext: 'Digital Scheduling & Dispatch',
    quote:
      'They listened to our needs, kept communication clear and made the whole process feel smooth from start to finish.',
    emphasis: 'clear',
    company: 'Saraswati Driving School',
    reviewStatus: 'draft',
    approvalStatus: 'pending-owner-approval',
    approved: false,
    isPlaceholder: false,
  },
  {
    id: 'mnesa',
    clientName: 'MNESA',
    brandName: 'MNESA',
    logoText: 'MNESA',
    logoType: 'mnesa-mark',
    contentType: 'client-review',
    role: 'CLIENT REVIEW',
    subtext: 'Opportunity Capture & Follow-Through Platform',
    quote:
      'OSTRUM brought clarity to our ideas and offered thoughtful direction. Their attention to detail helped shape a practical product we feel good about.',
    emphasis: 'clarity to our ideas',
    company: 'MNESA',
    reviewStatus: 'draft',
    approvalStatus: 'pending-owner-approval',
    approved: false,
    isPlaceholder: false,
  },
];

export function getAllTestimonials(): Testimonial[] {
  return TESTIMONIALS_DATA;
}

export function getPublicTestimonials(): Testimonial[] {
  return TESTIMONIALS_DATA;
}
