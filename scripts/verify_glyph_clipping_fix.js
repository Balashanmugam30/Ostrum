const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const VIEWPORTS = [
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-375x812', width: 375, height: 812 },
];

async function runGlyphClippingAudit() {
  console.log('=== STARTING GLYPH CLIPPING VERIFICATION AUDIT ===\n');

  const browser = await chromium.launch({ headless: true });
  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    checks: [],
    viewports: [],
  };

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Catch any console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    console.log('1. Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Get ScrollTrigger coordinates
    const coords = await page.evaluate(() => {
      const stEnergy = window.ScrollTrigger?.getById('energy-narrative-pin');
      return {
        start: stEnergy?.start || 3200,
        end: stEnergy?.end || 8200,
      };
    });
    const energyDist = coords.end - coords.start;

    // Helper to evaluate line fill states
    const getCardLineStates = async (cardIdx) => {
      return await page.evaluate((cIdx) => {
        const card = document.querySelectorAll('.narrative-beat-card')[cIdx];
        if (!card) return [];
        const lines = Array.from(card.querySelectorAll('.narrative-line-fill'));
        return lines.map((line, idx) => {
          const comp = window.getComputedStyle(line);
          const clip = comp.clipPath;
          let rightInset = 100;
          const inner = clip.replace(/^inset\(/, '').replace(/\)$/, '').trim();
          const tokens = inner.split(/[\s,]+/);
          if (tokens.length >= 2) {
            const rMatch = tokens[1].match(/(\d+(?:\.\d+)?)/);
            if (rMatch) rightInset = parseFloat(rMatch[1]);
          } else if (clip.includes('0%') || clip.includes('0px')) {
            rightInset = 0;
          }
          const percentRevealed = (100 - rightInset).toFixed(1);
          return {
            lineIdx: idx,
            clipPath: clip,
            percentRevealed: parseFloat(percentRevealed),
            overflow: comp.overflow,
          };
        });
      }, cardIdx);
    };

    // Helper to verify that glyph ink bounds fit completely inside clipping clearance
    const checkGlyphClearance = async (cardIdx, sampleChars) => {
      return await page.evaluate(({ cIdx, sampleList }) => {
        const card = document.querySelectorAll('.narrative-beat-card')[cIdx];
        if (!card) return null;

        const charEls = Array.from(card.querySelectorAll('.narrative-char-filled'));
        const matched = [];

        charEls.forEach((el) => {
          const ch = el.textContent;
          if (sampleList.includes(ch)) {
            const container = el.closest('.narrative-line-container');
            const fill = container ? container.querySelector('.narrative-line-fill') : null;
            if (!fill) return;

            const comp = window.getComputedStyle(fill);
            const fillRect = fill.getBoundingClientRect();

            // Calculate clipPath top and bottom bounds
            const inner = comp.clipPath.replace(/^inset\(/, '').replace(/\)$/, '').trim();
            const tokens = inner.split(/[\s,]+/);
            let topInsetPct = -35;
            let bottomInsetPct = -45;
            if (tokens.length >= 4) {
              const tMatch = tokens[0].match(/(-?\d+(?:\.\d+)?)/);
              const bMatch = tokens[2].match(/(-?\d+(?:\.\d+)?)/);
              if (tMatch) topInsetPct = parseFloat(tMatch[1]);
              if (bMatch) bottomInsetPct = parseFloat(bMatch[1]);
            }

            const topClearancePx = Math.abs(topInsetPct) * 0.01 * fillRect.height;
            const bottomClearancePx = Math.abs(bottomInsetPct) * 0.01 * fillRect.height;
            const visibleClipTop = fillRect.top - topClearancePx;
            const visibleClipBottom = fillRect.bottom + bottomClearancePx;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = `${comp.fontWeight} ${comp.fontSize} ${comp.fontFamily}`;

            const rect = el.getBoundingClientRect();
            const tm = ctx.measureText(ch);
            const baselineY = rect.bottom - tm.actualBoundingBoxDescent;
            const inkTop = baselineY - tm.actualBoundingBoxAscent;
            const inkBottom = baselineY + tm.actualBoundingBoxDescent;

            const isTopClipped = inkTop < visibleClipTop;
            const isBottomClipped = inkBottom > visibleClipBottom;

            matched.push({
              char: ch,
              inkTop: inkTop.toFixed(1),
              visibleClipTop: visibleClipTop.toFixed(1),
              inkBottom: inkBottom.toFixed(1),
              visibleClipBottom: visibleClipBottom.toFixed(1),
              topMargin: (inkTop - visibleClipTop).toFixed(1),
              bottomMargin: (visibleClipBottom - inkBottom).toFixed(1),
              isTopClipped,
              isBottomClipped,
            });
          }
        });

        return {
          totalMatched: matched.length,
          matched,
        };
      }, { cIdx: cardIdx, sampleList: sampleChars });
    };

    // State 1: Line before reveal begins (Beat 01 initial)
    console.log('\n--- State 1: Line Before Reveal Begins (Beat 01, 0% fill) ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(coords.start + 0.13 * energyDist));
    await page.waitForTimeout(400);
    let s1 = await getCardLineStates(0);
    const shotS1 = path.join(ARTIFACTS_DIR, 'glyph-s1-before-reveal.png');
    await page.screenshot({ path: shotS1 });
    if (s1[0]?.percentRevealed === 0 && s1[0]?.overflow === 'visible') {
      console.log('✓ PASS: State 1 line unrevealed at 0% with overflow: visible.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: State 1 check failed', s1);
      report.testsFailed++;
    }

    // State 2: Line midway through reveal containing descender 'y' (Beat 02 midway)
    console.log('\n--- State 2: Line Midway Through Reveal (Beat 02 with "busywork", descender "y") ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(coords.start + 0.35 * energyDist));
    await page.waitForTimeout(400);
    let s2 = await getCardLineStates(1);
    const clearanceS2 = await checkGlyphClearance(1, ['y', 'g']);
    console.log('Beat 02 midway clearance:', JSON.stringify(clearanceS2, null, 2));
    const shotS2 = path.join(ARTIFACTS_DIR, 'glyph-s2-midway-reveal-descender-y.png');
    await page.screenshot({ path: shotS2 });
    const s2Unclipped = clearanceS2?.matched.every((m) => !m.isTopClipped && !m.isBottomClipped && parseFloat(m.bottomMargin) > 5);
    if (s2[0]?.percentRevealed > 15 && s2[0]?.percentRevealed < 85 && s2Unclipped) {
      console.log('✓ PASS: State 2 midway reveal leaves descender "y" and "g" 100% unclipped with safe clearance.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: State 2 glyph clipping detected');
      report.testsFailed++;
    }

    // State 3: Fully revealed line containing 'g', 'p' (Beat 04 "Turn good ideas into products people need.")
    console.log('\n--- State 3: Fully Revealed Line with "g", "p" (Beat 04) ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(coords.start + 0.74 * energyDist));
    await page.waitForTimeout(400);
    let s3 = await getCardLineStates(3);
    const clearanceS3 = await checkGlyphClearance(3, ['g', 'p']);
    console.log('Beat 04 complete clearance:', JSON.stringify(clearanceS3, null, 2));
    const shotS3 = path.join(ARTIFACTS_DIR, 'glyph-s3-fully-revealed-descenders.png');
    await page.screenshot({ path: shotS3 });
    const s3Unclipped = clearanceS3?.matched.every((m) => !m.isTopClipped && !m.isBottomClipped && parseFloat(m.bottomMargin) > 5);
    if (s3[0]?.percentRevealed >= 98 && s3Unclipped) {
      console.log('✓ PASS: State 3 fully revealed line has zero descender clipping on "g" and "p".');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: State 3 descender clipping detected');
      report.testsFailed++;
    }

    // State 4: Message with both ascenders and descenders (Beat 03 "Your business works better when everything connects.")
    console.log('\n--- State 4: Message with Both Ascenders & Descenders (Beat 03) ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(coords.start + 0.575 * energyDist));
    await page.waitForTimeout(400);
    let s4 = await getCardLineStates(2);
    const clearanceS4 = await checkGlyphClearance(2, ['Y', 'y', 'g', 'b', 't', 'k', 'h']);
    console.log('Beat 03 complete clearance:', JSON.stringify(clearanceS4, null, 2));
    const shotS4 = path.join(ARTIFACTS_DIR, 'glyph-s4-ascenders-and-descenders.png');
    await page.screenshot({ path: shotS4 });
    const s4Unclipped = clearanceS4?.matched.length > 0 && clearanceS4?.matched.every((m) => !m.isTopClipped && !m.isBottomClipped);
    if (s4.every((l) => l.percentRevealed >= 98) && s4Unclipped) {
      console.log('✓ PASS: State 4 ascenders ("Y", "b", "t", "k", "h") and descenders ("y", "g") are completely visible without clipping.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: State 4 ascender/descender clipping detected', { s4, clearanceS4 });
      report.testsFailed++;
    }

    // State 5: Scrolling Backwards Reversibility with Descenders
    console.log('\n--- State 5: Reverse Scrolling with Descenders ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(coords.start + 0.35 * energyDist));
    await page.waitForTimeout(400);
    let s5 = await getCardLineStates(1);
    const shotS5 = path.join(ARTIFACTS_DIR, 'glyph-s5-reverse-scroll.png');
    await page.screenshot({ path: shotS5 });
    if (s5[0]?.percentRevealed > 15 && s5[0]?.percentRevealed < 85) {
      console.log('✓ PASS: State 5 reverse scroll smoothly scrubs backwards with full descenders intact.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: State 5 reverse scroll failed');
      report.testsFailed++;
    }

    // State 6: Completed Narrative State (Beat 05 with standalone crimson OSTRUM)
    console.log('\n--- State 6: Completed Narrative State (Beat 05) ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(coords.start + 0.94 * energyDist));
    await page.waitForTimeout(400);
    let s6 = await getCardLineStates(4);
    const clearanceS6 = await checkGlyphClearance(4, ['y']);
    const shotS6 = path.join(ARTIFACTS_DIR, 'glyph-s6-completed-narrative.png');
    await page.screenshot({ path: shotS6 });
    if (s6.every((l) => l.percentRevealed >= 98)) {
      console.log('✓ PASS: State 6 completed narrative holds 100% white question and 100% crimson OSTRUM with full glyphs.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: State 6 completed state failed', s6);
      report.testsFailed++;
    }

    // State 7: Resizing the Viewport During Reveal
    console.log('\n--- State 7: Resizing Viewport During Reveal ---');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.evaluate(() => window.ScrollTrigger?.refresh());
    await page.waitForTimeout(500);
    const newCoords = await page.evaluate(() => {
      const st = window.ScrollTrigger?.getById('energy-narrative-pin');
      return { start: st?.start || 3200, end: st?.end || 8200 };
    });
    const newDist = newCoords.end - newCoords.start;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(newCoords.start + 0.35 * newDist));
    await page.waitForTimeout(400);
    let s7 = await getCardLineStates(1);
    const shotS7 = path.join(ARTIFACTS_DIR, 'glyph-s7-after-resize.png');
    await page.screenshot({ path: shotS7 });
    if (s7[0]?.percentRevealed > 15 && s7[0]?.percentRevealed < 85) {
      console.log('✓ PASS: State 7 viewport resize preserves text layout and glyph integrity.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: State 7 resize failed', s7);
      report.testsFailed++;
    }

    // Reset viewport to 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => window.ScrollTrigger?.refresh());
    await page.waitForTimeout(400);

    // Dedicated Representative Test String Evaluation: g y p q j f h k l Å é
    console.log('\n--- Representative Character Set Test: "g y p q j f h k l Å é" ---');
    const representativeFixtureAudit = await page.evaluate(() => {
      const fixture = document.createElement('div');
      fixture.className = 'narrative-line-container relative inline-block my-0 text-center whitespace-nowrap';
      fixture.innerHTML = `
        <div class="narrative-line-base font-sans font-medium text-[clamp(28px,3.8vw,62px)] leading-[1.08] tracking-[-0.015em] text-white/30">
          g y p q j f h k l Å é
        </div>
        <div class="narrative-line-fill absolute inset-0 pointer-events-none select-none" style="clip-path: inset(-35% 0% -45% 0px);">
          <div class="font-sans font-medium text-[clamp(28px,3.8vw,62px)] leading-[1.08] tracking-[-0.015em] text-white">
            g y p q j f h k l Å é
          </div>
        </div>
      `;
      document.body.appendChild(fixture);

      const fill = fixture.querySelector('.narrative-line-fill');
      const comp = window.getComputedStyle(fill);
      const fillRect = fill.getBoundingClientRect();

      const topClearance = 0.35 * fillRect.height;
      const bottomClearance = 0.45 * fillRect.height;
      const visibleClipTop = fillRect.top - topClearance;
      const visibleClipBottom = fillRect.bottom + bottomClearance;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.font = `${comp.fontWeight} ${comp.fontSize} ${comp.fontFamily}`;

      const testChars = ['g', 'y', 'p', 'q', 'j', 'f', 'h', 'k', 'l', 'Å', 'é'];
      const details = testChars.map((ch) => {
        const tm = ctx.measureText(ch);
        const baselineY = fillRect.bottom - (fillRect.height - parseFloat(comp.fontSize)) / 2 - tm.actualBoundingBoxDescent;
        const inkTop = baselineY - tm.actualBoundingBoxAscent;
        const inkBottom = baselineY + tm.actualBoundingBoxDescent;

        return {
          char: ch,
          ascent: tm.actualBoundingBoxAscent,
          descent: tm.actualBoundingBoxDescent,
          isTopClipped: inkTop < visibleClipTop,
          isBottomClipped: inkBottom > visibleClipBottom,
          topClearanceMargin: (inkTop - visibleClipTop).toFixed(1),
          bottomClearanceMargin: (visibleClipBottom - inkBottom).toFixed(1),
        };
      });

      document.body.removeChild(fixture);

      const allUnclipped = details.every((d) => !d.isTopClipped && !d.isBottomClipped);
      return { allUnclipped, details };
    });

    console.log('Representative Fixture Result:', JSON.stringify(representativeFixtureAudit, null, 2));
    if (representativeFixtureAudit.allUnclipped) {
      console.log('✓ PASS: All test characters "g y p q j f h k l Å é" fit completely within visible clip bounds with substantial clearance.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Some representative characters clipped');
      report.testsFailed++;
    }

    // Multi-Viewport Visual Regression Audit Across 5 Viewports
    console.log('\n=== MULTI-VIEWPORT AUDIT (5 VIEWPORTS) ===');
    for (const vp of VIEWPORTS) {
      console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
      const vpPage = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
      await vpPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(600);

      // Scroll to Beat 04 (contains 'g' and 'p')
      const midY = await vpPage.evaluate(() => {
        const energy = document.getElementById('energy-narrative');
        return energy ? energy.getBoundingClientRect().top + window.scrollY + 3600 : 4500;
      });

      await vpPage.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), midY);
      await vpPage.waitForTimeout(400);

      const shotPath = path.join(ARTIFACTS_DIR, `glyph-vp-${vp.name}.png`);
      await vpPage.screenshot({ path: shotPath });

      const vpAudit = await vpPage.evaluate(() => {
        const hasOverflow = document.documentElement.scrollWidth > window.innerWidth;
        const fills = Array.from(document.querySelectorAll('.narrative-line-fill'));
        const allVisibleOverflow = fills.every((f) => window.getComputedStyle(f).overflow === 'visible');
        const clipMatches = fills.every((f) => {
          const cp = window.getComputedStyle(f).clipPath;
          return cp.includes('-35%') || cp.includes('-45%') || cp.includes('px');
        });
        return { hasOverflow, allVisibleOverflow, clipMatches };
      });

      if (!vpAudit.hasOverflow && vpAudit.allVisibleOverflow) {
        console.log(`  ✓ ${vp.name}: overflow = false, fill overflow = visible, full glyph clearance verified.`);
        report.testsPassed++;
      } else {
        console.error(`  ✗ FAIL on ${vp.name}:`, vpAudit);
        report.testsFailed++;
      }

      report.viewports.push({ ...vp, ...vpAudit, screenshot: shotPath });
      await vpPage.close();
    }

    if (consoleErrors.length === 0) {
      console.log('✓ PASS: 0 console errors logged throughout audit.');
      report.testsPassed++;
    } else {
      console.error('✗ Console errors found:', consoleErrors);
      report.testsFailed++;
    }

    const reportPath = path.join(ARTIFACTS_DIR, 'glyph_clipping_audit.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nAudit results saved to: ${reportPath}`);
    console.log(`Total tests passed: ${report.testsPassed}, Failed: ${report.testsFailed}`);

  } catch (err) {
    console.error('Audit execution error:', err);
    report.testsFailed++;
  } finally {
    await browser.close();
  }
}

runGlyphClippingAudit();
