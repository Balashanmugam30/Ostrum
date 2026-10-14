export interface Testimonial {
  id: string;
  clientName: string;
  quote: string;
  role?: string;
  company?: string;
  logoText: string;
  subtext?: string;
  logoSrc?: string;
  logoAlt?: string;
  approved: boolean;
  isPlaceholder: boolean;
}
