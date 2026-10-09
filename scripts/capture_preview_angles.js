const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureAngles() {
  const outDir = path.join(__dirname, '..', '.test-results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:3000/preview/ostrum-core ...');
  await page.goto('http://localhost:3000/preview/ostrum-core', { waitUntil: 'networkidle' });

  // Wait for 3D model to be fully rendered
  await page.waitForTimeout(2000);

  // Capture full stage
  await page.screenshot({ path: path.join(outDir, 'preview-stage-full.png') });
  console.log('Saved preview-stage-full.png');

  const angles = [
    { deg: 0, file: 'preview-front-0deg.png', button: 'Front (0°)' },
    { deg: 90, file: 'preview-profile-90deg.png', button: 'Profile (90°)' },
    { deg: 180, file: 'preview-back-180deg.png', button: 'Back (180°)' },
    { deg: 270, file: 'preview-profile-270deg.png', button: 'Profile (270°)' },
    { deg: 360, file: 'preview-loop-360deg.png', button: 'Full Loop (360°)' },
  ];

  for (const a of angles) {
    console.log(`Setting angle: ${a.deg}° ...`);
    await page.click(`button:has-text("${a.button}")`);
    await page.waitForTimeout(800); // Wait for smooth damping interpolation

    // Take screenshot of the 3D canvas container
    const stage = page.locator('[data-testid="ostrum-core-3d-container"]');
    await stage.screenshot({ path: path.join(outDir, a.file) });
    console.log(`Saved ${a.file}`);
  }

  await browser.close();
  console.log('Angle capture complete!');
}

captureAngles().catch(console.error);
