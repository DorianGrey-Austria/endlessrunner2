/**
 * Populates www/ from the production game in ../SubwayRunner.
 * Mirrors the deploy whitelist (index.html, js/, css/, models/, sounds/,
 * icons/, manifest, sw, privacy).
 *
 * Run before every `npx cap sync`:
 *   node sync-www.cjs && npx cap sync
 *
 * NOTE (store blocker, see SubwayRunner/docs/STORE_READINESS.md):
 * index.html still loads three.js from unpkg CDN. The wrapped app therefore
 * needs network on first load. Vendor three.js locally before store submission.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'SubwayRunner');
const OUT = path.join(__dirname, 'www');

const FILES = ['index.html', 'manifest.webmanifest', 'sw.js', 'privacy.html'];
const DIRS = ['js', 'css', 'models', 'sounds', 'icons'];
const EXCLUDE = new Set(['backup', '.DS_Store']);

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name)) continue;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const f of FILES) {
  const src = path.join(SRC, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, f));
}
for (const d of DIRS) {
  const src = path.join(SRC, d);
  if (fs.existsSync(src)) copyDir(src, path.join(OUT, d));
}

console.log('www/ synced from SubwayRunner (deploy whitelist)');
