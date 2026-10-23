/**
 * Centralized OSTRUM Site & Brand Configuration
 *
 * NOTE ON PLANNED DOMAIN & EMAIL:
 * The owner has stated that the domain `theostrum.com` is planned for purchase.
 * Do not assert that it is registered, deployed, or that mailbox delivery is operational
 * until verified by the owner.
 */

export const LINKEDIN_PLACEHOLDER =
  'https://www.linkedin.com/company/replace-with-real-ostrum-profile/';

export const SITE_CONFIG = {
  brandName: 'OSTRUM',
  brandLegalName: 'Ostrum',
  brandTagline: 'Digital Product Engineering & Custom Software Studio',

  // Planned production base URL (unverified / planned for purchase)
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://theostrum.com',

  // Planned primary contact mailbox (unverified / planned)
  contactEmail: 'hello@theostrum.com',

  // Company LinkedIn URL (configured centrally; placeholder or unset until official page is created)
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
 * Validates strictly whether an authentic, verified LinkedIn company HTTPS URL is configured.
 *
 * Rejection rules:
 * - Unset or empty string
 * - Known placeholder (https://www.linkedin.com/company/replace-with-real-ostrum-profile/)
 * - Non-https protocols
 * - Hostnames that do not strictly end with .linkedin.com or match linkedin.com
 * - Missing company/profile pathname
 */
export function hasValidLinkedIn(): boolean {
  const urlStr = SITE_CONFIG.linkedInUrl?.trim();
  if (!urlStr) return false;
  if (urlStr === LINKEDIN_PLACEHOLDER) return false;
  if (urlStr.includes('replace-with-real-ostrum-profile')) return false;

  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname.toLowerCase();
    const isStrictLinkedInHost =
      hostname === 'linkedin.com' ||
      hostname.endsWith('.linkedin.com') ||
      hostname === 'www.linkedin.com';

    if (!isStrictLinkedInHost) return false;

    // Must have a valid path like /company/xyz or /in/xyz
    const cleanPath = parsed.pathname.replace(/\/+$/, '');
    if (!cleanPath || cleanPath === '' || cleanPath === '/company' || cleanPath === '/in') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the verified LinkedIn URL if valid, or null if unconfigured/placeholder.
 */
export function getVerifiedLinkedInUrl(): string | null {
  return hasValidLinkedIn() ? SITE_CONFIG.linkedInUrl.trim() : null;
}
