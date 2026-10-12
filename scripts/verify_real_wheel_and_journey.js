const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const parseRgb = (str) => {
  if (!str) return [0, 0, 0];
  const m = str.match(/\d+/g);
  return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
};

const isColorMatch = (c1, c2, tol = 35) => {
  const [r1, g1, b1] = parseRgb(c1);
  const [r2, g2, b2] = parseRgb(c2);
  const dist = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  return dist <= tol;
};

async function runRealWheelAndJourneyVerification() {
  console.log('===============================================================');
  console.log('   OSTRUM: REAL WHEEL INPUT & FULL JOURNEY VERIFICATION SUITE   ');
  console.log('===============================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    assertions: [],
    journeyCheckpoints: {},
    wheelInteraction: {},
    responsiveMatrix: [],
    consoleErrors: [],
    pageErrors: [],
  };

  const assert = (description, condition, details = {}) => {
    if (condition) {
      console.log(`✓ PASS: ${description}`);
      report.testsPassed++;
      report.assertions.push({ status: 'PASS', description, details });
    } else {
      console.error(`✗ FAIL: ${description}`, details);
      report.testsFailed++;
      report.assertions.push({ status: 'FAIL', description, details });
    }
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-gpu-benchmarking', '--enable-threaded-compositing'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text());
      console.error('Browser console error:', msg.text());
    }
  });

  page.on('pageerror', err => {
    report.pageErrors.push(err.message);
    console.error('Page error:', err.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Position mouse in the center
  await page.mouse.move(720, 450);

  // -------------------------------------------------------------
  // PART 1: Full Forward Cinematic Journey (Hero -> Sec02 -> Sec03 Narrative -> Works Wheel)
  // -------------------------------------------------------------
  console.log('--- PART 1: Testing Full Cinematic Journey ---');

  // Step 1.1: Hero State
  const heroData = await page.evaluate(() => {
    const wordmark = document.querySelector('.intro svg[aria-label="OSTRUM"]');
    const wordmarkRect = wordmark ? wordmark.getBoundingClientRect() : null;
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    return {
      bodyBg,
      wordmarkWidth: wordmarkRect ? Math.round(wordmarkRect.width) : 0,
      wordmarkHeight: wordmarkRect ? Math.round(wordmarkRect.height) : 0,
      scrollY: window.scrollY,
    };
  });
  assert('Hero has pure dark background (rgb(0, 0, 0))', heroData.bodyBg === 'rgb(0, 0, 0)', heroData);
  assert('Hero wordmark renders with proportional width (> 1000px)', heroData.wordmarkWidth >= 1000, heroData);
  report.journeyCheckpoints.hero = heroData;

  // Step 1.2: Scroll naturally with mouse wheel to Section 02 Docking
  console.log('\n--- Scrolling naturally with mouse wheel to Section 02 ---');
  while ((await page.evaluate(() => window.scrollY)) < 1100) {
    await page.mouse.wheel(0, 150);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(800);

  const sec02Data = await page.evaluate(() => {
    const slot = document.getElementById('section02-sculpture-slot');
    const slotRect = slot ? slot.getBoundingClientRect() : null;
    const bodyText = document.body.innerText;
    return {
      slotVisible: !!slotRect && slotRect.width > 100,
      hasBusiness: bodyText.includes('FOR BUSINESS') || bodyText.includes('Systems that make'),
      hasNext: bodyText.includes("FOR WHAT'S NEXT") || bodyText.includes('Products and ventures'),
      scrollY: window.scrollY,
    };
  });
  assert('Section 02 sculpture slot is visible and docked between columns', sec02Data.slotVisible, sec02Data);
  assert('Section 02 dual identity text columns ("FOR BUSINESS" & "FOR WHAT\'S NEXT") present', sec02Data.hasBusiness && sec02Data.hasNext, sec02Data);
  report.journeyCheckpoints.section02 = sec02Data;

  // Step 1.3: Scroll naturally through Narrative Beats to Final Signoff
  console.log('\n--- Scrolling naturally with mouse wheel through Narrative Beats ---');
  while ((await page.evaluate(() => window.scrollY)) < 8600) {
    await page.mouse.wheel(0, 250);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(800);

  const signoffData = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasReady: text.includes("Ready for what's next?"),
      hasOstrum: text.includes('OSTRUM'),
      scrollY: window.scrollY,
    };
  });
  assert('Cinematic narrative reaches final signoff "Ready for what\'s next? / OSTRUM"', signoffData.hasReady && signoffData.hasOstrum, signoffData);
  report.journeyCheckpoints.signoff = signoffData;

  // -------------------------------------------------------------
  // PART 2: Real Wheel Scrolling into Works Wheel & Centre Label Verification
  // -------------------------------------------------------------
  console.log('\n--- PART 2: Real Mouse Wheel Entrance into Works Wheel ---');
  // Scroll until Works Wheel pinned container locks (scrollY ~9100)
  while ((await page.evaluate(() => window.scrollY)) < 9150) {
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1000);

  const initialOvalState = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    const centerSpan = document.querySelector('[data-testid="works-wheel-center-label"]');
    const centerDiv = centerSpan ? centerSpan.parentElement : null;
    const wheel = document.querySelector('[role="listbox"]');
    return {
      scrollY: window.scrollY,
      secBg: sec ? window.getComputedStyle(sec).backgroundColor : '',
      labelText: centerSpan ? centerSpan.innerText.trim() : '',
      labelOpacity: centerDiv ? parseFloat(window.getComputedStyle(centerDiv).opacity || '1') : 0,
      turn: wheel && wheel._worksWheel ? wheel._worksWheel.getTurn() : null,
    };
  });
  console.log('Initial Oval State:', initialOvalState);
  assert('Initial oval centre label is "Selected Work"', initialOvalState.labelText === 'Selected Work', initialOvalState);
  assert('Initial oval has Lusion light background (#f1f1fa / rgb(241, 241, 250))', isColorMatch(initialOvalState.secBg, 'rgb(241, 241, 250)'), initialOvalState);
  assert('Initial oval centre label is fully visible at rest (opacity = 1)', initialOvalState.labelOpacity === 1, initialOvalState);
  assert('Works Wheel turn is at rest (turn = 0)', initialOvalState.turn === 0, initialOvalState);
  report.wheelInteraction.initialOval = initialOvalState;

  // -------------------------------------------------------------
  // PART 3: Progressive Morph & Stationary Pause
  // -------------------------------------------------------------
  console.log('\n--- PART 3: Progressive Morph & Intermediate Stationary Pause ---');
  // Scroll past the 350px resting hold zone so fractional morph begins
  while ((await page.evaluate(() => {
    const wheel = document.querySelector('[role="listbox"]');
    return wheel && wheel._worksWheel ? wheel._worksWheel.getTurn() : 0;
  })) === 0) {
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(300);
  const morphStarted = await page.evaluate(() => {
    const wheel = document.querySelector('[role="listbox"]');
    return wheel && wheel._worksWheel ? wheel._worksWheel.getTurn() : 0;
  });
  assert('Morph begins progressively without jumping (0 < turn < 0.45)', morphStarted > 0 && morphStarted < 0.45, { turn: morphStarted });

  // Advance to halfway through morph (~0.5 - 0.7)
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(500);
  const halfwayT1 = await page.evaluate(() => {
    const wheel = document.querySelector('[role="listbox"]');
    return wheel && wheel._worksWheel ? wheel._worksWheel.getTurn() : 0;
  });

  // Stationary pause: wait 1000ms with zero wheel input
  await page.waitForTimeout(1000);
  const halfwayT2 = await page.evaluate(() => {
    const wheel = document.querySelector('[role="listbox"]');
    return wheel && wheel._worksWheel ? wheel._worksWheel.getTurn() : 0;
  });
  assert('Morph holds intermediate position stationary during pause (no auto-snapping)', Math.abs(halfwayT1 - halfwayT2) < 0.05, { t1: halfwayT1, t2: halfwayT2 });
  report.wheelInteraction.intermediateMorph = { t1: halfwayT1, t2: halfwayT2 };

  // -------------------------------------------------------------
  // PART 4: Real Wheel Navigation Across All 4 Projects
  // -------------------------------------------------------------
  console.log('\n--- PART 4: Real Wheel Navigation Across All 4 Projects ---');

  // Advance to Project 1: TMR AI Car Care
  while ((await page.evaluate(() => {
    const w = document.querySelector('[role="listbox"]');
    return w && w._worksWheel ? w._worksWheel.getTurn() : 0;
  })) < 1.1) {
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1000);
  const p1 = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    const h3 = sec ? sec.querySelector('h3') : null;
    const a = sec ? sec.querySelector('a') : null;
    const centerDiv = document.querySelector('[data-testid="works-wheel-center-label"]')?.parentElement;
    return {
      title: h3 ? h3.innerText.trim() : '',
      bg: sec ? window.getComputedStyle(sec).backgroundColor : '',
      href: a ? a.href : '',
      labelOpacity: centerDiv ? parseFloat(window.getComputedStyle(centerDiv).opacity || '1') : 0,
    };
  });
  assert('Project 1 is TMR AI Car Care', p1.title === 'TMR AI Car Care', p1);
  assert('Project 1 has Vermilion / Copper theme (#42100F / rgb(66, 16, 15))', isColorMatch(p1.bg, 'rgb(66, 16, 15)'), p1);
  assert('Project 1 links to verified client platform (https://tmraicarcare.com/)', p1.href === 'https://tmraicarcare.com/', p1);
  assert('Central "Selected Work" label has faded away in drum mode (opacity = 0)', p1.labelOpacity === 0, p1);
  report.wheelInteraction.project1 = p1;

  // Advance to Project 2: Saraswati Driving School
  while ((await page.evaluate(() => {
    const w = document.querySelector('[role="listbox"]');
    return w && w._worksWheel ? w._worksWheel.getTurn() : 0;
  })) < 2.1) {
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1000);
  const p2 = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    const h3 = sec ? sec.querySelector('h3') : null;
    const a = sec ? sec.querySelector('a') : null;
    return {
      title: h3 ? h3.innerText.trim() : '',
      bg: sec ? window.getComputedStyle(sec).backgroundColor : '',
      href: a ? a.href : '',
    };
  });
  assert('Project 2 is Saraswati Driving School', p2.title === 'Saraswati Driving School', p2);
  assert('Project 2 has Cobalt / Electric Blue theme (#0F1A4E / rgb(15, 26, 78))', isColorMatch(p2.bg, 'rgb(15, 26, 78)'), p2);
  assert('Project 2 links to verified client platform (https://saraswati-driving-school.vercel.app/)', p2.href === 'https://saraswati-driving-school.vercel.app/', p2);
  report.wheelInteraction.project2 = p2;

  // Advance to Project 3: MNESA
  while ((await page.evaluate(() => {
    const w = document.querySelector('[role="listbox"]');
    return w && w._worksWheel ? w._worksWheel.getTurn() : 0;
  })) < 3.1) {
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1000);
  const p3 = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    const h3 = sec ? sec.querySelector('h3') : null;
    return {
      title: h3 ? h3.innerText.trim() : '',
      bg: sec ? window.getComputedStyle(sec).backgroundColor : '',
    };
  });
  assert('Project 3 is MNESA', p3.title === 'MNESA', p3);
  assert('Project 3 has Violet / Purple theme (#230E48 / rgb(35, 14, 72))', isColorMatch(p3.bg, 'rgb(35, 14, 72)'), p3);
  report.wheelInteraction.project3 = p3;

  // Advance to Project 4: NeuroMove
  while ((await page.evaluate(() => {
    const w = document.querySelector('[role="listbox"]');
    return w && w._worksWheel ? w._worksWheel.getTurn() : 0;
  })) < 3.95) {
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1000);
  const p4 = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    const h3 = sec ? sec.querySelector('h3') : null;
    return {
      title: h3 ? h3.innerText.trim() : '',
      bg: sec ? window.getComputedStyle(sec).backgroundColor : '',
    };
  });
  assert('Project 4 is NeuroMove', p4.title === 'NeuroMove', p4);
  assert('Project 4 has Jade / Emerald Green theme (#063028 / rgb(6, 48, 40))', isColorMatch(p4.bg, 'rgb(6, 48, 40)'), p4);
  report.wheelInteraction.project4 = p4;

  // -------------------------------------------------------------
  // PART 5: Real Wheel Reverse Navigation
  // -------------------------------------------------------------
  console.log('\n--- PART 5: Real Wheel Reverse Navigation ---');

  // Reverse to MNESA
  while ((await page.evaluate(() => {
    const w = document.querySelector('[role="listbox"]');
    return w && w._worksWheel ? w._worksWheel.getTurn() : 4;
  })) > 3.05) {
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1000);
  const rMnesa = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    return {
      title: sec?.querySelector('h3')?.innerText.trim(),
      bg: sec ? window.getComputedStyle(sec).backgroundColor : '',
    };
  });
  assert('Reverse wheel input cleanly restores MNESA title and theme', rMnesa.title === 'MNESA' && isColorMatch(rMnesa.bg, 'rgb(35, 14, 72)'), rMnesa);

  // Reverse to Saraswati
  while ((await page.evaluate(() => {
    const w = document.querySelector('[role="listbox"]');
    return w && w._worksWheel ? w._worksWheel.getTurn() : 3;
  })) > 2.05) {
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1000);
  const rSara = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    return {
      title: sec?.querySelector('h3')?.innerText.trim(),
      bg: sec ? window.getComputedStyle(sec).backgroundColor : '',
    };
  });
  assert('Reverse wheel input cleanly restores Saraswati Driving School', rSara.title === 'Saraswati Driving School' && isColorMatch(rSara.bg, 'rgb(15, 26, 78)'), rSara);

  // Reverse to TMR
  while ((await page.evaluate(() => {
    const w = document.querySelector('[role="listbox"]');
    return w && w._worksWheel ? w._worksWheel.getTurn() : 2;
  })) > 1.05) {
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1000);
  const rTmr = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    return {
      title: sec?.querySelector('h3')?.innerText.trim(),
      bg: sec ? window.getComputedStyle(sec).backgroundColor : '',
    };
  });
  assert('Reverse wheel input cleanly restores TMR AI Car Care', rTmr.title === 'TMR AI Car Care' && isColorMatch(rTmr.bg, 'rgb(66, 16, 15)'), rTmr);

  // Reverse back to Resting Oval
  while ((await page.evaluate(() => {
    const w = document.querySelector('[role="listbox"]');
    return w && w._worksWheel ? w._worksWheel.getTurn() : 1;
  })) > 0.05) {
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1000);
  const rOval = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    const centerSpan = document.querySelector('[data-testid="works-wheel-center-label"]');
    const centerDiv = centerSpan ? centerSpan.parentElement : null;
    return {
      bg: sec ? window.getComputedStyle(sec).backgroundColor : '',
      labelText: centerSpan ? centerSpan.innerText.trim() : '',
      labelOpacity: centerDiv ? parseFloat(window.getComputedStyle(centerDiv).opacity || '1') : 0,
    };
  });
  assert('Reverse wheel input restores resting oval and "Selected Work" label (opacity = 1)', rOval.labelText === 'Selected Work' && rOval.labelOpacity === 1, rOval);
  assert('Reverse wheel input restores Lusion light background (#f1f1fa)', isColorMatch(rOval.bg, 'rgb(241, 241, 250)'), rOval);

  // Reverse out of Works Wheel into Narrative Beats and all the way back to Hero
  console.log('\n--- Reversing out of Works Wheel all the way back to Hero ---');
  while ((await page.evaluate(() => window.scrollY)) > 50) {
    await page.mouse.wheel(0, -350);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1000);

  const finalHero = await page.evaluate(() => {
    return {
      scrollY: window.scrollY,
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
      wordmarkPresent: !!document.querySelector('.intro svg[aria-label="OSTRUM"]'),
    };
  });
  assert('Reverse navigation releases pin smoothly and returns to Hero at scrollY = 0', finalHero.scrollY === 0, finalHero);
  assert('Hero dark background (rgb(0, 0, 0)) and OSTRUM wordmark intact', finalHero.bodyBg === 'rgb(0, 0, 0)' && finalHero.wordmarkPresent, finalHero);

  // -------------------------------------------------------------
  // PART 6: Viewport Matrix Testing (8 Viewports)
  // -------------------------------------------------------------
  console.log('\n--- PART 6: Testing Viewport Matrix (8 Viewports) ---');
  const viewports = [
    { name: 'desktop-1920x1080', width: 1920, height: 1080 },
    { name: 'desktop-1649x926', width: 1649, height: 926 },
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'laptop-1280x800', width: 1280, height: 800 },
    { name: 'tablet-1024x768', width: 1024, height: 768 },
    { name: 'tablet-portrait-768x1024', width: 768, height: 1024 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'mobile-375x812', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);

    const vpMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        overflow: doc.scrollWidth > window.innerWidth,
        wordmarkWidth: document.querySelector('.intro svg[aria-label="OSTRUM"]')?.getBoundingClientRect().width || 0,
      };
    });

    assert(`Viewport ${vp.name} (${vp.width}x${vp.height}) has zero horizontal overflow`, !vpMetrics.overflow, vpMetrics);
    report.responsiveMatrix.push({ vp: vp.name, metrics: vpMetrics });
  }

  assert('Zero console errors occurred during the entire test suite', report.consoleErrors.length === 0, { errors: report.consoleErrors });
  assert('Zero unhandled page errors occurred during the entire test suite', report.pageErrors.length === 0, { errors: report.pageErrors });

  const resultPath = path.join(ARTIFACTS_DIR, 'real_wheel_and_journey_verification_results.json');
  fs.writeFileSync(resultPath, JSON.stringify(report, null, 2));
  console.log(`\n===============================================================`);
  console.log(`VERIFICATION COMPLETE: ${report.testsPassed} PASSED, ${report.testsFailed} FAILED`);
  console.log(`Report written to: ${resultPath}`);
  console.log(`===============================================================\n`);

  await browser.close();

  if (report.testsFailed > 0) {
    process.exit(1);
  }
}

runRealWheelAndJourneyVerification().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
