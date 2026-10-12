const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

function checkCardOverlap(cards) {
  const visibleCards = cards.filter(c => c.opacity > 0.1 && c.display !== 'none' && c.visibility !== 'hidden');
  const overlaps = [];

  for (let i = 0; i < visibleCards.length; i++) {
    for (let j = i + 1; j < visibleCards.length; j++) {
      const a = visibleCards[i].rect;
      const b = visibleCards[j].rect;

      const interW = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const interH = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const interArea = interW * interH;

      const minArea = Math.min(a.width * a.height, b.width * b.height);
      const overlapRatio = minArea > 0 ? (interArea / minArea) : 0;

      if (overlapRatio > 0.15) { // more than 15% overlap
        overlaps.push({
          cardA: visibleCards[i].index,
          cardB: visibleCards[j].index,
          titleA: visibleCards[i].title,
          titleB: visibleCards[j].title,
          overlapRatio: (overlapRatio * 100).toFixed(1) + '%',
          interArea: Math.round(interArea),
          rectA: { left: Math.round(a.left), top: Math.round(a.top), w: Math.round(a.width), h: Math.round(a.height) },
          rectB: { left: Math.round(b.left), top: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) },
        });
      }
    }
  }
  return overlaps;
}

async function runReproduction() {
  console.log('=== STARTING REPRODUCTION SCRIPT FOR WORKS WHEEL DEFECTS ===\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error(`[Console Error]: ${msg.text()}`);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Get ScrollTrigger bounds for works wheel
  const stInfo = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
    return st ? { start: st.start, end: st.end, distance: st.end - st.start } : null;
  });
  console.log('ScrollTrigger works-wheel-pin:', stInfo);

  if (!stInfo) {
    console.error('ERROR: works-wheel-pin not found!');
    await browser.close();
    return;
  }

  const { start, end, distance } = stInfo;

  async function inspectState(label, filename) {
    console.log(`\n--- Inspecting: ${label} ---`);
    await page.waitForTimeout(300);

    const state = await page.evaluate(() => {
      const stage = document.querySelector('[role="listbox"]');
      const wheel = stage ? stage.querySelector('div[class*="preserve-3d"]') : null;
      const cardNodes = stage ? Array.from(stage.querySelectorAll('[role="option"]')) : [];
      const labelEl = document.querySelector('.pointer-events-none span');
      const leftPanel = document.querySelector('.pointer-events-none h3')?.parentElement;
      const titleEl = document.querySelector('.pointer-events-none h3');
      const descEl = document.querySelector('.pointer-events-none p');
      const linkEl = document.querySelector('.pointer-events-none a');

      const stageRect = stage ? stage.getBoundingClientRect() : null;
      const api = stage ? stage._worksWheel : null;

      const cards = cardNodes.map((c, i) => {
        const r = c.getBoundingClientRect();
        const style = window.getComputedStyle(c);
        const title = c.querySelector('img')?.getAttribute('alt') || `Card ${i}`;
        return {
          index: i,
          title,
          rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
          opacity: parseFloat(style.opacity || '1'),
          zIndex: style.zIndex,
          transform: style.transform,
          display: style.display,
          visibility: style.visibility,
        };
      });

      return {
        scrollY: window.scrollY,
        turn: api ? api.getTurn() : null,
        stageRect: stageRect ? { w: stageRect.width, h: stageRect.height } : null,
        cards,
        activeTitle: titleEl ? titleEl.textContent : '',
        activeDesc: descEl ? descEl.textContent : '',
        activeHref: linkEl ? linkEl.getAttribute('href') : '',
        leftPanelOpacity: leftPanel ? window.getComputedStyle(leftPanel).opacity : '0',
      };
    });

    const overlaps = checkCardOverlap(state.cards);
    console.log(`scrollY: ${state.scrollY}, turn: ${state.turn}`);
    console.log(`Active title: "${state.activeTitle}", left panel opacity: ${state.leftPanelOpacity}`);
    console.log(`Visible cards count: ${state.cards.filter(c => c.opacity > 0.1).length}`);
    if (overlaps.length > 0) {
      console.warn(`[DEFECT DETECTED] Overlapping cards count: ${overlaps.length}`);
      overlaps.forEach(o => {
        console.warn(`  Overlap between #${o.cardA} (${o.titleA}) and #${o.cardB} (${o.titleB}): ratio ${o.overlapRatio}`);
      });
    } else {
      console.log('No severe card overlaps (>15%) detected.');
    }

    const screenshotPath = path.join(ARTIFACTS_DIR, filename);
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot: ${filename}`);

    return { label, ...state, overlaps };
  }

  const results = [];

  // 1. Initial oval wheel (at rest)
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 50);
  results.push(await inspectState('1. Initial oval wheel at rest', 'repro-01-initial-oval.png'));

  // 2. Small amount of wheel movement
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 250);
  results.push(await inspectState('2. Small wheel movement', 'repro-02-small-movement.png'));

  // 3. Midpoint of oval-to-drum expansion
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 750);
  results.push(await inspectState('3. Midpoint of oval-to-drum expansion', 'repro-03-morph-midpoint.png'));

  // 4. Point at which first project becomes active
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 1300);
  results.push(await inspectState('4. Point first project becomes active', 'repro-04-first-project-active.png'));

  // 5. Fully settled first project
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 1500);
  results.push(await inspectState('5. Fully settled first project', 'repro-05-settled-project-1.png'));

  // 6. Transition to second project
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 2000);
  results.push(await inspectState('6. Transition to second project', 'repro-06-transition-project-2.png'));

  // 7. Transition through remaining items
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 2800);
  results.push(await inspectState('7. Mid-browsing projects', 'repro-07-mid-projects.png'));

  // 8. Last item
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 4500);
  results.push(await inspectState('8. Last project item', 'repro-08-last-project.png'));

  // 9. Reverse scrolling to initial oval
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 50);
  results.push(await inspectState('9. Reverse scroll to initial oval', 'repro-09-reverse-to-oval.png'));

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'reproduction_audit.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n=== REPRODUCTION COMPLETE ===');
  await browser.close();
}

runReproduction().catch(err => {
  console.error('Fatal reproduction error:', err);
  process.exit(1);
});
