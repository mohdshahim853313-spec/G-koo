const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const THEME_BG = { r: 255, g: 95, b: 109, alpha: 1 }; // #FF5F6D

// Target density scale factors for splash_content.png (baseline: width 220, height 295)
const CONTENT_SIZES = [
  { folder: 'drawable', width: 330, height: 442 },
  { folder: 'drawable-mdpi', width: 220, height: 295 },
  { folder: 'drawable-hdpi', width: 330, height: 442 },
  { folder: 'drawable-xhdpi', width: 440, height: 590 },
  { folder: 'drawable-xxhdpi', width: 660, height: 885 },
  { folder: 'drawable-xxxhdpi', width: 880, height: 1180 }
];

async function main() {
  console.log('--- Generating Aspect-Ratio Preserving Splash ---');

  const splashSourcePath = path.resolve('public/splash.png');
  if (!fs.existsSync(splashSourcePath)) {
    throw new Error('public/splash.png not found!');
  }

  // 1. Extract the centered mascot + G-koo text from user splash
  // In 485x1024: content is left: 115, top: 343, width: 254, height: 341
  // We extract with a 6px margin
  const cutoutRaw = await sharp(splashSourcePath)
    .extract({ left: 110, top: 338, width: 265, height: 352 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cutoutBuffer = Buffer.alloc(cutoutRaw.info.width * cutoutRaw.info.height * 4);
  for (let i = 0; i < cutoutRaw.info.width * cutoutRaw.info.height; i++) {
    const r = cutoutRaw.data[i * 4];
    const g = cutoutRaw.data[i * 4 + 1];
    const b = cutoutRaw.data[i * 4 + 2];
    const a = cutoutRaw.data[i * 4 + 3];
    const d = Math.hypot(r - 255, g - 95, b - 109);
    if (d < 18) {
      cutoutBuffer[i * 4 + 3] = 0; // transparent
    } else {
      cutoutBuffer[i * 4] = r;
      cutoutBuffer[i * 4 + 1] = g;
      cutoutBuffer[i * 4 + 2] = b;
      cutoutBuffer[i * 4 + 3] = a;
    }
  }

  // 2. Generate Android 12+ splash_icon.png (512x512)
  // Perfectly centered inside Android 12's 160dp circle (diameter 320px)
  const iconH = 260;
  const iconW = Math.round(cutoutRaw.info.width * (iconH / cutoutRaw.info.height));
  const iconResized = await sharp(cutoutBuffer, { raw: cutoutRaw.info })
    .resize(iconW, iconH)
    .png()
    .toBuffer();

  const splashIconBuffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    {
      input: iconResized,
      top: Math.round((512 - iconH) / 2),
      left: Math.round((512 - iconW) / 2)
    }
  ])
  .png()
  .toBuffer();

  fs.writeFileSync('android/app/src/main/res/drawable/splash_icon.png', splashIconBuffer);
  console.log('✓ Created android/app/src/main/res/drawable/splash_icon.png (Android 12+)');

  // 3. Generate splash_content.png across all density folders
  for (const item of CONTENT_SIZES) {
    const dir = path.join('android/app/src/main/res', item.folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const contentImg = await sharp(cutoutBuffer, { raw: cutoutRaw.info })
      .resize(item.width, item.height)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(dir, 'splash_content.png'), contentImg);
  }
  console.log('✓ Generated splash_content.png across all density folders');

  // 4. Remove all old splash.png from drawable* folders to avoid conflict with splash.xml
  const resDir = path.resolve('android/app/src/main/res');
  for (const f of fs.readdirSync(resDir)) {
    if (f.startsWith('drawable')) {
      const oldSplashPng = path.join(resDir, f, 'splash.png');
      if (fs.existsSync(oldSplashPng)) {
        fs.unlinkSync(oldSplashPng);
        console.log(`✓ Removed old ${f}/splash.png`);
      }
    }
  }

  // 5. Ensure drawable/splash.xml exists with gravity="center"
  const splashXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_content" />
    </item>
</layer-list>
`;
  fs.writeFileSync('android/app/src/main/res/drawable/splash.xml', splashXml);
  console.log('✓ Verified android/app/src/main/res/drawable/splash.xml');

  // 6. Generate master 2732x2732 for assets/
  const masterSplashBuffer = await sharp(splashSourcePath)
    .resize(2732, 2732, { fit: 'contain', background: THEME_BG })
    .png()
    .toBuffer();
  fs.writeFileSync('assets/splash.png', masterSplashBuffer);
  fs.writeFileSync('assets/splash-dark.png', masterSplashBuffer);
  console.log('✓ Updated assets/splash.png');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
