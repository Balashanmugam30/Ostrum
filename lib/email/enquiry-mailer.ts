import { Resend } from 'resend';

/**
 * Server-only Enquiry Mailer and Validation Service for OSTRUM
 *
 * Implements Resend transactional email routing, HTML escaping,
 * rate limiting, honeypot protection, and privacy-preserving audit logging.
 */

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
  projectType: string;
  phone: string;
  message: string;
}

export interface MailerResult {
  success: boolean;
  status: number;
  messageId?: string;
  error?: string;
  errorCategory?: 'validation_error' | 'rate_limited' | 'honeypot_triggered' | 'missing_config' | 'provider_error';
}

// In-memory sliding window rate limiter
// Note: In distributed multi-instance serverless deployments, each instance maintains its own window.
// A distributed store (e.g., Upstash Redis, Vercel KV) is required for cross-instance coordination.
interface RateLimitEntry {
  count: number;
  firstRequestTime: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per 10 minutes per IP

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    return true;
  }

  if (now - entry.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
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
 */
export function validateEnquiryPayload(raw: RawEnquiryPayload): {
  data?: ValidatedEnquiryData;
  error?: string;
  category?: 'validation_error' | 'honeypot_triggered';
} {
  // 1. Honeypot check (bots filling out hidden fields)
  if (
    (typeof raw.website_url === 'string' && raw.website_url.trim().length > 0) ||
    (typeof raw.hp_check === 'string' && raw.hp_check.trim().length > 0)
  ) {
    return {
      error: 'Invalid submission request.',
      category: 'honeypot_triggered',
    };
  }

  // 2. Name validation
  if (typeof raw.name !== 'string' || raw.name.trim().length === 0) {
    return { error: 'Full name is required.', category: 'validation_error' };
  }
  const cleanName = sanitizeSingleLine(raw.name, 100);
  if (cleanName.length < 2) {
    return { error: 'Please enter a valid full name.', category: 'validation_error' };
  }

  // 3. Email validation (RFC 5322 check + max 254 chars)
  if (typeof raw.email !== 'string' || raw.email.trim().length === 0) {
    return { error: 'Email address is required.', category: 'validation_error' };
  }
  const cleanEmail = sanitizeSingleLine(raw.email, 254);
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { error: 'Please provide a valid work email address.', category: 'validation_error' };
  }

  // 4. Message validation
  if (typeof raw.message !== 'string' || raw.message.trim().length === 0) {
    return { error: 'Project description or message is required.', category: 'validation_error' };
  }
  const cleanMessage = raw.message.trim().slice(0, 5000);
  if (cleanMessage.length < 10) {
    return {
      error: 'Please provide a brief project summary (at least 10 characters).',
      category: 'validation_error',
    };
  }

  // 5. Optional fields
  const cleanCompany = typeof raw.company === 'string' ? sanitizeSingleLine(raw.company, 120) : '';
  const cleanProjectType = typeof raw.projectType === 'string' ? sanitizeSingleLine(raw.projectType, 120) : '';
  const cleanPhone = typeof raw.phone === 'string' ? sanitizeSingleLine(raw.phone, 50) : '';

  return {
    data: {
      name: cleanName,
      email: cleanEmail,
      company: cleanCompany || 'Not specified',
      projectType: cleanProjectType || 'General Project Scoping',
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
  <title>New Project Enquiry — OSTRUM</title>
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
NEW PROJECT ENQUIRY — OSTRUM
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

  const correlationId = 'ost_' + Math.random().toString(36).substring(2, 10);
  const timestamp = new Date().toISOString();

  // If mock mode is enabled for testing
  if (process.env.RESEND_MOCK === 'true' && !options?.customResend) {
    console.log('[Enquiry Mailer: Mocked Mode Accepted]', {
      correlationId,
      timestamp,
      recipient: toAddress,
    });
    return {
      success: true,
      status: 200,
      messageId: `mock_${correlationId}`,
    };
  }

  if (!apiKey && !options?.customResend) {
    // Missing Resend configuration
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
      error: 'Enquiry service is currently offline for scheduled maintenance. Please reach out directly to hello@theostrum.com.',
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
        error: 'Unable to deliver notification at this time. Please try again shortly or reach us directly at hello@theostrum.com.',
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
      error: 'Failed to process enquiry notification. Please reach out directly to hello@theostrum.com.',
    };
  }
}
