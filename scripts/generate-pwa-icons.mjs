import { mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ICONS_DIR = resolve("public/icons");
if (!existsSync(ICONS_DIR)) {
  mkdirSync(ICONS_DIR, { recursive: true });
}

const BG_COLOR = { r: 11, g: 15, b: 23, alpha: 1 }; // #0B0F17

async function generateIcons() {
  const logoPath = resolve("public/kryso-logo.png");
  console.log("Generating Android & PWA icons from:", logoPath);

  // 1. Generate 512x512 standard icon
  const logo512 = await sharp(logoPath)
    .resize(400, 400, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: logo512, gravity: "center" }])
    .png()
    .toFile(join(ICONS_DIR, "icon-512.png"));
  console.log("Generated: public/icons/icon-512.png");

  // 2. Generate 192x192 standard icon
  const logo192 = await sharp(logoPath)
    .resize(150, 150, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: logo192, gravity: "center" }])
    .png()
    .toFile(join(ICONS_DIR, "icon-192.png"));
  console.log("Generated: public/icons/icon-192.png");

  // 3. Generate 512x512 Maskable Icon (safe zone is inner 80% circle, logo padded to 320px)
  const logoMaskable = await sharp(logoPath)
    .resize(320, 320, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: logoMaskable, gravity: "center" }])
    .png()
    .toFile(join(ICONS_DIR, "maskable-icon-512.png"));
  console.log("Generated: public/icons/maskable-icon-512.png");

  // 4. Generate Google Play Store High-Res Icon (512x512, 32-bit PNG, opaque background, max 1024KB)
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: logo512, gravity: "center" }])
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(join(ICONS_DIR, "playstore-icon.png"));
  console.log("Generated: public/icons/playstore-icon.png (Google Play Store Compliant)");

  // 5. Generate 180x180 Apple Touch Icon
  const logo180 = await sharp(logoPath)
    .resize(140, 140, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: logo180, gravity: "center" }])
    .png()
    .toFile(join(ICONS_DIR, "apple-touch-icon.png"));
  console.log("Generated: public/icons/apple-touch-icon.png");

  console.log("\nAll Android, PWA, and Play Store icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
