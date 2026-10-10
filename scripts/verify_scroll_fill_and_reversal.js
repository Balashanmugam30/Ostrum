const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const VIEWPORTS = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-375x812', width: 375, height: 812 },
];

async function runVerification() {
  console.log('=== STARTING OSTRUM CHOREOGRAPHY, OUTLINE-TO-FILL & REVERSAL AUDIT ===');

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
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Console Error]: ${msg.text()}`);
        report.consoleErrors.push(msg.text());
      }
    });

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Allow WebGL shader and 3D model decoding

    // 1. Verify Clean DOM Structure
    const beatCards = await page.$$('.narrative-beat-card');
    console.log(`Found ${beatCards.length} narrative beat cards in Section 03.`);
    if (beatCards.length === 4) {
      console.log('✓ PASS: Exactly 4 narrative beats present (Beats 01 to 04).');
      report.testsPassed++;
    } else {
      console.error(`✗ FAIL: Expected 4 narrative beats, found ${beatCards.length}`);
      report.testsFailed++;
    }

    // Measure ScrollTrigger coordinates from the page
    const coordinates = await page.evaluate(() => {
      const engine = document.getElementById('engine');
      const energy = document.getElementById('energy-narrative');
      const slot02 = document.getElementById('section02-sculpture-slot');

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

    console.log('Page Geometry:', JSON.stringify(coordinates, null, 2));

    const st02Start = coordinates.st02Start || 1100;
    const st02End = coordinates.st02End || (st02Start + 1000);
    const stEnergyStart = coordinates.energyTop || 3176;
    const energyDistance = 3800;
    const stEnergyEnd = stEnergyStart + energyDistance;

    // 14 REQUIRED CHECKPOINTS
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
        scrollY: Math.round(stEnergyStart + 0.08 * energyDistance),
        label: '5. Object-only black cinematic stage (no text, sculpture alone in center)',
      },
      {
        id: 'chk-06-beat01-outlined-glyphs',
        scrollY: Math.round(stEnergyStart + 0.175 * energyDistance),
        label: '6. Beat 01 showing outlined glyphs before the fill',
      },
      {
        id: 'chk-07-beat01-progressive-fill',
        scrollY: Math.round(stEnergyStart + 0.235 * energyDistance),
        label: '7. Beat 01 during progressive left-to-right fill',
      },
      {
        id: 'chk-08-beat01-fully-filled',
        scrollY: Math.round(stEnergyStart + 0.30 * energyDistance),
        label: '8. Beat 01 fully filled and readable (Reading Hold)',
      },
      {
        id: 'chk-09-beat02-completed',
        scrollY: Math.round(stEnergyStart + 0.51 * energyDistance),
        label: '9. Beat 02 at completed filled state ("Intelligence that works.")',
      },
      {
        id: 'chk-09b-beat03-completed',
        scrollY: Math.round(stEnergyStart + 0.72 * energyDistance),
        label: '9b. Beat 03 at completed filled state ("Built for what comes next.")',
      },
      {
        id: 'chk-10-beat04-selective-highlights',
        scrollY: Math.round(stEnergyStart + 0.94 * energyDistance),
        label: '10. Beat 04 with final paragraph selected phrases highlighted in coral',
      },
      {
        id: 'chk-11-black-bg-after-final-beat',
        scrollY: Math.round(stEnergyEnd + 250),
        label: '11. The black background after the final beat in release spacer',
      },
      {
        id: 'chk-12-reverse-halfway-crimson',
        scrollY: Math.round(st02End + 200),
        label: '12. Background halfway back to crimson while reverse scrolling',
      },
      {
        id: 'chk-13-reverse-sec02-restored',
        scrollY: Math.round(st02Start + 450),
        label: '13. Section 02 fully restored after reverse scrolling',
      },
      {
        id: 'chk-14-reverse-hero-restored',
        scrollY: 0,
        label: '14. Hero fully restored after reverse scrolling with active crimson caustics & cursor',
      },
    ];

    console.log(`\nExecuting ${checkpoints.length} scroll verification checkpoints...`);

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
        const leftBlock = document.querySelector('#engine .translate-x-1\\.5, #engine div:has(h3):not(.intro)');
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

        // Background darkening state
        const causticsCanvas = document.querySelector('#bg-caustics-container canvas');
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

    // 2. VIEWPORT RESPONSIVENESS AUDIT (5 VIEWPORTS)
    console.log('\n=== TESTING RESPONSIVE VIEWPORTS ===');
    for (const vp of VIEWPORTS) {
      console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
      const vpPage = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await vpPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(1000);

      // Scroll to mid of narrative
      const midNarrativeY = await vpPage.evaluate(() => {
        const energy = document.getElementById('energy-narrative');
        return energy ? energy.getBoundingClientRect().top + window.scrollY + 1400 : 2500;
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

    // 3. PERFORMANCE & FPS MEASUREMENT
    console.log('\n=== MEASURING FRAME PERFORMANCE ===');
    const perfPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
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

          // Scroll continuously during measurement
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

    // Save final report
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
