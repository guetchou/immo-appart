#!/usr/bin/env node
/**
 * Copie les fichiers JSON (schémas Strapi) de src/ vers dist/src/
 * TypeScript ne copie que les .ts → .js ; Strapi charge les schémas depuis dist/.
 */

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const SRC     = path.join(ROOT, 'src');
const DIST    = path.join(ROOT, 'dist', 'src');

function copyJsonRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath  = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyJsonRecursive(srcPath, destPath);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyJsonRecursive(path.join(SRC, 'api'),        path.join(DIST, 'api'));
copyJsonRecursive(path.join(SRC, 'components'), path.join(DIST, 'components'));

console.log('[copy-schemas] ✓ JSON schemas copiés → dist/src/');
