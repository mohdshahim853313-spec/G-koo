import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const resDir = 'c:\\Users\\sahil\\Desktop\\SHAHIM\\cursor all projects\\G-koo\\android\\app\\src\\main\\res';
const srcIconPath = 'c:\\Users\\sahil\\Desktop\\SHAHIM\\cursor all projects\\G-koo\\public\\pwa-512x512.png';

const BG_COLOR = '#0B0E17'; // Match PWA background

const DENSITIES = [
  { folder: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 }
];

async function generateIcons() {
  console.log('Generating Android APK icons from PWA 512x512 icon...');

  const srcBuf = fs.readFileSync(srcIconPath);

  for (const { folder, iconSize, fgSize } of DENSITIES) {
    const targetDir = path.join(resDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 1. Legacy Square Icon (ic_launcher.png): Dark #0B0E17 background + mascot
    const mascotForIcon = await sharp(srcBuf)
      .resize(Math.round(iconSize * 0.88), Math.round(iconSize * 0.88), { fit: 'contain' })
      .toBuffer();

    await sharp({
      create: {
        width: iconSize,
        height: iconSize,
        channels: 4,
        background: BG_COLOR
      }
    })
      .composite([{ input: mascotForIcon, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. Legacy Round Icon (ic_launcher_round.png): Dark #0B0E17 circular background + mascot
    const circleSvg = Buffer.from(
      `<svg width="${iconSize}" height="${iconSize}"><circle cx="${iconSize/2}" cy="${iconSize/2}" r="${iconSize/2}" fill="${BG_COLOR}"/></svg>`
    );
    const roundBg = await sharp(circleSvg).png().toBuffer();
    const mascotForRound = await sharp(srcBuf)
      .resize(Math.round(iconSize * 0.82), Math.round(iconSize * 0.82), { fit: 'contain' })
      .toBuffer();

    await sharp(roundBg)
      .composite([{ input: mascotForRound, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 3. Adaptive Foreground Icon (ic_launcher_foreground.png): Mascot sized to safe zone (66% of 108dp)
    const mascotForFg = await sharp(srcBuf)
      .resize(Math.round(fgSize * 0.68), Math.round(fgSize * 0.68), { fit: 'contain' })
      .toBuffer();

    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: mascotForFg, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${folder}`);
  }

  // 4. Update ic_launcher_background.xml
  const bgXmlPath = path.join(resDir, 'values', 'ic_launcher_background.xml');
  const bgXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${BG_COLOR}</color>
</resources>
`;
  fs.writeFileSync(bgXmlPath, bgXmlContent, 'utf8');

  // 5. Update adaptive icon XMLs (anydpi-v26)
  const anydpiDir = path.join(resDir, 'mipmap-anydpi-v26');
  if (!fs.existsSync(anydpiDir)) fs.mkdirSync(anydpiDir, { recursive: true });

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf8');
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf8');

  console.log('All Android icons generated successfully matching Web PWA!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
