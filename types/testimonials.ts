export interface Testimonial {
  id: string;
  clientName: string;
  quote: string;
  role?: string;
  company?: string;
  logoText: string;
  subtext?: string;
  approved: boolean;
  isPlaceholder: boolean;
}
