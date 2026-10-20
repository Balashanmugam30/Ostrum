import { NextResponse } from 'next/server';
import {
  checkRateLimit,
  validateEnquiryPayload,
  sendEnquiryNotification,
  type RawEnquiryPayload,
} from '@/lib/email/enquiry-mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  const correlationId = 'req_' + Math.random().toString(36).substring(2, 10);

  // 1. IP & Rate limiting
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';

  if (!checkRateLimit(clientIp)) {
    console.warn('[Enquiry API Rate Limit Exceeded]', {
      correlationId,
      timestamp,
      result: 'rate_limited',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Too many enquiry submissions from this connection. Please wait a few moments or email hello@theostrum.com directly.',
      },
      { status: 429 }
    );
  }

  // 2. Content-type and payload parsing
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { success: false, error: 'Invalid request content type. Expected application/json.' },
      { status: 415 }
    );
  }

  let body: RawEnquiryPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Malformed JSON payload.' },
      { status: 400 }
    );
  }

  // 3. Validation & Honeypot checking
  const validation = validateEnquiryPayload(body);
  if (!validation.data || validation.error) {
    console.warn('[Enquiry API Validation Rejected]', {
      correlationId,
      timestamp,
      result: validation.category || 'validation_error',
    });

    return NextResponse.json(
      {
        success: false,
        error: validation.error || 'Please check your submitted details.',
      },
      { status: 400 }
    );
  }

  // 4. Dispatch notification via Resend
  const mailerResult = await sendEnquiryNotification(validation.data);

  if (!mailerResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: mailerResult.error || 'Failed to submit enquiry. Please try again.',
      },
      { status: mailerResult.status }
    );
  }

  // 5. Accepted send
  return NextResponse.json(
    {
      success: true,
      message:
        'Thank you for reaching out. We have received your project details and a studio partner will be in touch within 24 hours.',
    },
    { status: 200 }
  );
}
