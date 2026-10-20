/**
 * Centralized OSTRUM Site & Brand Configuration
 *
 * NOTE ON PLANNED DOMAIN & EMAIL:
 * The owner has stated that the domain `theostrum.com` is planned for purchase.
 * Do not assert that it is registered, deployed, or that mailbox delivery is operational
 * until verified by the owner.
 */

export const SITE_CONFIG = {
  brandName: 'OSTRUM',
  brandLegalName: 'Ostrum',
  brandTagline: 'Digital Experience & Technology Studio',
  
  // Planned production base URL (unverified / planned for purchase)
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://theostrum.com',
  
  // Planned primary contact mailbox (unverified / planned)
  contactEmail: 'hello@theostrum.com',
  
  // Company LinkedIn URL (configured centrally; hidden if unset)
  linkedInUrl: process.env.NEXT_PUBLIC_OSTRUM_LINKEDIN_URL || '',
  
  // Project repositories & ventures
  githubUrl: 'https://github.com/Balashanmugam30/Ostrum',
  mnesaGithubUrl: 'https://github.com/Balashanmugam30/mnesa',
  
  // Launch verification flags
  isDomainVerified: false,
  isMailboxVerified: false,
} as const;

/**
 * Returns a mailto: link for the primary contact email
 */
export function getMailtoLink(subject?: string): string {
  const base = `mailto:${SITE_CONFIG.contactEmail}`;
  if (!subject) return base;
  return `${base}?subject=${encodeURIComponent(subject)}`;
}

/**
 * Checks whether a valid HTTPS LinkedIn URL is configured
 */
export function hasValidLinkedIn(): boolean {
  if (!SITE_CONFIG.linkedInUrl) return false;
  try {
    const url = new URL(SITE_CONFIG.linkedInUrl);
    return url.protocol === 'https:' && url.hostname.includes('linkedin.com');
  } catch {
    return false;
  }
}
