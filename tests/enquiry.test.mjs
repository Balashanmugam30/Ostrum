import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHtml,
  sanitizeSingleLine,
  validateEnquiryPayload,
  buildEnquiryHtml,
  buildEnquiryText,
  sendEnquiryNotification,
  checkRateLimit,
  checkRateLimitAsync,
  getEnquirySalt,
  _resetMemoryRateLimitStore,
  extractTrustedClientIp,
  isValidIp,
  ALLOWED_PROJECT_TYPES,
} from '../lib/email/enquiry-mailer.ts';
import { hasValidLinkedIn } from '../lib/site-config.ts';

describe('1. Input Sanitization & HTML Escaping', () => {
  test('escapeHtml properly escapes dangerous HTML characters', () => {
    const malicious = '<script>alert("xss")</script> & "test" \'quote\'';
    const escaped = escapeHtml(malicious);

    assert.doesNotMatch(escaped, /<script>/);
    assert.match(escaped, /&lt;script&gt;/);
    assert.match(escaped, /&amp;/);
    assert.match(escaped, /&quot;/);
    assert.match(escaped, /&#039;/);
  });

  test('sanitizeSingleLine removes newlines and carriage returns', () => {
    const injected = 'Subject Injection\r\nBcc: hacker@example.com\nAnother line';
    const sanitized = sanitizeSingleLine(injected, 100);

    assert.doesNotMatch(sanitized, /[\r\n]/);
    assert.strictEqual(sanitized, 'Subject Injection Bcc: hacker@example.com Another line');
  });

  test('sanitizeSingleLine enforces maximum length', () => {
    const longString = 'a'.repeat(200);
    const sanitized = sanitizeSingleLine(longString, 50);
    assert.strictEqual(sanitized.length, 50);
  });
});

describe('2. Payload Validation & Honeypot Protection', () => {
  test('accepts valid full payload with allowed project type', () => {
    const raw = {
      name: 'Ada Lovelace',
      email: 'ada@analytical.engine',
      company: 'Babbage Labs',
      projectType: 'AI Systems & Workflow Automation',
      phone: '+44 20 7946 0919',
      message: 'We are engineering an algorithmic calculating engine.',
    };

    const result = validateEnquiryPayload(raw);
    assert.ok(result.data);
    assert.strictEqual(result.data.name, 'Ada Lovelace');
    assert.strictEqual(result.data.email, 'ada@analytical.engine');
    assert.strictEqual(result.data.company, 'Babbage Labs');
    assert.strictEqual(result.data.projectType, 'AI Systems & Workflow Automation');
  });

  test('rejects non-plain-object payloads', () => {
    const arrayPayload = [{ name: 'Test', email: 'test@example.com' }];
    assert.strictEqual(validateEnquiryPayload(arrayPayload).category, 'validation_error');

    const nullPayload = null;
    assert.strictEqual(validateEnquiryPayload(nullPayload).category, 'validation_error');

    const stringPayload = '{"name": "test"}';
    assert.strictEqual(validateEnquiryPayload(stringPayload).category, 'validation_error');

    const numberPayload = 42;
    assert.strictEqual(validateEnquiryPayload(numberPayload).category, 'validation_error');
  });

  test('rejects unapproved project types', () => {
    const raw = {
      name: 'Test User',
      email: 'test@example.com',
      projectType: 'Malicious / Crypto Mining',
      message: 'Legitimate looking message with unauthorized project type.',
    };

    const result = validateEnquiryPayload(raw);
    assert.strictEqual(result.category, 'validation_error');
    assert.match(result.error, /Please select a valid project scope option/);
  });

  test('defaults omitted project type to "Other / Not Sure Yet"', () => {
    const raw = {
      name: 'Grace Hopper',
      email: 'grace@navy.mil',
      message: 'Exploring collaborative technical opportunities with studio.',
    };

    const result = validateEnquiryPayload(raw);
    assert.ok(result.data);
    assert.strictEqual(result.data.projectType, 'Other / Not Sure Yet');
  });

  test('accepts all 9 allowed project types case-insensitively', () => {
    for (const opt of ALLOWED_PROJECT_TYPES) {
      const res = validateEnquiryPayload({
        name: 'Alan Turing',
        email: 'alan@bletchley.ac.uk',
        projectType: opt.toLowerCase(),
        message: 'Exploring universal computational architectures.',
      });
      assert.ok(res.data, `Failed on project type: ${opt}`);
      assert.strictEqual(res.data.projectType, opt);
    }
  });

  test('rejects missing required fields', () => {
    const missingName = validateEnquiryPayload({ email: 'test@example.com', message: 'Hello world this is valid' });
    assert.strictEqual(missingName.category, 'validation_error');
    assert.match(missingName.error, /Full name is required/);

    const missingEmail = validateEnquiryPayload({ name: 'Test User', message: 'Hello world this is valid' });
    assert.strictEqual(missingEmail.category, 'validation_error');
    assert.match(missingEmail.error, /Email address is required/);

    const missingMessage = validateEnquiryPayload({ name: 'Test User', email: 'test@example.com' });
    assert.strictEqual(missingMessage.category, 'validation_error');
    assert.match(missingMessage.error, /Project description or message is required/);
  });

  test('rejects invalid email formats', () => {
    const invalidEmails = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain..com'];
    for (const email of invalidEmails) {
      const res = validateEnquiryPayload({ name: 'Valid Name', email, message: 'Valid long message here' });
      assert.strictEqual(res.category, 'validation_error');
    }
  });

  test('rejects submissions with honeypot fields filled', () => {
    const botSubmission = {
      name: 'Spam Bot',
      email: 'bot@spam.com',
      message: 'Buy cheap watches online now!',
      website_url: 'http://spamlink.com',
    };

    const res = validateEnquiryPayload(botSubmission);
    assert.strictEqual(res.category, 'honeypot_triggered');
  });
});

describe('3. Template Generation & Content Security', () => {
  const sampleData = {
    name: 'Grace Hopper',
    email: 'grace@navy.mil',
    company: 'Cobol Pioneers <LLC>',
    projectType: 'Custom Software & Business Platforms',
    phone: '+1 555 0199',
    message: 'Finding the first actual computer bug in a relay <moth>.',
  };

  test('buildEnquiryHtml escapes user data within the HTML template', () => {
    const html = buildEnquiryHtml(sampleData, '2026-10-20T12:00:00Z', 'corr_123');

    assert.match(html, /Grace Hopper/);
    assert.match(html, /Cobol Pioneers &lt;LLC&gt;/);
    assert.match(html, /&lt;moth&gt;/);
    assert.doesNotMatch(html, /<LLC>/);
    assert.doesNotMatch(html, /<moth>/);
  });

  test('buildEnquiryText includes all key fields in plain text', () => {
    const text = buildEnquiryText(sampleData, '2026-10-20T12:00:00Z', 'corr_123');

    assert.match(text, /Grace Hopper/);
    assert.match(text, /grace@navy\.mil/);
    assert.match(text, /Cobol Pioneers <LLC>/);
    assert.match(text, /Custom Software & Business Platforms/);
  });
});

describe('4. Resend Mailer Dispatch & Mock Integration', () => {
  const validData = {
    name: 'Linus Torvalds',
    email: 'linus@kernel.org',
    company: 'Linux Foundation',
    projectType: 'Custom Software & Business Platforms',
    phone: 'Not provided',
    message: 'Just for fun - discussing monolithic vs microkernel architecture.',
  };

  test('fails gracefully with 503 when RESEND_API_KEY is not configured', async () => {
    const originalKey = process.env.RESEND_API_KEY;
    const originalMock = process.env.RESEND_MOCK;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_MOCK;

    try {
      const res = await sendEnquiryNotification(validData);
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.status, 503);
      assert.strictEqual(res.errorCategory, 'missing_config');
      assert.match(res.error, /offline for scheduled maintenance/);
    } finally {
      if (originalKey) process.env.RESEND_API_KEY = originalKey;
      if (originalMock) process.env.RESEND_MOCK = originalMock;
    }
  });

  test('dispatches email with server-controlled to and client replyTo via mock', async () => {
    let capturedPayload = null;

    const fakeResend = {
      emails: {
        send: async (payload) => {
          capturedPayload = payload;
          return { data: { id: 'msg_test_accepted_123' }, error: null };
        },
      },
    };

    const res = await sendEnquiryNotification(validData, { customResend: fakeResend });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.messageId, 'msg_test_accepted_123');

    // Assert to is array with server configured address
    assert.ok(Array.isArray(capturedPayload.to));
    assert.strictEqual(capturedPayload.to[0], process.env.OSTRUM_ENQUIRY_TO || 'hello@theostrum.com');
    // Assert replyTo is visitor's validated address
    assert.strictEqual(capturedPayload.replyTo, 'linus@kernel.org');
  });

  test('handles provider error and returns 502 with user-safe message', async () => {
    const fakeFailingResend = {
      emails: {
        send: async () => {
          return {
            data: null,
            error: { name: 'validation_error', message: 'Domain not verified in Resend.' },
          };
        },
      },
    };

    const res = await sendEnquiryNotification(validData, { customResend: fakeFailingResend });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.status, 502);
    assert.strictEqual(res.errorCategory, 'provider_error');
    assert.match(res.error, /Unable to deliver notification at this time/);
  });

  test('prohibits RESEND_MOCK in production environment and returns 500', async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalMock = process.env.RESEND_MOCK;
    process.env.NODE_ENV = 'production';
    process.env.RESEND_MOCK = 'true';

    try {
      const res = await sendEnquiryNotification(validData);
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.status, 500);
      assert.strictEqual(res.errorCategory, 'provider_error');
      assert.match(res.error, /configuration error/);
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalMock !== undefined) {
        process.env.RESEND_MOCK = originalMock;
      } else {
        delete process.env.RESEND_MOCK;
      }
    }
  });
});

describe('5. Rate Limiting Protection & Distributed Resilience', () => {
  beforeEach(() => {
    _resetMemoryRateLimitStore();
  });

  test('allows up to 5 requests per IP then blocks subsequent requests (sync)', () => {
    const testIp = '192.0.2.42';

    for (let i = 0; i < 5; i++) {
      const allowed = checkRateLimit(testIp);
      assert.strictEqual(allowed, true, `Request ${i + 1} should be allowed`);
    }

    const sixth = checkRateLimit(testIp);
    assert.strictEqual(sixth, false, '6th request within window should be rate-limited');
  });

  test('allows up to 5 requests per IP then blocks subsequent requests (async)', async () => {
    const testIp = '198.51.100.99';

    for (let i = 0; i < 5; i++) {
      const res = await checkRateLimitAsync(testIp);
      assert.strictEqual(res.allowed, true, `Request ${i + 1} should be allowed`);
      assert.strictEqual(res.remaining, 4 - i);
    }

    const sixth = await checkRateLimitAsync(testIp);
    assert.strictEqual(sixth.allowed, false, '6th request should be blocked');
    assert.strictEqual(sixth.remaining, 0);
  });

  test('production fails closed with rate_limit_unavailable when ENQUIRY_SALT is missing', async () => {
    const origEnv = process.env.NODE_ENV;
    const origSalt = process.env.ENQUIRY_SALT;
    const origUrl = process.env.UPSTASH_REDIS_REST_URL;
    const origToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ENQUIRY_SALT;
      process.env.UPSTASH_REDIS_REST_URL = 'https://fake-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'fake_token_123';

      const res = await checkRateLimitAsync('203.0.113.1');
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.errorCategory, 'rate_limit_unavailable');
      assert.strictEqual(res.provider, 'distributed_redis');
    } finally {
      process.env.NODE_ENV = origEnv;
      if (origSalt !== undefined) process.env.ENQUIRY_SALT = origSalt;
      else delete process.env.ENQUIRY_SALT;
      if (origUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = origUrl;
      else delete process.env.UPSTASH_REDIS_REST_URL;
      if (origToken !== undefined) process.env.UPSTASH_REDIS_REST_TOKEN = origToken;
      else delete process.env.UPSTASH_REDIS_REST_TOKEN;
    }
  });

  test('production fails closed with rate_limit_unavailable when Upstash credentials are missing', async () => {
    const origEnv = process.env.NODE_ENV;
    const origSalt = process.env.ENQUIRY_SALT;
    const origUrl = process.env.UPSTASH_REDIS_REST_URL;
    const origToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    try {
      process.env.NODE_ENV = 'production';
      process.env.ENQUIRY_SALT = 'super-secret-salt-with-sufficient-entropy-1234';
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const res = await checkRateLimitAsync('203.0.113.2');
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.errorCategory, 'rate_limit_unavailable');
      assert.strictEqual(res.provider, 'distributed_redis');
    } finally {
      process.env.NODE_ENV = origEnv;
      if (origSalt !== undefined) process.env.ENQUIRY_SALT = origSalt;
      else delete process.env.ENQUIRY_SALT;
      if (origUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = origUrl;
      else delete process.env.UPSTASH_REDIS_REST_URL;
      if (origToken !== undefined) process.env.UPSTASH_REDIS_REST_TOKEN = origToken;
      else delete process.env.UPSTASH_REDIS_REST_TOKEN;
    }
  });

  test('production fails closed with rate_limit_unavailable when Upstash Redis store errors', async () => {
    const origEnv = process.env.NODE_ENV;
    const origSalt = process.env.ENQUIRY_SALT;
    const origUrl = process.env.UPSTASH_REDIS_REST_URL;
    const origToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const origFetch = global.fetch;

    try {
      process.env.NODE_ENV = 'production';
      process.env.ENQUIRY_SALT = 'super-secret-salt-with-sufficient-entropy-1234';
      process.env.UPSTASH_REDIS_REST_URL = 'https://fake-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'fake_token_123';

      // Mock fetch to simulate Redis 500 server error
      global.fetch = async () => new Response('Internal Server Error', { status: 500 });

      const res = await checkRateLimitAsync('203.0.113.3');
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.errorCategory, 'rate_limit_unavailable');
      assert.strictEqual(res.provider, 'distributed_redis');
    } finally {
      process.env.NODE_ENV = origEnv;
      global.fetch = origFetch;
      if (origSalt !== undefined) process.env.ENQUIRY_SALT = origSalt;
      else delete process.env.ENQUIRY_SALT;
      if (origUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = origUrl;
      else delete process.env.UPSTASH_REDIS_REST_URL;
      if (origToken !== undefined) process.env.UPSTASH_REDIS_REST_TOKEN = origToken;
      else delete process.env.UPSTASH_REDIS_REST_TOKEN;
    }
  });

  test('production operates distributed rate limiting with mock Upstash Redis store', async () => {
    const origEnv = process.env.NODE_ENV;
    const origSalt = process.env.ENQUIRY_SALT;
    const origUrl = process.env.UPSTASH_REDIS_REST_URL;
    const origToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const origFetch = global.fetch;

    let mockCounter = 0;

    try {
      process.env.NODE_ENV = 'production';
      process.env.ENQUIRY_SALT = 'super-secret-salt-with-sufficient-entropy-1234';
      process.env.UPSTASH_REDIS_REST_URL = 'https://fake-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'fake_token_123';

      let returnedCount = 0;
      global.fetch = async () => {
        returnedCount++;
        return new Response(
          JSON.stringify([
            { result: returnedCount }, // INCR result
            { result: 'OK' },          // EXPIRE result
            { result: 580 },           // TTL result
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      // 1st request -> returnedCount = 1 (remaining 4)
      const res1 = await checkRateLimitAsync('203.0.113.4');
      assert.strictEqual(res1.allowed, true);
      assert.strictEqual(res1.provider, 'distributed_redis');
      assert.strictEqual(res1.remaining, 4);

      // Fast forward to 5th request -> returnedCount = 4 before call, so call becomes 5
      returnedCount = 4;
      const res5 = await checkRateLimitAsync('203.0.113.4');
      assert.strictEqual(res5.allowed, true);
      assert.strictEqual(res5.remaining, 0);

      // 6th request -> returnedCount = 5 before call, call becomes 6 (exceeded)
      const res6 = await checkRateLimitAsync('203.0.113.4');
      assert.strictEqual(res6.allowed, false);
      assert.strictEqual(res6.remaining, 0);
      assert.strictEqual(res6.provider, 'distributed_redis');
    } finally {
      process.env.NODE_ENV = origEnv;
      global.fetch = origFetch;
      if (origSalt !== undefined) process.env.ENQUIRY_SALT = origSalt;
      else delete process.env.ENQUIRY_SALT;
      if (origUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = origUrl;
      else delete process.env.UPSTASH_REDIS_REST_URL;
      if (origToken !== undefined) process.env.UPSTASH_REDIS_REST_TOKEN = origToken;
      else delete process.env.UPSTASH_REDIS_REST_TOKEN;
    }
  });

  test('getEnquirySalt returns null in production when missing or too short, returns value when valid', () => {
    const origEnv = process.env.NODE_ENV;
    const origSalt = process.env.ENQUIRY_SALT;

    try {
      process.env.NODE_ENV = 'production';

      delete process.env.ENQUIRY_SALT;
      assert.strictEqual(getEnquirySalt(), null);

      process.env.ENQUIRY_SALT = 'short-salt'; // < 16 chars
      assert.strictEqual(getEnquirySalt(), null);

      process.env.ENQUIRY_SALT = 'sufficiently-long-production-salt-key-999';
      assert.strictEqual(getEnquirySalt(), 'sufficiently-long-production-salt-key-999');
    } finally {
      process.env.NODE_ENV = origEnv;
      if (origSalt !== undefined) process.env.ENQUIRY_SALT = origSalt;
      else delete process.env.ENQUIRY_SALT;
    }
  });
});

describe('6. Trusted Client IP Extraction & Validation', () => {
  test('isValidIp validates correct IPv4 addresses', () => {
    assert.strictEqual(isValidIp('127.0.0.1'), true);
    assert.strictEqual(isValidIp('192.168.1.1'), true);
    assert.strictEqual(isValidIp('203.0.113.195'), true);
    assert.strictEqual(isValidIp('256.0.0.1'), false);
    assert.strictEqual(isValidIp('192.168.1'), false);
    assert.strictEqual(isValidIp('not-an-ip'), false);
  });

  test('isValidIp validates IPv6 addresses', () => {
    assert.strictEqual(isValidIp('2001:db8::1'), true);
    assert.strictEqual(isValidIp('::1'), true);
    assert.strictEqual(isValidIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334'), true);
  });

  test('extractTrustedClientIp respects edge hierarchy', () => {
    // Vercel edge takes precedence
    const headers1 = new Headers({
      'x-vercel-forwarded-for': '198.51.100.1',
      'cf-connecting-ip': '198.51.100.2',
      'x-real-ip': '198.51.100.3',
    });
    const res1 = extractTrustedClientIp(headers1);
    assert.strictEqual(res1.ip, '198.51.100.1');
    assert.strictEqual(res1.source, 'x-vercel-forwarded-for');
    assert.strictEqual(res1.isTrustedEdge, true);

    // Cloudflare edge takes precedence when Vercel is absent
    const headers2 = new Headers({
      'cf-connecting-ip': '198.51.100.2',
      'x-real-ip': '198.51.100.3',
    });
    const res2 = extractTrustedClientIp(headers2);
    assert.strictEqual(res2.ip, '198.51.100.2');
    assert.strictEqual(res2.source, 'cf-connecting-ip');
    assert.strictEqual(res2.isTrustedEdge, true);

    // Fallback safely to 127.0.0.1 in non-production environments
    const headersSpoofed = new Headers({
      'x-vercel-forwarded-for': 'malicious<script>',
      'x-forwarded-for': 'injected, 192.168.1.1',
    });
    const resSpoofed = extractTrustedClientIp(headersSpoofed);
    assert.strictEqual(resSpoofed.ip, '127.0.0.1');
    assert.strictEqual(resSpoofed.source, 'fallback');
    assert.strictEqual(resSpoofed.isTrustedEdge, false);
  });

  test('extractTrustedClientIp generates segregated identifier in production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const headersUnknown = new Headers({
        'x-forwarded-for': 'malicious-spoof',
      });
      const res = extractTrustedClientIp(headersUnknown);
      assert.strictEqual(res.ip, 'unidentified_origin_client');
      assert.strictEqual(res.source, 'fallback');
      assert.strictEqual(res.isTrustedEdge, false);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('7. LinkedIn Strict Validation & Placeholder Handling', () => {
  test('rejects placeholder URL and deceptive URLs', () => {
    // Empty
    assert.strictEqual(hasValidLinkedIn(''), false);

    // Placeholder
    assert.strictEqual(
      hasValidLinkedIn('https://www.linkedin.com/company/replace-with-real-ostrum-profile/'),
      false
    );

    // Deceptive subdomain/domain
    assert.strictEqual(
      hasValidLinkedIn('https://linkedin.com.attacker.org/company/ostrum'),
      false
    );

    // Insecure HTTP
    assert.strictEqual(
      hasValidLinkedIn('http://www.linkedin.com/company/ostrum'),
      false
    );

    // Bare root
    assert.strictEqual(hasValidLinkedIn('https://www.linkedin.com/'), false);

    // Owner-supplied verified canonical company URL
    assert.strictEqual(
      hasValidLinkedIn('https://www.linkedin.com/company/ostrum/'),
      true
    );
  });
});
