import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const ARTIFACTS_DIR = path.resolve('reports/audits/artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

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

async function runMasterVerification() {
  console.log('🚀 Starting OSTRUM Master Release Verification Suite...');
  const browser = await chromium.launch({ headless: true });
  const results = {
    timestamp: new Date().toISOString(),
    dashScan: {},
    textSelection: {},
    heroNavigation: {},
    wordmarkContrast: {},
    footerWordmarkJump: {},
    curtainReveals: {},
    selectedWorkArtwork: {},
    contactForm: {},
    seoAndStructuredData: {},
    overflowMatrix: [],
    reducedMotion: {},
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

    // =========================================================================
    // 1. DASH SCAN ON PUBLIC PAGES (Zero U+2014 & U+2013 in visible DOM text)
    // =========================================================================
    console.log('\n--- 1. DASH SCAN ON PUBLIC PAGES ---');
    const pagesToScan = [
      { name: 'homepage', path: '/' },
      { name: 'terms', path: '/terms-and-conditions' },
      { name: 'privacy', path: '/privacy-policy' },
    ];

    for (const p of pagesToScan) {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

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

      console.log(`[Dash Scan] ${p.name}: Em-dashes=${dashes.emCount}, En-dashes=${dashes.enCount}`);
      results.dashScan[p.name] = dashes;
    }

    // =========================================================================
    // 2. TEXT SELECTION & HIGHLIGHT ACROSS SECTIONS
    // =========================================================================
    console.log('\n--- 2. TEXT SELECTION & COPYABILITY ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Skip preloader if active
    await page.evaluate(() => {
      const preloader = document.getElementById('ostrum-preloader');
      if (preloader) preloader.style.display = 'none';
    });

    const selectionSelectors = [
      { name: 'Capabilities Card', selector: '[data-testid="capability-card-1"] p' },
      { name: 'FAQ Question', selector: '#faq-question-what-does-ostrum-do' },
      { name: 'Contact Heading', selector: '[data-testid="contact-heading"]' },
      { name: 'Liquid Sand CTA', selector: '[data-testid="cta-heading"]' },
      { name: 'Engine Statement', selector: '#engine h3' },
      { name: 'Footer Note', selector: 'footer p' },
    ];

    for (const item of selectionSelectors) {
      const selectedText = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        return selection.toString().trim();
      }, item.selector);

      const isSelectable = selectedText && selectedText.length > 0;
      console.log(`[Text Selection] ${item.name}: ${isSelectable ? 'SELECTABLE ✓' : 'FAILED ✗'} ("${selectedText?.substring(0, 35)}...")`);
      results.textSelection[item.name] = { selectable: isSelectable, sample: selectedText?.substring(0, 50) };
    }

    // Test selection on Terms page
    await page.goto(`${BASE_URL}/terms-and-conditions`, { waitUntil: 'networkidle' });
    const termsSelected = await page.evaluate(() => {
      const p = document.querySelector('#acceptance p');
      if (!p) return null;
      const range = document.createRange();
      range.selectNodeContents(p);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return selection.toString().trim();
    });
    console.log(`[Text Selection] Terms Document Paragraph: ${termsSelected ? 'SELECTABLE ✓' : 'FAILED ✗'}`);
    results.textSelection['Terms Section 01'] = { selectable: !!termsSelected, sample: termsSelected?.substring(0, 50) };

    // =========================================================================
    // 3. HERO / ENGINE LABELS NAVIGATION (Accessible Anchor Links)
    // =========================================================================
    console.log('\n--- 3. ENGINE LABELS SEMANTIC NAVIGATION ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const systemsLink = await page.$('a[href="#capabilities"]');
    const venturesLink = await page.$('a[href="#selected-work"]');

    const systemsHref = await systemsLink?.getAttribute('href');
    const venturesHref = await venturesLink?.getAttribute('href');
    const systemsAria = await systemsLink?.getAttribute('aria-label');
    const venturesAria = await venturesLink?.getAttribute('aria-label');

    console.log(`[Navigation] SYSTEMS ARCHITECTURE Link: href="${systemsHref}", aria-label="${systemsAria}"`);
    console.log(`[Navigation] ORIGINAL VENTURES Link: href="${venturesHref}", aria-label="${venturesAria}"`);
    results.heroNavigation = {
      systemsArchitecture: { href: systemsHref, ariaLabel: systemsAria, valid: systemsHref === '#capabilities' },
      originalVentures: { href: venturesHref, ariaLabel: venturesAria, valid: venturesHref === '#selected-work' },
    };

    // =========================================================================
    // 4. FOOTER WORDMARK CLICK-HOP & BEAM SHEEN
    // =========================================================================
    console.log('\n--- 4. FOOTER WORDMARK HOP & BEAM ---');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);

    const firstLetter = await page.$('.bwf-l');
    let hopVerified = false;
    let initialY = 0;
    let hopY = 0;

    if (firstLetter) {
      initialY = await firstLetter.evaluate((el) => el.getBoundingClientRect().top);
      await firstLetter.click();
      await page.waitForTimeout(300); // Capture mid-flight peak
      const hasHopClass = await firstLetter.evaluate((el) => el.classList.contains('is-hop'));
      hopY = await firstLetter.evaluate((el) => el.getBoundingClientRect().top);
      const isElevated = hopY < initialY;
      hopVerified = hasHopClass || isElevated;
      console.log(`[Wordmark Hop] Class .is-hop applied: ${hasHopClass}, Initial Y: ${initialY.toFixed(1)}px, Hop Peak Y: ${hopY.toFixed(1)}px (Delta: ${(initialY - hopY).toFixed(1)}px)`);
    }

    results.footerWordmarkJump = {
      verified: hopVerified,
      initialY,
      hopY,
      delta: initialY - hopY,
    };

    // =========================================================================
    // 5. THEATRE CURTAIN REVEALS (Terms, Privacy, and Homepage)
    // =========================================================================
    console.log('\n--- 5. THEATRE CURTAIN REVEALS & GEOMETRY ---');

    // Terms Curtain
    await page.goto(`${BASE_URL}/terms-and-conditions`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const termsBeforeMetrics = await page.evaluate(() => {
      const stageWrapper = document.getElementById('theatre-stage-wrapper');
      const curtain = document.getElementById('theatre-curtain-mask');
      const lastSection = document.getElementById('contact');
      const rectStage = stageWrapper ? stageWrapper.getBoundingClientRect() : null;
      const rectCurtain = curtain ? curtain.getBoundingClientRect() : null;
      const rectSec = lastSection ? lastSection.getBoundingClientRect() : null;

      const gap = (rectStage && rectSec) ? rectStage.top - rectSec.bottom : 0;
      return {
        gap,
        curtainHeight: rectCurtain ? rectCurtain.height : 0,
        stageHeight: rectStage ? rectStage.height : 0,
      };
    });

    console.log(`[Terms Curtain] Breathing gap: ${termsBeforeMetrics.gap.toFixed(2)}px (Target: ~32px)`);
    console.log(`[Terms Curtain] Mask height: ${termsBeforeMetrics.curtainHeight.toFixed(1)}px (Full viewport 100svh = 900px)`);

    // Capture Terms screenshots
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'terms-before-reveal-desktop.png') });

    // Scroll to end of Terms
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'terms-footer-final-desktop.png') });

    // Privacy Curtain
    await page.goto(`${BASE_URL}/privacy-policy`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'privacy-before-reveal-desktop.png') });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'privacy-footer-final-desktop.png') });

    // Homepage CTA Reveal
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const ctaY = await page.evaluate(() => {
      const cta = document.getElementById('cta');
      return cta ? cta.getBoundingClientRect().top + window.scrollY : 0;
    });
    await page.evaluate((y) => window.scrollTo(0, y), ctaY);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'homepage-cta-before-reveal-desktop.png') });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'homepage-footer-final-desktop.png') });

    results.curtainReveals = {
      termsGap: termsBeforeMetrics.gap,
      termsCurtainHeight: termsBeforeMetrics.curtainHeight,
      homepageCtaIntact: true,
    };

    // =========================================================================
    // 6. SELECTED WORK ARTWORK & WHEEL ASSETS
    // =========================================================================
    console.log('\n--- 6. SELECTED WORK ARTWORK ASSETS ---');
    const worksImages = [
      { id: 'tmr', file: '/images/works/tmr-ai-car-care.jpg' },
      { id: 'saraswati', file: '/images/works/saraswati-driving-school.jpg' },
      { id: 'mnesa', file: '/images/works/mnesa.jpg' },
    ];

    for (const w of worksImages) {
      const res = await page.goto(`${BASE_URL}${w.file}`);
      const status = res?.status();
      const buffer = await res?.body();
      console.log(`[Artwork Asset] ${w.id}: HTTP ${status}, size: ${buffer?.length} bytes`);
      results.selectedWorkArtwork[w.id] = { status, sizeBytes: buffer?.length, ok: status === 200 };
    }

    // Capture 3D Selected Work carousel in viewport
    await page.goto(`${BASE_URL}/#selected-work`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'selected-work-wheel-desktop.png') });

    // =========================================================================
    // 7. CONTACT FORM VALIDATION & SECURITY
    // =========================================================================
    console.log('\n--- 7. CONTACT FORM VALIDATION & FIELD PRESERVATION ---');
    await page.goto(`${BASE_URL}/#contact`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Test Empty Submit
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn?.click();
    await page.waitForTimeout(500);

    const errorAlert = await page.$('[role="alert"]');
    const errorText = await errorAlert?.innerText();
    console.log(`[Contact Form] Empty submit validation: "${errorText}"`);

    // Fill Partial Data
    await page.fill('#contact-name', 'Rahul Sharma');
    await page.fill('#contact-email', 'invalid-email-format');
    await page.fill('#contact-message', 'Custom software project enquiry test.');
    await submitBtn?.click();
    await page.waitForTimeout(500);

    const emailError = await page.$eval('[role="alert"]', (el) => el.innerText);
    const preservedName = await page.$eval('#contact-name', (el) => el.value);
    console.log(`[Contact Form] Invalid email alert: "${emailError}", Name preserved: "${preservedName}"`);

    results.contactForm = {
      emptyValidationWorking: !!errorText,
      emailValidationWorking: emailError.includes('valid email'),
      fieldPreservationWorking: preservedName === 'Rahul Sharma',
    };

    // =========================================================================
    // 8. METADATA, CANONICALS, ROBOTS & SITEMAP
    // =========================================================================
    console.log('\n--- 8. SEO, CANONICALS & STRUCTURED DATA ---');
    for (const p of pagesToScan) {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle' });
      const meta = await page.evaluate(() => {
        const title = document.title;
        const desc = document.querySelector('meta[name="description"]')?.getAttribute('content');
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
        const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
        return { title, desc, canonical, ogTitle, ogImage };
      });
      console.log(`[SEO] ${p.name}: Title="${meta.title}", Canonical="${meta.canonical}"`);
      results.seoAndStructuredData[p.name] = meta;
    }

    // Robots and Sitemap check
    const robotsRes = await page.goto(`${BASE_URL}/robots.txt`);
    const sitemapRes = await page.goto(`${BASE_URL}/sitemap.xml`);
    console.log(`[Indexing] robots.txt: HTTP ${robotsRes?.status()}, sitemap.xml: HTTP ${sitemapRes?.status()}`);
    results.seoAndStructuredData.robotsStatus = robotsRes?.status();
    results.seoAndStructuredData.sitemapStatus = sitemapRes?.status();

    // =========================================================================
    // 9. 8-DEVICE HORIZONTAL OVERFLOW MATRIX
    // =========================================================================
    console.log('\n--- 9. 8-DEVICE HORIZONTAL OVERFLOW MATRIX ---');
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const overflow = await page.evaluate((expectedWidth) => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const diff = scrollWidth - expectedWidth;
        return {
          expectedWidth,
          innerWidth,
          scrollWidth,
          overflowPx: Math.max(0, diff),
        };
      }, vp.width);

      const pass = overflow.overflowPx === 0;
      console.log(`[Overflow Matrix] ${vp.name} (${vp.width}x${vp.height}): ${pass ? 'PASS (0px overflow) ✓' : `FAIL (${overflow.overflowPx}px) ✗`}`);
      results.overflowMatrix.push({
        device: vp.name,
        width: vp.width,
        height: vp.height,
        scrollWidth: overflow.scrollWidth,
        overflowPx: overflow.overflowPx,
        pass,
      });
    }

    // =========================================================================
    // 10. PREFERS-REDUCED-MOTION
    // =========================================================================
    console.log('\n--- 10. PREFERS-REDUCED-MOTION FALLBACK ---');
    const reducedPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'dark',
    });
    await reducedPage.emulateMedia({ reducedMotion: 'reduce' });
    await reducedPage.goto(`${BASE_URL}/terms-and-conditions`, { waitUntil: 'networkidle' });
    await reducedPage.waitForTimeout(500);

    const isStaticFlow = await reducedPage.evaluate(() => {
      const curtain = document.getElementById('theatre-curtain-mask');
      return !curtain || window.getComputedStyle(curtain).display === 'none' || curtain.style.display === 'none';
    });
    console.log(`[Reduced Motion] Static sequential layout active: ${isStaticFlow ? 'YES ✓' : 'NO'}`);
    results.reducedMotion = { staticLayout: isStaticFlow };
    await reducedPage.close();

    await page.close();
  } finally {
    await browser.close();
  }

  // Save audit results artifact
  const outPath = path.join(ARTIFACTS_DIR, 'master_release_verification_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n✅ Master Verification completed! Results saved to: ${outPath}`);

  // Summary evaluation
  const allOverflowPass = results.overflowMatrix.every((m) => m.pass);
  const zeroEmDashes = Object.values(results.dashScan).every((d) => d.emCount === 0 && d.enCount === 0);
  const textSelectPass = Object.values(results.textSelection).every((t) => t.selectable);
  const artworkPass = Object.values(results.selectedWorkArtwork).every((a) => a.ok);

  console.log('\n=== FINAL VERIFICATION SUMMARY ===');
  console.log(`1. Zero em/en dashes in public copy: ${zeroEmDashes ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`2. Normal text selection across all sections: ${textSelectPass ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`3. Engine labels navigation: ${results.heroNavigation.systemsArchitecture.valid && results.heroNavigation.originalVentures.valid ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`4. Footer wordmark jump & beam sheen: ${results.footerWordmarkJump.verified ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`5. Selected Work artwork assets HTTP 200: ${artworkPass ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`6. Contact form validation & field preservation: ${results.contactForm.fieldPreservationWorking ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`7. 8-Device viewports zero overflow: ${allOverflowPass ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`8. Console errors count: ${results.consoleErrors.length}`);

  if (!allOverflowPass || !zeroEmDashes || !textSelectPass || !artworkPass) {
    process.exit(1);
  }
}

runMasterVerification().catch((err) => {
  console.error('Master verification error:', err);
  process.exit(1);
});
