import {
  extractTrustedClientIp,
  checkRateLimitAsync,
  validateEnquiryPayload,
  sendEnquiryNotification,
} from '@/lib/email/enquiry-mailer';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 64 * 1024; // 64 KB hard request limit

export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  const correlationId =
    'req_' +
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().substring(0, 8)
      : Math.random().toString(36).substring(2, 10));

  // 1. Trusted Client IP extraction & Distributed Rate Limiting
  const clientIpInfo = extractTrustedClientIp(request.headers);
  const rateLimitResult = await checkRateLimitAsync(clientIpInfo.ip);

  if (!rateLimitResult.allowed) {
    console.warn('[Enquiry API Rate Limit Exceeded]', {
      correlationId,
      timestamp,
      result: 'rate_limited',
      provider: rateLimitResult.provider,
    });

    return Response.json(
      {
        success: false,
        error:
          'Too many enquiry submissions from this connection. Please wait a few moments or email hello@theostrum.com directly.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetMs / 1000)),
        },
      }
    );
  }

  // 2. Content-Type verification
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return Response.json(
      { success: false, error: 'Invalid request content type. Expected application/json.' },
      { status: 415 }
    );
  }

  // 3. Pre-read Content-Length header verification
  const declaredContentLength = request.headers.get('content-length');
  if (declaredContentLength && parseInt(declaredContentLength, 10) > MAX_BODY_BYTES) {
    return Response.json(
      { success: false, error: 'Payload too large. Maximum request size is 64KB.' },
      { status: 413 }
    );
  }

  // 4. Safe streaming body read with strict byte counter
  if (!request.body) {
    return Response.json(
      { success: false, error: 'Request body cannot be empty.' },
      { status: 400 }
    );
  }

  let rawText = '';
  try {
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytesReceived = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        bytesReceived += value.byteLength;
        if (bytesReceived > MAX_BODY_BYTES) {
          await reader.cancel();
          return Response.json(
            { success: false, error: 'Payload too large. Maximum request size is 64KB.' },
            { status: 413 }
          );
        }
        chunks.push(value);
      }
    }

    const totalBuffer = Buffer.concat(chunks);
    rawText = new TextDecoder('utf-8').decode(totalBuffer);
  } catch (err) {
    console.error('[Enquiry API Stream Read Error]', {
      correlationId,
      timestamp,
      error: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { success: false, error: 'Failed to process incoming request stream.' },
      { status: 400 }
    );
  }

  // 5. JSON parsing and plain object verification
  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(rawText);
  } catch {
    return Response.json(
      { success: false, error: 'Malformed JSON payload.' },
      { status: 400 }
    );
  }

  if (typeof parsedPayload !== 'object' || parsedPayload === null || Array.isArray(parsedPayload)) {
    return Response.json(
      { success: false, error: 'Invalid payload format. Expected a JSON object.' },
      { status: 400 }
    );
  }

  // 6. Validation, Allowlisting & Honeypot checking
  const validation = validateEnquiryPayload(parsedPayload);
  if (!validation.data || validation.error) {
    console.warn('[Enquiry API Validation Rejected]', {
      correlationId,
      timestamp,
      result: validation.category || 'validation_error',
    });

    return Response.json(
      {
        success: false,
        error: validation.error || 'Please check your submitted details.',
      },
      { status: 400 }
    );
  }

  // 7. Dispatch notification via Resend
  const mailerResult = await sendEnquiryNotification(validation.data);

  if (!mailerResult.success) {
    return Response.json(
      {
        success: false,
        error: mailerResult.error || 'Failed to submit enquiry. Please try again.',
      },
      { status: mailerResult.status }
    );
  }

  // 8. Accepted send response (zero-PII returned)
  return Response.json(
    {
      success: true,
      message:
        'Thank you for reaching out. We have received your project details and a studio partner will be in touch within 24 hours.',
    },
    { status: 200 }
  );
}
