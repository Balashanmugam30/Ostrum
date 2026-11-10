export type TestimonialLogoType = 'image' | 'mnesa-mark' | 'wordmark';
export type TestimonialContentType = 'client-review' | 'testimonial' | 'project-note' | 'project-highlight';
export type TestimonialApprovalStatus = 'pending-owner-approval' | 'approved';
export type TestimonialReviewStatus = 'draft' | 'approved';

export interface Testimonial {
  id: string;
  clientName: string;
  brandName?: string;
  quote: string;
  emphasis?: string;
  content?: string;
  role?: string;
  company?: string;
  logoText?: string;
  subtext?: string;
  logoSrc?: string;
  logoAlt?: string;
  logoType?: TestimonialLogoType;
  contentType?: TestimonialContentType;
  reviewStatus?: TestimonialReviewStatus;
  approvalStatus?: TestimonialApprovalStatus;
  rating?: number;
  approved: boolean;
  isPlaceholder: boolean;
}
