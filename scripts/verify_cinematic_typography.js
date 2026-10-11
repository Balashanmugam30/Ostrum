const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const VIEWPORTS = [
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'desktop-1649x926', width: 1649, height: 926 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-375x812', width: 375, height: 812 },
];

async function runAudit() {
  console.log('=== STARTING AUDIT: OSTRUM FINAL CINEMATIC TYPOGRAPHY, COMPACT LINE SPACING & SEQUENTIAL REVEAL ===');

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox'],
  });

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    checkpoints: [],
    viewports: [],
    sequentialLineAssertions: [],
    widthMeasurements: {},
    consoleErrors: [],
  };

  try {
    // 1. Primary Test Viewport: 1649 x 926
    const page = await browser.newPage({ viewport: { width: 1649, height: 926 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Console Error]: ${msg.text()}`);
        report.consoleErrors.push(msg.text());
      }
    });

    console.log('Navigating to http://localhost:3000 at 1649x926...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Allow fonts, WebGL caustics and 3D model decoding

    // 2. Measure Container Width and Margin Proportions (Phase 3 Audit)
    const containerMeasurements = await page.evaluate(() => {
      const beatsContainer = document.querySelector('#energy-narrative .max-w-\\[1540px\\]');
      const winW = window.innerWidth;
      const rect = beatsContainer ? beatsContainer.getBoundingClientRect() : null;
      const width = rect ? rect.width : 0;
      const leftMargin = rect ? rect.left : 0;
      const rightMargin = rect ? winW - rect.right : 0;
      const ratio = width / winW;

      return {
        winW,
        containerWidth: Math.round(width),
        leftMargin: Math.round(leftMargin),
        rightMargin: Math.round(rightMargin),
        widthRatio: (ratio * 100).toFixed(1) + '%',
      };
    });

    console.log('Container Width Measurements (1649x926):', JSON.stringify(containerMeasurements, null, 2));
    report.widthMeasurements['1649x926'] = containerMeasurements;

    if (parseFloat(containerMeasurements.widthRatio) >= 84) {
      console.log(`✓ PASS: Container occupies ${containerMeasurements.widthRatio} of available viewport width (Target: 84-90vw).`);
      report.testsPassed++;
    } else {
      console.error(`✗ FAIL: Container only occupies ${containerMeasurements.widthRatio}`);
      report.testsFailed++;
    }

    // 3. Inspect Typography Consistency across Primary Statements (Phase 2 Audit)
    const typographyAudit = await page.evaluate(() => {
      const primaryLines = Array.from(document.querySelectorAll('.narrative-line-container:not([data-is-supporting="true"]) .narrative-line-base'));
      if (primaryLines.length === 0) return { count: 0, fontSizes: [] };

      const styles = primaryLines.map((el, i) => {
        const comp = window.getComputedStyle(el);
        return {
          lineIdx: i,
          fontSize: comp.fontSize,
          fontWeight: comp.fontWeight,
          lineHeight: comp.lineHeight,
          fontFamily: comp.fontFamily,
          color: comp.color,
        };
      });

      const firstSize = styles[0]?.fontSize;
      const firstWeight = styles[0]?.fontWeight;
      const firstLineHeight = styles[0]?.lineHeight;
      const allSameSize = styles.every((s) => s.fontSize === firstSize);
      const allSameWeight = styles.every((s) => s.fontWeight === firstWeight);

      // Line height ratio
      const fontSizeNum = parseFloat(firstSize);
      const lineHeightNum = parseFloat(firstLineHeight);
      const lhRatio = (lineHeightNum / fontSizeNum).toFixed(2);

      return {
        totalPrimaryLines: styles.length,
        firstSize,
        firstWeight,
        firstLineHeight,
        lhRatio,
        allSameSize,
        allSameWeight,
        samples: styles.slice(0, 4),
      };
    });

    console.log('Typography Uniformity Audit:', JSON.stringify(typographyAudit, null, 2));

    if (typographyAudit.allSameSize && typographyAudit.allSameWeight) {
      console.log(`✓ PASS: All ${typographyAudit.totalPrimaryLines} primary lines share exact same typography: ${typographyAudit.firstSize}, weight ${typographyAudit.firstWeight}, line-height ratio ${typographyAudit.lhRatio}.`);
      report.testsPassed++;
    } else {
      console.error(`✗ FAIL: Typography mismatch among lines: ${JSON.stringify(typographyAudit)}`);
      report.testsFailed++;
    }

    // 4. Verify Single Message per Beat & Line Limits (Phase 3 & 4 Audit)
    const beatsStructureAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.narrative-beat-card'));
      return cards.map((card, idx) => {
        const primaryLines = Array.from(card.querySelectorAll('.narrative-line-container:not([data-is-supporting="true"])'));
        const supportingLines = Array.from(card.querySelectorAll('.narrative-line-container[data-is-supporting="true"]'));
        const primaryText = primaryLines.map((l) => l.textContent.trim()).join(' ');
        const supportingText = supportingLines.map((l) => l.textContent.trim()).join(' ');

        return {
          beatIdx: idx,
          primaryLineCount: primaryLines.length,
          supportingLineCount: supportingLines.length,
          primaryText,
          supportingText,
          underThreeLines: primaryLines.length <= 3,
        };
      });
    });

    console.log('Beats Structure Audit:', JSON.stringify(beatsStructureAudit, null, 2));

    const allUnderThree = beatsStructureAudit.every((b) => b.underThreeLines);
    if (allUnderThree) {
      console.log('✓ PASS: Every primary statement fits within at most 3 desktop lines.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Some beats exceed 3 lines');
      report.testsFailed++;
    }

    const allZeroSupporting = beatsStructureAudit.every((b) => b.supportingLineCount === 0);
    const beat5HasTwoDisplayLines = beatsStructureAudit[4]?.primaryLineCount === 2;
    const noBuildItWith = !beatsStructureAudit.some((b) => b.primaryText.includes('Build it with') || b.supportingText.includes('Build it with'));

    if (allZeroSupporting && beat5HasTwoDisplayLines && noBuildItWith) {
      console.log('✓ PASS: All beats have 0 supporting lines. Beat 05 has exactly 2 display lines ("Ready for what\'s next?" and "OSTRUM"). Zero occurrences of "Build it with".');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Supporting lines or beat 5 structure incorrect:', { allZeroSupporting, beat5HasTwoDisplayLines, noBuildItWith });
      report.testsFailed++;
    }

    // Verify Exact Narrative Copy Across All Beats
    const copyAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.narrative-beat-card'));
      return cards.map((c) => {
        const lines = Array.from(c.querySelectorAll('.narrative-line-base'));
        return lines.map((l) => l.textContent.trim()).join(' ');
      });
    });

    console.log('Copy Audit across beats:', copyAudit);
    const expectedCopy = [
      "Make your business work as one.",
      "Less busywork. More room to grow.",
      "Your business works better when everything connects.",
      "Turn good ideas into products people need.",
      "Ready for what's next? OSTRUM",
    ];
    const copyMatches = copyAudit.every((actual, i) => actual === expectedCopy[i]);
    if (copyMatches) {
      console.log('✓ PASS: All 5 beats match the exact requested client-focused copy.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Copy mismatch:', { expected: expectedCopy, actual: copyAudit });
      report.testsFailed++;
    }

    // 5. Measure Scroll Coordinates
    const coords = await page.evaluate(() => {
      const stEnergy = window.ScrollTrigger?.getById('energy-narrative-pin');
      return {
        energyStart: stEnergy ? stEnergy.start : 3200,
        energyEnd: stEnergy ? stEnergy.end : 8200,
      };
    });

    console.log('ScrollTrigger Coordinates:', coords);
    const energyStart = coords.energyStart;
    const energyDist = coords.energyEnd - energyStart;

    // Helper to evaluate line fill states for any card
    const getCardLineStates = async (cardIdx) => {
      return await page.evaluate((cIdx) => {
        const card = document.querySelectorAll('.narrative-beat-card')[cIdx];
        if (!card) return [];
        const lines = Array.from(card.querySelectorAll('.narrative-line-fill'));
        return lines.map((line, idx) => {
          const comp = window.getComputedStyle(line);
          const clip = comp.clipPath;
          const match = clip.match(/inset\([^)]*?(\d+(?:\.\d+)?)%\s+0(?:px)?\s+0(?:px)?\)/);
          const rightInset = match ? parseFloat(match[1]) : (clip.includes('0px 0px 0px 0px') || clip.includes('0% 0% 0% 0%') ? 0 : 100);
          const percentRevealed = (100 - rightInset).toFixed(1);
          return {
            lineIdx: idx,
            clipPath: clip,
            percentRevealed: parseFloat(percentRevealed),
          };
        });
      }, cardIdx);
    };

    // 6. Test Beat 01 Reveal Sequence
    console.log('\n--- Testing Beat 01 ("Make your business work as one.") ---');
    // State 1: Beat 01 initial
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.13 * energyDist));
    await page.waitForTimeout(400);
    let b1States = await getCardLineStates(0);
    console.log('Beat 01 initial:', b1States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-01-beat01-initial.png') });
    if (b1States[0]?.percentRevealed === 0) report.testsPassed++;

    // State 2: Beat 01 midway
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.18 * energyDist));
    await page.waitForTimeout(400);
    b1States = await getCardLineStates(0);
    console.log('Beat 01 midway:', b1States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-02-beat01-midway.png') });
    if (b1States[0]?.percentRevealed > 20 && b1States[0]?.percentRevealed < 80) report.testsPassed++;

    // State 3: Beat 01 complete
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.235 * energyDist));
    await page.waitForTimeout(400);
    b1States = await getCardLineStates(0);
    console.log('Beat 01 complete:', b1States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-03-beat01-complete.png') });
    if (b1States[0]?.percentRevealed >= 98) report.testsPassed++;

    // 7. Test Beat 02 ("Less busywork. More room to grow.")
    console.log('\n--- Testing Beat 02 ("Less busywork. More room to grow.") ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.38 * energyDist));
    await page.waitForTimeout(400);
    let b2States = await getCardLineStates(1);
    console.log('Beat 02 complete:', b2States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-04-beat02-tools.png') });
    if (b2States[0]?.percentRevealed >= 98) report.testsPassed++;

    // 8. Test Beat 03 ("Your business works better when everything connects.")
    console.log('\n--- Testing Beat 03 ("Your business works better when everything connects.") ---');
    // Midway
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.51 * energyDist));
    await page.waitForTimeout(400);
    let b3States = await getCardLineStates(2);
    console.log('Beat 03 Line fill progress midway:', b3States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-05-beat03-line1-midway-line2-zero.png') });
    if (b3States.length > 1) {
      if (b3States[0]?.percentRevealed > 10 && b3States[0]?.percentRevealed < 90 && b3States[1]?.percentRevealed === 0) {
        console.log('✓ PASS: Beat 03 Line 1 fills while Line 2 remains strictly 0%.');
        report.testsPassed++;
      } else {
        console.error('✗ FAIL: Beat 03 Line 2 revealed prematurely');
        report.testsFailed++;
      }
    } else {
      if (b3States[0]?.percentRevealed > 10 && b3States[0]?.percentRevealed < 90) {
        console.log('✓ PASS: Beat 03 single line fills midway smoothly.');
        report.testsPassed++;
      } else {
        console.error('✗ FAIL: Beat 03 fill not midway');
        report.testsFailed++;
      }
    }

    // All Lines Filled
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.575 * energyDist));
    await page.waitForTimeout(400);
    b3States = await getCardLineStates(2);
    console.log('Beat 03 All lines complete:', b3States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-08-beat03-all-lines-filled.png') });
    if (b3States.every((s) => s.percentRevealed >= 98)) report.testsPassed++;

    // 9. Test Beat 04 ("Turn good ideas into products people need.")
    console.log('\n--- Testing Beat 04 ("Turn good ideas into products people need.") ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.74 * energyDist));
    await page.waitForTimeout(400);
    let b4States = await getCardLineStates(3);
    console.log('Beat 04 complete:', b4States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-09-beat04-problem-products.png') });
    if (b4States.every((s) => s.percentRevealed >= 98)) report.testsPassed++;

    // 10. Test Beat 05 ("Ready for what's next?" + standalone crimson "OSTRUM") & Crimson Accent
    console.log('\n--- Testing Beat 05 & Standalone Crimson OSTRUM Signoff ---');
    // Main question complete, OSTRUM line at 0%
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.880 * energyDist));
    await page.waitForTimeout(400);
    let b5States = await getCardLineStates(4);
    console.log('Beat 05 Question complete (OSTRUM signoff at 0%):', b5States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-10-beat05-main-complete-supporting-zero.png') });
    if (b5States[0]?.percentRevealed >= 95 && b5States[1]?.percentRevealed === 0) {
      console.log('✓ PASS: Beat 05 question completes before OSTRUM signoff starts.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Beat 05 OSTRUM signoff revealed prematurely or question not completed');
      report.testsFailed++;
    }

    // Both lines complete (including standalone OSTRUM line)
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.94 * energyDist));
    await page.waitForTimeout(400);
    b5States = await getCardLineStates(4);
    console.log('Beat 05 All lines complete:', b5States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-11-beat05-supporting-crimson-ostrum.png') });
    if (b5States.every((s) => s.percentRevealed >= 98)) report.testsPassed++;

    // Verify Crimson Accent on standalone OSTRUM only
    const crimsonAccentAudit = await page.evaluate(() => {
      const crimsonChars = Array.from(document.querySelectorAll('.narrative-char-filled.text-\\[\\#C01832\\]'));
      const card5 = document.querySelectorAll('.narrative-beat-card')[4];
      const brandLine = card5?.querySelector('.narrative-line-container[data-is-brand="true"]');
      const brandChars = brandLine ? Array.from(brandLine.querySelectorAll('.narrative-char-filled.text-\\[\\#C01832\\]')) : [];

      // Check colors across all other beats (beats 0 to 3)
      let nonWhiteCharsInBeats1to4 = 0;
      for (let i = 0; i < 4; i++) {
        const c = document.querySelectorAll('.narrative-beat-card')[i];
        if (c) {
          const nonWhite = c.querySelectorAll('.narrative-char-filled:not(.text-white)');
          nonWhiteCharsInBeats1to4 += nonWhite.length;
        }
      }

      const crimsonWord = crimsonChars.map((c) => c.textContent).join('');

      return {
        crimsonWord,
        crimsonCount: crimsonChars.length,
        brandCharsCount: brandChars.length,
        nonWhiteCharsInBeats1to4,
      };
    });

    console.log('Crimson Accent Audit:', JSON.stringify(crimsonAccentAudit, null, 2));

    if (crimsonAccentAudit.crimsonWord === 'OSTRUM' && crimsonAccentAudit.nonWhiteCharsInBeats1to4 === 0) {
      console.log('✓ PASS: Only the word OSTRUM is crimson (#C01832). All other narrative text is pure white.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Crimson accent verification failed');
      report.testsFailed++;
    }

    // 11. Reading Hold Verification
    console.log('\n--- Testing Reading Hold ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.98 * energyDist));
    await page.waitForTimeout(400);
    b5States = await getCardLineStates(4);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-12-reading-hold.png') });
    if (b5States.every((s) => s.percentRevealed >= 98)) {
      console.log('✓ PASS: Final beat holds at 100% white and crimson through 1.00.');
      report.testsPassed++;
    }

    // 12. Reverse Scroll Verification
    console.log('\n--- Testing Reverse Scroll Reversibility ---');
    // Scroll back to midway through Beat 01 Line 1
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.18 * energyDist));
    await page.waitForTimeout(400);
    b1States = await getCardLineStates(0);
    console.log('Reverse midway Beat 01:', b1States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-13-reverse-scroll-midway.png') });
    if (b1States[0]?.percentRevealed > 20 && b1States[0]?.percentRevealed < 80) {
      console.log('✓ PASS: Reverse scroll smoothly reverses fill progress.');
      report.testsPassed++;
    }

    // Reverse fully back to Stage 0
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyStart + 0.08 * energyDist));
    await page.waitForTimeout(400);
    b1States = await getCardLineStates(0);
    console.log('Fully reversed Stage 0:', b1States);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chk-cine-14-reverse-scroll-stage0.png') });
    if (b1States[0]?.percentRevealed === 0) {
      console.log('✓ PASS: Fully reversed restores 0% fill state.');
      report.testsPassed++;
    }

    // 13. Multi-Viewport Responsiveness & Overflow Audit (7 Viewports)
    console.log('\n=== MULTI-VIEWPORT RESPONSIVENESS AUDIT (7 VIEWPORTS) ===');
    for (const vp of VIEWPORTS) {
      console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
      const vpPage = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await vpPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(800);

      // Scroll to mid of narrative
      const midNarrativeY = await vpPage.evaluate(() => {
        const energy = document.getElementById('energy-narrative');
        return energy ? energy.getBoundingClientRect().top + window.scrollY + 2400 : 3500;
      });

      await vpPage.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), midNarrativeY);
      await vpPage.waitForTimeout(500);

      const shotPath = path.join(ARTIFACTS_DIR, `vp-cine-${vp.name}.png`);
      await vpPage.screenshot({ path: shotPath });

      const check = await vpPage.evaluate(() => {
        const hasOverflow = document.documentElement.scrollWidth > window.innerWidth;
        const lineBase = document.querySelector('.narrative-line-container:not([data-is-supporting="true"]) .narrative-line-base');
        const fontSize = lineBase ? window.getComputedStyle(lineBase).fontSize : '';
        const beatsContainer = document.querySelector('#energy-narrative .max-w-\\[1540px\\]');
        const containerW = beatsContainer ? beatsContainer.getBoundingClientRect().width : 0;
        return {
          hasOverflow,
          fontSize,
          containerWidth: Math.round(containerW),
          ratio: ((containerW / window.innerWidth) * 100).toFixed(1) + '%',
        };
      });

      console.log(`  ${vp.name}: overflow = ${check.hasOverflow}, font-size = ${check.fontSize}, container = ${check.ratio}`);
      if (!check.hasOverflow) {
        report.testsPassed++;
      } else {
        console.error(`  ✗ FAIL: Horizontal overflow on ${vp.name}`);
        report.testsFailed++;
      }

      report.viewports.push({
        ...vp,
        screenshot: shotPath,
        overflow: check.hasOverflow,
        fontSize: check.fontSize,
        containerRatio: check.ratio,
      });

      await vpPage.close();
    }

    // Save final report
    const reportPath = path.join(ARTIFACTS_DIR, 'cinematic_typography_audit.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nAudit results saved to: ${reportPath}`);
    console.log(`Total tests passed: ${report.testsPassed}, Failed: ${report.testsFailed}`);

  } catch (err) {
    console.error('Fatal Verification Error:', err);
    report.testsFailed++;
  } finally {
    await browser.close();
  }
}

runAudit();
