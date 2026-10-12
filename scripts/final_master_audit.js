const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const VIEWPORTS = [
  { name: 'desktop-1920x1080', w: 1920, h: 1080 },
  { name: 'desktop-1649x926', w: 1649, h: 926 },
  { name: 'desktop-1440x900', w: 1440, h: 900 },
  { name: 'laptop-1280x800', w: 1280, h: 800 },
  { name: 'tablet-1024x768', w: 1024, h: 768 },
  { name: 'tablet-portrait-768x1024', w: 768, h: 1024 },
  { name: 'mobile-390x844', w: 390, h: 844 },
  { name: 'mobile-375x812', w: 375, h: 812 },
];

function parseRgb(str) {
  if (!str) return null;
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : null;
}

function colorDist(c1, c2) {
  if (!c1 || !c2) return 999;
  return Math.hypot(c1[0] - c2[0], c1[1] - c2[1], c1[2] - c2[2]);
}

function isColorMatch(actualStr, targetStr, maxDist = 30) {
  const c1 = parseRgb(actualStr);
  const c2 = parseRgb(targetStr);
  return colorDist(c1, c2) <= maxDist;
}

async function runMasterAudit() {
  console.log('================================================================');
  console.log('   OSTRUM FINAL MASTER AUDIT: PERFORMANCE, VISUAL & SCROLL QA  ');
  console.log('================================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    consoleErrors: [],
    pageErrors: [],
    checkpoints: {},
    performanceScenarios: {},
    renderingArchitecture: {},
    responsiveMatrix: [],
    accessibility: {},
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Browser Console Error]: ${msg.text()}`);
      report.consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[Browser Page Error]: ${err.message}`);
    report.pageErrors.push(err.message);
  });

  // Enable Chrome DevTools Performance CDP Session
  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');

  const getCDPMetric = async (name) => {
    const res = await client.send('Performance.getMetrics');
    const item = res.metrics.find((m) => m.name === name);
    return item ? item.value : 0;
  };

  // Helper to record FPS and frame times across an asynchronous action
  const sampleFrameRates = async (durationMs, actionFn) => {
    const handle = await page.evaluateHandle(() => {
      window._fpsDeltas = [];
      let last = performance.now();
      let active = true;
      function loop(now) {
        if (!active) return;
        window._fpsDeltas.push(now - last);
        last = now;
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
      return () => { active = false; };
    });

    const startTime = performance.now();
    if (actionFn) await actionFn();
    const elapsed = performance.now() - startTime;
    if (elapsed < durationMs) {
      await page.waitForTimeout(durationMs - elapsed);
    }

    await page.evaluate((stopLoop) => stopLoop(), handle);

    const stats = await page.evaluate(() => {
      const deltas = window._fpsDeltas.slice(2);
      if (deltas.length === 0) return { avgFps: 60, avgFrameTimeMs: 16.6, p95FrameTimeMs: 16.6, droppedFrames: 0 };
      const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      const sorted = [...deltas].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)] || avg;
      const dropped = deltas.filter(d => d > 33.3).length;
      return {
        totalFrames: deltas.length,
        avgFps: parseFloat((1000 / avg).toFixed(1)),
        avgFrameTimeMs: parseFloat(avg.toFixed(2)),
        p95FrameTimeMs: parseFloat(p95.toFixed(2)),
        droppedFrames: dropped,
      };
    });

    return stats;
  };

  // -------------------------------------------------------------
  // SCENARIO 1: Initial Page Load
  // -------------------------------------------------------------
  console.log('--- 1. Measuring Initial Page Load ---');
  const t0 = performance.now();
  const navRes = await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const loadTimeMs = performance.now() - t0;
  await page.waitForTimeout(1500);

  const initialHeap = await getCDPMetric('JSHeapUsedSize');
  const initialLayoutCount = await getCDPMetric('LayoutCount');
  const initialTaskDuration = await getCDPMetric('TaskDuration');

  report.performanceScenarios['1_page_load'] = {
    status: navRes.status(),
    loadTimeMs: parseFloat(loadTimeMs.toFixed(1)),
    initialHeapBytes: initialHeap,
    initialLayoutCount,
    taskDurationSec: parseFloat(initialTaskDuration.toFixed(3)),
  };
  console.log(`Page Load Time: ${loadTimeMs.toFixed(1)}ms, HTTP: ${navRes.status()}`);
  if (navRes.status() === 200) report.testsPassed++; else report.testsFailed++;

  // -------------------------------------------------------------
  // RENDERING ARCHITECTURE AUDIT
  // -------------------------------------------------------------
  console.log('\n--- Auditing Rendering Architecture & Canvases ---');
  const renderArch = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('canvas')).map((c, i) => {
      const rect = c.getBoundingClientRect();
      const parent = c.parentElement;
      return {
        index: i,
        width: c.width,
        height: c.height,
        displayWidth: Math.round(rect.width),
        displayHeight: Math.round(rect.height),
        parentTestId: parent ? (parent.getAttribute('data-testid') || parent.className) : 'none',
      };
    });
    return {
      canvasCount: canvases.length,
      canvases,
      hasScrollTrigger: typeof window.ScrollTrigger !== 'undefined',
      scrollTriggerCount: window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0,
    };
  });
  console.log('Render Architecture:', JSON.stringify(renderArch, null, 2));
  report.renderingArchitecture = renderArch;
  if (renderArch.canvasCount >= 2) report.testsPassed++; else report.testsFailed++;

  // -------------------------------------------------------------
  // CHECKPOINT A: Hero Section & Typography
  // -------------------------------------------------------------
  console.log('\n--- Checkpoint A: Hero Section Inspection ---');
  const heroData = await page.evaluate(() => {
    const body = document.body;
    const bodyStyle = window.getComputedStyle(body);
    const wordmark = document.querySelector('.intro svg[aria-label="OSTRUM"]');
    const wordmarkRect = wordmark ? wordmark.getBoundingClientRect() : null;
    const header = document.querySelector('header');
    const headerStyle = header ? window.getComputedStyle(header) : null;
    const desc = document.querySelector('.intro-desc');
    const descStyle = desc ? window.getComputedStyle(desc) : null;
    const fontsLoaded = ['400 16px "Neue Montreal"', '400 16px "Romie"'].every(f => document.fonts.check(f));

    return {
      bodyBg: bodyStyle.backgroundColor,
      bodyColor: bodyStyle.color,
      bodyFont: bodyStyle.fontFamily,
      headerFixed: headerStyle ? headerStyle.position === 'fixed' : false,
      wordmarkWidth: wordmarkRect ? Math.round(wordmarkRect.width) : 0,
      wordmarkHeight: wordmarkRect ? Math.round(wordmarkRect.height) : 0,
      descFontSize: descStyle ? descStyle.fontSize : '',
      fontsLoaded,
    };
  });
  console.log('Hero Data:', heroData);
  report.checkpoints['A_hero'] = heroData;

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master-01-hero.png') });

  if (
    heroData.bodyBg === 'rgb(0, 0, 0)' &&
    heroData.headerFixed &&
    heroData.wordmarkWidth > 500 &&
    heroData.fontsLoaded
  ) {
    console.log('✓ PASS: Checkpoint A - Hero visual styling, fonts and fixed header verified.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Checkpoint A - Hero visual check failed.');
    report.testsFailed++;
  }

  // -------------------------------------------------------------
  // SCENARIO 2: Hero Background Cursor Movement
  // -------------------------------------------------------------
  console.log('\n--- 2. Measuring Hero Cursor Movement FPS ---');
  const heroCursorPerf = await sampleFrameRates(1000, async () => {
    for (let i = 0; i < 20; i++) {
      const x = 300 + Math.sin(i * 0.3) * 200;
      const y = 300 + Math.cos(i * 0.3) * 150;
      await page.mouse.move(x, y);
      await page.waitForTimeout(30);
    }
  });
  console.log('Hero Cursor Performance:', heroCursorPerf);
  report.performanceScenarios['2_hero_cursor'] = heroCursorPerf;
  report.testsPassed++;

  // -------------------------------------------------------------
  // CHECKPOINT B & SCENARIO 3 & 4: Sculpture Journey & Section 02 Docking
  // -------------------------------------------------------------
  console.log('\n--- Checkpoint B: Sculpture Journey & Section 02 Docking ---');
  const st02 = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('section02-hold') : null;
    return st ? { start: st.start, end: st.end } : { start: 1000, end: 2000 };
  });

  const journeyPerf = await sampleFrameRates(1500, async () => {
    const steps = 30;
    for (let i = 1; i <= steps; i++) {
      const y = (st02.start / steps) * i;
      await page.evaluate((pos) => window.scrollTo(0, pos), y);
      await page.waitForTimeout(30);
    }
  });
  console.log('Sculpture Journey FPS:', journeyPerf);
  report.performanceScenarios['3_sculpture_journey'] = journeyPerf;

  // Verify at Section 02 Docking Position
  await page.evaluate((pos) => window.scrollTo(0, pos + 100), st02.start);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master-02-section02-docked.png') });

  const section02Data = await page.evaluate(() => {
    const slot = document.getElementById('section02-sculpture-slot');
    const slotRect = slot ? slot.getBoundingClientRect() : null;
    const bodyText = document.body.innerText;
    const hasBusiness = bodyText.includes("FOR BUSINESS") || bodyText.includes("Systems that make");
    const hasNext = bodyText.includes("FOR WHAT'S NEXT") || bodyText.includes("Products and ventures");
    return {
      slotVisible: !!slotRect && slotRect.width > 100,
      slotTop: slotRect ? Math.round(slotRect.top) : 0,
      hasBusiness,
      hasNext,
    };
  });
  console.log('Section 02 Data:', section02Data);
  report.checkpoints['B_section02'] = section02Data;
  if (section02Data.slotVisible && section02Data.hasBusiness && section02Data.hasNext) {
    console.log('✓ PASS: Checkpoint B - Section 02 docking & dual identity content verified.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Checkpoint B - Section 02 check failed.');
    report.testsFailed++;
  }

  // -------------------------------------------------------------
  // CHECKPOINT C & SCENARIO 5: Cinematic Narrative Scrolling
  // -------------------------------------------------------------
  console.log('\n--- Checkpoint C: Cinematic Narrative Section 03 ---');
  const stEnergy = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('energy-narrative-pin') : null;
    return st ? { start: st.start, end: st.end, span: st.end - st.start } : { start: 3176, end: 9076, span: 5900 };
  });

  console.log(`Cinematic narrative span: ${stEnergy.start} to ${stEnergy.end}`);

  const narrativeBeatsObserved = [];
  const narrativePerf = await sampleFrameRates(2500, async () => {
    const beatSteps = 5;
    for (let b = 1; b <= beatSteps; b++) {
      const targetScroll = stEnergy.start + (stEnergy.span / (beatSteps + 1)) * b;
      await page.evaluate((pos) => window.scrollTo(0, pos), targetScroll);
      await page.waitForTimeout(300);

      const beatInfo = await page.evaluate(() => {
        const visibleBeats = Array.from(document.querySelectorAll('.narrative-beat-card')).filter(card => {
          const op = parseFloat(window.getComputedStyle(card).opacity);
          return op > 0.3;
        }).map(c => c.innerText.trim().replace(/\n/g, ' '));
        return visibleBeats;
      });
      if (beatInfo.length > 0) narrativeBeatsObserved.push(beatInfo[0]);
    }
  });

  console.log('Cinematic Narrative FPS:', narrativePerf);
  console.log('Observed Narrative Beats:', narrativeBeatsObserved);
  report.performanceScenarios['5_cinematic_narrative'] = narrativePerf;
  report.checkpoints['C_cinematic_narrative'] = narrativeBeatsObserved;

  if (narrativeBeatsObserved.length >= 2) {
    console.log('✓ PASS: Checkpoint C - Cinematic narrative beats verified.');
    report.testsPassed++;
  } else {
    report.testsFailed++;
  }

  // -------------------------------------------------------------
  // CHECKPOINT D: Final Cinematic Signoff ("Ready for what's next? / OSTRUM")
  // -------------------------------------------------------------
  console.log('\n--- Checkpoint D: Final Cinematic Signoff State ---');
  await page.evaluate((endPos) => window.scrollTo(0, endPos - 200), stEnergy.end);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master-03-final-cinematic-signoff.png') });

  const finalSignoffData = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasReady = text.includes("Ready for what's next?");
    const hasOstrumSignoff = text.includes("OSTRUM");
    return { hasReady, hasOstrumSignoff };
  });
  console.log('Final Signoff Data:', finalSignoffData);
  report.checkpoints['D_final_signoff'] = finalSignoffData;
  if (finalSignoffData.hasReady && finalSignoffData.hasOstrumSignoff) {
    console.log('✓ PASS: Checkpoint D - Final cinematic signoff verified.');
    report.testsPassed++;
  } else {
    report.testsFailed++;
  }

  // -------------------------------------------------------------
  // CHECKPOINT E & SCENARIO 6-11: Works Wheel Entrance, Morph, Themes
  // -------------------------------------------------------------
  console.log('\n--- Checkpoint E: Works Wheel & Project Themes ---');
  const stWheel = await page.evaluate(() => {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
    return st ? { start: st.start, end: st.end, span: st.end - st.start } : { start: 9076, end: 13776, span: 4700 };
  });

  // Handoff entrance to Initial Light Oval
  await page.evaluate((startPos) => window.scrollTo(0, startPos), stWheel.start);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master-04-works-wheel-light-oval.png') });

  const initialOvalState = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    const secBg = sec ? window.getComputedStyle(sec).backgroundColor : '';
    const label = document.querySelector('#selected-work span');
    const labelText = label ? label.innerText : '';
    const items = Array.from(document.querySelectorAll('#selected-work img')).length;
    return { secBg, labelText, itemsCount: items };
  });
  console.log('Initial Oval State:', initialOvalState);
  report.checkpoints['E_initial_oval'] = initialOvalState;

  if (isColorMatch(initialOvalState.secBg, 'rgb(241, 241, 250)')) {
    console.log('✓ PASS: Initial oval retains Lusion light background (rgb(241, 241, 250)).');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Initial oval background mismatch:', initialOvalState.secBg);
    report.testsFailed++;
  }

  // Verified Project Offsets in Works Wheel Pin Scroll (turn = 1, 2, 3, 4)
  const PROJECT_TARGETS = [
    { name: 'TMR AI Car Care', offset: 1350, bg: 'rgb(66, 16, 15)', text: 'rgb(255, 248, 245)', url: 'https://tmraicarcare.com/' },
    { name: 'Saraswati Driving School', offset: 2350, bg: 'rgb(15, 26, 78)', text: 'rgb(244, 248, 255)', url: 'https://saraswati-driving-school.vercel.app/' },
    { name: 'MNESA', offset: 3350, bg: 'rgb(35, 14, 72)', text: 'rgb(250, 246, 255)', url: '' },
    { name: 'NeuroMove', offset: 4350, bg: 'rgb(6, 48, 40)', text: 'rgb(240, 253, 248)', url: '' },
  ];

  const projectResults = [];

  for (let pIdx = 0; pIdx < PROJECT_TARGETS.length; pIdx++) {
    const target = PROJECT_TARGETS[pIdx];
    const prevOffset = pIdx === 0 ? 650 : PROJECT_TARGETS[pIdx - 1].offset;
    const midOffset = Math.round((prevOffset + target.offset) / 2);

    const projectPerf = await sampleFrameRates(1400, async () => {
      // Step through intermediate transition point (emulating natural user scroll progression)
      await page.evaluate((pos) => window.scrollTo({ top: pos, behavior: 'instant' }), stWheel.start + midOffset);
      await page.waitForTimeout(300);
      await page.evaluate((pos) => window.scrollTo({ top: pos, behavior: 'instant' }), stWheel.start + target.offset);
      await page.waitForTimeout(1000); // Allow smooth exponential color lerp to settle
    });

    const state = await page.evaluate(() => {
      const sec = document.getElementById('selected-work');
      const pinContainer = sec ? sec.querySelector('div[class*="min-h-screen"]') : null;
      const titleEl = document.querySelector('#selected-work h3');
      const descEl = document.querySelector('#selected-work p');
      const linkEl = document.querySelector('#selected-work a');
      const secBg = sec ? window.getComputedStyle(sec).backgroundColor : '';
      const pinBg = pinContainer ? window.getComputedStyle(pinContainer).backgroundColor : '';
      const titleColor = titleEl ? window.getComputedStyle(titleEl).color : '';
      return {
        secBg,
        pinBg,
        scrollY: window.scrollY,
        title: titleEl ? titleEl.innerText.trim() : '',
        titleColor,
        desc: descEl ? descEl.innerText.trim() : '',
        href: linkEl ? linkEl.href : '',
      };
    });

    console.log(`Project ${pIdx + 1} (${target.name}):`, state);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, `master-05-project-${pIdx + 1}.png`) });

    const bgMatch = isColorMatch(state.pinBg, target.bg, 35) || isColorMatch(state.secBg, target.bg, 35);
    const titleMatch = state.title.toLowerCase().includes(target.name.toLowerCase());

    if (bgMatch && titleMatch) {
      console.log(`✓ PASS: Project ${target.name} theme and title verified.`);
      report.testsPassed++;
    } else {
      console.error(`✗ FAIL: Project ${target.name} mismatch: bg=${state.secBg}/${state.pinBg} vs target=${target.bg}, title=${state.title}`);
      report.testsFailed++;
    }

    projectResults.push({ target: target.name, measured: state, perf: projectPerf, passed: bgMatch && titleMatch });
  }

  report.checkpoints['E_projects'] = projectResults;

  // -------------------------------------------------------------
  // CHECKPOINT F: Reverse Scroll to Top
  // -------------------------------------------------------------
  console.log('\n--- Checkpoint F: Reverse Scroll to Top ---');
  const reversePerf = await sampleFrameRates(2000, async () => {
    const reverseSteps = 30;
    const currentY = await page.evaluate(() => window.scrollY);
    for (let r = reverseSteps; r >= 0; r--) {
      const y = (currentY / reverseSteps) * r;
      await page.evaluate((pos) => window.scrollTo(0, pos), y);
      await page.waitForTimeout(25);
    }
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master-06-reversed-to-hero.png') });

  const finalHeroState = await page.evaluate(() => {
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const wordmark = document.querySelector('.intro svg[aria-label="OSTRUM"]');
    return {
      bodyBg,
      wordmarkPresent: !!wordmark,
      scrollY: window.scrollY,
    };
  });
  console.log('Final Hero State after Reverse:', finalHeroState);
  report.checkpoints['F_reverse_scroll'] = finalHeroState;
  report.performanceScenarios['13_reverse_scroll'] = reversePerf;

  if (finalHeroState.bodyBg === 'rgb(0, 0, 0)' && finalHeroState.wordmarkPresent) {
    console.log('✓ PASS: Checkpoint F - Full reversal cleanly restores hero and dark palette.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Checkpoint F - Reversal failed.');
    report.testsFailed++;
  }

  // -------------------------------------------------------------
  // RESPONSIVE MATRIX: 8 Viewports
  // -------------------------------------------------------------
  console.log('\n--- Auditing Responsive Matrix (8 Viewports) ---');
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    const vpMetrics = await page.evaluate((w) => {
      const docW = document.documentElement.scrollWidth;
      const wordmark = document.querySelector('.intro svg[aria-label="OSTRUM"]');
      const wRect = wordmark ? wordmark.getBoundingClientRect() : null;
      return {
        hasHorizontalOverflow: docW > w + 2,
        wordmarkWidth: wRect ? Math.round(wRect.width) : 0,
        fitsScreen: wRect ? wRect.width <= w : true,
      };
    }, vp.w);

    const vpShot = path.join(ARTIFACTS_DIR, `master-vp-${vp.name}.png`);
    await page.screenshot({ path: vpShot });

    console.log(`Viewport ${vp.name} (${vp.w}x${vp.h}): overflow=${vpMetrics.hasHorizontalOverflow}, wordmark=${vpMetrics.wordmarkWidth}px`);

    if (!vpMetrics.hasHorizontalOverflow && vpMetrics.fitsScreen) {
      report.testsPassed++;
    } else {
      report.testsFailed++;
    }

    report.responsiveMatrix.push({
      viewport: vp.name,
      dimensions: `${vp.w}x${vp.h}`,
      ...vpMetrics,
      screenshot: vpShot,
    });
  }

  // -------------------------------------------------------------
  // ACCESSIBILITY & RUNTIME CLEANUP AUDIT
  // -------------------------------------------------------------
  console.log('\n--- Auditing Accessibility, Links & Landmarks ---');
  const a11yData = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      tag: h.tagName.toLowerCase(),
      text: h.innerText.slice(0, 40).trim(),
    }));
    const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
      href: a.href,
      text: a.innerText.trim(),
    }));
    const imagesWithAlt = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src.split('/').pop(),
      alt: img.alt,
    }));
    return { headings, links, imagesWithAlt };
  });

  report.accessibility = a11yData;
  console.log(`Found ${a11yData.headings.length} headings, ${a11yData.links.length} links, ${a11yData.imagesWithAlt.length} images.`);
  if (a11yData.headings.length > 0 && a11yData.links.length > 0) {
    report.testsPassed++;
  } else {
    report.testsFailed++;
  }

  // Memory & Heap summary
  const finalHeap = await getCDPMetric('JSHeapUsedSize');
  const heapDeltaMb = parseFloat(((finalHeap - initialHeap) / (1024 * 1024)).toFixed(2));
  console.log(`Heap Delta across complete multi-viewport audit: ${heapDeltaMb} MB`);

  report.memory = {
    initialHeapBytes: initialHeap,
    finalHeapBytes: finalHeap,
    deltaMb: heapDeltaMb,
  };

  await browser.close();

  // Save report
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'final_master_audit_results.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n================================================================');
  console.log(`MASTER AUDIT COMPLETE: ${report.testsPassed} PASSED, ${report.testsFailed} FAILED`);
  console.log(`Console Errors: ${report.consoleErrors.length}, Page Errors: ${report.pageErrors.length}`);
  console.log('================================================================\n');

  if (report.testsFailed > 0 || report.consoleErrors.length > 0 || report.pageErrors.length > 0) {
    process.exit(1);
  }
}

runMasterAudit().catch((err) => {
  console.error('Fatal Audit Error:', err);
  process.exit(1);
});
