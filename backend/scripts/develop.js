#!/usr/bin/env node
/**
 * Wrapper `strapi develop` — injecte les JSON schémas dans dist/
 * APRÈS le clean+build de Strapi (qui efface dist/ à chaque démarrage).
 *
 * Stratégie :
 *   Phase 1 — attendre que Strapi nettoie dist/ (le fichier sentinelle disparaît)
 *   Phase 2 — attendre que Strapi recompile (le fichier sentinelle réapparaît)
 *   Phase 3 — copier les JSON, terminé.
 */

const { spawn } = require('child_process');
const path      = require('path');
const fss       = require('fs');

const ROOT      = path.join(__dirname, '..');
const SENTINEL  = path.join(ROOT, 'dist', 'src', 'api', 'appartement', 'controllers', 'appartement.js');
const DIST_API  = path.join(ROOT, 'dist', 'src', 'api');
const SRC_API   = path.join(ROOT, 'src', 'api');
const DIST_COMP = path.join(ROOT, 'dist', 'src', 'components');
const SRC_COMP  = path.join(ROOT, 'src', 'components');

function copyJsonRecursive(srcDir, destDir) {
  if (!fss.existsSync(srcDir)) return;
  fss.mkdirSync(destDir, { recursive: true });
  for (const entry of fss.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyJsonRecursive(s, d);
    else if (entry.isFile() && entry.name.endsWith('.json')) fss.copyFileSync(s, d);
  }
}

let phase = fss.existsSync(SENTINEL) ? 'wait_clean' : 'wait_build';

const interval = setInterval(() => {
  const exists = fss.existsSync(SENTINEL);

  if (phase === 'wait_clean' && !exists) {
    // Strapi vient de nettoyer dist/
    phase = 'wait_build';
    return;
  }

  if (phase === 'wait_build' && exists) {
    // Strapi vient de recompiler — on injecte les JSON
    copyJsonRecursive(SRC_API,  DIST_API);
    copyJsonRecursive(SRC_COMP, DIST_COMP);
    console.log('[develop] ✓ JSON schemas injectés dans dist/src/ (après build)');
    phase = 'done';
    clearInterval(interval);
  }
}, 300);

const child = spawn(
  path.join(ROOT, 'node_modules', '.bin', 'strapi'),
  ['develop', '--no-watch-admin', ...process.argv.slice(2)],
  { stdio: 'inherit', cwd: ROOT }
);

child.on('exit', (code) => {
  clearInterval(interval);
  process.exit(code ?? 0);
});
