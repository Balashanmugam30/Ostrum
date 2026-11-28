import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = process.env.OUT_DIR || 'scratch/mobile_hero_3d_regression';
const CYCLES = Number(process.env.CYCLES || 5);
const MODES = process.env.MODES
  ? new Set(
      process.env.MODES.split(',')
        .map((m) => m.trim())
        .filter(Boolean)
    )
  : null;
const shouldRunMode = (mode) => !MODES || MODES.has(mode);

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePngRgba(buffer) {
  const sig = buffer.subarray(0, 8).toString('hex');
  if (sig !== '89504e470d0a1a0a') throw new Error('Invalid PNG signature');

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`Unsupported PNG format: depth=${bitDepth}, color=${colorType}`);
  }

  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp;
  const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
  const raw = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const filterType = inflated[y * (stride + 1)];
    const rowStart = y * (stride + 1) + 1;
    const outStart = y * stride;

    for (let i = 0; i < stride; i++) {
      const x = inflated[rowStart + i];
      const a = i >= bpp ? raw[outStart + i - bpp] : 0;
      const b = y > 0 ? raw[outStart - stride + i] : 0;
      const c = y > 0 && i >= bpp ? raw[outStart - stride + i - bpp] : 0;

      let val = x;
      if (filterType === 1) val = (x + a) & 0xff;
      else if (filterType === 2) val = (x + b) & 0xff;
      else if (filterType === 3) val = (x + Math.floor((a + b) / 2)) & 0xff;
      else if (filterType === 4) val = (x + paethPredictor(a, b, c)) & 0xff;
      raw[outStart + i] = val;
    }
  }

  return { width, height, bpp, data: raw };
}

function injectWebGLTracker() {
  return (maxCap) => {
    const active = [];
    window.__webglLog = [];
    window.__webglEvictions = [];
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type) {
      const ctx = origGetContext.apply(this, arguments);
      if (ctx && (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl')) {
        const existing = window.__webglLog.find((c) => c.canvas === this);
        if (!existing) {
          const entry = {
            id: window.__webglLog.length,
            canvas: this,
            type,
            owner: this.className || this.parentElement?.className || 'offscreen',
          };
          window.__webglLog.push(entry);
          active.push(entry);
          while (active.length > maxCap) {
            const oldest = active.shift();
            if (oldest) {
              const ext = ctx.getExtension('WEBGL_lose_context');
              window.__webglEvictions.push(oldest.owner);
              if (oldest !== entry) {
                const oldGl = oldest.canvas.getContext('webgl2') || oldest.canvas.getContext('webgl');
                oldGl?.getExtension?.('WEBGL_lose_context')?.loseContext?.();
              } else if (ext) {
                ext.loseContext();
              }
            }
          }
        }
      }
      return ctx;
    };
  };
}

async function analyzeHeroPixels(page, savePath) {
  const pngBuffer = await page.screenshot(savePath ? { path: savePath } : undefined);
  const { width, height, bpp, data } = decodePngRgba(pngBuffer);

  const box = await page.evaluate(() => {
    const o = document.querySelector('#hero-ostrum-o');
    if (!o) return null;
    const r = o.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  });
  if (!box) throw new Error('#hero-ostrum-o not found');

  const vp = page.viewportSize();
  const scaleX = width / vp.width;
  const scaleY = height / vp.height;

  const x0 = Math.max(0, Math.floor((box.left + box.width * 0.25) * scaleX));
  const x1 = Math.min(width - 1, Math.ceil((box.left + box.width * 0.75) * scaleX));
  const y0 = Math.max(0, Math.floor((box.top + box.height * 0.30) * scaleY));
  const y1 = Math.min(height - 1, Math.ceil((box.top + box.height * 0.70) * scaleY));

  let brightSculpturePixels = 0;
  let totalSampled = 0;

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const idx = (y * width + x) * bpp;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      totalSampled++;
      if (r >= 135 && g >= 100 && b >= 95) {
        brightSculpturePixels++;
      }
    }
  }

  // Sample hero backdrop at (50%, 15%) and (85%, 25%) to ensure rich crimson/dark backdrop (never blank white)
  const bgPoints = [
    [Math.round(width * 0.5), Math.round(height * 0.14)],
    [Math.round(width * 0.85), Math.round(height * 0.25)],
  ].map(([px, py]) => {
    const i = (py * width + px) * bpp;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
  });
  const isCrimsonOrDarkBackdrop = bgPoints.every((p) => !(p.r > 235 && p.g > 235 && p.b > 235) && (p.r > p.b + 10 || p.r < 60));

  return {
    box,
    totalSampled,
    brightSculpturePixels,
    ratio: Number((brightSculpturePixels / Math.max(1, totalSampled)).toFixed(4)),
    bgPoints,
    isCrimsonOrDarkBackdrop,
  };
}

async function touchSwipe(cdp, x, startY, endY, steps = 5, stepDelayMs = 4) {
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y: startY, id: 1 }],
  });
  for (let i = 1; i <= steps; i++) {
    const y = startY + ((endY - startY) * i) / steps;
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: Math.round(y), id: 1 }],
    });
    await new Promise((r) => setTimeout(r, stepDelayMs));
  }
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
}

async function touchScrollToBottom(page, cdp, vpWidth, vpHeight) {
  const touchX = Math.round(vpWidth * 0.5);
  const startY = Math.round(vpHeight * 0.85);
  const endY = Math.round(vpHeight * 0.10);

  for (let i = 0; i < 65; i++) {
    await touchSwipe(cdp, touchX, startY, endY, 5, 4);
    await page.waitForTimeout(15);
    const pos = await page.evaluate(() => ({
      y: window.scrollY,
      max: document.documentElement.scrollHeight - window.innerHeight,
    }));
    if (pos.y >= pos.max - 20) break;
  }
  await page.waitForTimeout(450);
}

async function touchScrollToTop(page, cdp, vpWidth, vpHeight) {
  const touchX = Math.round(vpWidth * 0.5);
  const startY = Math.round(vpHeight * 0.15);
  const endY = Math.round(vpHeight * 0.90);

  for (let i = 0; i < 65; i++) {
    await touchSwipe(cdp, touchX, startY, endY, 5, 4);
    await page.waitForTimeout(15);
    const y = await page.evaluate(() => window.scrollY);
    if (y === 0) break;
  }
  await page.waitForTimeout(600);
}

async function getTelemetry(page) {
  return page.evaluate(() => {
    const wrapper = document.querySelector('.ostrum-continuous-journey');
    const canvas = wrapper?.querySelector('canvas');
    const gl = canvas ? (canvas.getContext('webgl2') || canvas.getContext('webgl')) : null;
    const stEnergy = window.ScrollTrigger?.getById('energy-narrative-pin');
    const bgEl = document.querySelector('.background-webgl');
    const capPin = document.querySelector('[data-testid="capabilities-pin-container"]');
    const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
    const stage = document.querySelector('[data-testid="theatre-stage-panel"]');
    const emailTile = document.querySelector('[data-testid="footer-tile-email"]');
    const projectTile = document.querySelector('[data-testid="footer-tile-project"]');
    const footerWordmark = document.querySelector('[data-testid="footer-wordmark-container"]');
    return {
      scrollY: window.scrollY,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
      exitBoundary: stEnergy ? stEnergy.end + 100 : null,
      phase: window.__ostrumPhase,
      modelLoaded: wrapper?.dataset.modelLoaded === 'true',
      modelReadyFlag: Boolean(window.__ostrumModelReady),
      modelVisible: Boolean(window.__ostrumModelRoot?.visible),
      rotationY: window.__ostrumModelRoot?.rotation?.y ?? null,
      wrapperOpacityStyle: wrapper?.style.opacity ?? null,
      wrapperOpacityComputed: wrapper ? getComputedStyle(wrapper).opacity : null,
      canvasConnected: Boolean(canvas && canvas.isConnected && wrapper?.contains(canvas)),
      loopActive: wrapper?.dataset.loopActive === 'true',
      contextLost: Boolean((wrapper?.dataset.contextLost === 'true') || gl?.isContextLost?.()),
      mobileBackground: bgEl?.getAttribute('data-mobile-background'),
      hasBgCanvas: Boolean(bgEl?.querySelector('canvas')),
      capPinPosition: capPin ? getComputedStyle(capPin).position : null,
      capPinOpacity: capPin ? getComputedStyle(capPin).opacity : null,
      webglCreatedCount: window.__webglLog?.length ?? 0,
      webglEvictions: window.__webglEvictions ?? [],
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      footer: stage
        ? {
            curtainVis: curtain ? getComputedStyle(curtain).visibility : null,
            curtainBottom: curtain ? Math.round(curtain.getBoundingClientRect().bottom) : null,
            stageTop: Math.round(stage.getBoundingClientRect().top),
            stageBottom: Math.round(stage.getBoundingClientRect().bottom),
            stageHeight: Math.round(stage.getBoundingClientRect().height),
            emailTileTop: emailTile ? Math.round(emailTile.getBoundingClientRect().top) : null,
            projectTileTop: projectTile ? Math.round(projectTile.getBoundingClientRect().top) : null,
            wordmarkBottom: footerWordmark ? Math.round(footerWordmark.getBoundingClientRect().bottom) : null,
          }
        : null,
    };
  });
}

async function runPhoneTouchCycles(browser, config) {
  const { label, vp, isMobile, desktopSiteApprox = false, waitInitMs = 1500, userAgent } = config;
  console.log(`\n=== Testing ${label} (${vp.width}x${vp.height}, ${CYCLES} Touch Cycles${desktopSiteApprox ? ', desktop-site approx' : ''}) ===`);

  const context = await browser.newContext({
    viewport: vp,
    isMobile,
    hasTouch: true,
    deviceScaleFactor: desktopSiteApprox ? 2.75 : 1,
    ...(userAgent ? { userAgent } : {}),
  });
  await context.addInitScript(injectWebGLTracker(), 8);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  const pageErrors = [];
  const consoleErrors = [];
  const webglWarnings = [];
  const failedRequests = [];
  const bgRequests = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error') consoleErrors.push(t);
    if (t.includes('Too many active WebGL contexts') || t.includes('context was lost')) {
      webglWarnings.push(t);
    }
  });
  page.on('requestfailed', (req) => failedRequests.push(`${req.url()} (${req.failure()?.errorText})`));
  page.on('response', (res) => {
    if (res.url().includes('/images/bg')) {
      bgRequests.push({ url: res.url(), status: res.status() });
    }
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ostrumPhase === 'complete', { timeout: 15000 });
  await page.waitForTimeout(waitInitMs);

  const initTel = await getTelemetry(page);
  const initPixels = await analyzeHeroPixels(page, path.join(OUT_DIR, `${label}_init.png`));
  console.log(`[${label}] Initial:`, { ...initTel, pixels: initPixels.brightSculpturePixels, bg: initPixels.bgPoints });
  assert.equal(initTel.phase, 'complete');
  assert.equal(initTel.modelLoaded, true);
  assert.equal(initTel.modelVisible, true);
  assert.equal(initTel.wrapperOpacityComputed, '1');
  assert.equal(initTel.canvasConnected, true);
  assert.equal(initTel.loopActive, true);
  assert.equal(initTel.contextLost, false);
  assert.equal(initTel.mobileBackground, 'true', `${label}: phone tier must enable safe crimson image backdrop`);
  assert.equal(initTel.hasBgCanvas, false, `${label}: heavy desktop WebGL background canvas must be off on handhelds`);
  assert.ok(initTel.webglCreatedCount <= 2, `${label}: expected <= 2 WebGL contexts at init, got ${initTel.webglCreatedCount}`);
  assert.equal(initTel.webglEvictions.length, 0, `${label}: zero WebGL evictions allowed`);
  assert.ok(initPixels.isCrimsonOrDarkBackdrop, `${label}: backdrop turned white or missing`);
  assert.ok(initPixels.brightSculpturePixels > 40, `Expected sculpture pixels at init, got ${initPixels.brightSculpturePixels}`);

  const cycleRecords = [];
  for (let cycle = 1; cycle <= CYCLES; cycle++) {
    await touchScrollToBottom(page, cdp, vp.width, vp.height);

    if (cycle === 3) {
      await page.setViewportSize({ width: vp.width, height: vp.height - 84 });
      await page.waitForTimeout(250);
      await touchScrollToBottom(page, cdp, vp.width, vp.height - 84);
    }

    const curVpH = page.viewportSize().height;
    const footerShot = cycle === 1 ? path.join(OUT_DIR, `${label}_footer_cycle_1.png`) : undefined;
    if (footerShot) await page.screenshot({ path: footerShot });
    const footerTel = await getTelemetry(page);
    assert.ok(footerTel.scrollY > (footerTel.exitBoundary ?? 7000), `Cycle ${cycle}: did not scroll past exit (${footerTel.scrollY})`);
    assert.equal(footerTel.loopActive, false, `Cycle ${cycle}: loop must pause below story`);
    assert.equal(footerTel.wrapperOpacityComputed, '0', `Cycle ${cycle}: wrapper must be opacity 0 below story`);
    assert.equal(footerTel.horizontalOverflow, false, `Cycle ${cycle}: horizontal overflow at bottom`);

    // Verify footer is completely uncovered and wordmark reaches bottom without a void on tall viewports
    if (desktopSiteApprox && footerTel.footer.stageHeight <= curVpH + 4) {
      assert.ok(
        footerTel.footer.curtainVis === 'hidden' || footerTel.footer.curtainBottom <= 5,
        `Cycle ${cycle}: CTA curtain still covering footer (bottom=${footerTel.footer.curtainBottom})`,
      );
      assert.ok(footerTel.footer.emailTileTop >= 0, `Cycle ${cycle}: email tile clipped above viewport (${footerTel.footer.emailTileTop})`);
      assert.ok(footerTel.footer.projectTileTop >= 0, `Cycle ${cycle}: project tile clipped above viewport (${footerTel.footer.projectTileTop})`);
      assert.ok(
        Math.abs(footerTel.footer.wordmarkBottom - curVpH) <= 6,
        `Cycle ${cycle}: wordmarkBottom (${footerTel.footer.wordmarkBottom}) did not reach viewport bottom (${curVpH})`,
      );
    }

    if (cycle === 3) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(250);
    }

    await touchScrollToTop(page, cdp, vp.width, vp.height);

    const shotPath =
      cycle === 1 || cycle === CYCLES
        ? path.join(OUT_DIR, `${label}_cycle_${cycle}.png`)
        : undefined;
    const heroTel = await getTelemetry(page);
    const heroPixels = await analyzeHeroPixels(page, shotPath);

    console.log(`[${label}] Cycle ${cycle} return:`, {
      scrollY: heroTel.scrollY,
      wrapperOpacity: heroTel.wrapperOpacityComputed,
      loopActive: heroTel.loopActive,
      contextLost: heroTel.contextLost,
      webglCreated: heroTel.webglCreatedCount,
      evictions: heroTel.webglEvictions.length,
      pixelsInsideO: heroPixels.brightSculpturePixels,
      capPinPos: heroTel.capPinPosition,
      backdropOk: heroPixels.isCrimsonOrDarkBackdrop,
      footerWordmarkBottom: footerTel.footer?.wordmarkBottom,
    });

    assert.ok(heroTel.scrollY <= 30, `Cycle ${cycle}: expected return to hero top, got scrollY=${heroTel.scrollY}`);
    assert.equal(heroTel.wrapperOpacityComputed, '1', `Cycle ${cycle}: wrapper opacity`);
    assert.equal(heroTel.canvasConnected, true, `Cycle ${cycle}: canvas connected`);
    assert.equal(heroTel.modelLoaded, true, `Cycle ${cycle}: model loaded`);
    assert.equal(heroTel.modelVisible, true, `Cycle ${cycle}: model visible`);
    assert.equal(heroTel.rotationY, 0, `Cycle ${cycle}: rotationY reset to 0`);
    assert.equal(heroTel.loopActive, true, `Cycle ${cycle}: active loop restarted`);
    assert.equal(heroTel.contextLost, false, `Cycle ${cycle}: context not lost`);
    assert.notEqual(heroTel.capPinPosition, 'fixed', `Cycle ${cycle}: capabilities white fixed overlay remained stuck`);
    assert.ok(heroTel.webglCreatedCount <= 2, `Cycle ${cycle}: excess WebGL contexts created (${heroTel.webglCreatedCount})`);
    assert.equal(heroTel.webglEvictions.length, 0, `Cycle ${cycle}: WebGL evictions occurred`);
    assert.ok(heroPixels.isCrimsonOrDarkBackdrop, `Cycle ${cycle}: background turned white or disappeared`);
    assert.ok(
      heroPixels.brightSculpturePixels >= initPixels.brightSculpturePixels * 0.70,
      `Cycle ${cycle}: rendered sculpture pixels (${heroPixels.brightSculpturePixels}) below threshold vs initial (${initPixels.brightSculpturePixels})`,
    );

    cycleRecords.push({ cycle, footerTel, heroTel, heroPixels });
  }

  assert.equal(webglWarnings.length, 0, `WebGL eviction warnings: ${webglWarnings.join('; ')}`);
  assert.equal(pageErrors.length, 0, `Page errors: ${pageErrors.join('; ')}`);
  assert.equal(consoleErrors.length, 0, `Console errors: ${consoleErrors.join('; ')}`);
  assert.equal(failedRequests.length, 0, `Failed requests: ${failedRequests.join('; ')}`);
  assert.ok(bgRequests.some((r) => r.status === 200), 'Background image request should return HTTP 200');

  await context.close();
  return { label, viewport: `${vp.width}x${vp.height}`, desktopSiteApprox, initTel, initPixels, cycles: cycleRecords };
}

async function testDesktopRegression(browser) {
  console.log('\n=== Testing Laptop Desktop 1440x900 Regression ===');
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    isMobile: false,
    hasTouch: false,
  });
  await context.addInitScript(injectWebGLTracker(), 8);
  const page = await context.newPage();

  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ostrumPhase === 'complete', { timeout: 14000 });
  await page.waitForTimeout(500);

  const initHeroOTop = await page.evaluate(() => {
    const o = document.querySelector('#hero-ostrum-o');
    return o ? o.getBoundingClientRect().top : null;
  });
  assert.notEqual(initHeroOTop, null);

  const initTel = await getTelemetry(page);
  const initPixels = await analyzeHeroPixels(page, path.join(OUT_DIR, 'desktop_1440x900_hero.png'));
  console.log('Desktop Init:', { ...initTel, pixels: initPixels.brightSculpturePixels });
  assert.equal(initTel.loopActive, true);
  assert.equal(initTel.modelVisible, true);
  assert.equal(initTel.hasBgCanvas, true, 'Laptop should use desktop WebGL background caustics');
  assert.ok(initTel.webglCreatedCount <= 5, `Laptop shared WebGL contexts expected <= 5 (got ${initTel.webglCreatedCount})`);
  assert.equal(initTel.webglEvictions.length, 0, 'Laptop should stay under 8-context cap with shared renderer');
  assert.ok(initPixels.brightSculpturePixels > 100);

  // Scroll to Capabilities to visually verify shared Card3DAccent canvas rendering
  await page.evaluate(() => {
    const st = window.ScrollTrigger?.getById('capabilities-pin');
    const target = st ? st.start + 400 : 12000;
    if (window.lenis) window.lenis.scrollTo(target, { immediate: true });
    else window.scrollTo(0, target);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop_1440x900_capabilities.png') });

  // Scroll to bottom
  await page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (window.lenis) window.lenis.scrollTo(max, { immediate: true });
    else window.scrollTo(0, max);
  });
  await page.waitForTimeout(600);
  const bottomTel = await getTelemetry(page);
  console.log('Desktop Bottom:', bottomTel);
  assert.equal(bottomTel.loopActive, false);
  assert.equal(bottomTel.wrapperOpacityComputed, '0');
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop_1440x900_footer.png') });

  // Return to hero
  await page.evaluate(() => {
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  });
  await page.waitForFunction(
    (expectedTop) => {
      const o = document.querySelector('#hero-ostrum-o');
      if (!o || window.scrollY > 2) return false;
      return Math.abs(o.getBoundingClientRect().top - expectedTop) < 5;
    },
    initHeroOTop,
    { timeout: 15000 },
  );
  await page.waitForTimeout(300);
  const returnTel = await getTelemetry(page);
  const returnPixels = await analyzeHeroPixels(page, path.join(OUT_DIR, 'desktop_1440x900_return.png'));
  console.log('Desktop Return:', { ...returnTel, pixels: returnPixels.brightSculpturePixels });
  assert.equal(returnTel.loopActive, true);
  assert.equal(returnTel.wrapperOpacityComputed, '1');
  assert.equal(returnTel.modelVisible, true);
  assert.equal(returnTel.rotationY, 0);
  assert.ok(returnPixels.brightSculpturePixels >= initPixels.brightSculpturePixels * 0.70);

  const triggers = await page.evaluate(() => ({
    section02: Boolean(window.ScrollTrigger?.getById('section02-hold')),
    energyPin: Boolean(window.ScrollTrigger?.getById('energy-narrative-pin')),
    worksWheel: Boolean(window.ScrollTrigger?.getById('works-wheel-pin')),
    capabilities: Boolean(window.ScrollTrigger?.getById('capabilities-pin')),
    curtainCta: Boolean(window.ScrollTrigger?.getById('theatre-curtain-reveal-cta')),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
  }));
  console.log('Desktop Triggers & Overflow:', triggers);
  assert.ok(triggers.section02 && triggers.energyPin && triggers.worksWheel && triggers.capabilities && triggers.curtainCta);
  assert.equal(triggers.horizontalOverflow, false);
  assert.equal(pageErrors.length, 0, `Desktop pageErrors: ${pageErrors}`);
  assert.equal(consoleErrors.length, 0, `Desktop consoleErrors: ${consoleErrors}`);

  await context.close();
  return { initTel, bottomTel, returnTel, triggers };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const chromeDesktopUa =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

  try {
    const mobile390 = shouldRunMode('mobile390')
      ? await runPhoneTouchCycles(browser, {
          label: 'hero_390x844',
          vp: { width: 390, height: 844 },
          isMobile: true,
        })
      : null;
    const mobile360 = shouldRunMode('mobile360')
      ? await runPhoneTouchCycles(browser, {
          label: 'hero_360x800',
          vp: { width: 360, height: 800 },
          isMobile: true,
        })
      : null;
    const desktopSite980 = shouldRunMode('desktopSite980')
      ? await runPhoneTouchCycles(browser, {
          label: 'desktop_site_980x1742',
          vp: { width: 980, height: 1742 },
          isMobile: false,
          desktopSiteApprox: true,
          waitInitMs: 800,
          userAgent: chromeDesktopUa,
        })
      : null;
    const desktopSite1950 = shouldRunMode('desktopSite1950')
      ? await runPhoneTouchCycles(browser, {
          label: 'desktop_site_980x1950',
          vp: { width: 980, height: 1950 },
          isMobile: false,
          desktopSiteApprox: true,
          waitInitMs: 800,
          userAgent: chromeDesktopUa,
        })
      : null;
    const desktop = shouldRunMode('desktop') ? await testDesktopRegression(browser) : null;

    const summary = {
      baseUrl: BASE_URL,
      verifiedAt: new Date().toISOString(),
      modes: MODES ? Array.from(MODES) : ['mobile390', 'mobile360', 'desktopSite980', 'desktopSite1950', 'desktop'],
      mobile390,
      mobile360,
      desktopSite980,
      desktopSite1950,
      desktop,
    };
    const resultsFile = MODES ? `results_${Array.from(MODES).join('_')}.json` : 'results.json';
    fs.writeFileSync(path.join(OUT_DIR, resultsFile), JSON.stringify(summary, null, 2));
    console.log(`\nALL MOBILE, DESKTOP-SITE APPROX, AND LAPTOP REGRESSION CHECKS PASSED. Evidence saved to ${OUT_DIR}/${resultsFile}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('REGRESSION FAILED:', err);
  process.exit(1);
});
