export type TestimonialLogoType = 'image' | 'mnesa-mark' | 'wordmark';
export type TestimonialContentType = 'testimonial' | 'project-note';

export interface Testimonial {
  id: string;
  clientName: string;
  brandName?: string;
  quote: string;
  content?: string;
  role?: string;
  company?: string;
  logoText?: string;
  subtext?: string;
  logoSrc?: string;
  logoAlt?: string;
  logoType?: TestimonialLogoType;
  contentType?: TestimonialContentType;
  approved: boolean;
  isPlaceholder: boolean;
}
