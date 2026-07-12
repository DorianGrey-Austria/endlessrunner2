/**
 * PWA/Store icon generator — renders the app icon via headless Chromium canvas.
 * Run: node scripts/generate_icons.cjs
 * Output: icons/icon-192.png, icons/icon-512.png, icons/icon-maskable-512.png,
 *         icons/apple-touch-icon.png (180x180)
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'icons');

/**
 * Draws the icon: night-city gradient, three converging subway lanes,
 * stylized runner (circle head + body) mid-jump. Pure geometry, scales cleanly.
 * @param {boolean} maskable - adds 20% safe-zone padding for Android maskable icons
 */
const DRAW_FN = `(size, maskable) => {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const pad = maskable ? size * 0.12 : 0;
  const s = size - pad * 2;

  // Background (rounded corners only for non-maskable)
  ctx.save();
  if (!maskable) {
    const r = size * 0.22;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.arcTo(size, 0, size, size, r); ctx.arcTo(size, size, 0, size, r);
    ctx.arcTo(0, size, 0, 0, r); ctx.arcTo(0, 0, size, 0, r); ctx.closePath();
    ctx.clip();
  }
  const bg = ctx.createLinearGradient(0, 0, 0, size);
  bg.addColorStop(0, '#0d1b3d');
  bg.addColorStop(0.55, '#1b3a6b');
  bg.addColorStop(1, '#2b2350');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Ground plane
  const horizonY = pad + s * 0.42;
  ctx.fillStyle = '#141024';
  ctx.fillRect(0, horizonY, size, size - horizonY);

  // Three converging lanes
  const cx = size / 2;
  const laneBottomOffsets = [-0.36, 0, 0.36];
  ctx.strokeStyle = '#ffd23f';
  ctx.lineCap = 'round';
  for (const off of laneBottomOffsets) {
    ctx.lineWidth = size * 0.025;
    ctx.beginPath();
    ctx.moveTo(cx + off * s * 1.15, pad + s * 1.05);
    ctx.lineTo(cx + off * s * 0.16, horizonY);
    ctx.stroke();
  }
  // Horizon glow
  const glow = ctx.createLinearGradient(0, horizonY - s * 0.08, 0, horizonY + s * 0.04);
  glow.addColorStop(0, 'rgba(255, 210, 63, 0)');
  glow.addColorStop(1, 'rgba(255, 210, 63, 0.35)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, horizonY - s * 0.08, size, s * 0.12);

  // Runner (mid-jump), centered slightly right
  const rx = cx + s * 0.02;
  const ry = pad + s * 0.52;
  const u = s * 0.05; // unit
  ctx.strokeStyle = '#ff5a36';
  ctx.fillStyle = '#ff5a36';
  ctx.lineWidth = u * 0.85;
  ctx.lineJoin = 'round';
  // head
  ctx.beginPath();
  ctx.arc(rx + u * 0.6, ry - u * 3.4, u * 1.15, 0, Math.PI * 2);
  ctx.fill();
  // torso (leaning forward)
  ctx.beginPath();
  ctx.moveTo(rx + u * 0.35, ry - u * 2.2);
  ctx.lineTo(rx - u * 0.5, ry + u * 0.4);
  ctx.stroke();
  // front leg kicked ahead
  ctx.beginPath();
  ctx.moveTo(rx - u * 0.5, ry + u * 0.4);
  ctx.lineTo(rx + u * 1.7, ry + u * 1.1);
  ctx.lineTo(rx + u * 2.4, ry + u * 2.6);
  ctx.stroke();
  // back leg folded
  ctx.beginPath();
  ctx.moveTo(rx - u * 0.5, ry + u * 0.4);
  ctx.lineTo(rx - u * 2.0, ry + u * 1.3);
  ctx.lineTo(rx - u * 1.5, ry + u * 2.8);
  ctx.stroke();
  // arms
  ctx.beginPath();
  ctx.moveTo(rx + u * 0.1, ry - u * 1.6);
  ctx.lineTo(rx + u * 1.9, ry - u * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rx + u * 0.1, ry - u * 1.6);
  ctx.lineTo(rx - u * 1.6, ry - u * 2.4);
  ctx.stroke();

  ctx.restore();
  return c.toDataURL('image/png');
}`;

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const targets = [
    { file: 'icon-192.png', size: 192, maskable: false },
    { file: 'icon-512.png', size: 512, maskable: false },
    { file: 'icon-maskable-512.png', size: 512, maskable: true },
    { file: 'apple-touch-icon.png', size: 180, maskable: true }, // iOS masks its own corners
  ];

  for (const t of targets) {
    const dataUrl = await page.evaluate(`(${DRAW_FN})(${t.size}, ${t.maskable})`);
    const b64 = dataUrl.split(',')[1];
    fs.writeFileSync(path.join(OUT_DIR, t.file), Buffer.from(b64, 'base64'));
    console.log(`written icons/${t.file}`);
  }

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
