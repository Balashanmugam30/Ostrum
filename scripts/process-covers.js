const sharp = require('sharp');
const path = require('path');

async function processCovers() {
  const frontSrc = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5\\ostrum_foundry_front_1791457598510.jpg';
  const backSrc = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5\\ostrum_foundry_back_1791457619777.jpg';

  const targetW = 540;
  const targetH = 800;

  // Crop front: left: 176, top: 198, width: 518, height: 852
  const frontCropped = await sharp(frontSrc)
    .extract({ left: 176, top: 198, width: 518, height: 852 })
    .resize(targetW, targetH, { fit: 'fill' })
    .toBuffer();

  // Crop back: left: 154, top: 188, width: 558, height: 794
  const backCropped = await sharp(backSrc)
    .extract({ left: 154, top: 188, width: 558, height: 794 })
    .resize(targetW, targetH, { fit: 'fill' })
    .toBuffer();

  // Create rounded corner SVG mask
  const r = 8;
  const maskSvg = Buffer.from(
    `<svg width="${targetW}" height="${targetH}">
      <rect x="0" y="0" width="${targetW}" height="${targetH}" rx="${r}" ry="${r}" fill="white" />
    </svg>`
  );

  const frontFinal = await sharp(frontCropped)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png({ compressionLevel: 8 })
    .toFile(path.join(__dirname, '../public/images/foundry-dossier-front.png'));

  const backFinal = await sharp(backCropped)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png({ compressionLevel: 8 })
    .toFile(path.join(__dirname, '../public/images/foundry-dossier-back.png'));

  // Also create optimized WebP versions
  await sharp(path.join(__dirname, '../public/images/foundry-dossier-front.png'))
    .webp({ quality: 90 })
    .toFile(path.join(__dirname, '../public/images/foundry-dossier-front.webp'));

  await sharp(path.join(__dirname, '../public/images/foundry-dossier-back.png'))
    .webp({ quality: 90 })
    .toFile(path.join(__dirname, '../public/images/foundry-dossier-back.webp'));

  console.log('Front processed:', frontFinal);
  console.log('Back processed:', backFinal);
}

processCovers().catch(console.error);
