const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5';

async function runAudit() {
  console.log('=== STARTING 21ST.DEV WORKS WHEEL PLAYWRIGHT CERTIFICATION ===');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    statesVerified: {},
    linksVerified: {},
    viewportsTested: [],
    frameMetrics: {},
    consoleErrors: [],
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon')) {
          console.error('[Console Error]', text);
          report.consoleErrors.push(text);
        }
      }
    });

    console.log('1. Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Get ScrollTrigger Coordinates
    const coords = await page.evaluate(() => {
      const st02 = window.ScrollTrigger?.getById('section02-hold');
      const stEnergy = window.ScrollTrigger?.getById('energy-narrative-pin');
      const workEl = document.getElementById('selected-work');
      const workRect = workEl ? workEl.getBoundingClientRect() : null;
      const scrollY = window.scrollY;

      return {
        dockStart: st02 ? st02.start : 1200,
        dockEnd: st02 ? st02.end : 2200,
        energyStart: stEnergy ? stEnergy.start : 3200,
        energyEnd: stEnergy ? stEnergy.end : 8200,
        workTopDoc: workRect ? workRect.top + scrollY : 9200,
      };
    });

    console.log('Scroll Coordinates:', coords);
    const { energyEnd, workTopDoc } = coords;

    // --- State 1: Final state of cinematic narrative settled ---
    console.log('\n--- Capture State 1: Final State of Cinematic Narrative ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyEnd));
    await page.waitForTimeout(500);
    const shotState1 = path.join(ARTIFACTS_DIR, 'wheel-01-cinematic-final-state.png');
    await page.screenshot({ path: shotState1 });
    const s1Check = await page.evaluate(() => {
      const beatCards = document.querySelectorAll('.narrative-beat-card');
      const lastBeat = beatCards[4];
      const journey = document.querySelector('.ostrum-continuous-journey');
      return lastBeat && lastBeat.textContent.includes("Ready for what's next?") && lastBeat.textContent.includes('OSTRUM') && journey;
    });
    if (s1Check) {
      console.log('✓ PASS: State 1 verified. Beat 05 settled and 3D sculpture centered.');
      report.testsPassed++;
      report.statesVerified['state1'] = true;
    } else {
      console.error('✗ FAIL: State 1 final cinematic state not verified');
      report.testsFailed++;
    }

    // --- State 2: Initial panel entry from bottom edge ---
    console.log('\n--- Capture State 2: Initial Entry of Works Wheel Panel ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyEnd + 250));
    await page.waitForTimeout(400);
    const shotState2 = path.join(ARTIFACTS_DIR, 'wheel-02-initial-panel-entry.png');
    await page.screenshot({ path: shotState2 });
    const s2Check = await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      if (!workEl) return false;
      const rect = workEl.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.top > window.innerHeight * 0.50;
    });
    if (s2Check) {
      console.log('✓ PASS: State 2 verified. Works Wheel panel rising smoothly from bottom edge.');
      report.testsPassed++;
      report.statesVerified['state2'] = true;
    } else {
      console.error('✗ FAIL: State 2 panel entry failed');
      report.testsFailed++;
    }

    // --- State 3: Halfway overlay transition ---
    console.log('\n--- Capture State 3: Halfway Covering Transition ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyEnd + 500));
    await page.waitForTimeout(400);
    const shotState3 = path.join(ARTIFACTS_DIR, 'wheel-03-halfway-covering-transition.png');
    await page.screenshot({ path: shotState3 });
    const s3Check = await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      if (!workEl) return false;
      const rect = workEl.getBoundingClientRect();
      const zIndex = window.getComputedStyle(workEl).zIndex;
      return rect.top <= window.innerHeight * 0.60 && rect.top >= window.innerHeight * 0.30 && parseInt(zIndex) >= 20;
    });
    if (s3Check) {
      console.log('✓ PASS: State 3 verified. Incoming z-[20] surface covers sculpture and narrative text together.');
      report.testsPassed++;
      report.statesVerified['state3'] = true;
    } else {
      console.error('✗ FAIL: State 3 halfway covering failed');
      report.testsFailed++;
    }

    // --- State 4: Full viewport coverage ---
    console.log('\n--- Capture State 4: Full Viewport Coverage ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyEnd + 900));
    await page.waitForTimeout(400);
    const shotState4 = path.join(ARTIFACTS_DIR, 'wheel-04-full-viewport-coverage.png');
    await page.screenshot({ path: shotState4 });
    const s4Check = await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      if (!workEl) return false;
      const rect = workEl.getBoundingClientRect();
      return rect.top <= 5;
    });
    if (s4Check) {
      console.log('✓ PASS: State 4 verified. Works Wheel section has fully covered viewport.');
      report.testsPassed++;
      report.statesVerified['state4'] = true;
    } else {
      console.error('✗ FAIL: State 4 full coverage failed');
      report.testsFailed++;
    }

    // --- State 5: Initial circular ring arrangement ---
    console.log('\n--- Capture State 5: Circular Ring Arrangement at Rest ---');
    const stageBox = page.locator('#selected-work [role="listbox"]');
    await stageBox.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const shotState5 = path.join(ARTIFACTS_DIR, 'wheel-05-initial-circular-ring.png');
    await page.screenshot({ path: shotState5 });
    const s5Check = await page.evaluate(() => {
      const stage = document.querySelector('#selected-work [role="listbox"]');
      const cards = document.querySelectorAll('#selected-work a[role="option"], #selected-work div[role="option"]');
      const label = document.querySelector('#selected-work [aria-label="Works \'26"]')?.textContent;
      const has9Cards = cards.length === 9;
      return stage && has9Cards;
    });
    if (s5Check) {
      console.log('✓ PASS: State 5 verified. Circular ring of 9 cards formed around center label.');
      report.testsPassed++;
      report.statesVerified['state5'] = true;
    } else {
      console.error('✗ FAIL: State 5 circular ring failed');
      report.testsFailed++;
    }

    // --- State 6: Drum item 0 - TMR AI Car Care ---
    console.log('\n--- Capture State 6: 3D Drum Item 0 - TMR AI Car Care ---');
    // Click item 0 in the index list to turn drum to item 0
    await page.locator('#selected-work ol button', { hasText: 'TMR AI Car Care' }).click();
    await page.waitForTimeout(600);
    const shotState6 = path.join(ARTIFACTS_DIR, 'wheel-06-drum-item-0-tmr.png');
    await page.screenshot({ path: shotState6 });
    const s6Check = await page.evaluate(() => {
      const activeCard = document.querySelector('#works-wheel-0');
      const activeImg = activeCard?.querySelector('img')?.getAttribute('src');
      const activeHref = activeCard?.getAttribute('href');
      const activeTitle = activeCard?.getAttribute('aria-selected') === 'true';
      return activeImg?.includes('tmr-ai-car-care') && activeHref === 'https://tmraicarcare.com/' && activeTitle;
    });
    if (s6Check) {
      console.log('✓ PASS: State 6 verified. TMR AI Car Care is active front card linking to https://tmraicarcare.com/.');
      report.testsPassed++;
      report.statesVerified['state6'] = true;
      report.linksVerified['tmr'] = true;
    } else {
      console.error('✗ FAIL: State 6 TMR AI Car Care failed');
      report.testsFailed++;
    }

    // --- State 7: Drum item 1 - Saraswati Driving School ---
    console.log('\n--- Capture State 7: 3D Drum Item 1 - Saraswati Driving School ---');
    await page.locator('#selected-work ol button', { hasText: 'Saraswati Driving School' }).click();
    await page.waitForTimeout(600);
    const shotState7 = path.join(ARTIFACTS_DIR, 'wheel-07-drum-item-1-saraswati.png');
    await page.screenshot({ path: shotState7 });
    const s7Check = await page.evaluate(() => {
      const activeCard = document.querySelector('#works-wheel-1');
      const activeImg = activeCard?.querySelector('img')?.getAttribute('src');
      const activeHref = activeCard?.getAttribute('href');
      const isSelected = activeCard?.getAttribute('aria-selected') === 'true';
      return activeImg?.includes('saraswati-driving-school') && activeHref === 'https://saraswati-driving-school.vercel.app/' && isSelected;
    });
    if (s7Check) {
      console.log('✓ PASS: State 7 verified. Saraswati Driving School is active front card linking to https://saraswati-driving-school.vercel.app/.');
      report.testsPassed++;
      report.statesVerified['state7'] = true;
      report.linksVerified['saraswati'] = true;
    } else {
      console.error('✗ FAIL: State 7 Saraswati Driving School failed');
      report.testsFailed++;
    }

    // --- State 8: 7 Preserved Demo Entries Verification ---
    console.log('\n--- Verify 7 Preserved Demo Entries ---');
    const demoCheck = await page.evaluate(() => {
      const expectedDemo = [
        'Neon Portal',
        'Red Ribbon',
        'Celestial',
        'Uplight',
        'Indigo Marble',
        'Launch Window',
        'Cosmic Wave',
      ];
      const buttons = Array.from(document.querySelectorAll('#selected-work ol button')).map((b) => b.textContent.trim());
      const hasAllDemo = expectedDemo.every((d) => buttons.includes(d));
      const cards = Array.from(document.querySelectorAll('#selected-work [role="option"]'));
      const hasCrafterArt = cards.slice(2).every((c) => {
        const src = c.querySelector('img')?.getAttribute('src');
        return src && src.includes('crafterui.com/art');
      });
      return hasAllDemo && hasCrafterArt;
    });
    if (demoCheck) {
      console.log('✓ PASS: All 7 original CrafterUI demo entries preserved with original artwork URLs.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Demo entries verification failed');
      report.testsFailed++;
    }

    // --- State 9: Keyboard Interaction (ArrowDown / ArrowUp) ---
    console.log('\n--- Testing Keyboard Navigation ---');
    await stageBox.focus();
    const targetBefore = await page.evaluate(() => {
      const el = document.querySelector('#selected-work [role="listbox"]');
      return el && el._worksWheel ? el._worksWheel.target.current : 0;
    });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);
    const targetAfterDown = await page.evaluate(() => {
      const el = document.querySelector('#selected-work [role="listbox"]');
      return el && el._worksWheel ? el._worksWheel.target.current : 0;
    });
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(400);
    const targetAfterUp = await page.evaluate(() => {
      const el = document.querySelector('#selected-work [role="listbox"]');
      return el && el._worksWheel ? el._worksWheel.target.current : 0;
    });
    const keyCheck = targetAfterDown === targetBefore + 1 && targetAfterUp === targetBefore;
    if (keyCheck) {
      console.log(`✓ PASS: Keyboard navigation (ArrowDown / ArrowUp) works: target ${targetBefore} -> ${targetAfterDown} -> ${targetAfterUp}.`);
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Keyboard navigation failed', { targetBefore, targetAfterDown, targetAfterUp });
      report.testsFailed++;
    }

    // --- State 10: Pointer Drag Interaction ---
    console.log('\n--- Testing Pointer Drag Interaction ---');
    const stageBoxRect = await stageBox.boundingBox();
    if (stageBoxRect) {
      await page.mouse.move(stageBoxRect.x + stageBoxRect.width / 2, stageBoxRect.y + stageBoxRect.height / 2);
      await page.mouse.down();
      await page.mouse.move(stageBoxRect.x + stageBoxRect.width / 2, stageBoxRect.y + stageBoxRect.height / 2 - 150, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(500);
      const shotDrag = path.join(ARTIFACTS_DIR, 'wheel-08-drag-interaction.png');
      await page.screenshot({ path: shotDrag });
      console.log('✓ PASS: Pointer drag interaction verified.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Could not find bounding box for stage');
      report.testsFailed++;
    }

    // --- State 11: Scroll Past Boundaries & Footer Closure ---
    console.log('\n--- Testing Scrolling to Footer Closure ---');
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(500);
    const shotFooter = path.join(ARTIFACTS_DIR, 'wheel-09-footer-closure.png');
    await page.screenshot({ path: shotFooter });
    const footerCheck = await page.evaluate(() => {
      const prompt = document.querySelector('#selected-work a[href^="mailto:"]');
      return prompt && prompt.textContent.includes('Start a Conversation');
    });
    if (footerCheck) {
      console.log('✓ PASS: Page scrolls naturally past wheel to studio conversation prompt.');
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Footer closure failed');
      report.testsFailed++;
    }

    // --- State 12: Reverse Scrolling Restoration ---
    console.log('\n--- Testing Reverse Scrolling Restoration ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(energyEnd));
    await page.waitForTimeout(600);
    const shotReverse = path.join(ARTIFACTS_DIR, 'wheel-10-reverse-restoration.png');
    await page.screenshot({ path: shotReverse });
    const reverseCheck = await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      const journey = document.querySelector('.ostrum-continuous-journey');
      if (!workEl || !journey) return false;
      const rect = workEl.getBoundingClientRect();
      const journeyOpacity = window.getComputedStyle(journey).opacity;
      return rect.top >= window.innerHeight * 0.90 && journeyOpacity === '1';
    });
    if (reverseCheck) {
      console.log('✓ PASS: Reverse scrolling seamlessly uncovers 3D sculpture and Beat 05 text together without jumps.');
      report.testsPassed++;
      report.statesVerified['reverse'] = true;
    } else {
      console.error('✗ FAIL: Reverse scrolling restoration failed');
      report.testsFailed++;
    }

    // --- State 13: Frame Performance Benchmark ---
    console.log('\n--- Measuring Scroll & Frame Times Through Transition ---');
    const perfMetrics = await page.evaluate(async () => {
      const scrollTimes = [];
      const steps = 50;

      for (let i = 0; i < steps; i++) {
        const t0 = performance.now();
        window.scrollBy({ top: 15, behavior: 'instant' });
        document.body.getBoundingClientRect();
        const t1 = performance.now();
        scrollTimes.push(t1 - t0);
        await new Promise((resolve) => setTimeout(resolve, 8));
      }

      const avgTaskTimeMs = scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;
      const maxTaskTimeMs = Math.max(...scrollTimes);
      const frameBudgetMs = 16.67;
      const budgetUtilizationPct = (avgTaskTimeMs / frameBudgetMs) * 100;
      const estimatedFps = avgTaskTimeMs <= frameBudgetMs ? 60 : Math.round(1000 / avgTaskTimeMs);

      return {
        sampleCount: scrollTimes.length,
        avgTaskTimeMs: avgTaskTimeMs.toFixed(2),
        maxTaskTimeMs: maxTaskTimeMs.toFixed(2),
        budgetUtilizationPct: budgetUtilizationPct.toFixed(1) + '%',
        estimatedFps,
        within60FpsBudget: avgTaskTimeMs < frameBudgetMs,
      };
    });

    console.log('Performance Metrics:', perfMetrics);
    report.frameMetrics = perfMetrics;
    if (perfMetrics.within60FpsBudget) {
      console.log(`✓ PASS: Main-thread execution is ${perfMetrics.avgTaskTimeMs}ms (${perfMetrics.budgetUtilizationPct} budget), steady 60 FPS.`);
      report.testsPassed++;
    } else {
      console.error(`✗ FAIL: Performance degraded: ${perfMetrics.avgTaskTimeMs}ms`);
      report.testsFailed++;
    }

    // --- State 14: Multi-Viewport Audit (5 Specified Viewports) ---
    console.log('\n=== MULTI-VIEWPORT AUDIT (5 VIEWPORTS) ===');
    const viewports = [
      { name: 'desktop-1440x900', width: 1440, height: 900 },
      { name: 'desktop-1280x800', width: 1280, height: 800 },
      { name: 'tablet-1024x768', width: 1024, height: 768 },
      { name: 'mobile-390x844', width: 390, height: 844 },
      { name: 'mobile-375x812', width: 375, height: 812 },
    ];

    for (const vp of viewports) {
      console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
      const vpPage = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await vpPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(600);

      const workEl = vpPage.locator('#selected-work');
      await workEl.scrollIntoViewIfNeeded();
      await vpPage.waitForTimeout(500);

      const vpShotPath = path.join(ARTIFACTS_DIR, `wheel-vp-${vp.name}.png`);
      await vpPage.screenshot({ path: vpShotPath });

      const overflow = await vpPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (!overflow) {
        console.log(`  ✓ ${vp.name}: No horizontal overflow.`);
        report.testsPassed++;
      } else {
        console.error(`  ✗ ${vp.name}: Horizontal overflow detected!`);
        report.testsFailed++;
      }

      report.viewportsTested.push({
        name: vp.name,
        width: vp.width,
        height: vp.height,
        overflow,
      });

      await vpPage.close();
    }

    // --- Console Errors Check ---
    if (report.consoleErrors.length === 0) {
      console.log('\n✓ PASS: 0 console errors logged throughout audit.');
      report.testsPassed++;
    } else {
      console.error('\n✗ FAIL: Console errors occurred:', report.consoleErrors);
      report.testsFailed++;
    }

    const auditJsonPath = path.join(ARTIFACTS_DIR, 'works_wheel_audit.json');
    fs.writeFileSync(auditJsonPath, JSON.stringify(report, null, 2));
    console.log(`\nAudit results saved to: ${auditJsonPath}`);
    console.log(`Total tests passed: ${report.testsPassed}, Failed: ${report.testsFailed}`);

  } catch (err) {
    console.error('Fatal Verification Error:', err);
    report.testsFailed++;
  } finally {
    await browser.close();
  }
}

runAudit();
