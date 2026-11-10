import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = 3344;

// Simple static server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  console.log('HTTP REQ:', reqPath);
  if (reqPath === '/' || reqPath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Favicon Render</title>
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
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1.0, 0.1, 50);

    // 4-point Studio Lighting matching Hero
    const keyLight = new THREE.DirectionalLight('#fff7ee', 2.4);
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

    // Exact porcelain material from OstrumContinuousJourney.tsx
    const porcelainColor = new THREE.Color('#f7eee8');
    const material = new THREE.MeshPhysicalMaterial({
      color: porcelainColor,
      roughness: 0.26,
      metalness: 0.06,
      clearcoat: 0.58,
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

      // Frame camera tightly so model fills ~92% of 1024x1024 square
      pivotGroup.updateMatrixWorld(true);
      const rotatedBox = new THREE.Box3().setFromObject(pivotGroup);
      const rotSize = new THREE.Vector3();
      rotatedBox.getSize(rotSize);
      const maxDim = Math.max(rotSize.x, rotSize.y);

      // In PerspectiveCamera with fov=34 deg, half-height = tan(17 deg) * dist
      // For height to match maxDim / 0.92:
      const fovRad = (34 * Math.PI) / 360;
      const targetHalfView = (maxDim / 0.92) / 2;
      const dist = targetHalfView / Math.tan(fovRad);
      console.log('Scaled model maxDim:', maxDim, 'camera dist:', dist);

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

async function main() {
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Render server listening on http://localhost:${PORT}`);

  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--use-gl=angle', '--use-angle=default', '--enable-webgl'],
    });
    const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
    page.on('console', (msg) => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

    await page.goto(`http://localhost:${PORT}`);
    await page.waitForFunction(() => window.__RENDER_DONE || window.__RENDER_ERROR, { timeout: 30000 });

    const err = await page.evaluate(() => window.__RENDER_ERROR);
    if (err) {
      throw new Error(`Renderer error in browser: ${err}`);
    }

    // Capture transparent dataURL
    const dataUrl = await page.evaluate(() => {
      const c = document.getElementById('c');
      return c.toDataURL('image/png');
    });

    await browser.close();

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const rawPngBuffer = Buffer.from(base64Data, 'base64');

    // Tight trim & pad to exactly 90% occupancy
    console.log('Processing raw render through Sharp...');
    const trimmed = await sharp(rawPngBuffer).trim().toBuffer();
    const meta = await sharp(trimmed).metadata();
    console.log(`Trimmed object dimensions: ${meta.width}x${meta.height}`);

    const maxDim = Math.max(meta.width, meta.height);
    // Fit into 1024x1024 with 92% occupancy (margin = ~4% on each side)
    const targetDim = 1024;
    const contentDim = Math.round(targetDim * 0.92);
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

    // 1. Save master asset
    const brandDir = path.join(rootDir, 'public/brand');
    if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
    const masterPath = path.join(brandDir, 'ostrum-3d-symbol-master.png');
    fs.writeFileSync(masterPath, master1024);
    console.log('Saved transparent master symbol:', masterPath);

    // 2. Generate derivative sizes
    const publicDir = path.join(rootDir, 'public');
    const appDir = path.join(rootDir, 'app');

    const targets = [
      { file: path.join(publicDir, 'favicon-16x16.png'), size: 16 },
      { file: path.join(publicDir, 'favicon-32x32.png'), size: 32 },
      { file: path.join(publicDir, 'favicon-48x48.png'), size: 48 },
      { file: path.join(publicDir, 'apple-touch-icon.png'), size: 180 },
      { file: path.join(publicDir, 'icon-192.png'), size: 192 },
      { file: path.join(publicDir, 'icon-512.png'), size: 512 },
      { file: path.join(appDir, 'icon.png'), size: 512 },
      { file: path.join(appDir, 'apple-icon.png'), size: 180 },
    ];

    for (const t of targets) {
      await sharp(master1024).resize(t.size, t.size).png().toFile(t.file);
      console.log(`Generated: ${t.file} (${t.size}x${t.size})`);
    }

    // 3. Multi-resolution favicon.ico
    const b16 = await sharp(master1024).resize(16, 16).png().toBuffer();
    const b32 = await sharp(master1024).resize(32, 32).png().toBuffer();
    const b48 = await sharp(master1024).resize(48, 48).png().toBuffer();
    const icoBuf = createIco([b16, b32, b48], [16, 32, 48]);
    const icoPath = path.join(publicDir, 'favicon.ico');
    fs.writeFileSync(icoPath, icoBuf);
    console.log('Generated favicon.ico (16, 32, 48):', icoPath);

    // 4. Generate Visual Proof Sheet comparing 16, 32, 48, 180, 192, 512
    // on both Dark (#141414) and Light (#FFFFFF) backdrops
    console.log('Generating favicon visual proof sheet...');
    const proofWidth = 900;
    const proofHeight = 520;
    
    // We will render:
    // Row 1: Dark background (#181414) with sizes: 16 (scaled 2x for preview), 32, 48, 180
    // Row 2: Light background (#FAFAFA) with sizes: 16 (scaled 2x for preview), 32, 48, 180
    const darkBox = await sharp({
      create: { width: 860, height: 230, channels: 4, background: { r: 24, g: 20, b: 20, alpha: 1 } }
    }).png().toBuffer();

    const lightBox = await sharp({
      create: { width: 860, height: 230, channels: 4, background: { r: 250, g: 250, b: 250, alpha: 1 } }
    }).png().toBuffer();

    const p16 = await sharp(master1024).resize(16, 16).toBuffer();
    const p32 = await sharp(master1024).resize(32, 32).toBuffer();
    const p48 = await sharp(master1024).resize(48, 48).toBuffer();
    const p180 = await sharp(master1024).resize(180, 180).toBuffer();

    const compositeDark = await sharp(darkBox).composite([
      { input: p16, left: 40, top: 107 },
      { input: p32, left: 120, top: 99 },
      { input: p48, left: 220, top: 91 },
      { input: p180, left: 340, top: 25 },
    ]).png().toBuffer();

    const compositeLight = await sharp(lightBox).composite([
      { input: p16, left: 40, top: 107 },
      { input: p32, left: 120, top: 99 },
      { input: p48, left: 220, top: 91 },
      { input: p180, left: 340, top: 25 },
    ]).png().toBuffer();

    const proofSheet = await sharp({
      create: { width: proofWidth, height: proofHeight, channels: 4, background: { r: 10, g: 10, b: 10, alpha: 1 } }
    }).composite([
      { input: compositeDark, left: 20, top: 20 },
      { input: compositeLight, left: 20, top: 270 }
    ]).png().toBuffer();

    const proofPath = path.join(rootDir, 'reports/audits/artifacts/favicon-visual-proof-sheet.png');
    fs.writeFileSync(proofPath, proofSheet);
    console.log('Saved Favicon Visual Proof Sheet:', proofPath);

  } finally {
    server.close();
    console.log('Render server closed.');
  }
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
