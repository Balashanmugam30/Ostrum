import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const masterSource = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5/ostrum_brand_master_icon_v3_1794244062718.jpg';
const brandDir = path.resolve('public/brand');
const publicDir = path.resolve('public');
const appDir = path.resolve('app');

if (!fs.existsSync(brandDir)) {
  fs.mkdirSync(brandDir, { recursive: true });
}

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

async function run() {
  console.log('Reading master source:', masterSource);
  const masterBuf = fs.readFileSync(masterSource);

  // 1. Master PNG
  const masterPngPath = path.join(brandDir, 'ostrum-3d-symbol-master.png');
  await sharp(masterBuf).png({ quality: 100 }).toFile(masterPngPath);
  console.log('Saved master PNG:', masterPngPath);

  // 2. Individual icon files
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
    await sharp(masterBuf).resize(t.size, t.size).png().toFile(t.file);
    console.log(`Generated: ${t.file} (${t.size}x${t.size})`);
  }

  // 3. Multi-resolution favicon.ico
  const b16 = await sharp(masterBuf).resize(16, 16).png().toBuffer();
  const b32 = await sharp(masterBuf).resize(32, 32).png().toBuffer();
  const b48 = await sharp(masterBuf).resize(48, 48).png().toBuffer();
  const icoBuf = createIco([b16, b32, b48], [16, 32, 48]);
  const icoPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuf);
  console.log('Generated favicon.ico (16, 32, 48):', icoPath);

  // 4. manifest.webmanifest
  const manifest = {
    name: 'OSTRUM',
    short_name: 'OSTRUM',
    description: 'Custom software, AI systems and digital products.',
    start_url: '/',
    display: 'standalone',
    background_color: '#4A0E17',
    theme_color: '#4A0E17',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  const manifestPath = path.join(publicDir, 'manifest.webmanifest');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Saved manifest:', manifestPath);
}

run().catch(console.error);
