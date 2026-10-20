import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images');

async function generateBrandAssets() {
  console.log('Generating authentic brand assets: ostrum-logo.png and ostrum-og.png...');

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();

  // 1. Generate ostrum-logo.png (Transparent background, white wordmark)
  const logoHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @font-face {
      font-family: 'Romie';
      src: url('file://${path.join(ROOT_DIR, 'public', 'fonts', 'Romie-Regular.woff2').replace(/\\/g, '/')}') format('woff2');
    }
    body {
      margin: 0;
      padding: 40px;
      background: transparent;
      display: inline-block;
    }
    svg {
      width: 1000px;
      height: 288px;
    }
  </style>
</head>
<body>
  <svg viewBox="0 0 1253 360" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="#FFFFFF" font-family="'Romie', Georgia, serif" font-size="268" font-weight="400" letter-spacing="-0.01em">
      <text x="0" y="266">O</text>
      <text x="226" y="266">S</text>
      <text x="394" y="266">T</text>
      <text x="594" y="266">R</text>
      <text x="794" y="266">U</text>
      <text x="1004" y="266">M</text>
    </g>
  </svg>
</body>
</html>
  `;

  await page.setContent(logoHtml);
  const svgEl = await page.$('svg');
  if (svgEl) {
    await svgEl.screenshot({
      path: path.join(IMAGES_DIR, 'ostrum-logo.png'),
      omitBackground: true,
    });
    console.log('✓ Created public/images/ostrum-logo.png');
  }

  // 2. Generate ostrum-og.png (1200 x 630 luxury brand card)
  await page.setViewportSize({ width: 1200, height: 630 });
  const ogHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @font-face {
      font-family: 'Romie';
      src: url('file://${path.join(ROOT_DIR, 'public', 'fonts', 'Romie-Regular.woff2').replace(/\\/g, '/')}') format('woff2');
    }
    @font-face {
      font-family: 'Neue Montreal';
      src: url('file://${path.join(ROOT_DIR, 'public', 'fonts', 'NeueMontreal-Regular.woff2').replace(/\\/g, '/')}') format('woff2');
    }
    body {
      margin: 0;
      width: 1200px;
      height: 630px;
      background-color: #050505;
      background-image: 
        radial-gradient(circle at 80% 20%, rgba(201, 54, 43, 0.22) 0%, transparent 50%),
        radial-gradient(circle at 20% 80%, rgba(100, 18, 15, 0.35) 0%, transparent 60%);
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px;
      box-sizing: border-box;
      font-family: 'Neue Montreal', sans-serif;
    }
    .badge {
      font-family: monospace;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      color: #FF765E;
    }
    .logo-container svg {
      width: 700px;
      height: 200px;
    }
    .footer-line {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding-top: 24px;
    }
    .tagline {
      font-size: 20px;
      color: #D4D4D8;
      max-width: 600px;
      line-height: 1.4;
    }
    .url {
      font-family: monospace;
      font-size: 15px;
      color: #FF765E;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="badge">Digital Engineering &amp; Venture Studio</div>
  <div class="logo-container">
    <svg viewBox="0 0 1253 360" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="#FFFFFF" font-family="'Romie', Georgia, serif" font-size="268" font-weight="400" letter-spacing="-0.01em">
        <text x="0" y="266">O</text>
        <text x="226" y="266">S</text>
        <text x="394" y="266">T</text>
        <text x="594" y="266">R</text>
        <text x="794" y="266">U</text>
        <text x="1004" y="266">M</text>
      </g>
    </svg>
  </div>
  <div class="footer-line">
    <div class="tagline">Intelligent systems, custom infrastructure, and high-impact digital experiences.</div>
    <div class="url">theostrum.com</div>
  </div>
</body>
</html>
  `;

  await page.setContent(ogHtml);
  await page.screenshot({
    path: path.join(IMAGES_DIR, 'ostrum-og.png'),
  });
  console.log('✓ Created public/images/ostrum-og.png');

  await browser.close();
  console.log('Asset generation complete.');
}

generateBrandAssets().catch((err) => {
  console.error('Failed to generate brand assets:', err);
  process.exit(1);
});
