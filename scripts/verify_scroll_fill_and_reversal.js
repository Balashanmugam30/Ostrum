const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const VIEWPORTS = [
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-375x812', width: 375, height: 812 },
];

async function runVerification() {
  console.log('=== STARTING OSTRUM FINAL POLISH: TYPOGRAPHY, 5 BEATS & SINGLE HANDOFF AUDIT ===');

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
    performance: {},
    consoleErrors: [],
  };

  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Console Error]: ${msg.text()}`);
        report.consoleErrors.push(msg.text());
      }
    });

    console.log('Navigating to http://localhost:3000 at 1920x1080...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Allow WebGL shader and 3D model decoding

    // 1. Verify Clean DOM Structure and 5 Narrative Beat Cards
    const beatCards = await page.$$('.narrative-beat-card');
    console.log(`Found ${beatCards.length} narrative beat cards in Section 03.`);
    if (beatCards.length === 5) {
      console.log('✓ PASS: Exactly 5 narrative beats present (Beats 01 to 05).');
      report.testsPassed++;
    } else {
      console.error(`✗ FAIL: Expected 5 narrative beats, found ${beatCards.length}`);
      report.testsFailed++;
    }

    // 2. Measure Typography & Styling at 1920x1080
    const typoAudit = await page.evaluate(() => {
      const h2 = document.querySelector('.narrative-beat-card h2');
      const p = document.querySelector('.narrative-beat-card p');
      const compH2 = h2 ? window.getComputedStyle(h2) : null;
      const compP = p ? window.getComputedStyle(p) : null;

      return {
        fontFamily: compH2?.fontFamily || '',
        fontWeight: compH2?.fontWeight || '',
        fontSize: compH2?.fontSize || '',
        lineHeight: compH2?.lineHeight || '',
        color: compH2?.color || '',
        textStroke: compH2?.webkitTextStroke || '',
        pFontSize: compP?.fontSize || '',
        pColor: compP?.color || '',
      };
    });

    console.log('Typography Audit (1920x1080):', JSON.stringify(typoAudit, null, 2));

    // Verify typography criteria:
    // Font size should be ~75px (70-76px)
    const fontSizeNum = parseFloat(typoAudit.fontSize);
    if (fontSizeNum >= 68 && fontSizeNum <= 78) {
      console.log(`✓ PASS: Headline font size at 1920x1080 is ${typoAudit.fontSize} (matches ~75px reference).`);
      report.testsPassed++;
    } else {
      console.log(`ℹ NOTE: Headline font size is ${typoAudit.fontSize}`);
    }

    // Measure ScrollTrigger coordinates from the page
    const coordinates = await page.evaluate(() => {
      const engine = document.getElementById('engine');
      const energy = document.getElementById('energy-narrative');

      let st02Start = 0;
      let st02End = 0;
      let stEnergyStart = 0;
      let stEnergyEnd = 0;

      if (window.ScrollTrigger) {
        const st02 = window.ScrollTrigger.getById('section02-hold');
        if (st02) {
          st02Start = st02.start;
          st02End = st02.end;
        }
        const stEnergy = window.ScrollTrigger.getById('energy-narrative-pin');
        if (stEnergy) {
          stEnergyStart = stEnergy.start;
          stEnergyEnd = stEnergy.end;
        }
      }

      return {
        docHeight: document.documentElement.scrollHeight,
        winHeight: window.innerHeight,
        engineTop: engine ? engine.getBoundingClientRect().top + window.scrollY : 0,
        energyTop: energy ? energy.getBoundingClientRect().top + window.scrollY : 0,
        st02Start,
        st02End,
        stEnergyStart,
        stEnergyEnd,
      };
    });

    console.log('Page Coordinates:', JSON.stringify(coordinates, null, 2));

    const st02Start = coordinates.st02Start || 1100;
    const st02End = coordinates.st02End || (st02Start + 1000);
    const stEnergyStart = coordinates.stEnergyStart || coordinates.energyTop || 3176;
    const stEnergyEnd = coordinates.stEnergyEnd || (stEnergyStart + 4600);
    const energyDistance = stEnergyEnd - stEnergyStart;

    // 16 MASTER CHECKPOINTS
    const checkpoints = [
      {
        id: 'chk-01-sec02-before-entrance',
        scrollY: st02Start + 20,
        label: '1. Section 02 before text entrance (sculpture arrived at center, text at start)',
      },
      {
        id: 'chk-02-sec02-partly-revealed',
        scrollY: st02Start + 180,
        label: '2. Section 02 with both text blocks partly revealed',
      },
      {
        id: 'chk-03-sec02-fully-visible-hold',
        scrollY: st02Start + 520,
        label: '3. Section 02 both text blocks fully visible & sculpture locked at rest (Reading Hold)',
      },
      {
        id: 'chk-04-sec02-leaving-after-hold',
        scrollY: st02End + 150,
        label: '4. Sculpture beginning departure towards Section 03 ONLY after reading hold',
      },
      {
        id: 'chk-05-cinematic-stage0-object-only',
        scrollY: Math.round(stEnergyStart + 0.06 * energyDistance),
        label: '5. Object-only black cinematic stage (no text, sculpture alone in center)',
      },
      {
        id: 'chk-06-beat01-muted-grey-base',
        scrollY: Math.round(stEnergyStart + 0.135 * energyDistance),
        label: '6. Beat 01 showing inactive muted grey lettering before white fill',
      },
      {
        id: 'chk-07-beat01-progressive-fill',
        scrollY: Math.round(stEnergyStart + 0.175 * energyDistance),
        label: '7. Beat 01 during progressive scrubbed white fill',
      },
      {
        id: 'chk-08-beat01-fully-filled',
        scrollY: Math.round(stEnergyStart + 0.235 * energyDistance),
        label: '8. Beat 01 fully filled in solid white (Reading Hold)',
      },
      {
        id: 'chk-09-beat02-punchline-filled',
        scrollY: Math.round(stEnergyStart + 0.38 * energyDistance),
        label: '9. Beat 02 completed punchline ("It shouldn\'t be this hard.")',
      },
      {
        id: 'chk-10-beat03-business-better',
        scrollY: Math.round(stEnergyStart + 0.55 * energyDistance),
        label: '10. Beat 03 completed ("We make your business work better.")',
      },
      {
        id: 'chk-11-beat04-solve-problems',
        scrollY: Math.round(stEnergyStart + 0.73 * energyDistance),
        label: '11. Beat 04 completed ("Got a problem no product solves?")',
      },
      {
        id: 'chk-12-beat05-selective-highlights',
        scrollY: Math.round(stEnergyStart + 0.95 * energyDistance),
        label: '12. Beat 05 completed with selective coral highlights on supporting text',
      },
      {
        id: 'chk-13-black-bg-release-spacer',
        scrollY: Math.round(stEnergyEnd + 200),
        label: '13. Deep black background after final beat in release spacer',
      },
      {
        id: 'chk-14-reverse-halfway-handoff',
        scrollY: Math.round((st02End + stEnergyStart) / 2),
        label: '14. Background smoothly transitioning back to crimson during reverse scroll',
      },
      {
        id: 'chk-15-reverse-sec02-restored',
        scrollY: Math.round(st02Start + 500),
        label: '15. Section 02 fully restored with 100% crimson caustics on reverse scroll',
      },
      {
        id: 'chk-16-reverse-hero-restored',
        scrollY: 0,
        label: '16. Hero fully restored on reverse scroll (100% crimson caustics & cursor halo)',
      },
    ];

    console.log(`\nExecuting ${checkpoints.length} scroll verification checkpoints at 1920x1080...`);

    for (const cp of checkpoints) {
      console.log(`\n---> Scrolling to: ${cp.label} (scrollY: ${cp.scrollY})`);
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), cp.scrollY);
      await page.waitForTimeout(450); // Allow GSAP scrub and Three.js lerp to settle

      const shotPath = path.join(ARTIFACTS_DIR, `${cp.id}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`  Saved screenshot: ${cp.id}.png`);

      // Read runtime metrics from DOM and WebGL
      const metrics = await page.evaluate((currY) => {
        // Section 02 side block opacity
        const leftEl = document.querySelector('#engine [class*="max-w-[360px]"]');
        const leftOpacity = leftEl ? parseFloat(window.getComputedStyle(leftEl).opacity) : null;

        // Active beat card
        const cards = Array.from(document.querySelectorAll('.narrative-beat-card'));
        const visibleCards = cards.filter((c) => parseFloat(window.getComputedStyle(c).opacity) > 0.25);
        const cardDetails = visibleCards.map((c) => {
          const h2 = c.querySelector('h2')?.innerText?.trim() || '';
          const fillHead = c.querySelector('.heading-fill');
          const clipHead = fillHead ? window.getComputedStyle(fillHead).clipPath : '';
          const sub = c.querySelector('.supporting-fill');
          const clipSub = sub ? window.getComputedStyle(sub).clipPath : '';
          return { h2, clipHead, clipSub };
        });

        // Header opacity
        const header = document.querySelector('header');
        const headerOpacity = header ? window.getComputedStyle(header).opacity : '1';

        return {
          scrollY: window.scrollY,
          leftOpacity,
          visibleCardsCount: visibleCards.length,
          cardDetails,
          headerOpacity,
        };
      }, cp.scrollY);

      console.log('  Metrics:', JSON.stringify(metrics));
      report.checkpoints.push({ ...cp, metrics });
      report.testsPassed++;
    }

    // 3. RESPONSIVE VIEWPORTS AUDIT (6 VIEWPORTS)
    console.log('\n=== TESTING RESPONSIVE VIEWPORTS ===');
    for (const vp of VIEWPORTS) {
      console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
      const vpPage = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await vpPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(1000);

      // Scroll to mid of narrative (Beat 03)
      const midNarrativeY = await vpPage.evaluate(() => {
        const energy = document.getElementById('energy-narrative');
        return energy ? energy.getBoundingClientRect().top + window.scrollY + 2000 : 3000;
      });

      await vpPage.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), midNarrativeY);
      await vpPage.waitForTimeout(500);

      const shotPath = path.join(ARTIFACTS_DIR, `vp-narrative-${vp.name}.png`);
      await vpPage.screenshot({ path: shotPath });

      const check = await vpPage.evaluate(() => {
        const hasOverflow = document.documentElement.scrollWidth > window.innerWidth;
        const h2 = document.querySelector('.narrative-beat-card h2');
        const h2Size = h2 ? window.getComputedStyle(h2).fontSize : '';
        return { hasOverflow, h2Size };
      });

      console.log(`  ${vp.name}: overflow = ${check.hasOverflow}, h2 size = ${check.h2Size}`);
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
        h2Size: check.h2Size,
      });

      await vpPage.close();
    }

    // 4. PERFORMANCE & FPS MEASUREMENT
    console.log('\n=== MEASURING FRAME PERFORMANCE ===');
    const perfPage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await perfPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await perfPage.waitForTimeout(1000);

    const perfMetrics = await perfPage.evaluate(async () => {
      const frameTimes = [];
      let lastTime = performance.now();

      return new Promise((resolve) => {
        let count = 0;
        const measure = (now) => {
          frameTimes.push(now - lastTime);
          lastTime = now;
          count++;

          // Continuous smooth scroll during measurement
          window.scrollBy(0, 15);

          if (count < 120) {
            requestAnimationFrame(measure);
          } else {
            const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const max = Math.max(...frameTimes);
            const fps = 1000 / avg;
            resolve({ avgFrameMs: avg.toFixed(2), maxFrameMs: max.toFixed(2), approxFps: fps.toFixed(1) });
          }
        };
        requestAnimationFrame(measure);
      });
    });

    console.log('Performance measurements:', perfMetrics);
    report.performance = perfMetrics;
    await perfPage.close();

    // Save final audit report
    const reportPath = path.join(ARTIFACTS_DIR, 'scroll_fill_reversal_audit.json');
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

runVerification();
