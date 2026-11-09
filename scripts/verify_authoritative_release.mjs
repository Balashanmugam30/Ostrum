import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import axeSource from 'axe-core';

const BASE_URL = 'http://localhost:3000';
const ARTIFACTS_DIR = path.resolve('reports/audits/artifacts/playwright');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const VIEWPORT_MATRIX = [
  { name: 'owner-reference-desktop', width: 1648, height: 928 },
  { name: 'large-desktop', width: 1920, height: 1080 },
  { name: 'standard-desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'compact-mobile', width: 375, height: 667 },
  { name: 'narrow-mobile', width: 360, height: 800 },
];

async function runAuthoritativeVerification() {
  console.log('🚀 Starting OSTRUM Master Playwright Regression Suite...');
  const browser = await chromium.launch({ headless: true });
  const results = {
    timestamp: new Date().toISOString(),
    commit: process.env.GIT_COMMIT || 'HEAD',
    browserVersion: browser.version(),
    copyAssertions: {},
    heroControls: {},
    testimonialDomAndSelection: {},
    footerLinkedIn: {},
    faviconAndBrandIcons: {},
    contactFormAndInteractions: {},
    viewportsAndOverflow: [],
    axeAccessibility: {},
    consoleErrors: [],
    overallPass: true,
  };

  try {
    const page = await browser.newPage({ viewport: { width: 1648, height: 928 } });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource') && !text.includes('favicon')) {
          results.consoleErrors.push(text);
        }
      }
    });

    // =========================================================================
    // A. COPY ASSERTIONS
    // =========================================================================
    console.log('\n--- A. COPY ASSERTIONS ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Skip preloader if active
    await page.evaluate(() => {
      const preloader = document.getElementById('ostrum-preloader');
      if (preloader) preloader.style.display = 'none';
    });

    const pageContent = await page.content();

    // 1. Hero text
    const expectedHeroBusiness = 'We build custom software and AI systems for ambitious businesses.';
    const expectedHeroProducts = 'We create original digital products for problems worth solving.';
    const expectedBridge = 'Custom systems for today. Original products for what’s next.';
    const hasHeroBusiness = pageContent.includes(expectedHeroBusiness);
    const hasHeroProducts = pageContent.includes(expectedHeroProducts);
    const hasBridge = pageContent.includes(expectedBridge);

    console.log(`[Copy] Hero Business: ${hasHeroBusiness ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`[Copy] Hero Products: ${hasHeroProducts ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`[Copy] Hero Bridge: ${hasBridge ? 'PASS ✓' : 'FAIL ✗'}`);

    // 2. Panel 01 & Panel 02
    const panel01Headline = pageContent.includes('Custom systems, built around your business.');
    const panel01Detail = pageContent.includes('Software, integrations and AI automation shaped around your workflows.');
    const panel02Headline = pageContent.includes('Original products for real problems.');
    const panel02Detail = pageContent.includes('We validate ideas and build selected ventures through OSTRUM Ventures.');

    console.log(`[Copy] Panel 01 Headline & Detail: ${panel01Headline && panel01Detail ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`[Copy] Panel 02 Headline & Detail: ${panel02Headline && panel02Detail ? 'PASS ✓' : 'FAIL ✗'}`);

    // 3. Capabilities
    const capIntro = pageContent.includes('Digital experiences, AI systems and connected software that make work simpler.');
    const cap1 = pageContent.includes('Websites, storefronts and portals designed for clear journeys, accessibility and search.');
    const cap2 = pageContent.includes('AI agents and workflow automation that connect tools and reduce repetitive work, with human oversight.');
    const cap3 = pageContent.includes('Custom platforms, CRM/ERP integrations and dashboards that bring business operations together.');
    const cap4 = pageContent.includes('From product discovery to SaaS, MVPs, web apps, mobile apps and production APIs.');
    const cap5 = pageContent.includes('IoT, embedded software and device integrations that connect hardware to useful digital systems.');
    const cap6 = pageContent.includes('Bespoke software, legacy modernisation and integrations for needs off-the-shelf tools cannot meet.');

    const allCapsPass = capIntro && cap1 && cap2 && cap3 && cap4 && cap5 && cap6;
    console.log(`[Copy] Capabilities Intro & 6 Cards: ${allCapsPass ? 'PASS ✓' : 'FAIL ✗'}`);

    // 4. Selected Work
    const tmrPass = pageContent.includes('A digital platform for automotive care studios, bringing service discovery, customer enquiries and bookings together.');
    const sarasPass = pageContent.includes('A booking and fleet-scheduling platform for student lessons, training schedules and vehicle coordination.');
    const mnesaPass = pageContent.includes('An OSTRUM venture exploring a simpler way to capture ideas, organise commitments and turn them into action.');
    const allWorksPass = tmrPass && sarasPass && mnesaPass;
    console.log(`[Copy] Selected Work 3 Projects: ${allWorksPass ? 'PASS ✓' : 'FAIL ✗'}`);

    // 5. FAQ
    const faqIntro = pageContent.includes('A few answers about our work, process and delivery.');
    const faqQ1 = pageContent.includes('OSTRUM builds custom software, AI systems, digital platforms and original products.');
    const faqQ2 = pageContent.includes('We deliver custom software, web and mobile apps, UI/UX, e-commerce, AI automation');
    const faqQ3 = pageContent.includes('We assess each enquiry on its goals, scope and fit');
    const faqQ4 = pageContent.includes('Custom software can fit workflows that standard tools cannot support.');
    const faqQ5 = pageContent.includes('long-term fit - not trends');
    const faqQ6 = pageContent.includes('We identify suitable workflows, connect the required tools');
    const faqQ7 = pageContent.includes('We review the existing systems, integrations and data needs');
    const faqQ8 = pageContent.includes('Pricing depends on scope, complexity, integrations and delivery needs.');
    const faqQ9 = pageContent.includes('Ownership, licensing and source-code access are defined in the project agreement');
    const faqQ10 = pageContent.includes('Post-launch support and maintenance are discussed and defined');
    const allFaqPass = faqIntro && faqQ1 && faqQ2 && faqQ3 && faqQ4 && faqQ5 && faqQ6 && faqQ7 && faqQ8 && faqQ9 && faqQ10;
    console.log(`[Copy] FAQ Intro & 10 Q&As: ${allFaqPass ? 'PASS ✓' : 'FAIL ✗'}`);

    // 6. Contact
    const contactHeading = pageContent.includes('Tell us what you’re building.');
    const contactDesc = pageContent.includes('Tell us what you need to build or improve. We’ll review your brief and reply with a clear next step.');
    const contactPrivacy = pageContent.includes('We use your details to review your enquiry and protect this form. Read our');
    const allContactPass = contactHeading && contactDesc && contactPrivacy;
    console.log(`[Copy] Contact Heading, Desc & Privacy: ${allContactPass ? 'PASS ✓' : 'FAIL ✗'}`);

    // 7. Bottom CTA
    const ctaEyebrow = pageContent.includes('HAVE A PROJECT IN MIND?');
    const ctaHeading = pageContent.includes('LET’S BUILD WHAT’S NEXT.');
    const ctaSupport = pageContent.includes('Software, AI and digital products. Built for your business.');
    const allCtaPass = ctaEyebrow && ctaHeading && ctaSupport;
    console.log(`[Copy] Bottom CTA: ${allCtaPass ? 'PASS ✓' : 'FAIL ✗'}`);

    // 8. Footer
    const footerDesc = pageContent.includes('Custom software, AI systems and original digital products.');
    const footerStartProject = pageContent.includes('Start a project');
    console.log(`[Copy] Footer Description & Action: ${footerDesc && footerStartProject ? 'PASS ✓' : 'FAIL ✗'}`);

    results.copyAssertions = {
      hero: hasHeroBusiness && hasHeroProducts && hasBridge,
      panels: panel01Headline && panel01Detail && panel02Headline && panel02Detail,
      capabilities: allCapsPass,
      selectedWork: allWorksPass,
      faq: allFaqPass,
      contact: allContactPass,
      bottomCta: allCtaPass,
      footer: footerDesc && footerStartProject,
    };

    // =========================================================================
    // B. HERO REDIRECTION CONTROLS REMOVAL
    // =========================================================================
    console.log('\n--- B. HERO CONTROLS REMOVAL ---');
    const hasSystemsArch = pageContent.includes('SYSTEMS ARCHITECTURE');
    const hasOriginalVent = pageContent.includes('ORIGINAL VENTURES');
    const systemsAnchor = await page.$('a[href="#capabilities"]');
    const venturesAnchor = await page.$('a[href="#selected-work"]');

    // Tab test: focus through hero and ensure no action link is focused
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const activeElText = await page.evaluate(() => document.activeElement?.textContent || '');
    const tabLandedOnOldControl = activeElText.includes('SYSTEMS ARCHITECTURE') || activeElText.includes('ORIGINAL VENTURES');

    const heroControlsRemoved = !hasSystemsArch && !hasOriginalVent && !tabLandedOnOldControl;
    console.log(`[Hero Controls] SYSTEMS ARCHITECTURE absent: ${!hasSystemsArch ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`[Hero Controls] ORIGINAL VENTURES absent: ${!hasOriginalVent ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`[Hero Controls] Keyboard tab never focuses old controls: ${!tabLandedOnOldControl ? 'PASS ✓' : 'FAIL ✗'}`);

    results.heroControls = {
      systemsArchitectureAbsent: !hasSystemsArch,
      originalVenturesAbsent: !hasOriginalVent,
      keyboardTabClean: !tabLandedOnOldControl,
      pass: heroControlsRemoved,
    };

    // =========================================================================
    // C. TESTIMONIAL DOM TEXT & SELECTION
    // =========================================================================
    console.log('\n--- C. TESTIMONIAL DOM TEXT & SELECTION ---');
    const backdropIsDomText = await page.evaluate(() => {
      const h2 = document.querySelector('[data-testid="testimonials-heading"]');
      return h2 && h2.tagName === 'H2' && h2.textContent?.trim() === 'TESTIMONIALS';
    });
    console.log(`[Testimonials] Backdrop is real DOM H2: ${backdropIsDomText ? 'PASS ✓' : 'FAIL ✗'}`);

    // Selection test: select quote in card and assert selection contains ONLY quote, not backdrop
    const selectionCheck = await page.evaluate(() => {
      const quoteEl = document.querySelector('[data-testid="testimonial-quote-text"]');
      if (!quoteEl) return { success: false, reason: 'quote element not found' };

      const range = document.createRange();
      range.selectNodeContents(quoteEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      const selected = sel.toString().trim();
      const capturesBackdrop = selected.includes('TESTIMONIALS');
      return {
        success: selected.length > 10 && !capturesBackdrop,
        selectedSnippet: selected.substring(0, 60),
        capturesBackdrop,
      };
    });
    console.log(`[Testimonials] Quote selection isolation: ${selectionCheck.success ? 'PASS ✓' : 'FAIL ✗'} ("${selectionCheck.selectedSnippet}...")`);

    results.testimonialDomAndSelection = {
      backdropIsDomText,
      selectionIsolation: selectionCheck.success,
      selectedSnippet: selectionCheck.selectedSnippet,
      pass: backdropIsDomText && selectionCheck.success,
    };

    // =========================================================================
    // D. FOOTER LINKEDIN BRAND ICON
    // =========================================================================
    console.log('\n--- D. FOOTER LINKEDIN BRAND ICON ---');
    const linkedInCheck = await page.evaluate(() => {
      const link = document.querySelector('[data-testid="footer-linkedin-link"]');
      if (!link) return { found: false };
      const href = link.getAttribute('href');
      const ariaLabel = link.getAttribute('aria-label');
      const rect = link.getBoundingClientRect();
      const svg = link.querySelector('svg');
      const svgRect = svg ? svg.getBoundingClientRect() : null;
      const compStyle = window.getComputedStyle(link);

      return {
        found: true,
        href,
        ariaLabel,
        visible: rect.width > 0 && rect.height > 0 && compStyle.display !== 'none' && compStyle.visibility !== 'hidden',
        svgWidth: svgRect ? svgRect.width : 0,
        svgHeight: svgRect ? svgRect.height : 0,
        noViewAsMember: !href?.includes('viewAsMember'),
      };
    });

    const linkedInPass = linkedInCheck.found &&
      linkedInCheck.href === 'https://www.linkedin.com/company/ostrum/' &&
      linkedInCheck.ariaLabel === 'OSTRUM on LinkedIn' &&
      linkedInCheck.visible &&
      linkedInCheck.svgWidth > 0;

    console.log(`[LinkedIn] Footer Link found: ${linkedInCheck.found ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`[LinkedIn] Exact href: "${linkedInCheck.href}" (${linkedInPass ? 'PASS ✓' : 'FAIL ✗'})`);
    console.log(`[LinkedIn] Visible SVG dimensions: ${linkedInCheck.svgWidth}x${linkedInCheck.svgHeight}px`);
    console.log(`[LinkedIn] aria-label: "${linkedInCheck.ariaLabel}"`);

    results.footerLinkedIn = {
      ...linkedInCheck,
      pass: linkedInPass,
    };

    // =========================================================================
    // E. FAVICON & BRAND ICON DERIVATIVES
    // =========================================================================
    console.log('\n--- E. FAVICON & BRAND ICONS ---');
    const iconRoutes = [
      { url: '/favicon.ico', expectedStatus: 200, mime: 'image' },
      { url: '/favicon-16x16.png', expectedStatus: 200, mime: 'image/png' },
      { url: '/favicon-32x32.png', expectedStatus: 200, mime: 'image/png' },
      { url: '/apple-touch-icon.png', expectedStatus: 200, mime: 'image/png' },
      { url: '/icon-192.png', expectedStatus: 200, mime: 'image/png' },
      { url: '/icon-512.png', expectedStatus: 200, mime: 'image/png' },
      { url: '/manifest.webmanifest', expectedStatus: 200, mime: 'application/manifest+json' },
      { url: '/brand/ostrum-3d-symbol-master.png', expectedStatus: 200, mime: 'image/png' },
    ];

    const iconResults = [];
    for (const r of iconRoutes) {
      const resp = await page.goto(`${BASE_URL}${r.url}`);
      const status = resp?.status();
      const contentType = resp?.headers()['content-type'] || '';
      const ok = status === r.expectedStatus;
      console.log(`[Icon Route] ${r.url}: HTTP ${status} (${contentType}) - ${ok ? 'PASS ✓' : 'FAIL ✗'}`);
      iconResults.push({ url: r.url, status, contentType, ok });
    }

    const allIconsPass = iconResults.every((i) => i.ok);
    results.faviconAndBrandIcons = {
      routes: iconResults,
      pass: allIconsPass,
    };

    // =========================================================================
    // F. CONTACT FORM VALIDATION & INTERACTIONS
    // =========================================================================
    console.log('\n--- F. CONTACT FORM VALIDATION ---');
    await page.goto(`${BASE_URL}/#contact`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Empty submit
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn?.click();
    await page.waitForTimeout(300);
    const alert1 = await page.$eval('[role="alert"]', (el) => el.innerText).catch(() => '');
    const emptyValidationOk = alert1.includes('enter your name');
    console.log(`[Form] Empty submit validation: "${alert1}" (${emptyValidationOk ? 'PASS ✓' : 'FAIL ✗'})`);

    // Invalid email & field preservation
    await page.fill('#contact-name', 'Balashanmugam');
    await page.fill('#contact-email', 'invalid-email');
    await page.fill('#contact-message', 'Custom software evaluation request.');
    await submitBtn?.click();
    await page.waitForTimeout(300);
    const alert2 = await page.$eval('[role="alert"]', (el) => el.innerText).catch(() => '');
    const emailValidationOk = alert2.includes('valid email');
    const preservedName = await page.$eval('#contact-name', (el) => el.value);
    const preservationOk = preservedName === 'Balashanmugam';

    console.log(`[Form] Invalid email alert: "${alert2}" (${emailValidationOk ? 'PASS ✓' : 'FAIL ✗'})`);
    console.log(`[Form] Field preservation: "${preservedName}" (${preservationOk ? 'PASS ✓' : 'FAIL ✗'})`);

    results.contactFormAndInteractions = {
      emptyValidationOk,
      emailValidationOk,
      preservationOk,
      pass: emptyValidationOk && emailValidationOk && preservationOk,
    };

    // =========================================================================
    // G. VIEWPORT MATRIX & ZERO HORIZONTAL OVERFLOW
    // =========================================================================
    console.log('\n--- G. VIEWPORT MATRIX & ZERO OVERFLOW ---');
    for (const vp of VIEWPORT_MATRIX) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      // Check overflow
      const overflow = await page.evaluate((expectedW) => {
        const scrollW = document.documentElement.scrollWidth;
        const innerW = window.innerWidth;
        const diff = scrollW - expectedW;
        return {
          expectedW,
          scrollW,
          overflowPx: Math.max(0, diff),
        };
      }, vp.width);

      const pass = overflow.overflowPx === 0;
      console.log(`[Viewport] ${vp.name} (${vp.width}x${vp.height}): ${pass ? 'PASS (0px overflow) ✓' : `FAIL (${overflow.overflowPx}px) ✗`}`);

      // Capture screenshot
      const shotPath = path.join(ARTIFACTS_DIR, `${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });

      results.viewportsAndOverflow.push({
        device: vp.name,
        width: vp.width,
        height: vp.height,
        scrollWidth: overflow.scrollW,
        overflowPx: overflow.overflowPx,
        screenshot: shotPath,
        pass,
      });
    }

    // Capture focused hero and footer on owner desktop (1648 x 928)
    await page.setViewportSize({ width: 1648, height: 928 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'owner-hero-desktop-1648x928.png') });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'owner-footer-desktop-1648x928.png') });

    // =========================================================================
    // H. AXE-CORE ACCESSIBILITY AUDIT
    // =========================================================================
    console.log('\n--- H. AXE-CORE ACCESSIBILITY AUDIT ---');
    const routesToAudit = ['/', '/terms-and-conditions', '/privacy-policy'];
    const axeResults = {};

    for (const route of routesToAudit) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      // Inject and run axe
      const axeReport = await page.evaluate((axeCode) => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.text = axeCode;
          document.head.appendChild(script);
          window.axe.run(document, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
            },
          }).then((res) => resolve({
            violationsCount: res.violations.length,
            violations: res.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodesCount: v.nodes.length,
            })),
          })).catch((err) => resolve({ error: err.message }));
        });
      }, axeSource.source);

      console.log(`[Axe Audit] ${route}: Violations=${axeReport.violationsCount}`);
      axeResults[route] = axeReport;
    }

    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'axe-results.json'), JSON.stringify(axeResults, null, 2), 'utf8');
    results.axeAccessibility = axeResults;

    await page.close();
  } finally {
    await browser.close();
  }

  // Final overall pass determination
  const allCopyPass = Object.values(results.copyAssertions).every(Boolean);
  const heroPass = results.heroControls.pass;
  const testimonialPass = results.testimonialDomAndSelection.pass;
  const linkedInPass = results.footerLinkedIn.pass;
  const iconsPass = results.faviconAndBrandIcons.pass;
  const contactPass = results.contactFormAndInteractions.pass;
  const overflowPass = results.viewportsAndOverflow.every((v) => v.pass);

  results.overallPass = allCopyPass && heroPass && testimonialPass && linkedInPass && iconsPass && contactPass && overflowPass;

  // Save report
  const reportPath = path.join(ARTIFACTS_DIR, 'master_release_regression_evidence.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n📄 Regression evidence saved to: ${reportPath}`);

  console.log('\n=======================================================');
  console.log(`MASTER PLAYWRIGHT REGRESSION VERDICT: ${results.overallPass ? 'ALL GATES PASS (GO) ✓' : 'FAIL (NO-GO) ✗'}`);
  console.log('=======================================================');

  if (!results.overallPass) {
    process.exit(1);
  }
}

runAuthoritativeVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
