#!/usr/bin/env node
/*
 * AddPost.js — Interactive CLI to append a new post to src/data/posts.json.
 *
 * Usage:
 *   node scripts/AddPost.js
 *
 * It will ask you for:
 *   - Title
 *   - Summary
 *   - Tags (comma separated, e.g. Web, RCE, Node.js)
 *   - Reading time in minutes
 *   - Cover image path (optional, defaults to /assets/img/post-default.svg)
 *   - URL to the full write-up (optional)
 *
 * The id is auto-generated from the title (slug), the date is today's ISO date.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_PATH = resolve(__dirname, '..', 'src', 'data', 'posts.json');

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

async function main() {
  if (!existsSync(POSTS_PATH)) {
    console.error(`[!] posts.json not found at ${POSTS_PATH}`);
    process.exit(1);
  }

  const rl = createInterface({ input, output });
  const ask = async (q, def = '') => {
    const a = (await rl.question(`\x1b[32m?\x1b[0m ${q}${def ? ` (\x1b[90m${def}\x1b[0m)` : ''} > `)).trim();
    return a || def;
  };

  console.log('\n\x1b[32m>_\x1b[0m new post wizard\n');

  const title = await ask('Title');
  if (!title) { console.error('[!] title is required'); rl.close(); process.exit(1); }

  const summary = await ask('Summary');
  const tagsRaw = await ask('Tags (comma-separated)', 'Write-up');
  const readingTime = parseInt(await ask('Reading time (minutes)', '8'), 10) || 8;
  const cover = await ask('Cover image path', '/assets/img/post-default.svg');
  const event = await ask('Related CTF / event (optional)', '');
  const category = await ask('Primary category (optional)', '');

  const post = {
    id: slugify(title) + '-' + Date.now().toString(36),
    title,
    date: new Date().toISOString().slice(0, 10),
    author: 'HyPn0s',
    ...(event ? { event } : {}),
    ...(category ? { category } : {}),
    summary,
    tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
    readingTime,
    cover,
    content: [
      { type: 'h2', text: 'Introduction' },
      { type: 'p', text: 'Write your content here. Supported block types: h2, h3, p, quote, code, kv (key/value), flag.' },
    ],
  };

  const current = JSON.parse(readFileSync(POSTS_PATH, 'utf8'));
  current.unshift(post);
  writeFileSync(POSTS_PATH, JSON.stringify(current, null, 2) + '\n', 'utf8');

  console.log('\n\x1b[32m[+]\x1b[0m post added:');
  console.log(JSON.stringify(post, null, 2));
  rl.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
