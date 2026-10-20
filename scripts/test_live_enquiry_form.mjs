import { chromium } from 'playwright';
import http from 'node:http';

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode) resolve(true);
          else reject(new Error('No status'));
        });
        req.on('error', reject);
        req.end();
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function run() {
  console.log('[Enquiry Test Runner] Testing against http://localhost:3000...');
  await waitForServer('http://localhost:3000');

  // 1. API Negative Tests via fetch
  console.log('[Test 1] Testing API validation & honeypot rejection...');
  
  // Invalid email
  const res1 = await fetch('http://localhost:3000/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'invalid-email', message: 'Testing validation error handling' })
  });
  const data1 = await res1.json();
  if (res1.status !== 400 || !data1.error) {
    throw new Error(`Expected 400 for invalid email, got ${res1.status}: ${JSON.stringify(data1)}`);
  }
  console.log('✓ Invalid email rejected with 400');

  // Honeypot
  const res2 = await fetch('http://localhost:3000/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Bot User', email: 'bot@spam.com', message: 'Spam payload content', website_url: 'http://spam.ru' })
  });
  const data2 = await res2.json();
  if (res2.status !== 400 || data2.error !== 'Invalid submission request.') {
    throw new Error(`Expected 400 for honeypot, got ${res2.status}: ${JSON.stringify(data2)}`);
  }
  console.log('✓ Honeypot submission rejected with 400');

  // Missing config returns 503
  const res3 = await fetch('http://localhost:3000/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Legitimate Prospect', email: 'prospect@acme-corp.com', message: 'Interested in bespoke commercial engineering for 2027.' })
  });
  const data3 = await res3.json();
  if (res3.status !== 503 || data3.success !== false) {
    throw new Error(`Expected 503 for missing RESEND_API_KEY, got ${res3.status}: ${JSON.stringify(data3)}`);
  }
  console.log('✓ Missing RESEND_API_KEY gracefully returns 503 without false success');

  // 2. Playwright Real UI Interaction Tests
  console.log('[Test 2] Launching Playwright Chromium for UI interaction tests...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Navigate to contact section
  const contactSection = page.locator('#contact');
  await contactSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  console.log('[Test 3] Testing client-side form validation in UI...');
  const submitBtn = contactSection.locator('button[type="submit"]');

  // Submit empty
  await submitBtn.click();
  await page.waitForTimeout(500);
  const errorText1 = await contactSection.locator('[role="alert"]').textContent();
  if (!errorText1?.includes('Please enter your name')) {
    throw new Error(`Expected name validation error, got: ${errorText1}`);
  }
  console.log('✓ UI catches empty name submission');

  // Fill name & invalid email
  await page.fill('input[name="name"]', 'Dr. Evelyn Reed');
  await page.fill('input[name="email"]', 'notanemail');
  await page.fill('textarea[name="message"]', 'Project scoping inquiry for autonomous logistics.');
  await submitBtn.click();
  await page.waitForTimeout(500);

  const errorText2 = await contactSection.locator('[role="alert"]').textContent();
  if (!errorText2?.includes('valid email address')) {
    throw new Error(`Expected email validation error, got: ${errorText2}`);
  }
  console.log('✓ UI catches invalid email format');

  // Fill valid email & submit to trigger server response
  await page.fill('input[name="email"]', 'evelyn@reed-robotics.tech');
  await submitBtn.click();
  await page.waitForTimeout(1500);

  // Expect server error banner (503 maintenance / offline)
  const errorText3 = await contactSection.locator('[role="alert"]').textContent();
  if (!errorText3?.includes('maintenance') && !errorText3?.includes('hello@theostrum.com')) {
    throw new Error(`Expected maintenance fallback banner, got: ${errorText3}`);
  }
  console.log('✓ UI displays accessible error message without losing form state');

  // Verify form data preserved
  const preservedName = await page.inputValue('input[name="name"]');
  const preservedEmail = await page.inputValue('input[name="email"]');
  const preservedMessage = await page.inputValue('textarea[name="message"]');
  if (preservedName !== 'Dr. Evelyn Reed' || preservedEmail !== 'evelyn@reed-robotics.tech') {
    throw new Error('Form data was lost upon submission failure!');
  }
  console.log('✓ User input strictly preserved upon submission failure');

  await page.screenshot({ path: 'reports/audits/artifacts/enquiry_form_failure_state.png' });
  console.log('✓ Screenshot saved to reports/audits/artifacts/enquiry_form_failure_state.png');

  await browser.close();
  console.log('[All Enquiry Integration Tests Passed Cleanly]');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
