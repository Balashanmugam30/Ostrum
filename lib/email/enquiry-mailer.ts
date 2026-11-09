import { Resend } from 'resend';

/**
 * Distributed & In-Memory Rate Limiter for OSTRUM Enquiry API
 *
 * Implements a sliding-window rate limit:
 * - In production serverless environments with UPSTASH_REDIS_REST_URL/TOKEN or
 *   KV_REST_API_URL/TOKEN, uses distributed atomic storage.
 * - In local development or standalone instances without external store credentials,
 *   falls back to an in-memory sliding-window limiter as a process-level circuit breaker.
 *
 * Rate Limit Window: 10 minutes (600,000 ms)
 * Max Allowed Submissions: 5 requests per IP per window
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  provider: 'distributed_redis' | 'local_memory';
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per 10 minutes per IP

interface MemoryEntry {
  count: number;
  firstRequestTime: number;
}
const localMemoryStore = new Map<string, MemoryEntry>();

/**
 * Checks in-memory sliding window rate limit.
 */
function checkMemoryRateLimit(ip: string, now: number): RateLimitResult {
  // Housekeeping: purge entries older than window
  if (localMemoryStore.size > 2000) {
    for (const [key, val] of localMemoryStore.entries()) {
      if (now - val.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
        localMemoryStore.delete(key);
      }
    }
  }

  const entry = localMemoryStore.get(ip);

  if (!entry || now - entry.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    localMemoryStore.set(ip, { count: 1, firstRequestTime: now });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetMs: RATE_LIMIT_WINDOW_MS,
      provider: 'local_memory',
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const elapsed = now - entry.firstRequestTime;
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, RATE_LIMIT_WINDOW_MS - elapsed),
      provider: 'local_memory',
    };
  }

  entry.count += 1;
  const elapsed = now - entry.firstRequestTime;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetMs: Math.max(0, RATE_LIMIT_WINDOW_MS - elapsed),
    provider: 'local_memory',
  };
}

/**
 * Checks rate limit against distributed Redis store (Upstash / Vercel KV) if configured.
 * Uses atomic fixed-window counter via Upstash REST API (INCR + EXPIRE NX + TTL).
 */
async function checkDistributedRateLimit(
  ip: string,
  now: number,
  apiUrl: string,
  apiToken: string
): Promise<RateLimitResult | null> {
  try {
    const key = `ostrum:rl:enquiry:${ip}`;
    const windowSec = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);

    const pipelineUrl = `${apiUrl.replace(/\/$/, '')}/pipeline`;
    const res = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, windowSec, 'NX'],
        ['TTL', key],
      ]),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      console.warn('[Distributed Rate Limiter] Store returned non-200 HTTP status:', res.status);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length < 3) {
      return null;
    }

    const currentCount = Number(data[0]?.result);
    const ttlSeconds = Number(data[2]?.result) || windowSec;

    const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - currentCount);
    const resetMs = ttlSeconds * 1000;

    return {
      allowed: currentCount <= RATE_LIMIT_MAX_REQUESTS,
      remaining,
      resetMs,
      provider: 'distributed_redis',
    };
  } catch (err) {
    console.warn('[Distributed Rate Limiter Warning] Upstash connection failed, falling back to local memory:', err);
    return null;
  }
}

/**
 * Main export: checks rate limit using distributed store when configured,
 * falling back gracefully to process-level memory circuit breaker.
 */
export async function checkRateLimitAsync(ip: string): Promise<RateLimitResult> {
  const now = Date.now();

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (redisUrl && redisToken) {
    const distributedResult = await checkDistributedRateLimit(ip, now, redisUrl, redisToken);
    if (distributedResult !== null) {
      return distributedResult;
    }
  }

  return checkMemoryRateLimit(ip, now);
}

/**
 * Synchronous compatibility wrapper for unit tests and local execution.
 */
export function checkRateLimit(ip: string): boolean {
  const res = checkMemoryRateLimit(ip, Date.now());
  return res.allowed;
}

/**
 * Reset memory store for test suite isolation.
 */
export function _resetMemoryRateLimitStore(): void {
  localMemoryStore.clear();
}

/**
 * Server-only Enquiry Mailer and Validation Service for OSTRUM
 *
 * Implements Resend transactional email routing, HTML escaping,
 * distributed rate limiting, honeypot protection, project-type allowlisting,
 * and zero-PII audit logging.
 */

export const ALLOWED_PROJECT_TYPES = [
  'Custom Software & Business Platforms',
  'Website, Web App & E-commerce Development',
  'AI Systems & Workflow Automation',
  'Mobile App & SaaS Product Development',
  'UI/UX & Digital Product Design',
  'SEO & Digital Marketing',
  'API, CRM & ERP Integrations',
  'IoT, Embedded & Connected Technology',
  'Other / Not Sure Yet',
] as const;

export type AllowedProjectType = (typeof ALLOWED_PROJECT_TYPES)[number];

export interface RawEnquiryPayload {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  projectType?: unknown;
  phone?: unknown;
  message?: unknown;
  website_url?: unknown; // Honeypot field
  hp_check?: unknown; // Alternative honeypot field
}

export interface ValidatedEnquiryData {
  name: string;
  email: string;
  company: string;
  projectType: AllowedProjectType;
  phone: string;
  message: string;
}

export interface MailerResult {
  success: boolean;
  status: number;
  messageId?: string;
  error?: string;
  errorCategory?:
    | 'validation_error'
    | 'rate_limited'
    | 'honeypot_triggered'
    | 'missing_config'
    | 'provider_error';
}

export interface TrustedClientIpInfo {
  ip: string;
  source:
    | 'x-vercel-forwarded-for'
    | 'cf-connecting-ip'
    | 'x-real-ip'
    | 'x-forwarded-for'
    | 'fallback';
  isTrustedEdge: boolean;
}

/**
 * Validates whether a string conforms to IPv4 or IPv6 syntax without spoofed characters.
 */
export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string' || ip.length > 45) return false;
  // Strict IPv4 check
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
    return ip.split('.').every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255 && (part === '0' || !part.startsWith('0'));
    });
  }
  // Standard IPv6 check
  if (/^[0-9a-fA-F:]+$/.test(ip) && ip.includes(':') && !ip.includes(':::')) {
    return true;
  }
  return false;
}

/**
 * Extracts client IP evaluating edge reverse-proxy headers in order of cryptographic trust:
 * 1. x-vercel-forwarded-for (Vercel edge trusted client IP)
 * 2. cf-connecting-ip (Cloudflare edge trusted client IP)
 * 3. x-real-ip (Standard reverse proxy client IP)
 * 4. x-forwarded-for (First hop fallback, untrusted edge)
 * 5. fallback: 127.0.0.1
 */
export function extractTrustedClientIp(headers: Headers): TrustedClientIpInfo {
  const vercelIp = headers.get('x-vercel-forwarded-for')?.trim();
  if (vercelIp && isValidIp(vercelIp)) {
    return { ip: vercelIp, source: 'x-vercel-forwarded-for', isTrustedEdge: true };
  }

  const cfIp = headers.get('cf-connecting-ip')?.trim();
  if (cfIp && isValidIp(cfIp)) {
    return { ip: cfIp, source: 'cf-connecting-ip', isTrustedEdge: true };
  }

  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp && isValidIp(realIp)) {
    return { ip: realIp, source: 'x-real-ip', isTrustedEdge: true };
  }

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstHop = forwardedFor.split(',')[0].trim();
    if (isValidIp(firstHop)) {
      return { ip: firstHop, source: 'x-forwarded-for', isTrustedEdge: false };
    }
  }

  // Fallback: in non-production/test environments, default to 127.0.0.1 for local isolation.
  // In production, unknown callers without trusted proxy headers share a single emergency bucket
  // to ensure abuse protection cannot be bypassed by omitting headers.
  const isDevOrTest = process.env.NODE_ENV !== 'production';
  const fallbackIp = isDevOrTest
    ? '127.0.0.1'
    : 'unidentified_origin_client';

  return { ip: fallbackIp, source: 'fallback', isTrustedEdge: false };
}

/**
 * Escapes characters that are special in HTML to prevent XSS / HTML injection in email clients.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips carriage returns and newlines to prevent header injection in single-line email fields.
 */
export function sanitizeSingleLine(str: string, maxLength: number): string {
  return str
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and normalizes raw enquiry payload.
 * Enforces plain object structure, honeypot absence, email RFC compliance,
 * and project type allowlisting.
 */
export function validateEnquiryPayload(raw: unknown): {
  data?: ValidatedEnquiryData;
  error?: string;
  category?: 'validation_error' | 'honeypot_triggered';
} {
  // 0. Plain object validation (reject null, array, primitives)
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {
      error: 'Invalid request payload format. Expected a JSON object.',
      category: 'validation_error',
    };
  }

  const typedRaw = raw as RawEnquiryPayload;

  // 1. Honeypot check (bots filling out hidden fields)
  if (
    (typeof typedRaw.website_url === 'string' && typedRaw.website_url.trim().length > 0) ||
    (typeof typedRaw.hp_check === 'string' && typedRaw.hp_check.trim().length > 0)
  ) {
    return {
      error: 'Invalid submission request.',
      category: 'honeypot_triggered',
    };
  }

  // 2. Name validation
  if (typeof typedRaw.name !== 'string' || typedRaw.name.trim().length === 0) {
    return { error: 'Full name is required.', category: 'validation_error' };
  }
  const cleanName = sanitizeSingleLine(typedRaw.name, 100);
  if (cleanName.length < 2) {
    return { error: 'Please enter a valid full name.', category: 'validation_error' };
  }

  // 3. Email validation (RFC 5322 check + max 254 chars)
  if (typeof typedRaw.email !== 'string' || typedRaw.email.trim().length === 0) {
    return { error: 'Email address is required.', category: 'validation_error' };
  }
  const cleanEmail = sanitizeSingleLine(typedRaw.email, 254);
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { error: 'Please provide a valid work email address.', category: 'validation_error' };
  }

  // 4. Message validation
  if (typeof typedRaw.message !== 'string' || typedRaw.message.trim().length === 0) {
    return { error: 'Project description or message is required.', category: 'validation_error' };
  }
  const cleanMessage = typedRaw.message.trim().slice(0, 5000);
  if (cleanMessage.length < 10) {
    return {
      error: 'Please provide a brief project summary (at least 10 characters).',
      category: 'validation_error',
    };
  }

  // 5. Project Type validation against strict allowlist
  let cleanProjectType: AllowedProjectType = 'Other / Not Sure Yet';
  if (typeof typedRaw.projectType === 'string' && typedRaw.projectType.trim().length > 0) {
    const rawType = sanitizeSingleLine(typedRaw.projectType, 120);
    const matchedType = ALLOWED_PROJECT_TYPES.find(
      (opt) => opt.toLowerCase() === rawType.toLowerCase()
    );
    if (!matchedType) {
      return {
        error: 'Please select a valid project scope option.',
        category: 'validation_error',
      };
    }
    cleanProjectType = matchedType;
  }

  // 6. Optional company and phone fields
  const cleanCompany =
    typeof typedRaw.company === 'string' ? sanitizeSingleLine(typedRaw.company, 120) : '';
  const cleanPhone =
    typeof typedRaw.phone === 'string' ? sanitizeSingleLine(typedRaw.phone, 50) : '';

  return {
    data: {
      name: cleanName,
      email: cleanEmail,
      company: cleanCompany || 'Not specified',
      projectType: cleanProjectType,
      phone: cleanPhone || 'Not provided',
      message: cleanMessage,
    },
  };
}

/**
 * Generates formatted HTML email body for studio notifications.
 */
export function buildEnquiryHtml(
  data: ValidatedEnquiryData,
  timestamp: string,
  correlationId: string
): string {
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safeCompany = escapeHtml(data.company);
  const safeProjectType = escapeHtml(data.projectType);
  const safePhone = escapeHtml(data.phone);
  const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br />');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>New Project Enquiry: OSTRUM</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #282828; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 32px rgba(0,0,0,0.5);">
    
    <!-- Header -->
    <div style="padding: 28px 32px; background: linear-gradient(180deg, #1F0807 0%, #141414 100%); border-bottom: 1px solid #331513;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #FF4D30;">
        OSTRUM
      </h1>
      <p style="margin: 6px 0 0; font-size: 13px; color: #B0A8A6; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">
        Studio Notification · Website Project Intake
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.5; color: #E5E0DF;">
        A new commercial project enquiry has been submitted through the OSTRUM website enquiry form.
      </p>

      <!-- Key Details Card -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #1A1A1A; border: 1px solid #282828; border-radius: 12px; overflow: hidden;">
        <tbody>
          <tr>
            <td style="padding: 12px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #8F8785; width: 35%; border-bottom: 1px solid #282828;">Full Name</td>
            <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #FFFFFF; border-bottom: 1px solid #282828;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #8F8785; border-bottom: 1px solid #282828;">Work Email</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #FF4D30; border-bottom: 1px solid #282828;">
              <a href="mailto:${safeEmail}" style="color: #FF765E; text-decoration: none;">${safeEmail}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #8F8785; border-bottom: 1px solid #282828;">Company</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #FFFFFF; border-bottom: 1px solid #282828;">${safeCompany}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #8F8785; border-bottom: 1px solid #282828;">Project Scope</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #FFFFFF; border-bottom: 1px solid #282828;">${safeProjectType}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #8F8785;">Telephone</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #FFFFFF;">${safePhone}</td>
          </tr>
        </tbody>
      </table>

      <!-- Project Message -->
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 10px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8F8785;">
          Project Description & Scope
        </h3>
        <div style="padding: 16px; background-color: #1A1A1A; border: 1px solid #282828; border-radius: 12px; font-size: 14px; line-height: 1.6; color: #E5E0DF;">
          ${safeMessage}
        </div>
      </div>

      <!-- Action Prompt -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #282828; font-size: 12px; color: #8F8785;">
        <p style="margin: 0 0 4px;">Reply directly to this email to contact <strong>${safeName}</strong> at <strong>${safeEmail}</strong>.</p>
        <p style="margin: 0; font-family: monospace; font-size: 11px; color: #5C5554;">
          Ref ID: ${correlationId} · Timestamp: ${timestamp}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates formatted plain-text alternative.
 */
export function buildEnquiryText(
  data: ValidatedEnquiryData,
  timestamp: string,
  correlationId: string
): string {
  return `
NEW PROJECT ENQUIRY: OSTRUM
============================================================
Timestamp: ${timestamp}
Reference ID: ${correlationId}

SENDER INFORMATION:
- Name: ${data.name}
- Work Email: ${data.email}
- Company: ${data.company}
- Project Classification: ${data.projectType}
- Telephone: ${data.phone}

PROJECT DESCRIPTION & SCOPE:
------------------------------------------------------------
${data.message}

============================================================
Reply directly to this notification to contact ${data.name} (${data.email}).
Delivered via OSTRUM Website Enquiry Gateway.
  `.trim();
}

/**
 * Dispatches the notification email through Resend.
 * Zero-PII logging: no customer personal information is exposed to logs.
 */
export async function sendEnquiryNotification(
  data: ValidatedEnquiryData,
  options?: {
    customResend?: Resend;
  }
): Promise<MailerResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const toAddress = process.env.OSTRUM_ENQUIRY_TO || 'hello@theostrum.com';
  const fromAddress = process.env.OSTRUM_ENQUIRY_FROM || 'OSTRUM Website <website@theostrum.com>';

  const correlationId =
    'ost_' +
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().substring(0, 8)
      : Math.random().toString(36).substring(2, 10));
  const timestamp = new Date().toISOString();

  // If mock mode is enabled for testing
  if (process.env.RESEND_MOCK === 'true' && !options?.customResend) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Enquiry Mailer Security Error]', {
        correlationId,
        timestamp,
        error: 'RESEND_MOCK is forbidden in production environment.',
      });
      return {
        success: false,
        status: 500,
        errorCategory: 'provider_error',
        error: 'Enquiry delivery configuration error.',
      };
    }

    console.log('[Enquiry Mailer: Mocked Mode Accepted]', {
      correlationId,
      timestamp,
      recipientDomain: toAddress.split('@')[1] || 'theostrum.com',
    });
    return {
      success: true,
      status: 200,
      messageId: `mock_${correlationId}`,
    };
  }

  if (!apiKey && !options?.customResend) {
    console.warn('[Enquiry Mailer Warning]', {
      correlationId,
      timestamp,
      result: 'missing_config',
      note: 'RESEND_API_KEY environment variable is not configured.',
    });
    return {
      success: false,
      status: 503,
      errorCategory: 'missing_config',
      error:
        'Enquiry service is currently offline for scheduled maintenance. Please reach out directly to hello@theostrum.com.',
    };
  }

  try {
    const resend = options?.customResend || new Resend(apiKey);

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      replyTo: data.email,
      subject: `[OSTRUM Enquiry] New project enquiry from ${data.name}${data.company && data.company !== 'Not specified' ? ` (${data.company})` : ''}`,
      html: buildEnquiryHtml(data, timestamp, correlationId),
      text: buildEnquiryText(data, timestamp, correlationId),
    });

    if (emailResponse.error) {
      console.error('[Enquiry Mailer Provider Error]', {
        correlationId,
        timestamp,
        errorName: emailResponse.error.name,
        errorMessage: emailResponse.error.message,
      });

      return {
        success: false,
        status: 502,
        errorCategory: 'provider_error',
        error:
          'Unable to deliver notification at this time. Please try again shortly or reach us directly at hello@theostrum.com.',
      };
    }

    console.log('[Enquiry Mailer Delivery Accepted]', {
      correlationId,
      timestamp,
      messageId: emailResponse.data?.id,
    });

    return {
      success: true,
      status: 200,
      messageId: emailResponse.data?.id,
    };
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    console.error('[Enquiry Mailer Exception]', {
      correlationId,
      timestamp,
      exceptionMessage: errMessage,
    });

    return {
      success: false,
      status: 500,
      errorCategory: 'provider_error',
      error:
        'Failed to process enquiry notification. Please reach out directly to hello@theostrum.com.',
    };
  }
}
