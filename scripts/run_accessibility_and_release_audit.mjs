import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const AXE_PATH = path.resolve('node_modules/axe-core/axe.min.js');

const VIEWPORTS = [
  { name: 'large-desktop', width: 1920, height: 1080 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'small-desktop', width: 1024, height: 768 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'mobile-large', width: 430, height: 932 },
  { name: 'mobile-medium', width: 390, height: 844 },
  { name: 'mobile-compact', width: 360, height: 800 },
];

async function runAudit() {
  console.log('🚀 Launching OSTRUM Comprehensive Verification & Accessibility Audit...');
  const browser = await chromium.launch({ headless: true });
  const results = {
    timestamp: new Date().toISOString(),
    axeResults: {},
    dashScan: {},
    overflowMatrix: [],
    formStates: {},
    consoleErrors: [],
  };

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource') && !text.includes('favicon')) {
          results.consoleErrors.push(text);
        }
      }
    });

    // 1. Accessibility Scan with axe-core
    console.log('\n--- 1. AXE-CORE ACCESSIBILITY AUDIT ---');
    const routes = [
      { name: 'homepage', path: '/' },
      { name: 'terms', path: '/terms-and-conditions' },
      { name: 'privacy', path: '/privacy-policy' },
    ];

    for (const r of routes) {
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      // Hide preloader for DOM audit
      await page.evaluate(() => {
        const p = document.getElementById('ostrum-preloader');
        if (p) p.style.display = 'none';
      });

      if (fs.existsSync(AXE_PATH)) {
        await page.addScriptTag({ path: AXE_PATH });
        const axeReport = await page.evaluate(async () => {
          // @ts-ignore
          const res = await window.axe.run(document, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
            },
          });
          return {
            violationsCount: res.violations.length,
            violations: res.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.length,
            })),
            passesCount: res.passes.length,
          };
        });

        console.log(`[axe-core] ${r.name}: Violations=${axeReport.violationsCount}, Passes=${axeReport.passesCount}`);
        results.axeResults[r.name] = axeReport;
      }
    }

    // 2. Contact Form Accessibility & State Testing
    console.log('\n--- 2. CONTACT FORM A11Y & STATE TESTING ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      const p = document.getElementById('ostrum-preloader');
      if (p) p.style.display = 'none';
    });

    // Verify Honeypot isolation
    const honeypotInfo = await page.evaluate(() => {
      const hp = document.getElementById('website_url');
      if (!hp) return null;
      return {
        tabIndex: hp.getAttribute('tabindex'),
        autoComplete: hp.getAttribute('autocomplete'),
        containerAriaHidden: hp.parentElement?.getAttribute('aria-hidden'),
      };
    });
    console.log('[Form] Honeypot Isolation:', honeypotInfo);
    results.formStates.honeypot = honeypotInfo;

    // Verify Error State aria attributes
    const submitBtn = page.locator('button[type="submit"]:has-text("Send Enquiry")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(400);

      const errorAlert = await page.locator('#contact-form-error').textContent();
      const nameInputAriaInvalid = await page.locator('#contact-name').getAttribute('aria-invalid');
      const nameInputAriaDescribedby = await page.locator('#contact-name').getAttribute('aria-describedby');

      console.log('[Form Error State]', {
        errorAlert: errorAlert?.trim(),
        nameInputAriaInvalid,
        nameInputAriaDescribedby,
      });

      results.formStates.errorState = {
        errorAlert: errorAlert?.trim(),
        nameInputAriaInvalid,
        nameInputAriaDescribedby,
      };
    }

    // 3. Dash Scan across public pages
    console.log('\n--- 3. ZERO DASH SCAN (U+2014 & U+2013) ---');
    for (const r of routes) {
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const dashes = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        let emCount = 0;
        let enCount = 0;
        const samples = [];
        while ((node = walker.nextNode())) {
          const text = node.textContent || '';
          if (text.includes('\u2014')) {
            emCount += (text.match(/\u2014/g) || []).length;
            samples.push({ type: 'em-dash', text: text.trim().substring(0, 80) });
          }
          if (text.includes('\u2013')) {
            enCount += (text.match(/\u2013/g) || []).length;
            samples.push({ type: 'en-dash', text: text.trim().substring(0, 80) });
          }
        }
        return { emCount, enCount, samples };
      });

      console.log(`[Dash Scan] ${r.name}: Em=${dashes.emCount}, En=${dashes.enCount}`);
      results.dashScan[r.name] = dashes;
    }

    // 4. 8-Device Horizontal Overflow Matrix
    console.log('\n--- 4. 8-DEVICE HORIZONTAL OVERFLOW MATRIX ---');
    for (const vp of VIEWPORTS) {
      const p = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await p.waitForTimeout(500);

      const overflow = await p.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        return { docW, winW, overflowPx: Math.max(0, docW - winW) };
      });

      console.log(`[Overflow Matrix] ${vp.name} (${vp.width}x${vp.height}): ${overflow.overflowPx}px overflow`);
      results.overflowMatrix.push({
        name: vp.name,
        width: vp.width,
        height: vp.height,
        ...overflow,
        pass: overflow.overflowPx <= 1,
      });
      await p.close();
    }

    console.log('\n✅ Audit completed successfully!');
    console.log('Console Errors recorded:', results.consoleErrors.length);
  } finally {
    await browser.close();
  }
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
