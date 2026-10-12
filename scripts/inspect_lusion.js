const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

(async () => {
  console.log('Inspecting https://lusion.co/ ...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto('https://lusion.co/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Waiting for preloader to complete...');
    // Wait until preloader finishes (look for canvas or wait 10 seconds)
    await page.waitForTimeout(10000);

    const lusionInfo = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas')).map((c, i) => {
        const gl = c.getContext('webgl2') || c.getContext('webgl');
        return {
          index: i,
          width: c.width,
          height: c.height,
          style: c.getAttribute('style'),
          className: c.className,
          isWebGL: !!gl,
          renderer: gl ? gl.getParameter(gl.RENDERER) : '2d',
        };
      });

      return {
        title: document.title,
        canvases,
        threeJsPresent: !!window.__THREE__ || !!window.THREE,
      };
    });

    console.log('Lusion Info:', JSON.stringify(lusionInfo, null, 2));

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'lusion-reference-page.png') });
    console.log('Saved screenshot lusion-reference-page.png');

    // Test moving pointer across center
    await page.mouse.move(720, 450);
    await page.waitForTimeout(500);
    await page.mouse.move(850, 400, { steps: 20 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'lusion-reference-pointer-move.png') });

  } catch (err) {
    console.error('Error inspecting lusion.co:', err.message);
  } finally {
    if (browser) await browser.close();
  }
})();
