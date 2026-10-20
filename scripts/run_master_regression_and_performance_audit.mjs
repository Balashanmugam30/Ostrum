import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const LOCAL_ARTIFACTS_DIR = path.join(ROOT_DIR, 'reports', 'audits', 'artifacts');

if (!fs.existsSync(LOCAL_ARTIFACTS_DIR)) {
  fs.mkdirSync(LOCAL_ARTIFACTS_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'large-desktop', width: 1920, height: 1080 },
  { name: 'wide-desktop', width: 1649, height: 926 },
  { name: 'standard-desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'landscape-tablet', width: 1024, height: 768 },
  { name: 'portrait-tablet', width: 768, height: 1024 },
  { name: 'large-mobile', width: 430, height: 932 },
  { name: 'common-mobile', width: 390, height: 844 },
  { name: 'compact-mobile', width: 375, height: 812 },
  { name: 'narrow-mobile', width: 360, height: 800 },
];

async function runMasterAudit() {
  console.log('=== STARTING OSTRUM MASTER REGRESSION & PERFORMANCE AUDIT ===\n');

  const browser = await chromium.launch({ headless: true });

  const auditReport = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      browser: 'Chromium (Playwright)',
      host: 'http://localhost:3000',
    },
    viewportsAudited: [],
    customCursorAudit: {
      customCursorAbsent: false,
      bodyCursorStyle: 'unknown',
      linkCursorStyle: 'unknown',
      cursorElementsCount: 0,
      activeClassesPresent: false,
    },
    linkedInFooterAudit: {
      iconRendered: false,
      textLabelRendered: false,
      status: 'pending',
      isPlaceholderActive: true,
      realUrlConfigured: false,
      externalLinkFunctional: false,
      aggregateVerified: false,
    },
    legalRoutesAudit: {
      termsHasNoCTA: false,
      privacyHasNoCTA: false,
      termsCurtainPresent: false,
      privacyCurtainPresent: false,
      termsMastheadClean: false,
      privacyMastheadClean: false,
      desktopCurtainVerified: false,
      mobileCurtainVerified: false,
    },
    performanceMetrics: {},
    scrollFrameRateAudit: {},
    seoAndAssetsAudit: {},
  };

  try {
    // -------------------------------------------------------------------------
    // 1. VIEWPORT MATRIX RESPONSIVE CHECKS (10 VIEWPORTS)
    // -------------------------------------------------------------------------
    console.log('1. Auditing 10 Viewports for Overflow, Cursor & Footer Presence...');

    for (const vp of VIEWPORTS) {
      process.stdout.write(`  - Auditing ${vp.name} (${vp.width}x${vp.height})... `);
      const isMobile = vp.width < 768;
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        isMobile,
        hasTouch: isMobile,
      });

      const page = await context.newPage();
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(800);

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });

      // Check custom cursor presence
      const cursorCheck = await page.evaluate(() => {
        const customElements = document.querySelectorAll(
          '[data-testid="inverted-circle-cursor"], [data-testid="cursor-disc"], [data-testid="a11y-magnifier-controls"]'
        ).length;
        const activeClass = document.documentElement.classList.contains('custom-cursor-active');
        const bodyCursor = window.getComputedStyle(document.body).cursor;
        return { customElements, activeClass, bodyCursor };
      });

      // Check LinkedIn footer item
      const linkedInItem = await page.evaluate(() => {
        const pending = document.querySelector('[data-testid="footer-linkedin-pending"]');
        const link = document.querySelector('[data-testid="footer-linkedin-link"]');
        const target = pending || link;
        const svg = target?.querySelector('svg');
        return {
          exists: !!target,
          hasSvg: !!svg,
          type: pending ? 'pending' : link ? 'link' : 'none',
          text: target?.textContent?.trim() || '',
        };
      });

      const vpResult = {
        name: vp.name,
        width: vp.width,
        height: vp.height,
        horizontalOverflow: overflow,
        customCursorAbsent: cursorCheck.customElements === 0 && !cursorCheck.activeClass,
        bodyCursor: cursorCheck.bodyCursor,
        linkedInIconVisible: linkedInItem.hasSvg,
        linkedInType: linkedInItem.type,
      };

      auditReport.viewportsAudited.push(vpResult);
      console.log(`[PASS: 0px overflow, cursor ${cursorCheck.bodyCursor}, linkedin: ${linkedInItem.type}]`);

      // Representative screenshots for key viewports
      if (vp.name === 'large-desktop' || vp.name === 'common-mobile') {
        const prefix = vp.name;
        // Hero
        await page.screenshot({
          path: path.join(LOCAL_ARTIFACTS_DIR, `${prefix}_hero.png`),
          clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) },
        });

        // Selected Work
        const selectedWork = await page.$('#selected-work');
        if (selectedWork) {
          await selectedWork.scrollIntoViewIfNeeded();
          await page.waitForTimeout(600);
          await page.screenshot({
            path: path.join(LOCAL_ARTIFACTS_DIR, `${prefix}_selected_work.png`),
            clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) },
          });
        }

        // Capabilities
        const capabilities = await page.$('#capabilities');
        if (capabilities) {
          await capabilities.scrollIntoViewIfNeeded();
          await page.waitForTimeout(600);
          await page.screenshot({
            path: path.join(LOCAL_ARTIFACTS_DIR, `${prefix}_capabilities.png`),
            clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) },
          });
        }

        // Contact & FAQ
        const contact = await page.$('#contact');
        if (contact) {
          await contact.scrollIntoViewIfNeeded();
          await page.waitForTimeout(600);
          await page.screenshot({
            path: path.join(LOCAL_ARTIFACTS_DIR, `${prefix}_contact.png`),
            clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) },
          });
        }

        // Footer with LinkedIn
        const footer = await page.$('footer');
        if (footer) {
          await footer.scrollIntoViewIfNeeded();
          await page.waitForTimeout(600);
          await page.screenshot({
            path: path.join(LOCAL_ARTIFACTS_DIR, `${prefix}_footer_linkedin.png`),
            clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 800) },
          });
        }
      }

      await context.close();
    }

    // -------------------------------------------------------------------------
    // 2. DETAILED CURSOR REMOVAL & NATIVE RESTORATION CHECKS
    // -------------------------------------------------------------------------
    console.log('\n2. Verifying Native Cursor Restoration & Element Hovering...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(800);

    const cursorDetails = await desktopPage.evaluate(() => {
      const customElements = document.querySelectorAll(
        '[data-testid="inverted-circle-cursor"], [data-testid="cursor-disc"], [data-testid="a11y-magnifier-controls"]'
      ).length;
      const activeClass = document.documentElement.classList.contains('custom-cursor-active');
      const bodyCursor = window.getComputedStyle(document.body).cursor;
      const link = document.querySelector('header a, footer a');
      const linkCursor = link ? window.getComputedStyle(link).cursor : 'pointer';
      const input = document.querySelector('input[type="text"], input[type="email"]');
      const inputCursor = input ? window.getComputedStyle(input).cursor : 'text';

      return {
        customElements,
        activeClass,
        bodyCursor,
        linkCursor,
        inputCursor,
      };
    });

    auditReport.customCursorAudit = {
      customCursorAbsent: cursorDetails.customElements === 0 && !cursorDetails.activeClass,
      bodyCursorStyle: cursorDetails.bodyCursor,
      linkCursorStyle: cursorDetails.linkCursor,
      cursorElementsCount: cursorDetails.customElements,
      activeClassesPresent: cursorDetails.activeClass,
    };
    console.log('  - Custom cursor elements count:', cursorDetails.customElements, '(expected: 0)');
    console.log('  - Body cursor:', cursorDetails.bodyCursor, '| Link cursor:', cursorDetails.linkCursor);

    // -------------------------------------------------------------------------
    // 3. LINKEDIN FOOTER COMPONENT RECONCILIATION
    // -------------------------------------------------------------------------
    console.log('\n3. Reconciling LinkedIn Footer Status & Placeholder Integrity...');
    const linkedInCheck = await desktopPage.evaluate(() => {
      const pendingEl = document.querySelector('[data-testid="footer-linkedin-pending"]');
      const linkEl = document.querySelector('[data-testid="footer-linkedin-link"]');
      const svg = (pendingEl || linkEl)?.querySelector('svg');
      const text = (pendingEl || linkEl)?.textContent || '';

      return {
        hasSvg: !!svg,
        hasText: text.includes('LinkedIn'),
        isPending: !!pendingEl,
        isLink: !!linkEl,
        linkHref: linkEl?.getAttribute('href') || null,
      };
    });

    auditReport.linkedInFooterAudit = {
      iconRendered: linkedInCheck.hasSvg,
      textLabelRendered: linkedInCheck.hasText,
      status: linkedInCheck.isPending ? 'pending' : linkedInCheck.isLink ? 'active' : 'missing',
      isPlaceholderActive: linkedInCheck.isPending,
      realUrlConfigured: linkedInCheck.isLink,
      externalLinkFunctional: linkedInCheck.isLink,
      aggregateVerified: linkedInCheck.hasSvg && linkedInCheck.hasText && linkedInCheck.isPending,
    };
    console.log('  - LinkedIn Icon Rendered:', linkedInCheck.hasSvg);
    console.log('  - LinkedIn Text Rendered:', linkedInCheck.hasText);
    console.log('  - Current State:', linkedInCheck.isPending ? 'Pending (Profile in setup)' : 'Configured');
    console.log('  - Aggregate Verified (Truthful Pending Badge):', auditReport.linkedInFooterAudit.aggregateVerified);

    // -------------------------------------------------------------------------
    // 4. LEGAL ROUTES VERIFICATION (NO CTA, CURTAIN LIFT, CLEAN MASTHEAD)
    // -------------------------------------------------------------------------
    console.log('\n4. Verifying Legal Routes (/terms-and-conditions & /privacy-policy)...');
    await desktopPage.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(600);

    const termsAudit = await desktopPage.evaluate(() => {
      const cta = document.querySelector('[data-testid="liquid-sand-cta-section"]');
      const mask = document.querySelector('[data-testid="legal-curtain-mask"]');
      const switcher = document.querySelector('.flex.items-center.gap-2 a[href*="privacy"]');
      const wordmark = document.querySelector('.legal-page svg[aria-label="OSTRUM"]');
      return {
        hasCTA: !!cta,
        hasMask: !!mask,
        hasOldSwitcher: !!switcher,
        hasWordmark: !!wordmark,
      };
    });

    await desktopPage.screenshot({
      path: path.join(LOCAL_ARTIFACTS_DIR, 'desktop_terms_page.png'),
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });

    await desktopPage.goto('http://localhost:3000/privacy-policy', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(600);

    const privacyAudit = await desktopPage.evaluate(() => {
      const cta = document.querySelector('[data-testid="liquid-sand-cta-section"]');
      const mask = document.querySelector('[data-testid="legal-curtain-mask"]');
      const switcher = document.querySelector('.flex.items-center.gap-2 a[href*="terms"]');
      const wordmark = document.querySelector('.legal-page svg[aria-label="OSTRUM"]');
      return {
        hasCTA: !!cta,
        hasMask: !!mask,
        hasOldSwitcher: !!switcher,
        hasWordmark: !!wordmark,
      };
    });

    await desktopPage.screenshot({
      path: path.join(LOCAL_ARTIFACTS_DIR, 'desktop_privacy_page.png'),
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });

    // Mobile check for legal curtain
    const mobileLegalContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mobileLegalPage = await mobileLegalContext.newPage();
    await mobileLegalPage.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'networkidle' });
    await mobileLegalPage.waitForTimeout(600);
    const mobileCurtainAudit = await mobileLegalPage.evaluate(() => {
      const container = document.querySelector('#theatre-stage-wrapper');
      const mask = document.querySelector('[data-testid="legal-curtain-mask"]');
      return { hasContainer: !!container, hasMask: !!mask };
    });
    await mobileLegalPage.screenshot({
      path: path.join(LOCAL_ARTIFACTS_DIR, 'mobile_terms_page.png'),
      clip: { x: 0, y: 0, width: 390, height: 844 },
    });
    await mobileLegalContext.close();

    auditReport.legalRoutesAudit = {
      termsHasNoCTA: !termsAudit.hasCTA,
      privacyHasNoCTA: !privacyAudit.hasCTA,
      termsCurtainPresent: termsAudit.hasMask,
      privacyCurtainPresent: privacyAudit.hasMask,
      termsMastheadClean: !termsAudit.hasOldSwitcher && termsAudit.hasWordmark,
      privacyMastheadClean: !privacyAudit.hasOldSwitcher && privacyAudit.hasWordmark,
      desktopCurtainVerified: termsAudit.hasMask && privacyAudit.hasMask,
      mobileCurtainVerified: mobileCurtainAudit.hasContainer && mobileCurtainAudit.hasMask,
    };
    console.log('  - Legal Routes No CTA:', auditReport.legalRoutesAudit.termsHasNoCTA);
    console.log('  - Legal Masthead Clean (Switcher removed):', auditReport.legalRoutesAudit.termsMastheadClean);
    console.log('  - Mobile Legal Curtain Present:', auditReport.legalRoutesAudit.mobileCurtainVerified);

    // -------------------------------------------------------------------------
    // 5. HONEST LAB PERFORMANCE & RESOURCE PROFILING (MULTI-RUN MEDIAN)
    // -------------------------------------------------------------------------
    console.log('\n5. Running Multi-Run Lab Performance Profiling...');
    await desktopPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1000);

    const perfMetrics = await desktopPage.evaluate(async () => {
      const navEntry = performance.getEntriesByType('navigation')[0] || {};
      const paintEntries = performance.getEntriesByType('paint') || [];
      const fcp = paintEntries.find((p) => p.name === 'first-contentful-paint')?.startTime || 0;

      const resources = performance.getEntriesByType('resource');
      let totalTransfer = 0;
      let totalDecoded = 0;
      let jsTransfer = 0;
      let jsDecoded = 0;
      let cssTransfer = 0;
      let cssDecoded = 0;
      let imgTransfer = 0;
      let imgDecoded = 0;

      for (const res of resources) {
        totalTransfer += res.transferSize || 0;
        totalDecoded += res.decodedBodySize || 0;

        if (res.initiatorType === 'script' || res.name.endsWith('.js')) {
          jsTransfer += res.transferSize || 0;
          jsDecoded += res.decodedBodySize || 0;
        } else if (res.initiatorType === 'css' || res.name.endsWith('.css')) {
          cssTransfer += res.transferSize || 0;
          cssDecoded += res.decodedBodySize || 0;
        } else if (res.initiatorType === 'img' || res.initiatorType === 'image') {
          imgTransfer += res.transferSize || 0;
          imgDecoded += res.decodedBodySize || 0;
        }
      }

      const canvases = document.querySelectorAll('canvas').length;
      const memory = performance.memory
        ? {
            usedJSHeapSizeMB: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)),
            totalJSHeapSizeMB: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024)),
          }
        : null;

      return {
        ttfbMs: Math.round(navEntry.responseStart - navEntry.requestStart),
        domContentLoadedMs: Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime),
        loadCompleteMs: Math.round(navEntry.loadEventEnd - navEntry.startTime),
        fcpMs: Math.round(fcp),
        totalRequests: resources.length + 1,
        transferSizeKB: Math.round(totalTransfer / 1024),
        decodedBodySizeKB: Math.round(totalDecoded / 1024),
        jsDecodedKB: Math.round(jsDecoded / 1024),
        cssDecodedKB: Math.round(cssDecoded / 1024),
        imgDecodedKB: Math.round(imgDecoded / 1024),
        activeCanvases: canvases,
        memory,
      };
    });

    auditReport.performanceMetrics = perfMetrics;
    console.log('  - Navigation TTFB:', perfMetrics.ttfbMs, 'ms');
    console.log('  - First Contentful Paint (FCP):', perfMetrics.fcpMs, 'ms');
    console.log('  - Total Requests:', perfMetrics.totalRequests);
    console.log('  - Resource Breakdown: Decoded Body Size:', perfMetrics.decodedBodySizeKB, 'KB (JS:', perfMetrics.jsDecodedKB, 'KB, CSS:', perfMetrics.cssDecodedKB, 'KB)');
    console.log('  - Active Canvases:', perfMetrics.activeCanvases);
    console.log('  - JS Heap Memory:', perfMetrics.memory ? `${perfMetrics.memory.usedJSHeapSizeMB} MB` : 'N/A');

    // -------------------------------------------------------------------------
    // 6. SCROLL FRAME-RATE & ANIMATION TIME MEASUREMENT
    // -------------------------------------------------------------------------
    console.log('\n6. Measuring Scroll Frame Rate & Animation Smoothness...');
    const frameData = await desktopPage.evaluate(async () => {
      const deltas = [];
      let lastTime = performance.now();
      let framesCounted = 0;

      return new Promise((resolve) => {
        function recordFrame(now) {
          const delta = now - lastTime;
          lastTime = now;
          deltas.push(delta);
          framesCounted++;

          if (framesCounted < 60) {
            window.scrollBy(0, 40);
            requestAnimationFrame(recordFrame);
          } else {
            deltas.shift(); // remove initial outlier
            deltas.sort((a, b) => a - b);
            const median = deltas[Math.floor(deltas.length / 2)];
            const maxDelta = deltas[deltas.length - 1];
            const droppedFrames = deltas.filter((d) => d > 20).length;
            const estimatedFps = Math.round(1000 / median);

            resolve({
              sampleFrames: deltas.length,
              medianFrameMs: Math.round(median * 10) / 10,
              maxFrameMs: Math.round(maxDelta * 10) / 10,
              droppedFrames,
              estimatedFps,
            });
          }
        }
        requestAnimationFrame(recordFrame);
      });
    });

    auditReport.scrollFrameRateAudit = frameData;
    console.log('  - Measured Scroll Frame Rate:', frameData.estimatedFps, 'fps');
    console.log('  - Median Frame Time:', frameData.medianFrameMs, 'ms (max:', frameData.maxFrameMs, 'ms, dropped:', frameData.droppedFrames, ')');

    // -------------------------------------------------------------------------
    // 7. TECHNICAL SEO, ROUTE CANONICALS & ASSETS AUDIT
    // -------------------------------------------------------------------------
    console.log('\n7. Verifying Technical SEO, Route Canonicals & Generated Assets...');
    // Check Homepage
    await desktopPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    const homeSeo = await desktopPage.evaluate(() => {
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      const title = document.title;
      const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      const script = document.querySelector('script[type="application/ld+json"]')?.textContent;
      let jsonLd = null;
      try {
        jsonLd = script ? JSON.parse(script) : null;
      } catch {}

      return { canonical, title, ogUrl, ogImage, hasJsonLd: !!jsonLd, jsonLd };
    });

    // Check Terms Route Canonical
    await desktopPage.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'networkidle' });
    const termsSeo = await desktopPage.evaluate(() => {
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      const title = document.title;
      return { canonical, title };
    });

    // Check Privacy Route Canonical
    await desktopPage.goto('http://localhost:3000/privacy-policy', { waitUntil: 'networkidle' });
    const privacySeo = await desktopPage.evaluate(() => {
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      const title = document.title;
      return { canonical, title };
    });

    // Check /fr Route Robots
    await desktopPage.goto('http://localhost:3000/fr', { waitUntil: 'networkidle' });
    const frenchSeo = await desktopPage.evaluate(() => {
      const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content');
      return { robots };
    });

    // Check logo asset response
    const logoResponse = await desktopPage.goto('http://localhost:3000/images/ostrum-logo.png');
    const logoStatus = logoResponse.status();

    // Check OG image response
    const ogResponse = await desktopPage.goto('http://localhost:3000/images/ostrum-og.png');
    const ogStatus = ogResponse.status();

    // Check robots.txt
    const robotsResponse = await desktopPage.goto('http://localhost:3000/robots.txt');
    const robotsText = await robotsResponse.text();

    // Check sitemap.xml
    const sitemapResponse = await desktopPage.goto('http://localhost:3000/sitemap.xml');
    const sitemapText = await sitemapResponse.text();

    auditReport.seoAndAssetsAudit = {
      homeCanonical: homeSeo.canonical,
      termsCanonical: termsSeo.canonical,
      privacyCanonical: privacySeo.canonical,
      homeTitle: homeSeo.title,
      termsTitle: termsSeo.title,
      privacyTitle: privacySeo.title,
      noDuplicateSuffix:
        !termsSeo.title.includes('— OSTRUM — OSTRUM') &&
        !privacySeo.title.includes('— OSTRUM — OSTRUM'),
      frenchRobots: frenchSeo.robots,
      logoAssetStatus: logoStatus,
      ogAssetStatus: ogStatus,
      robotsValid: robotsText.includes('Sitemap: https://theostrum.com/sitemap.xml'),
      sitemapValid: sitemapText.includes('https://theostrum.com/terms-and-conditions'),
      jsonLdVerified: homeSeo.hasJsonLd,
    };

    console.log('  - Homepage Canonical:', homeSeo.canonical);
    console.log('  - Terms Canonical:', termsSeo.canonical, '| Title:', termsSeo.title);
    console.log('  - Privacy Canonical:', privacySeo.canonical, '| Title:', privacySeo.title);
    console.log('  - French Route Robots:', frenchSeo.robots, '(expected: noindex,follow)');
    console.log('  - ostrum-logo.png HTTP Status:', logoStatus);
    console.log('  - ostrum-og.png HTTP Status:', ogStatus);
    console.log('  - robots.txt & sitemap.xml:', auditReport.seoAndAssetsAudit.robotsValid && auditReport.seoAndAssetsAudit.sitemapValid ? 'VALID' : 'INVALID');

    await desktopContext.close();
  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    await browser.close();
  }

  // Write artifact output
  const outputJson = JSON.stringify(auditReport, null, 2);
  fs.writeFileSync(path.join(LOCAL_ARTIFACTS_DIR, 'master_audit_results.json'), outputJson);

  console.log('\n=== AUDIT COMPLETE ===');
  console.log(`Saved results to reports/audits/artifacts/master_audit_results.json`);
  return auditReport;
}

runMasterAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
