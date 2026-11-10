import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = 3345;

// Static server serving Three.js and GLB model
const server = http.createServer((req, res) => {
  const [reqPath, queryString] = req.url.split('?');
  const urlParams = new URLSearchParams(queryString || '');
  const theme = urlParams.get('theme') || 'dark';

  if (reqPath === '/' || reqPath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Favicon Render - ${theme}</title>
  <script type="importmap">
  {
    "imports": {
      "three": "/three.module.js",
      "three/addons/": "/jsm/"
    }
  }
  </script>
  <style>
    body { margin: 0; background: transparent; overflow: hidden; }
    #c { width: 1024px; height: 1024px; display: block; }
  </style>
</head>
<body>
  <canvas id="c" width="1024" height="1024"></canvas>
  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

    const theme = "${theme}";
    const canvas = document.getElementById('c');
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(1024, 1024);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0); // 100% transparent background
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = theme === 'light' ? 1.25 : 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1.0, 0.1, 50);

    let material;

    if (theme === 'light') {
      // DEEP OSTRUM BURGUNDY / OXBLOOD FOR LIGHT BROWSER CHROME
      // Lighting tailored to reveal deep burgundy sculptural contours on white/light tabs
      const keyLight = new THREE.DirectionalLight('#fff5f2', 3.0);
      keyLight.position.set(-2.4, 3.8, 3.4);
      scene.add(keyLight);

      const hemiLight = new THREE.HemisphereLight('#ffded8', '#2b0404', 1.2);
      hemiLight.position.set(0, 5, 0);
      scene.add(hemiLight);

      const rimLight = new THREE.PointLight('#ff765e', 2.8, 14, 1.1);
      rimLight.position.set(3.4, -1.2, -2.6);
      scene.add(rimLight);

      const fillLight = new THREE.DirectionalLight('#e09088', 0.85);
      fillLight.position.set(1.8, 1.2, 2.0);
      scene.add(fillLight);

      // Deep Burgundy / Oxblood material
      material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#580f0c'),
        roughness: 0.28,
        metalness: 0.14,
        clearcoat: 0.72,
        clearcoatRoughness: 0.16,
        transmission: 0,
        ior: 1.52,
        sheen: 0.65,
        sheenColor: new THREE.Color('#8a1e1a'),
        sheenRoughness: 0.32,
        specularColor: new THREE.Color('#ffffff'),
        specularIntensity: 0.98,
        iridescence: 0.08,
        iridescenceIOR: 1.34,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1
      });
    } else {
      // BRIGHT IVORY / PORCELAIN FOR DARK BROWSER CHROME
      const keyLight = new THREE.DirectionalLight('#fff7ee', 2.5);
      keyLight.position.set(-2.5, 3.6, 3.2);
      scene.add(keyLight);

      const hemiLight = new THREE.HemisphereLight('#fdeddc', '#220404', 1.0);
      hemiLight.position.set(0, 5, 0);
      scene.add(hemiLight);

      const rimLight = new THREE.PointLight('#ff4d30', 2.0, 12, 1.2);
      rimLight.position.set(3.4, -1.2, -2.6);
      scene.add(rimLight);

      const fillLight = new THREE.DirectionalLight('#ffebd8', 0.55);
      fillLight.position.set(1.8, 1.2, 2.0);
      scene.add(fillLight);

      // Ivory / Porcelain material
      material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#f7eee8'),
        roughness: 0.24,
        metalness: 0.06,
        clearcoat: 0.60,
        clearcoatRoughness: 0.18,
        transmission: 0,
        ior: 1.50,
        sheen: 0.65,
        sheenColor: new THREE.Color('#ffdcd8'),
        sheenRoughness: 0.35,
        specularColor: new THREE.Color('#ffffff'),
        specularIntensity: 0.95,
        iridescence: 0.06,
        iridescenceIOR: 1.32,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1
      });
    }

    const loader = new GLTFLoader();
    loader.load('/models/monyedre-360.glb', (gltf) => {
      const rawGroup = gltf.scene;
      rawGroup.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
          if (child.geometry) {
            child.geometry.computeVertexNormals();
          }
        }
      });

      // Center geometry around origin
      const box = new THREE.Box3().setFromObject(rawGroup);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      rawGroup.position.set(-center.x, -center.y, -center.z);

      // Hero orientation & proper scale
      const pivotGroup = new THREE.Group();
      pivotGroup.add(rawGroup);

      const rawMax = Math.max(size.x, size.y, size.z);
      const targetDim = 3.35;
      const baseScale = rawMax > 0 ? targetDim / rawMax : 0.017;
      pivotGroup.scale.set(baseScale, baseScale, baseScale);

      pivotGroup.rotation.x = 0.20;
      pivotGroup.rotation.z = -0.05;
      pivotGroup.rotation.y = 0; // Exact resting rotation in Hero 'O'
      scene.add(pivotGroup);

      // Frame camera tightly so model fills 96% of 1024x1024 square
      pivotGroup.updateMatrixWorld(true);
      const rotatedBox = new THREE.Box3().setFromObject(pivotGroup);
      const rotSize = new THREE.Vector3();
      rotatedBox.getSize(rotSize);
      const maxDim = Math.max(rotSize.x, rotSize.y);

      // Camera distance calculation for 96% occupancy
      const fovRad = (34 * Math.PI) / 360;
      const targetHalfView = (maxDim / 0.96) / 2;
      const dist = targetHalfView / Math.tan(fovRad);

      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      window.__RENDER_DONE = true;
    }, undefined, (err) => {
      console.error('GLTF Load error:', err);
      window.__RENDER_ERROR = err.message || String(err);
    });
  </script>
</body>
</html>`);
    return;
  }

  if (reqPath.startsWith('/three.') || reqPath === '/three.module.js') {
    const file = path.join(rootDir, 'node_modules/three/build', path.basename(reqPath));
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      fs.createReadStream(file).pipe(res);
      return;
    }
  }

  if (reqPath.startsWith('/jsm/')) {
    const file = path.join(rootDir, 'node_modules/three/examples/jsm', reqPath.replace('/jsm/', ''));
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      fs.createReadStream(file).pipe(res);
      return;
    }
  }

  if (reqPath === '/models/monyedre-360.glb') {
    const file = path.join(rootDir, 'public/models/monyedre-360.glb');
    res.writeHead(200, { 'Content-Type': 'model/gltf-binary' });
    fs.createReadStream(file).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

function createIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const headerLen = 6;
  const dirEntryLen = 16;
  const header = Buffer.alloc(headerLen);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // count

  let offset = headerLen + count * dirEntryLen;
  const dirEntries = [];

  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(dirEntryLen);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += buf.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

async function renderVariant(browser, theme) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  try {
    await page.goto(`http://localhost:${PORT}/?theme=${theme}`);
    await page.waitForFunction(() => window.__RENDER_DONE || window.__RENDER_ERROR, { timeout: 30000 });

    const err = await page.evaluate(() => window.__RENDER_ERROR);
    if (err) throw new Error(`Renderer error for ${theme}: ${err}`);

    const dataUrl = await page.evaluate(() => {
      const c = document.getElementById('c');
      return c.toDataURL('image/png');
    });

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const rawPngBuffer = Buffer.from(base64Data, 'base64');

    // Tight trim & pad to exactly 96% occupancy
    const trimmed = await sharp(rawPngBuffer).trim().toBuffer();
    const meta = await sharp(trimmed).metadata();
    console.log(`[${theme}] Trimmed object dimensions: ${meta.width}x${meta.height}`);

    const maxDim = Math.max(meta.width, meta.height);
    const targetDim = 1024;
    const contentDim = Math.round(targetDim * 0.96); // 96% occupancy!
    const scale = contentDim / maxDim;
    const scaledWidth = Math.round(meta.width * scale);
    const scaledHeight = Math.round(meta.height * scale);

    const resizedContent = await sharp(trimmed)
      .resize(scaledWidth, scaledHeight)
      .toBuffer();

    const left = Math.round((targetDim - scaledWidth) / 2);
    const top = Math.round((targetDim - scaledHeight) / 2);

    const master1024 = await sharp({
      create: {
        width: targetDim,
        height: targetDim,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: resizedContent, left, top }])
      .png()
      .toBuffer();

    return master1024;
  } finally {
    await page.close();
  }
}

async function main() {
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Render server listening on http://localhost:${PORT}`);

  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--use-gl=angle', '--use-angle=default', '--enable-webgl'],
    });

    console.log('Rendering Dark Theme Variant (Bright Ivory for Dark Chrome)...');
    const masterDark1024 = await renderVariant(browser, 'dark');

    console.log('Rendering Light Theme Variant (Deep Burgundy for Light Chrome)...');
    const masterLight1024 = await renderVariant(browser, 'light');

    await browser.close();

    const brandDir = path.join(rootDir, 'public/brand');
    const publicDir = path.join(rootDir, 'public');
    const appDir = path.join(rootDir, 'app');
    if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });

    // 1. Save master high-resolution renders
    fs.writeFileSync(path.join(brandDir, 'ostrum-3d-symbol-master.png'), masterDark1024);
    fs.writeFileSync(path.join(brandDir, 'ostrum-3d-symbol-dark.png'), masterDark1024);
    fs.writeFileSync(path.join(brandDir, 'ostrum-3d-symbol-light.png'), masterLight1024);
    console.log('Saved 1024x1024 master assets (master, dark, light).');

    // 2. Generate Dark Theme Derivatives (Ivory on Transparent)
    const darkTargets = [
      { file: path.join(publicDir, 'favicon-dark-v3.png'), size: 48 },
      { file: path.join(publicDir, 'favicon-dark.png'), size: 32 },
      { file: path.join(publicDir, 'favicon-dark-16x16.png'), size: 16 },
      { file: path.join(publicDir, 'favicon-dark-32x32.png'), size: 32 },
      { file: path.join(publicDir, 'favicon-dark-48x48.png'), size: 48 },
      // Standard public fallback paths
      { file: path.join(publicDir, 'favicon-16x16.png'), size: 16 },
      { file: path.join(publicDir, 'favicon-32x32.png'), size: 32 },
      { file: path.join(publicDir, 'favicon-48x48.png'), size: 48 },
      { file: path.join(publicDir, 'apple-touch-icon.png'), size: 180 },
      { file: path.join(publicDir, 'icon-192.png'), size: 192 },
      { file: path.join(publicDir, 'icon-512.png'), size: 512 },
    ];

    for (const t of darkTargets) {
      await sharp(masterDark1024).resize(t.size, t.size).png().toFile(t.file);
    }
    console.log('Generated dark theme & primary application icon derivatives.');

    // 3. Generate Light Theme Derivatives (Deep Burgundy on Transparent)
    const lightTargets = [
      { file: path.join(publicDir, 'favicon-light-v3.png'), size: 48 },
      { file: path.join(publicDir, 'favicon-light.png'), size: 32 },
      { file: path.join(publicDir, 'favicon-light-16x16.png'), size: 16 },
      { file: path.join(publicDir, 'favicon-light-32x32.png'), size: 32 },
      { file: path.join(publicDir, 'favicon-light-48x48.png'), size: 48 },
      { file: path.join(publicDir, 'favicon-light-96x96.png'), size: 96 },
    ];

    for (const t of lightTargets) {
      await sharp(masterLight1024).resize(t.size, t.size).png().toFile(t.file);
    }
    console.log('Generated light theme icon derivatives.');

    // 4. Generate Permanent Pure-Black Favicon (Ivory on Solid Black #000000)
    const compositeBlack512 = await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    })
      .composite([{
        input: await sharp(masterDark1024).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
        blend: 'over',
      }])
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, 'favicon-ostrum-black.png'), compositeBlack512);
    console.log('Generated permanent pure-black favicon: favicon-ostrum-black.png (512x512).');

    // 5. Multi-resolution fallback favicon.ico with solid black background
    const b16 = await sharp(compositeBlack512).resize(16, 16).png().toBuffer();
    const b32 = await sharp(compositeBlack512).resize(32, 32).png().toBuffer();
    const b48 = await sharp(compositeBlack512).resize(48, 48).png().toBuffer();
    const icoBuf = createIco([b16, b32, b48], [16, 32, 48]);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
    console.log('Generated favicon.ico (16, 32, 48) on solid black background.');

    // 5. Visual Proof Sheet: Side-by-side Dark & Light Chrome comparison
    console.log('Generating dual-theme visual proof sheet...');
    const proofWidth = 1000;
    const proofHeight = 620;

    // Dark tab bar strip (#1F1F1F)
    const darkBox = await sharp({
      create: { width: 960, height: 270, channels: 4, background: { r: 31, g: 31, b: 31, alpha: 1 } }
    }).png().toBuffer();

    // Light tab bar strip (#F1F3F4 - standard Chrome light tab bar)
    const lightBox = await sharp({
      create: { width: 960, height: 270, channels: 4, background: { r: 241, g: 243, b: 244, alpha: 1 } }
    }).png().toBuffer();

    // Dark variants (Ivory)
    const d16 = await sharp(masterDark1024).resize(16, 16).toBuffer();
    const d32 = await sharp(masterDark1024).resize(32, 32).toBuffer();
    const d48 = await sharp(masterDark1024).resize(48, 48).toBuffer();
    const d96 = await sharp(masterDark1024).resize(96, 96).toBuffer();
    const d180 = await sharp(masterDark1024).resize(180, 180).toBuffer();

    // Light variants (Burgundy)
    const l16 = await sharp(masterLight1024).resize(16, 16).toBuffer();
    const l32 = await sharp(masterLight1024).resize(32, 32).toBuffer();
    const l48 = await sharp(masterLight1024).resize(48, 48).toBuffer();
    const l96 = await sharp(masterLight1024).resize(96, 96).toBuffer();
    const l180 = await sharp(masterLight1024).resize(180, 180).toBuffer();

    const compositeDark = await sharp(darkBox).composite([
      { input: d16, left: 60, top: 127 },
      { input: d32, left: 140, top: 119 },
      { input: d48, left: 240, top: 111 },
      { input: d96, left: 360, top: 87 },
      { input: d180, left: 520, top: 45 },
    ]).png().toBuffer();

    const compositeLight = await sharp(lightBox).composite([
      { input: l16, left: 60, top: 127 },
      { input: l32, left: 140, top: 119 },
      { input: l48, left: 240, top: 111 },
      { input: l96, left: 360, top: 87 },
      { input: l180, left: 520, top: 45 },
    ]).png().toBuffer();

    const proofSheet = await sharp({
      create: { width: proofWidth, height: proofHeight, channels: 4, background: { r: 12, g: 12, b: 12, alpha: 1 } }
    }).composite([
      { input: compositeDark, left: 20, top: 20 },
      { input: compositeLight, left: 20, top: 320 }
    ]).png().toBuffer();

    const proofPath1 = path.join(rootDir, 'reports/audits/artifacts/favicon-visual-proof-sheet.png');
    const proofPath2 = path.join(rootDir, 'reports/audits/artifacts/playwright/favicon-dual-theme-proof.png');
    fs.writeFileSync(proofPath1, proofSheet);
    fs.writeFileSync(proofPath2, proofSheet);
    console.log('Saved Dual-Theme Favicon Proof Sheet to:', proofPath1, 'and', proofPath2);

  } finally {
    server.close();
    console.log('Render server closed.');
  }
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
