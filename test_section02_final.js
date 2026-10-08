const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runFinalAudit() {
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

  const fullReport = {
    viewports: {},
    rotationTest: {},
    overlayTest: {},
    frenchRoute: {},
  };

  // 1. Multi-viewport validation
  for (const vp of viewports) {
    console.log(`\n=== Auditing Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') pageErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // Scroll to section 02
    await page.evaluate(() => {
      const el = document.getElementById('engine');
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForTimeout(500);

    // Overflow check
    const overflowCheck = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    // Content checks
    const contentCheck = await page.evaluate(() => {
      const section = document.getElementById('engine');
      const text = section.innerText;
      return {
        hasBook: /book|livre|dossier|flip/i.test(text),
        hasHeadline: text.includes('We build for today.') && text.includes("We build what's next."),
        hasForBusiness: text.includes('FOR BUSINESS') && text.includes('Systems that make ambitious companies move better.'),
        hasForNext: text.includes("FOR WHAT'S NEXT") && text.includes('Products and ventures built around problems worth solving.'),
        hasBacking: text.includes('BUILD · DISCOVER · BACK'),
      };
    });

    // Screenshot
    const screenshotPath = path.join(resultsDir, `final-${vp.name}.png`);
    await page.screenshot({ path: screenshotPath });

    fullReport.viewports[vp.name] = {
      errors: pageErrors,
      overflow: overflowCheck,
      content: contentCheck,
      screenshot: screenshotPath,
    };

    console.log(`- Console errors: ${pageErrors.length}`);
    console.log(`- Horizontal overflow: ${overflowCheck.hasOverflow} (${overflowCheck.scrollWidth}/${overflowCheck.innerWidth})`);
    console.log(`- Headline verified: ${contentCheck.hasHeadline}`);
    console.log(`- Bilateral directions verified: ${contentCheck.hasForBusiness && contentCheck.hasForNext}`);
    console.log(`- Screenshot: ${screenshotPath}`);

    await page.close();
  }

  // 2. Programmatic Rotation Test (0%, 25%, 50%, 75%, 100%)
  console.log(`\n=== Running Programmatic 360-Degree Rotation Test ===`);
  const rotPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await rotPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  const rotationSteps = [0, 0.25, 0.5, 0.75, 1.0];
  for (const step of rotationSteps) {
    const data = await rotPage.evaluate((targetStep) => {
      const section = document.getElementById('engine');
      const rect = section.getBoundingClientRect();
      const totalScrollable = rect.height + window.innerHeight;
      const targetScrollY = section.offsetTop - window.innerHeight * 0.9 + targetStep * totalScrollable * 0.8;
      window.scrollTo(0, Math.max(0, targetScrollY));

      const coreContainer = document.querySelector('[data-testid="ostrum-core-container"]');
      const coreRig = document.querySelector('[data-testid="ostrum-core-rig"]');

      return {
        stepPercent: targetStep * 100 + '%',
        scrollY: window.scrollY,
        rotationDegAttr: coreContainer ? coreContainer.getAttribute('data-rotation-deg') : null,
        rigTransform: coreRig ? coreRig.style.transform : null,
      };
    }, step);

    await rotPage.waitForTimeout(300);

    // Read back after lerp settling
    const settledData = await rotPage.evaluate(() => {
      const coreContainer = document.querySelector('[data-testid="ostrum-core-container"]');
      const coreRig = document.querySelector('[data-testid="ostrum-core-rig"]');
      return {
        rotationDegAttr: coreContainer ? coreContainer.getAttribute('data-rotation-deg') : null,
        rigTransform: coreRig ? coreRig.style.transform : null,
      };
    });

    fullReport.rotationTest[step * 100 + '%'] = settledData;
    console.log(`- Scroll ${step * 100}%: rotationAttr = ${settledData.rotationDegAttr}°, transform = ${settledData.rigTransform}`);
  }
  await rotPage.close();

  // 3. Programmatic Overlay Test (zero black container / zero black halo)
  console.log(`\n=== Running Programmatic Overlay Test ===`);
  const overlayPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await overlayPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  const overlayResults = await overlayPage.evaluate(() => {
    const section = document.getElementById('engine');
    const coreContainer = document.querySelector('[data-testid="ostrum-core-container"]');
    const secStyle = window.getComputedStyle(section);
    const coreStyle = window.getComputedStyle(coreContainer);

    const hasBlackBg = secStyle.backgroundColor === 'rgb(0, 0, 0)' || secStyle.backgroundColor === 'rgb(10, 8, 8)';
    const isSecTransparent = secStyle.backgroundColor === 'rgba(0, 0, 0, 0)' || secStyle.backgroundColor === 'transparent';
    const isCoreTransparent = coreStyle.backgroundColor === 'rgba(0, 0, 0, 0)' || coreStyle.backgroundColor === 'transparent';

    return {
      sectionBg: secStyle.backgroundColor,
      coreBg: coreStyle.backgroundColor,
      hasBlackBg,
      isSecTransparent,
      isCoreTransparent,
      hasNoBlackOverlay: isSecTransparent && isCoreTransparent && !hasBlackBg,
    };
  });

  fullReport.overlayTest = overlayResults;
  console.log(`- Section Background: ${overlayResults.sectionBg} (isTransparent: ${overlayResults.isSecTransparent})`);
  console.log(`- Core Container Background: ${overlayResults.coreBg} (isTransparent: ${overlayResults.isCoreTransparent})`);
  console.log(`- Verified NO black overlay: ${overlayResults.hasNoBlackOverlay}`);
  await overlayPage.close();

  // 4. French Route Verification
  console.log(`\n=== Testing French Route (/fr) ===`);
  const frPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await frPage.goto('http://localhost:3000/fr', { waitUntil: 'networkidle' });
  const frText = await frPage.$eval('#engine', (el) => el.innerText);
  const frValid = frText.includes('LE CŒUR OSTRUM') && frText.includes('POUR LES ENTREPRISES');
  fullReport.frenchRoute = { valid: frValid };
  console.log(`- French localization valid: ${frValid}`);
  await frPage.close();

  await browser.close();

  fs.writeFileSync(path.join(resultsDir, 'final-audit.json'), JSON.stringify(fullReport, null, 2));
  console.log('\nAudit complete! Saved to .test-results/final-audit.json');
}

runFinalAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
