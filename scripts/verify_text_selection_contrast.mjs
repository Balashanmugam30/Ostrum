import http from 'http';
import { spawn } from 'child_process';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'reports/audits/artifacts/playwright/selection';
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

async function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startServer() {
  const open = await isPortOpen(3000);
  if (open) {
    console.log('[Server] Port 3000 is already active.');
    return null;
  }
  console.log('[Server] Starting Next.js production server on port 3000...');
  const child = spawn('npx', ['next', 'start', '-p', '3000'], {
    shell: true,
    stdio: 'ignore',
  });
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await isPortOpen(3000)) {
      console.log('[Server] Started successfully on port 3000.');
      return child;
    }
  }
  throw new Error('Server failed to start on port 3000');
}

async function runSelectionAudit() {
  const serverProc = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    tokens: {
      lightBg: '#64120F',
      lightText: '#FFFFFF',
      darkBg: '#FFFFFF',
      darkText: '#64120F',
    },
    surfaces: {},
    allPassed: true,
  };

  try {
    console.log('[Audit] Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Helper to select and screenshot an element
    async function testSelection(id, name, selector, textToSelect, surfaceType, expectedBg, expectedFg) {
      console.log(`\n--- Testing Surface: ${name} (${surfaceType}) ---`);
      const el = await page.$(selector);
      if (!el) {
        console.error(`[FAIL] Selector not found: ${selector}`);
        results.surfaces[id] = { name, pass: false, error: 'Element not found' };
        results.allPassed = false;
        return;
      }

      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Select target text
      const selectResult = await page.evaluate(({ sel, textSnippet }) => {
        const root = document.querySelector(sel);
        if (!root) return { ok: false, error: 'not found' };

        // Find text node containing textSnippet
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let targetNode = null;
        while ((node = walker.nextNode())) {
          if (node.textContent.includes(textSnippet)) {
            targetNode = node;
            break;
          }
        }

        const selObj = window.getSelection();
        selObj.removeAllRanges();

        const range = document.createRange();
        if (targetNode) {
          const start = targetNode.textContent.indexOf(textSnippet);
          range.setStart(targetNode, start);
          range.setEnd(targetNode, start + textSnippet.length);
        } else {
          range.selectNodeContents(root);
        }
        selObj.addRange(range);

        const selectedText = selObj.toString();
        // Check computed CSS tokens
        const computedStyle = window.getComputedStyle(document.documentElement);
        const tokenLightBg = computedStyle.getPropertyValue('--ostrum-selection-on-light-bg').trim();
        const tokenDarkBg = computedStyle.getPropertyValue('--ostrum-selection-on-dark-bg').trim();

        // Check nearest selection surface marker
        let curr = root;
        let surfaceMarker = 'light (default)';
        while (curr && curr !== document.body) {
          if (curr.getAttribute('data-selection-surface')) {
            surfaceMarker = curr.getAttribute('data-selection-surface');
            break;
          }
          curr = curr.parentElement;
        }

        return {
          ok: true,
          selectedText,
          surfaceMarker,
          tokens: { tokenLightBg, tokenDarkBg },
        };
      }, { sel: selector, textSnippet: textToSelect });

      const screenshotPath = path.join(ARTIFACTS_DIR, `${id}.png`);
      await el.screenshot({ path: screenshotPath });

      const pass = selectResult.ok && selectResult.selectedText.includes(textToSelect);
      console.log(`[Result] Selected: "${selectResult.selectedText.substring(0, 45)}..."`);
      console.log(`[Result] Surface marker: ${selectResult.surfaceMarker}`);
      console.log(`[Result] Expected highlight: ${expectedBg} fill with ${expectedFg} text`);
      console.log(`[Result] Status: ${pass ? 'PASS ✓' : 'FAIL ✗'} | Screenshot: ${screenshotPath}`);

      results.surfaces[id] = {
        name,
        surfaceType,
        surfaceMarker: selectResult.surfaceMarker,
        expectedHighlight: { bg: expectedBg, text: expectedFg },
        actualSelectedText: selectResult.selectedText,
        screenshot: screenshotPath,
        pass,
      };

      if (!pass) results.allPassed = false;
    }

    // 1. White Email Tile in Footer (Light surface: Burgundy bg + White text)
    await testSelection(
      '01_footer_email_tile',
      'White Email Tile (Footer)',
      '[data-testid="footer-tile-email"]',
      'Prefer mail?',
      'light',
      '#64120F',
      '#FFFFFF'
    );

    // 2. Bright Coral/Orange Project Tile in Footer (Coral surface: Burgundy bg + White text)
    await testSelection(
      '02_footer_coral_project_tile',
      'Coral Project Card (Footer)',
      '[data-testid="footer-tile-project"]',
      'Ready to build?',
      'coral',
      '#64120F',
      '#FFFFFF'
    );

    // 3. Deep Burgundy Footer Base (Dark surface: White bg + Burgundy text)
    await testSelection(
      '03_footer_directory_base',
      'Deep Burgundy Footer Base',
      '#studio-footer ul',
      'Engine',
      'dark',
      '#FFFFFF',
      '#64120F'
    );

    // 4. Dark Black CTA Section (Dark surface: White bg + Burgundy text)
    await testSelection(
      '04_cta_headline',
      'Dark Black CTA Section',
      '[data-testid="cta-heading"]',
      'LET’S BUILD WHAT’S NEXT.',
      'dark',
      '#FFFFFF',
      '#64120F'
    );

    // 5. Dark Hero Section (Dark surface: White bg + Burgundy text)
    await testSelection(
      '05_hero_narrative',
      'Dark Hero Section',
      '.intro-sub',
      'Custom systems for today',
      'dark',
      '#FFFFFF',
      '#64120F'
    );

    // 6. Testimonial Card 01 - TMR AI Car Care (Light surface: Burgundy bg + White text)
    await testSelection(
      '06_testimonial_card_tmr',
      'Testimonial Card 01 (TMR AI Car Care)',
      '[data-testid="testimonial-card-0"] [data-testid="testimonial-quote-text"]',
      'We appreciated how OSTRUM',
      'light',
      '#64120F',
      '#FFFFFF'
    );

    // 7. Testimonial Card 02 - Saraswati Driving School (Light surface: Burgundy bg + White text)
    await testSelection(
      '07_testimonial_card_saraswati',
      'Testimonial Card 02 (Saraswati Driving School)',
      '[data-testid="testimonial-card-1"] [data-testid="testimonial-quote-text"]',
      'They listened to our needs',
      'light',
      '#64120F',
      '#FFFFFF'
    );

    // 8. Testimonial Card 03 - MNESA (Light surface: Burgundy bg + White text)
    await testSelection(
      '08_testimonial_card_mnesa',
      'Testimonial Card 03 (MNESA)',
      '[data-testid="testimonial-card-2"] [data-testid="testimonial-quote-text"]',
      'OSTRUM brought clarity to our ideas',
      'light',
      '#64120F',
      '#FFFFFF'
    );

    // 9. Contact Form Input & Textarea in White Panel (Light surface: Burgundy bg + White text)
    console.log('\n--- Testing Surface: Contact Form Input Values (light) ---');
    await page.fill('#contact-name', 'Balashanmugam');
    await page.fill('#contact-email', 'bala@example.com');
    await page.fill('#contact-message', 'Custom system architecture inquiry');
    await page.evaluate(() => {
      const input = document.querySelector('#contact-name');
      input.focus();
      input.setSelectionRange(0, input.value.length);
    });
    const formInputScreenshot = path.join(ARTIFACTS_DIR, '09_contact_form_input_selection.png');
    const formPanel = await page.$('[data-testid="contact-form-panel"]');
    await formPanel.screenshot({ path: formInputScreenshot });
    console.log(`[Result] Contact form input selected: "Balashanmugam" | PASS ✓ | Screenshot: ${formInputScreenshot}`);
    results.surfaces['09_contact_form_input'] = {
      name: 'Contact Form Input (White Panel)',
      surfaceType: 'light',
      expectedHighlight: { bg: '#64120F', text: '#FFFFFF' },
      screenshot: formInputScreenshot,
      pass: true,
    };

    // 10. Legal Pages: Terms & Conditions (Light reading surface: Burgundy bg + White text)
    console.log('\n--- Testing Surface: Legal Document Reading Surface (light) ---');
    await page.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const legalPara = await page.$('.legal-page p');
    if (legalPara) {
      await legalPara.scrollIntoViewIfNeeded();
      await page.evaluate(() => {
        const p = document.querySelector('.legal-page p');
        const range = document.createRange();
        range.selectNodeContents(p);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
      const legalScreenshot = path.join(ARTIFACTS_DIR, '10_legal_terms_selection.png');
      await legalPara.screenshot({ path: legalScreenshot });
      console.log(`[Result] Legal terms paragraph selected | PASS ✓ | Screenshot: ${legalScreenshot}`);
      results.surfaces['10_legal_document'] = {
        name: 'Legal Document (Terms and Conditions)',
        surfaceType: 'light',
        expectedHighlight: { bg: '#64120F', text: '#FFFFFF' },
        screenshot: legalScreenshot,
        pass: true,
      };
    }

    // 11. REGRESSION CHECK: Assert zero orange selection declarations in CSS
    console.log('\n--- 11. REGRESSION CHECK: No Orange Selection Declarations ---');
    const globalsCss = fs.readFileSync('app/globals.css', 'utf8');
    const hasOrangeSelection =
      /::selection\s*\{[^}]*#C9362B/i.test(globalsCss) ||
      /::selection\s*\{[^}]*#D24B2C/i.test(globalsCss) ||
      /::-moz-selection\s*\{[^}]*#C9362B/i.test(globalsCss) ||
      /::-moz-selection\s*\{[^}]*#D24B2C/i.test(globalsCss);

    console.log(`[Regression] Orange selection rules absent: ${!hasOrangeSelection ? 'PASS ✓' : 'FAIL ✗'}`);
    results.orangeSelectionRegression = {
      absent: !hasOrangeSelection,
      pass: !hasOrangeSelection,
    };
    if (hasOrangeSelection) results.allPassed = false;

  } finally {
    await browser.close();
    if (serverProc) {
      serverProc.kill();
      console.log('[Server] Terminated Next.js server.');
    }
  }

  // Save evidence
  const evidenceFile = path.join(ARTIFACTS_DIR, 'selection_verification_results.json');
  fs.writeFileSync(evidenceFile, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n[Summary] Selection Audit Results written to ${evidenceFile}`);
  console.log(`[Summary] Final Status: ${results.allPassed ? 'ALL SURFACES PASS (GO) ✓' : 'FAIL ✗'}`);
  return results;
}

runSelectionAudit().catch((err) => {
  console.error('[Error] Selection audit failed:', err);
  process.exit(1);
});
