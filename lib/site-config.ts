/**
 * Centralized OSTRUM Site & Brand Configuration
 *
 * OFFICIAL DOMAIN & BUSINESS MAILBOX:
 * Official canonical domain: https://www.theostrum.tech/ (apex theostrum.tech redirects 308 to www.theostrum.tech)
 * Official primary contact mailbox: hello@theostrum.tech
 */

export const LINKEDIN_PLACEHOLDER =
  'https://www.linkedin.com/company/replace-with-real-ostrum-profile/';

export const SITE_CONFIG = {
  brandName: 'OSTRUM',
  brandLegalName: 'Ostrum',
  brandTagline: 'Digital Product Engineering & Custom Software Studio',

  // Official production base URL (canonical www.theostrum.tech)
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.theostrum.tech',

  // Official primary contact mailbox
  contactEmail: 'hello@theostrum.tech',

  // Company LinkedIn URL (configured centrally; placeholder or unset until official page is created)
  linkedInUrl: process.env.NEXT_PUBLIC_OSTRUM_LINKEDIN_URL || 'https://www.linkedin.com/company/ostrum/',

  // Project repositories & ventures
  githubUrl: 'https://github.com/Balashanmugam30/Ostrum',
  mnesaGithubUrl: 'https://github.com/Balashanmugam30/mnesa',

  // Launch verification flags
  isDomainVerified: true,
  // Kept false until transactional sender DNS verification (DKIM/SPF) is formally verified with Resend
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
export function hasValidLinkedIn(customUrl?: string): boolean {
  const rawUrl = customUrl !== undefined ? customUrl : (process.env.NEXT_PUBLIC_OSTRUM_LINKEDIN_URL || SITE_CONFIG.linkedInUrl);
  const urlStr = rawUrl?.trim();
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
export function getVerifiedLinkedInUrl(customUrl?: string): string | null {
  const rawUrl = customUrl !== undefined ? customUrl : (process.env.NEXT_PUBLIC_OSTRUM_LINKEDIN_URL || SITE_CONFIG.linkedInUrl);
  return hasValidLinkedIn(rawUrl) ? (rawUrl?.trim() || null) : null;
}
