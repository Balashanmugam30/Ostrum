const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runTests() {
  const resultsDir = path.join(__dirname, '.test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'desktop-1280', width: 1280, height: 800 },
    { name: 'tablet-landscape-1024', width: 1024, height: 768 },
    { name: 'tablet-portrait-768', width: 768, height: 1024 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-375', width: 375, height: 812 },
  ];

  const errors = [];
  const report = {};

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        pageErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // Check Hero and Section 02 presence
    const section = await page.$('#engine');
    if (!section) {
      throw new Error(`Section #engine not found on ${vp.name}`);
    }

    // Check text and content
    const sectionText = await section.innerText();
    const hasBook = /book|livre|dossier|flip/i.test(sectionText);
    const hasForBusiness = sectionText.includes('FOR BUSINESS');
    const hasForNext = sectionText.includes("FOR WHAT'S NEXT");
    const hasBacking = sectionText.includes('BUILD · DISCOVER · BACK');
    const hasHeadline = sectionText.includes('We build for today.') || sectionText.includes("We build what's next.");

    // Check background transparency
    const bgStyle = await page.evaluate(() => {
      const el = document.getElementById('engine');
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        isTransparent: style.backgroundColor === 'rgba(0, 0, 0, 0)' || style.backgroundColor === 'transparent',
      };
    });

    // Check horizontal overflow
    const overflowCheck = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    // Scroll into Section 02
    await page.evaluate(() => {
      const el = document.getElementById('engine');
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForTimeout(400);

    // Capture screenshot
    const screenshotPath = path.join(resultsDir, `section02-${vp.name}.png`);
    await page.screenshot({ path: screenshotPath });

    report[vp.name] = {
      errors: pageErrors,
      hasBook,
      hasForBusiness,
      hasForNext,
      hasBacking,
      hasHeadline,
      bgStyle,
      overflow: overflowCheck,
      screenshot: screenshotPath,
    };

    console.log(`- Page errors: ${pageErrors.length}`);
    console.log(`- Has book/dossier: ${hasBook}`);
    console.log(`- Transparent background: ${bgStyle.isTransparent} (${bgStyle.backgroundColor})`);
    console.log(`- Horizontal overflow: ${overflowCheck.hasOverflow} (${overflowCheck.scrollWidth} / ${overflowCheck.innerWidth})`);
    console.log(`- Screenshot saved: ${screenshotPath}`);

    await page.close();
  }

  // Test French Page (/fr)
  console.log(`\nTesting French page (/fr)...`);
  const frPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await frPage.goto('http://localhost:3000/fr', { waitUntil: 'networkidle' });
  const frText = await frPage.$eval('#engine', (el) => el.innerText);
  const frValid = frText.includes('LE CŒUR OSTRUM') && frText.includes('POUR LES ENTREPRISES');
  console.log(`- French text valid: ${frValid}`);
  await frPage.close();

  await browser.close();

  fs.writeFileSync(path.join(resultsDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log('\nAll tests completed successfully!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
