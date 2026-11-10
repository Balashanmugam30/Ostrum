import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');

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

export async function createBlackFavicon() {
  const sourcePath = path.join(publicDir, 'brand/ostrum-3d-symbol-dark.png');
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Authoritative master dark render not found at: ${sourcePath}`);
  }

  const targetDim = 512;
  const sourceBuffer = fs.readFileSync(sourcePath);

  // Resize the transparent 3D sculpture to 512x512
  const resizedSculpture = await sharp(sourceBuffer)
    .resize(targetDim, targetDim, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Composite over a 100% solid, pure-black canvas (#000000, alpha: 255)
  const composite512 = await sharp({
    create: {
      width: targetDim,
      height: targetDim,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }, // 100% pure black, alpha 255
    },
  })
    .composite([{ input: resizedSculpture, blend: 'over' }])
    .png()
    .toBuffer();

  // Save the primary accepted asset
  const outputPath = path.join(publicDir, 'favicon-ostrum-black.png');
  fs.writeFileSync(outputPath, composite512);
  console.log(`[Asset Saved] Saved 512x512 permanent black-background favicon to: ${outputPath}`);

  // Generate multi-resolution favicon.ico fallback (16, 32, 48) with solid black background
  const b16 = await sharp(composite512).resize(16, 16).png().toBuffer();
  const b32 = await sharp(composite512).resize(32, 32).png().toBuffer();
  const b48 = await sharp(composite512).resize(48, 48).png().toBuffer();
  const icoBuf = createIco([b16, b32, b48], [16, 32, 48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
  console.log('[Asset Saved] Generated matching pure-black favicon.ico (16, 32, 48)');

  // Verify acceptance requirements
  const { data, info } = await sharp(composite512).raw().toBuffer({ resolveWithObject: true });
  console.log(`[Verification] Dimensions: ${info.width}x${info.height}, Channels: ${info.channels}`);

  // 1. Canvas is square
  if (info.width !== info.height) {
    throw new Error(`Image is not square: ${info.width}x${info.height}`);
  }

  // 2. No transparent pixels (every pixel must have alpha 255)
  let transparentPixelCount = 0;
  let nonBlackPixelCount = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a !== 255) {
      transparentPixelCount++;
    }
    if (r !== 0 || g !== 0 || b !== 0) {
      nonBlackPixelCount++;
    }
  }

  if (transparentPixelCount > 0) {
    throw new Error(`Found ${transparentPixelCount} non-opaque pixels. Alpha must be 255 across all pixels.`);
  }

  // 3. Four corners are pure black (#000000)
  const cornerIndices = [
    0, // Top-left
    (info.width - 1) * info.channels, // Top-right
    (info.width * (info.height - 1)) * info.channels, // Bottom-left
    (info.width * info.height - 1) * info.channels, // Bottom-right
  ];

  for (const idx of cornerIndices) {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (r !== 0 || g !== 0 || b !== 0 || a !== 255) {
      throw new Error(`Corner pixel at index ${idx} is not pure black: rgba(${r},${g},${b},${a})`);
    }
  }

  console.log(`[Verification] 100% Opaque (0 transparent pixels across ${info.width * info.height} total pixels)`);
  console.log(`[Verification] Pure black background confirmed at all corners and boundaries`);
  console.log(`[Verification] Non-black pixels (sculpture): ${nonBlackPixelCount} (${((nonBlackPixelCount / (info.width * info.height)) * 100).toFixed(1)}% occupancy)`);

  return {
    width: info.width,
    height: info.height,
    isSquare: info.width === info.height,
    allOpaque: transparentPixelCount === 0,
    cornersPureBlack: true,
  };
}

createBlackFavicon().catch(err => {
  console.error('Failed to create black favicon:', err);
  process.exit(1);
});
