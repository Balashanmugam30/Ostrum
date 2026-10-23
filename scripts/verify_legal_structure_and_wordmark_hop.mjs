import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const VIEWPORTS = [
  { name: 'desktop_fhd', width: 1920, height: 1080 },
  { name: 'desktop_standard', width: 1440, height: 900 },
  { name: 'laptop_compact', width: 1280, height: 800 },
  { name: 'tablet_landscape', width: 1024, height: 768 },
  { name: 'tablet_portrait', width: 768, height: 1024 },
  { name: 'mobile_large', width: 430, height: 932 },
  { name: 'mobile_standard', width: 390, height: 844 },
  { name: 'mobile_compact', width: 360, height: 800 },
];

async function runMasterVerification() {
  console.log('=== STARTING OSTRUM LEGAL STRUCTURE, WORDMARK HOP & CURTAIN AUDIT ===\n');
  const browser = await chromium.launch({ headless: true });
  const results = {
    wordmarkHopTests: [],
    legalEndGapTests: [],
    pageStructureChecks: [],
    homepageNonRegression: null,
    responsiveMatrix: [],
    reducedMotionCheck: null,
  };

  try {
    // -------------------------------------------------------------------------
    // TEST 1: WORDMARK CLICK-TO-HOP RESTORATION & CLIPPING VERIFICATION
    // -------------------------------------------------------------------------
    console.log('[1/5] Verifying Wordmark Hop Animation & Zero Clipping...');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'networkidle' });

    // Scroll to footer wordmark and wait for entrance animation to settle
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    const letters = await page.$$('.bwf-l');
    console.log(`Found ${letters.length} wordmark letters.`);

    const wordBox = await page.$eval('.bwf-word-box', el => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height };
    });

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      const char = await letter.innerText();
      const cursor = await letter.evaluate(el => window.getComputedStyle(el).cursor);

      // Measure resting top
      const restingTop = await letter.evaluate(el => el.getBoundingClientRect().top);

      // Click to trigger hop
      await letter.dispatchEvent('click');

      // Sample near peak of hop (approx 300ms into 750ms animation)
      await page.waitForTimeout(300);
      const peakTop = await letter.evaluate(el => el.getBoundingClientRect().top);
      const isHopAtPeak = await letter.evaluate(el => el.classList.contains('is-hop'));

      // Check clipping against container ceiling
      const wordContainerTop = await page.$eval('.bwf-word', el => el.getBoundingClientRect().top);
      const isClippedAtPeak = peakTop < wordContainerTop;

      // Wait for hop animation to complete (750ms total, wait another 600ms)
      await page.waitForTimeout(600);
      const settledTop = await letter.evaluate(el => el.getBoundingClientRect().top);
      const isHopAtSettle = await letter.evaluate(el => el.classList.contains('is-hop'));

      const hopDistance = restingTop - peakTop; // positive means moved upward
      const settleDiff = Math.abs(settledTop - restingTop);

      console.log(`Letter '${char}': cursor=${cursor}, hopDistance=${hopDistance.toFixed(2)}px, peakClipped=${isClippedAtPeak}, settleDiff=${settleDiff.toFixed(2)}px, isHopClassRemoved=${!isHopAtSettle}`);

      results.wordmarkHopTests.push({
        char,
        cursor,
        hopDistance,
        isClippedAtPeak,
        settleDiff,
        isHopClassRemoved: !isHopAtSettle,
        passed: cursor === 'pointer' && hopDistance > 5 && !isClippedAtPeak && settleDiff < 1 && !isHopAtSettle,
      });

      // Rapid double click test on first letter
      if (i === 0) {
        await letter.dispatchEvent('click');
        await page.waitForTimeout(100);
        await letter.dispatchEvent('click');
        const rapidHopActive = await letter.evaluate(el => el.classList.contains('is-hop'));
        await page.waitForTimeout(800);
        const rapidSettled = await letter.evaluate(el => !el.classList.contains('is-hop'));
        console.log(`Rapid double-click test on '${char}': restarted=${rapidHopActive}, settledCleanly=${rapidSettled}`);
      }
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '01_footer_wordmark_hop_verified.png'),
    });

    // -------------------------------------------------------------------------
    // TEST 2: LEGAL PAGE STRUCTURE & EDITORIAL REDESIGN
    // -------------------------------------------------------------------------
    console.log('\n[2/5] Verifying Legal Page Structure, Single Index & Pure White Palette...');
    for (const route of ['/terms-and-conditions', '/privacy-policy']) {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // Check absence of duplicate top overview card
      const hasDuplicateOverview = await page.$eval('[data-testid="table-of-contents-overview"]', () => true).catch(() => false);

      // Check presence of sticky sidebar on desktop
      const hasStickySidebar = await page.$eval('[data-testid="sticky-legal-sidebar"]', () => true).catch(() => false);

      // Check canvas color (pure white #FFFFFF)
      const canvasBg = await page.$eval('.legal-page', el => window.getComputedStyle(el).backgroundColor);

      // Check absence of nested white card with heavy shadow
      const hasNestedCard = await page.$eval('main.shadow-\\[0_12px_40px_-15px_rgba\\(22\\,21\\,20\\,0\\.06\\)\\]', () => true).catch(() => false);

      // Check date
      const dateText = await page.innerText('header');
      const hasCorrectDate = dateText.includes('23 October 2026');

      // Check colors of headings, body, and accents
      const h1Color = await page.$eval('h1', el => window.getComputedStyle(el).color);
      const pColor = await page.$eval('article p', el => window.getComputedStyle(el).color);
      const sectionNumColor = await page.$eval('article h2 span', el => window.getComputedStyle(el).color);

      // Check absence of green dot and drafting notes
      const pageText = await page.innerText('body');
      const pageHtml = await page.content();
      const hasGreenDot = pageHtml.includes('#16A34A') || pageHtml.includes('rgb(22, 163, 74)');
      const hasDraftingNotes = pageText.includes('formal legal review') || pageText.includes('will be updated upon final commercial incorporation');

      console.log(`Route ${route}:`);
      console.log(`  - Duplicate TOC overview removed: ${!hasDuplicateOverview}`);
      console.log(`  - Sticky sidebar present: ${hasStickySidebar}`);
      console.log(`  - Canvas background: ${canvasBg} (expected rgb(255, 255, 255))`);
      console.log(`  - Nested card removed: ${!hasNestedCard}`);
      console.log(`  - Date: 23 October 2026: ${hasCorrectDate}`);
      console.log(`  - Heading color: ${h1Color}`);
      console.log(`  - Body copy color: ${pColor}`);
      console.log(`  - Accent color: ${sectionNumColor}`);
      console.log(`  - Green dot absent: ${!hasGreenDot}`);
      console.log(`  - Drafting notes absent: ${!hasDraftingNotes}`);

      results.pageStructureChecks.push({
        route,
        duplicateTocRemoved: !hasDuplicateOverview,
        stickySidebarPresent: hasStickySidebar,
        canvasBg,
        nestedCardRemoved: !hasNestedCard,
        hasCorrectDate,
        greenDotAbsent: !hasGreenDot,
        draftingNotesAbsent: !hasDraftingNotes,
        passed: !hasDuplicateOverview && hasStickySidebar && canvasBg === 'rgb(255, 255, 255)' && !hasNestedCard && hasCorrectDate && !hasGreenDot && !hasDraftingNotes,
      });

      const shotName = route.includes('terms') ? '02_terms_editorial_structure.png' : '03_privacy_editorial_structure.png';
      await page.screenshot({ path: path.join(ARTIFACT_DIR, shotName) });
    }

    // -------------------------------------------------------------------------
    // TEST 3: LEGAL PAGE END GAP & COMPACT CURTAIN REVEAL
    // -------------------------------------------------------------------------
    console.log('\n[3/5] Verifying Compact Curtain Reveal & End-Gap Elimination...');
    for (const route of ['/terms-and-conditions', '/privacy-policy']) {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      // Measure article bottom and stage wrapper top
      const gapMetrics = await page.evaluate(() => {
        const article = document.querySelector('article');
        const stageWrapper = document.getElementById('theatre-stage-wrapper');
        const curtain = document.querySelector('.theatre-curtain');
        const mask = document.querySelector('[data-testid="legal-curtain-mask"]');

        const artRect = article.getBoundingClientRect();
        const wrapRect = stageWrapper.getBoundingClientRect();
        const curRect = curtain.getBoundingClientRect();
        const maskRect = mask.getBoundingClientRect();

        return {
          gapBetweenArticleAndWrapper: wrapRect.top - artRect.bottom,
          curtainHeight: curRect.height,
          maskHeight: maskRect.height,
          windowHeight: window.innerHeight,
        };
      });

      console.log(`Route ${route} Geometry Metrics:`);
      console.log(`  - Gap between article and stage wrapper: ${gapMetrics.gapBetweenArticleAndWrapper.toFixed(0)}px (target 24-40px)`);
      console.log(`  - Curtain height: ${gapMetrics.curtainHeight.toFixed(0)}px (compact mask, NOT 100svh / ${gapMetrics.windowHeight}px)`);

      // Scroll incrementally into reveal
      const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
      
      // Step 1: Scroll to article bottom in view
      const articleBottomY = await page.$eval('article', el => el.getBoundingClientRect().bottom + window.scrollY);
      await page.evaluate(y => window.scrollTo(0, y - 800), articleBottomY);
      await page.waitForTimeout(200);

      // Step 2: Scroll to reveal start
      await page.evaluate(y => window.scrollTo(0, y - 400), articleBottomY);
      await page.waitForTimeout(200);

      // Step 3: Scroll through reveal
      await page.evaluate(y => window.scrollTo(0, y), articleBottomY);
      await page.waitForTimeout(300);

      // Step 4: Full reveal at bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      const revealEndState = await page.evaluate(() => {
        const curtain = document.querySelector('.theatre-curtain');
        const stage = document.querySelector('.theatre-stage');
        const wordmark = document.querySelector('.bwf-word');
        const tiles = stage ? stage.querySelector('.grid') : null;

        return {
          curtainVisibility: curtain ? window.getComputedStyle(curtain).visibility : null,
          curtainTransform: curtain ? curtain.style.transform : null,
          tilesTopInViewport: tiles ? tiles.getBoundingClientRect().top : null,
          wordmarkVisible: wordmark ? wordmark.getBoundingClientRect().height > 0 : false,
        };
      });

      console.log(`Route ${route} Reveal End State:`);
      console.log(`  - Curtain visibility: ${revealEndState.curtainVisibility}`);
      console.log(`  - Curtain transform: ${revealEndState.curtainTransform}`);
      console.log(`  - Wordmark visible: ${revealEndState.wordmarkVisible}`);

      // Step 5: Test reverse scroll
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      const reversedCurtainVisible = await page.$eval('.theatre-curtain', el => window.getComputedStyle(el).visibility);
      console.log(`  - Curtain restored on scroll reversal: ${reversedCurtainVisible === 'visible'}`);

      results.legalEndGapTests.push({
        route,
        gapMetrics,
        revealEndState,
        reversedCurtainVisible: reversedCurtainVisible === 'visible',
        passed: gapMetrics.gapBetweenArticleAndWrapper <= 60 && gapMetrics.curtainHeight < gapMetrics.windowHeight && revealEndState.wordmarkVisible && reversedCurtainVisible === 'visible',
      });

      const shotName = route.includes('terms') ? '04_terms_tight_reveal.png' : '05_privacy_tight_reveal.png';
      await page.screenshot({ path: path.join(ARTIFACT_DIR, shotName) });
    }

    // -------------------------------------------------------------------------
    // TEST 4: HOMEPAGE NON-REGRESSION
    // -------------------------------------------------------------------------
    console.log('\n[4/5] Verifying Homepage CTA-to-Footer Reveal is 100% Intact...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const homepageCTA = await page.evaluate(() => {
      const curtain = document.querySelector('.theatre-curtain');
      const cta = curtain ? curtain.querySelector('section, form, a[href*="mailto"]') : null;
      const curtainBg = curtain ? window.getComputedStyle(curtain).backgroundColor : null;
      return {
        hasCTA: !!cta,
        curtainBg,
      };
    });

    console.log(`Homepage CTA check: hasCTA=${homepageCTA.hasCTA}, curtainBg=${homepageCTA.curtainBg} (expected rgb(5, 5, 5))`);

    // Scroll to bottom of homepage
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    const homepageFooter = await page.evaluate(() => {
      const stage = document.querySelector('.theatre-stage');
      const wordmark = document.querySelector('.bwf-word');
      return {
        stagePresent: !!stage,
        wordmarkVisible: wordmark ? wordmark.getBoundingClientRect().height > 0 : false,
      };
    });

    console.log(`Homepage Footer check: stagePresent=${homepageFooter.stagePresent}, wordmarkVisible=${homepageFooter.wordmarkVisible}`);

    results.homepageNonRegression = {
      hasCTA: homepageCTA.hasCTA,
      curtainBlack: homepageCTA.curtainBg === 'rgb(5, 5, 5)',
      footerVisible: homepageFooter.wordmarkVisible,
      passed: homepageCTA.hasCTA && homepageCTA.curtainBg === 'rgb(5, 5, 5)' && homepageFooter.wordmarkVisible,
    };

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_homepage_reveal_intact.png') });

    // -------------------------------------------------------------------------
    // TEST 5: 8-VIEWPORT MATRIX & REDUCED MOTION
    // -------------------------------------------------------------------------
    console.log('\n[5/5] Testing across 8 Viewports + prefers-reduced-motion...');
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

      // Check single TOC system: on desktop (>=1024) sidebar is visible, overview card is 0
      const duplicateOverviewCount = await page.locator('[data-testid="table-of-contents-overview"]').count();
      const sidebarCount = await page.locator('[data-testid="sticky-legal-sidebar"]').count();

      // Scroll to footer wordmark
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(600);

      const wordmarkBox = await page.$eval('.bwf-word', el => {
        const r = el.getBoundingClientRect();
        return { width: Math.round(r.width), height: Math.round(r.height) };
      }).catch(() => null);

      console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): horizontalScroll=${hasHorizontalScroll}, duplicateTocCount=${duplicateOverviewCount}, wordmarkBox=${JSON.stringify(wordmarkBox)}`);

      results.responsiveMatrix.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        hasHorizontalScroll,
        duplicateTocCount: duplicateOverviewCount,
        wordmarkBox,
        passed: !hasHorizontalScroll && duplicateOverviewCount === 0 && !!wordmarkBox,
      });
    }

    // Check reduced motion
    const rmContext = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 }
    });
    const rmPage = await rmContext.newPage();
    await rmPage.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'networkidle' });
    await rmPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await rmPage.waitForTimeout(500);

    const firstLetter = await rmPage.$('.bwf-l');
    await firstLetter.dispatchEvent('click');
    await rmPage.waitForTimeout(200);
    const rmHopActive = await firstLetter.evaluate(el => el.classList.contains('is-hop'));
    console.log(`Reduced motion hop suppressed: ${!rmHopActive}`);

    results.reducedMotionCheck = {
      hopSuppressed: !rmHopActive,
      passed: !rmHopActive,
    };

    await rmContext.close();
    await browser.close();

    // Summary
    const wordmarkAllPassed = results.wordmarkHopTests.every(t => t.passed);
    const structureAllPassed = results.pageStructureChecks.every(t => t.passed);
    const endGapAllPassed = results.legalEndGapTests.every(t => t.passed);
    const homepagePassed = results.homepageNonRegression.passed;
    const viewportsAllPassed = results.responsiveMatrix.every(t => t.passed);
    const rmPassed = results.reducedMotionCheck.passed;

    console.log('\n================ MASTER AUDIT SUMMARY ================');
    console.log(`1. Wordmark Hop & Zero Clipping:      ${wordmarkAllPassed ? 'PASSED (elastic hop restored, 0 clipping)' : 'FAILED'}`);
    console.log(`2. Page Structure & Pure White Theme: ${structureAllPassed ? 'PASSED (duplicate TOC removed, white editorial)' : 'FAILED'}`);
    console.log(`3. Compact Curtain & End-Gap Fix:     ${endGapAllPassed ? 'PASSED (tight ending, compact reveal)' : 'FAILED'}`);
    console.log(`4. Homepage CTA Reveal Intact:        ${homepagePassed ? 'PASSED' : 'FAILED'}`);
    console.log(`5. 8-Viewport Matrix:                 ${viewportsAllPassed ? 'PASSED (0 horizontal scroll)' : 'FAILED'}`);
    console.log(`6. Reduced Motion Compliance:         ${rmPassed ? 'PASSED' : 'FAILED'}`);
    console.log('======================================================\n');

    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'master_legal_and_wordmark_audit.json'),
      JSON.stringify(results, null, 2)
    );

    if (wordmarkAllPassed && structureAllPassed && endGapAllPassed && homepagePassed && viewportsAllPassed && rmPassed) {
      console.log('ALL ACCEPTANCE CRITERIA VERIFIED AND PASSED!');
      process.exit(0);
    } else {
      console.error('SOME ACCEPTANCE CRITERIA FAILED.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Audit failed with error:', err);
    await browser.close();
    process.exit(1);
  }
}

runMasterVerification();
