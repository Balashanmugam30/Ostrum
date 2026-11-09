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

async function main() {
  console.log('🚀 Running Comprehensive OSTRUM Pre-Deployment Verification Suite...');
  const results = {
    timestamp: new Date().toISOString(),
    securityHeaders: {},
    faqSsrValidation: {},
    faqSchemaValidation: {},
    previewRouteProtection: {},
    ogImageValidation: {},
    notFoundRouteValidation: {},
    axeResults: {},
    dashScan: {},
    overflowMatrix: [],
    formStates: {},
    consoleErrors: [],
  };

  // 1. Raw HTTP Security Headers & SSR HTML Verification
  console.log('\n--- 1. HTTP HEADERS & SSR HTML VERIFICATION ---');
  const homeRes = await fetch(`${BASE_URL}/`);
  results.securityHeaders = {
    hsts: homeRes.headers.get('strict-transport-security'),
    xContentTypeOptions: homeRes.headers.get('x-content-type-options'),
    xFrameOptions: homeRes.headers.get('x-frame-options'),
    referrerPolicy: homeRes.headers.get('referrer-policy'),
    permissionsPolicy: homeRes.headers.get('permissions-policy'),
    csp: homeRes.headers.get('content-security-policy'),
    xPoweredBy: homeRes.headers.get('x-powered-by'),
  };
  console.log('Headers:', results.securityHeaders);

  const homeHtml = await homeRes.text();

  // Check FAQ answers in SSR HTML
  const faqDataModule = await import('../data/faq.ts');
  const faqItems = faqDataModule.OSTRUM_FAQ_DATA;
  let missingFaqAnswers = 0;
  for (const item of faqItems) {
    if (!homeHtml.includes(item.answer)) {
      console.warn(`[FAQ SSR Check] Missing answer in HTML for: ${item.question}`);
      missingFaqAnswers++;
    }
  }
  results.faqSsrValidation = {
    totalItems: faqItems.length,
    missingItems: missingFaqAnswers,
    allAnswersInSsrHtml: missingFaqAnswers === 0,
  };
  console.log(`[FAQ SSR Check] All ${faqItems.length} answers present in raw HTML: ${missingFaqAnswers === 0}`);

  // Check FAQPage schema
  const hasFaqSchema = homeHtml.includes('"@type":"FAQPage"') || homeHtml.includes('"@type": "FAQPage"');
  results.faqSchemaValidation = {
    hasFaqPageSchema: hasFaqSchema,
  };
  console.log(`[FAQ Schema Check] FAQPage JSON-LD present: ${hasFaqSchema}`);

  // 2. Route /preview/ostrum-core Protection Check
  console.log('\n--- 2. PREVIEW ROUTE PROTECTION CHECK ---');
  const previewRes = await fetch(`${BASE_URL}/preview/ostrum-core`);
  const previewHtml = await previewRes.text();
  const hasNoIndex = previewHtml.includes('content="noindex, nofollow"') || previewHtml.includes('noindex');
  results.previewRouteProtection = {
    statusCode: previewRes.status,
    hasNoIndexMeta: hasNoIndex,
  };
  console.log(`[Preview Route Check] /preview/ostrum-core Status: ${previewRes.status}, Noindex: ${hasNoIndex}`);

  // 3. 404 Route Check
  console.log('\n--- 3. 404 ROUTE CHECK ---');
  const notFoundRes = await fetch(`${BASE_URL}/this-route-does-not-exist`);
  results.notFoundRouteValidation = {
    statusCode: notFoundRes.status,
    isTrue404: notFoundRes.status === 404,
  };
  console.log(`[404 Route Check] /this-route-does-not-exist Status: ${notFoundRes.status}`);

  // 4. OG Image Validation
  console.log('\n--- 4. OG IMAGE VALIDATION ---');
  const ogRes = await fetch(`${BASE_URL}/images/ostrum-og.png`);
  const ogBuf = await ogRes.arrayBuffer();
  results.ogImageValidation = {
    status: ogRes.status,
    sizeBytes: ogBuf.byteLength,
    sizeKb: Math.round(ogBuf.byteLength / 1024),
    under300Kb: ogBuf.byteLength < 300 * 1024,
  };
  console.log(`[OG Image Check] Status: ${ogRes.status}, Size: ${Math.round(ogBuf.byteLength / 1024)} KB, Under 300KB: ${results.ogImageValidation.under300Kb}`);

  // 5. Playwright Browser Automation: Axe-Core, Viewports, Form, Dash Scan
  console.log('\n--- 5. PLAYWRIGHT AUDITS ---');
  const browser = await chromium.launch({ headless: true });

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

    const routes = [
      { name: 'homepage', path: '/' },
      { name: 'terms', path: '/terms-and-conditions' },
      { name: 'privacy', path: '/privacy-policy' },
    ];

    // Axe-Core Scan
    for (const r of routes) {
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
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

    // Zero Dash Scan
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

    // 8-Device Horizontal Overflow Matrix
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

    // Footer LinkedIn Verification (confirm no "Pending" badge)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const hasPendingBadge = await page.locator('[data-testid="footer-linkedin-pending"]').count();
    console.log(`[Footer LinkedIn] Pending badge present: ${hasPendingBadge > 0}`);
    results.footerLinkedIn = {
      hasPendingBadge: hasPendingBadge > 0,
      pass: hasPendingBadge === 0,
    };

    console.log('\n--- AUDIT COMPLETE ---');
    console.log('Console errors:', results.consoleErrors.length);
  } finally {
    await browser.close();
  }

  // Save artifacts
  const outPath1 = path.resolve('reports/audits/artifacts/predeployment_release_verification_results.json');
  fs.writeFileSync(outPath1, JSON.stringify(results, null, 2), 'utf8');

  // Also update master release verification results with axeResults & latest validations
  const masterPath = path.resolve('reports/audits/artifacts/master_release_verification_results.json');
  if (fs.existsSync(masterPath)) {
    const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
    master.axeResults = results.axeResults;
    master.faqSsrValidation = results.faqSsrValidation;
    master.faqSchemaValidation = results.faqSchemaValidation;
    master.previewRouteProtection = results.previewRouteProtection;
    master.notFoundRouteValidation = results.notFoundRouteValidation;
    master.ogImageValidation = results.ogImageValidation;
    master.timestamp = results.timestamp;
    fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');
  }

  console.log(`Artifact saved: ${outPath1}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
