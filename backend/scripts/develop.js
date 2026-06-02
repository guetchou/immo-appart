#!/usr/bin/env node
/**
 * Wrapper de `strapi develop` — simple passthrough.
 * Les schémas sont désormais en .ts → compilés automatiquement par esbuild.
 * Plus besoin de copier des JSON.
 */
const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const child = spawn(
  path.join(ROOT, 'node_modules', '.bin', 'strapi'),
  ['develop', '--no-watch-admin', ...process.argv.slice(2)],
  { stdio: 'inherit', cwd: ROOT }
);

child.on('exit', code => process.exit(code ?? 0));
