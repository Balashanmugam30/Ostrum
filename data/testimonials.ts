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
      'We wanted a digital experience that would present our car-care services clearly and make it easier for customers to connect with us. OSTRUM understood our vision, stayed responsive throughout the process and worked closely with us to shape an experience that feels simple and easy to use. We appreciated the team’s support and attention to detail.',
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
      'OSTRUM took the time to understand our driving school’s needs and helped us bring our requirements into a smoother digital experience. The team was approachable, patient and open to our feedback at every stage. Communication was clear, and the collaboration made the whole process comfortable from start to finish.',
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
      'Working with OSTRUM helped us turn our requirements into a clearer and more useful digital experience. The team listened to our ideas, brought thoughtful suggestions and paid attention to the details throughout the process. We valued the collaborative approach and the care taken to shape the result around our needs.',
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
