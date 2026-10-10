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
  console.log('=== STARTING AUDIT: UNIFORM LARGE TEXT, WIDER CONTAINER & SEQUENTIAL LINE REVEAL ===');

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
    // 1. Primary Test Viewport: 1649 x 926 (Target Viewport from user prompt)
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
      const beatsContainer = document.querySelector('#energy-narrative .max-w-\\[1580px\\]');
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

    if (parseFloat(containerMeasurements.widthRatio) >= 85) {
      console.log(`✓ PASS: Container occupies ${containerMeasurements.widthRatio} of available viewport width (Target: 88-92vw).`);
      report.testsPassed++;
    } else {
      console.error(`✗ FAIL: Container only occupies ${containerMeasurements.widthRatio}`);
      report.testsFailed++;
    }

    // 3. Inspect Typography Consistency across Primary & Supporting Lines (Phase 2 Audit)
    const typographyAudit = await page.evaluate(() => {
      const allLines = Array.from(document.querySelectorAll('.narrative-line-base'));
      if (allLines.length === 0) return { count: 0, fontSizes: [] };

      const styles = allLines.map((el, i) => {
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

      // Check whether all lines have the exact same font size & weight
      const firstSize = styles[0]?.fontSize;
      const firstWeight = styles[0]?.fontWeight;
      const allSameSize = styles.every((s) => s.fontSize === firstSize);
      const allSameWeight = styles.every((s) => s.fontWeight === firstWeight);

      return {
        totalLines: styles.length,
        firstSize,
        firstWeight,
        allSameSize,
        allSameWeight,
        samples: styles.slice(0, 4),
      };
    });

    console.log('Typography Uniformity Audit:', JSON.stringify(typographyAudit, null, 2));

    if (typographyAudit.allSameSize && typographyAudit.allSameWeight) {
      console.log(`✓ PASS: All ${typographyAudit.totalLines} lines share the exact same display typography: ${typographyAudit.firstSize}, weight ${typographyAudit.firstWeight}.`);
      report.testsPassed++;
    } else {
      console.error(`✗ FAIL: Typography mismatch among lines: ${JSON.stringify(typographyAudit)}`);
      report.testsFailed++;
    }

    // 4. Measure Scroll Coordinates
    const coords = await page.evaluate(() => {
      const stEnergy = window.ScrollTrigger?.getById('energy-narrative-pin');
      const st02 = window.ScrollTrigger?.getById('section02-hold');
      return {
        st02Start: st02 ? st02.start : 1200,
        st02End: st02 ? st02.end : 2200,
        energyStart: stEnergy ? stEnergy.start : 3200,
        energyEnd: stEnergy ? stEnergy.end : 8200,
      };
    });

    console.log('ScrollTrigger Coordinates:', coords);

    const energyStart = coords.energyStart;
    const energyDist = coords.energyEnd - energyStart;

    // Helper to evaluate line fill states for Beat 01
    const getBeat01LineStates = async () => {
      return await page.evaluate(() => {
        const card0 = document.querySelectorAll('.narrative-beat-card')[0];
        if (!card0) return [];
        const lines = Array.from(card0.querySelectorAll('.narrative-line-fill'));
        return lines.map((line, idx) => {
          const comp = window.getComputedStyle(line);
          const clip = comp.clipPath;
          // Parse inset percentage
          const match = clip.match(/inset\([^)]*?(\d+(?:\.\d+)?)%\s+0(?:px)?\s+0(?:px)?\)/);
          const rightInset = match ? parseFloat(match[1]) : (clip.includes('0px 0px 0px 0px') || clip.includes('0% 0% 0% 0%') ? 0 : 100);
          const percentRevealed = (100 - rightInset).toFixed(1);
          return {
            lineIdx: idx,
            clipPath: clip,
            percentRevealed: parseFloat(percentRevealed),
          };
        });
      });
    };

    // 9 CORE PLAYWRIGHT STATES FOR THE SEQUENTIAL LETTER REVEAL
    const sequentialStates = [
      {
        id: 'chk-seq-01-initial-state-line1',
        scrollY: Math.round(energyStart + 0.13 * energyDist),
        label: '1. Initial state of Beat 01 (card entered, Line 1 ready, 0% filled, muted grey)',
        verify: (states) => states[0]?.percentRevealed === 0 && states[1]?.percentRevealed === 0,
      },
      {
        id: 'chk-seq-02-midway-line1',
        scrollY: Math.round(energyStart + 0.155 * energyDist),
        label: '2. Midway through Line 1 character reveal (Line 1 ~50% filled, Line 2 strictly 0%)',
        verify: (states) => states[0]?.percentRevealed > 10 && states[0]?.percentRevealed < 90 && states[1]?.percentRevealed === 0,
      },
      {
        id: 'chk-seq-03-line1-complete-line2-unrevealed',
        scrollY: Math.round(energyStart + 0.17 * energyDist),
        label: '3. Line 1 completely filled (100%) while Line 2 remains unrevealed (0%)',
        verify: (states) => states[0]?.percentRevealed >= 98 && states[1]?.percentRevealed === 0,
      },
      {
        id: 'chk-seq-04-line2-start',
        scrollY: Math.round(energyStart + 0.178 * energyDist),
        label: '4. First character of Line 2 starting to reveal (Line 1 is 100%, Line 2 just started)',
        verify: (states) => states[0]?.percentRevealed >= 98 && states[1]?.percentRevealed > 0 && states[1]?.percentRevealed < 30,
      },
      {
        id: 'chk-seq-05-midway-line2',
        scrollY: Math.round(energyStart + 0.19 * energyDist),
        label: '5. Midway through Line 2 character reveal (Line 1 100%, Line 2 ~50%, Line 3 0%)',
        verify: (states) => states[0]?.percentRevealed >= 98 && states[1]?.percentRevealed > 20 && states[1]?.percentRevealed < 85 && states[2]?.percentRevealed === 0,
      },
      {
        id: 'chk-seq-06-all-lines-filled',
        scrollY: Math.round(energyStart + 0.235 * energyDist),
        label: '6. All lines of Beat 01 fully filled in solid white (100% on every line)',
        verify: (states) => states.every((s) => s.percentRevealed >= 98),
      },
      {
        id: 'chk-seq-07-reading-hold',
        scrollY: Math.round(energyStart + 0.25 * energyDist),
        label: '7. Beat 01 Reading Hold (stable poise, zero movement, fully readable)',
        verify: (states) => states.every((s) => s.percentRevealed >= 98),
      },
      {
        id: 'chk-seq-08-reverse-midway',
        scrollY: Math.round(energyStart + 0.155 * energyDist),
        label: '8. Reverse-scrolled state midway through Line 1 (Line 1 partially filled, Line 2 back to 0%)',
        verify: (states) => states[0]?.percentRevealed > 10 && states[0]?.percentRevealed < 90 && states[1]?.percentRevealed === 0,
      },
      {
        id: 'chk-seq-09-fully-reversed',
        scrollY: Math.round(energyStart + 0.08 * energyDist),
        label: '9. Fully reversed state back to Stage 0 (0% fill on all lines, pure black void)',
        verify: (states) => states.every((s) => s.percentRevealed === 0),
      },
    ];

    console.log(`\nExecuting ${sequentialStates.length} sequential state audits...`);

    for (const step of sequentialStates) {
      console.log(`\n---> Scrolling to: ${step.label} (scrollY: ${step.scrollY})`);
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), step.scrollY);
      await page.waitForTimeout(400); // Allow GSAP scrub to settle

      const lineStates = await getBeat01LineStates();
      console.log(`  Line fill states:`, JSON.stringify(lineStates));

      const shotPath = path.join(ARTIFACTS_DIR, `${step.id}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`  Saved screenshot: ${step.id}.png`);

      const pass = step.verify ? step.verify(lineStates) : true;
      if (pass) {
        console.log(`  ✓ PASS: Line sequence requirement met.`);
        report.testsPassed++;
      } else {
        console.error(`  ✗ FAIL: Line sequence assertion failed: ${JSON.stringify(lineStates)}`);
        report.testsFailed++;
      }

      report.sequentialLineAssertions.push({
        id: step.id,
        label: step.label,
        lineStates,
        passed: pass,
      });
    }

    // 5. Audit Beats 02 to 05 (Including Selective Coral Highlights on Beat 05)
    console.log('\n=== AUDITING REMAINING BEATS (02 to 05) ===');
    const remainingBeats = [
      {
        id: 'chk-seq-10-beat02-punchline',
        scrollY: Math.round(energyStart + 0.36 * energyDist),
        label: '10. Beat 02 punchline filled ("It shouldn\'t be this hard.")',
      },
      {
        id: 'chk-seq-11-beat03-business-better',
        scrollY: Math.round(energyStart + 0.58 * energyDist),
        label: '11. Beat 03 all lines completed ("We make your business work better.")',
      },
      {
        id: 'chk-seq-12-beat04-solve-problems',
        scrollY: Math.round(energyStart + 0.75 * energyDist),
        label: '12. Beat 04 all lines completed ("Got a problem no product solves?")',
      },
      {
        id: 'chk-seq-13-beat05-coral-highlights',
        scrollY: Math.round(energyStart + 0.94 * energyDist),
        label: '13. Beat 05 completed with glowing coral highlights on "makes work simpler" and "new ideas possible"',
      },
    ];

    for (const rb of remainingBeats) {
      console.log(`\n---> Scrolling to: ${rb.label} (scrollY: ${rb.scrollY})`);
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), rb.scrollY);
      await page.waitForTimeout(400);

      const shotPath = path.join(ARTIFACTS_DIR, `${rb.id}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`  Saved screenshot: ${rb.id}.png`);

      // Verify coral highlight rendering on Beat 05
      if (rb.id === 'chk-seq-13-beat05-coral-highlights') {
        const coralAudit = await page.evaluate(() => {
          const coralChars = Array.from(document.querySelectorAll('.narrative-char-filled.text-\\[\\#ff5c4a\\]'));
          return {
            coralCharCount: coralChars.length,
            sampleText: coralChars.map((c) => c.textContent).join(''),
          };
        });
        console.log('  Coral characters in Beat 05:', coralAudit);
        if (coralAudit.coralCharCount > 20) {
          console.log('  ✓ PASS: Selective coral highlights rendered on Beat 05.');
          report.testsPassed++;
        } else {
          console.error('  ✗ FAIL: Missing coral highlights on Beat 05.');
          report.testsFailed++;
        }
      }
    }

    // 6. Multi-Viewport Responsiveness & Overflow Audit (7 Viewports)
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

      const shotPath = path.join(ARTIFACTS_DIR, `vp-seq-${vp.name}.png`);
      await vpPage.screenshot({ path: shotPath });

      const check = await vpPage.evaluate(() => {
        const hasOverflow = document.documentElement.scrollWidth > window.innerWidth;
        const lineBase = document.querySelector('.narrative-line-base');
        const fontSize = lineBase ? window.getComputedStyle(lineBase).fontSize : '';
        const beatsContainer = document.querySelector('#energy-narrative .max-w-\\[1580px\\]');
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
    const reportPath = path.join(ARTIFACTS_DIR, 'sequential_line_reveal_audit.json');
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
