const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5';

function analyzeTraceEvents(events) {
  let longTasks = [];
  let scriptDurationUs = 0;
  let layoutDurationUs = 0;
  let styleDurationUs = 0;
  let paintDurationUs = 0;
  let compositeDurationUs = 0;
  let frameTimesMs = [];
  let lastFrameTimeUs = 0;

  for (const e of events) {
    const durUs = e.dur || 0;
    const durMs = durUs / 1000;

    // Categorize Main Thread work
    if (e.name === 'RunTask' || e.name === 'v8.execute' || e.name === 'FunctionCall') {
      scriptDurationUs += durUs;
      if (durMs >= 50) {
        longTasks.push({
          name: e.name,
          durationMs: parseFloat(durMs.toFixed(2)),
          timestampMs: parseFloat((e.ts / 1000).toFixed(2)),
        });
      }
    } else if (e.name === 'Layout') {
      layoutDurationUs += durUs;
    } else if (e.name === 'UpdateLayoutTree' || e.name === 'RecalculateStyles') {
      styleDurationUs += durUs;
    } else if (e.name === 'Paint') {
      paintDurationUs += durUs;
    } else if (e.name === 'CompositeLayers') {
      compositeDurationUs += durUs;
    }

    // Frame timing tracking
    if (e.name === 'BeginFrame' || e.name === 'DrawFrame' || e.name === 'needsBeginFrame') {
      if (lastFrameTimeUs > 0) {
        const deltaMs = (e.ts - lastFrameTimeUs) / 1000;
        if (deltaMs >= 4 && deltaMs <= 500) {
          frameTimesMs.push(deltaMs);
        }
      }
      lastFrameTimeUs = e.ts;
    }
  }

  // If no beginFrame events, fallback to requestAnimationFrame deltas if present
  if (frameTimesMs.length < 5) {
    let lastRafUs = 0;
    for (const e of events) {
      if (e.name === 'FireAnimationFrame') {
        if (lastRafUs > 0) {
          const deltaMs = (e.ts - lastRafUs) / 1000;
          if (deltaMs >= 4 && deltaMs <= 500) {
            frameTimesMs.push(deltaMs);
          }
        }
        lastRafUs = e.ts;
      }
    }
  }

  const sortedFrames = [...frameTimesMs].sort((a, b) => a - b);
  const totalFrames = sortedFrames.length;
  const p50 = totalFrames ? sortedFrames[Math.floor(totalFrames * 0.5)] : 16.6;
  const p90 = totalFrames ? sortedFrames[Math.floor(totalFrames * 0.9)] : 16.6;
  const p95 = totalFrames ? sortedFrames[Math.floor(totalFrames * 0.95)] : 16.6;
  const max = totalFrames ? sortedFrames[totalFrames - 1] : 16.6;
  const avg = totalFrames ? sortedFrames.reduce((a, b) => a + b, 0) / totalFrames : 16.6;

  const dropped16 = sortedFrames.filter(f => f > 16.7).length;
  const dropped33 = sortedFrames.filter(f => f > 33.3).length;

  return {
    totalEvents: events.length,
    longTasksCount: longTasks.length,
    longTasks: longTasks.slice(0, 5), // top 5
    breakdownMs: {
      scripting: parseFloat((scriptDurationUs / 1000).toFixed(2)),
      layout: parseFloat((layoutDurationUs / 1000).toFixed(2)),
      styleRecalc: parseFloat((styleDurationUs / 1000).toFixed(2)),
      paint: parseFloat((paintDurationUs / 1000).toFixed(2)),
      composite: parseFloat((compositeDurationUs / 1000).toFixed(2)),
    },
    frameMetrics: {
      totalFramesSampled: totalFrames,
      avgFrameTimeMs: parseFloat(avg.toFixed(2)),
      p50FrameTimeMs: parseFloat(p50.toFixed(2)),
      p90FrameTimeMs: parseFloat(p90.toFixed(2)),
      p95FrameTimeMs: parseFloat(p95.toFixed(2)),
      maxFrameTimeMs: parseFloat(max.toFixed(2)),
      framesExceeding16ms: dropped16,
      framesExceeding33ms: dropped33,
      pctBudgetCompliant: totalFrames ? parseFloat(((1 - dropped16 / totalFrames) * 100).toFixed(1)) : 100,
    },
  };
}

async function recordTrace(page, client, traceName, interactionFn) {
  console.log(`\n>>> STARTING TRACE: ${traceName} <<<`);
  let traceEvents = [];

  const dataHandler = (event) => {
    if (event.value) {
      traceEvents.push(...event.value);
    }
  };
  client.on('Tracing.dataCollected', dataHandler);

  const completePromise = new Promise(resolve => {
    client.once('Tracing.tracingComplete', () => resolve());
  });

  await client.send('Tracing.start', {
    categories: [
      'devtools.timeline',
      'disabled-by-default-devtools.timeline',
      'disabled-by-default-devtools.timeline.frame',
      'toplevel',
      'v8.execute',
      'blink.user_timing',
    ].join(','),
  });

  const t0 = performance.now();
  await interactionFn();
  const elapsed = performance.now() - t0;

  await client.send('Tracing.end');
  await completePromise;
  client.off('Tracing.dataCollected', dataHandler);

  const tracePath = path.join(ARTIFACTS_DIR, `${traceName}.json`);
  fs.writeFileSync(tracePath, JSON.stringify({ traceEvents }, null, 2));
  console.log(`Saved raw trace (${traceEvents.length} events, ${(fs.statSync(tracePath).size / 1024).toFixed(1)} KB) to ${tracePath}`);

  const analysis = analyzeTraceEvents(traceEvents);
  analysis.interactionDurationMs = parseFloat(elapsed.toFixed(2));
  console.log(`Analysis for ${traceName}:`, JSON.stringify(analysis, null, 2));

  return analysis;
}

(async () => {
  console.log('===============================================================');
  console.log('   CHROME DEVTOOLS PROTOCOL (CDP) REAL PERFORMANCE PROFILING   ');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-gpu-benchmarking', '--enable-threaded-compositing'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const client = await page.context().newCDPSession(page);

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const traceSummary = {
    timestamp: new Date().toISOString(),
    environment: 'Production Build (next start :3000) under Chromium CDP',
    traces: {},
  };

  // -------------------------------------------------------------
  // TRACE A: Initial entrance and morph
  // -------------------------------------------------------------
  // Position just before Works Wheel (e.g. scrollY = 8500 in Beat 05)
  await page.evaluate(() => window.scrollTo(0, 8500));
  await page.waitForTimeout(600);
  await page.mouse.move(720, 450);

  traceSummary.traces.Trace_A_Entrance_Morph = await recordTrace(
    page,
    client,
    'trace_A_entrance_morph',
    async () => {
      // Scroll naturally into the Works Wheel section
      for (let i = 0; i < 4; i++) {
        await page.mouse.wheel(0, 200);
        await page.waitForTimeout(40);
      }
      await page.waitForTimeout(400); // pause at resting oval

      // Small & medium wheel inputs transforming oval to drum
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 120);
        await page.waitForTimeout(40);
      }
      await page.waitForTimeout(600);
    }
  );

  // -------------------------------------------------------------
  // TRACE B: Project transitions (TMR -> Saraswati -> MNESA -> NeuroMove)
  // -------------------------------------------------------------
  traceSummary.traces.Trace_B_Project_Transitions = await recordTrace(
    page,
    client,
    'trace_B_project_transitions',
    async () => {
      // Advance through each of the 4 projects with deliberate wheel inputs and pauses
      for (let p = 1; p <= 4; p++) {
        for (let s = 0; s < 7; s++) {
          await page.mouse.wheel(0, 140);
          await page.waitForTimeout(35);
        }
        await page.waitForTimeout(400); // pause briefly at settled project state
      }
    }
  );

  // -------------------------------------------------------------
  // TRACE C: Reverse scrolling (NeuroMove -> MNESA -> Saraswati -> TMR -> Oval -> Narrative)
  // -------------------------------------------------------------
  traceSummary.traces.Trace_C_Reverse_Scrolling = await recordTrace(
    page,
    client,
    'trace_C_reverse_scrolling',
    async () => {
      // Reverse through all projects
      for (let p = 4; p >= 1; p--) {
        for (let s = 0; s < 7; s++) {
          await page.mouse.wheel(0, -140);
          await page.waitForTimeout(35);
        }
        await page.waitForTimeout(250);
      }
      // Reverse through morph back into resting oval
      for (let m = 0; m < 8; m++) {
        await page.mouse.wheel(0, -120);
        await page.waitForTimeout(35);
      }
      await page.waitForTimeout(400);
      // Reverse out into narrative
      for (let n = 0; n < 8; n++) {
        await page.mouse.wheel(0, -200);
        await page.waitForTimeout(35);
      }
      await page.waitForTimeout(400);
    }
  );

  // -------------------------------------------------------------
  // TRACE D: Pointer interaction on settled project
  // -------------------------------------------------------------
  // Scroll to TMR project state and settle
  await page.evaluate(() => window.scrollTo(0, 10500));
  await page.waitForTimeout(800);

  traceSummary.traces.Trace_D_Pointer_Interaction = await recordTrace(
    page,
    client,
    'trace_D_pointer_interaction',
    async () => {
      // Move cursor slowly across canvas
      for (let x = 200; x <= 1200; x += 40) {
        await page.mouse.move(x, 400 + Math.sin(x / 50) * 100);
        await page.waitForTimeout(20);
      }
      // Move cursor quickly across canvas
      for (let x = 1200; x >= 200; x -= 100) {
        await page.mouse.move(x, 450);
        await page.waitForTimeout(15);
      }
      // Idle response (stop cursor)
      await page.waitForTimeout(800);
    }
  );

  // -------------------------------------------------------------
  // TRACE E: Complete journey (Hero -> Section 02 -> Narrative -> Works Wheel -> Reverse to Hero)
  // -------------------------------------------------------------
  // Scroll back to Hero top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);

  traceSummary.traces.Trace_E_Complete_Journey = await recordTrace(
    page,
    client,
    'trace_E_complete_journey',
    async () => {
      // Forward scroll across entire page (Hero -> Section 02 -> Narrative -> Wheel)
      const forwardSteps = 25;
      for (let f = 1; f <= forwardSteps; f++) {
        await page.mouse.wheel(0, 450);
        await page.waitForTimeout(35);
      }
      await page.waitForTimeout(500);

      // Reverse scroll all the way back to top
      const reverseSteps = 25;
      for (let r = 1; r <= reverseSteps; r++) {
        await page.mouse.wheel(0, -450);
        await page.waitForTimeout(35);
      }
      await page.waitForTimeout(600);
    }
  );

  const summaryPath = path.join(ARTIFACTS_DIR, 'real_devtools_traces_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(traceSummary, null, 2));
  console.log(`\nAll 5 traces successfully captured and analyzed! Summary written to: ${summaryPath}`);

  await browser.close();
})();
