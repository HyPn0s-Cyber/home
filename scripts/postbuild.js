#!/usr/bin/env node
/*
 * postbuild.js
 *
 * After `vite build`, prepare the dist/ directory for GitHub Pages:
 *   1. Copy dist/index.html to dist/404.html so that deep links like
 *      /home/blog/xxx still serve the SPA after a hard refresh.
 *   2. Create dist/.nojekyll so GitHub Pages skips Jekyll processing
 *      (otherwise files/folders starting with `_` get ignored).
 */

import { copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, '..', 'dist');

const index = resolve(dist, 'index.html');
const notFound = resolve(dist, '404.html');
const nojekyll = resolve(dist, '.nojekyll');

if (!existsSync(index)) {
  console.error('[postbuild] dist/index.html missing — did vite build run?');
  process.exit(1);
}

copyFileSync(index, notFound);
writeFileSync(nojekyll, '');

console.log('[postbuild] ✓ 404.html + .nojekyll written to dist/');
