// Leonida Trophy Guide — make.fun entry for gta6-trophy-guide-01 (Node 22,
// standard library only). The guide is this directory's app/ folder: plain
// static files a browser opens at app/index.html (ES modules, CSS, no build
// step), offline — it loads nothing over the network — and its trophy list
// and guides are app/data/trophies.json (all 55 official PS5 trophies, each
// with a guide in our own words that cites its sources).
//
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json, the summary
// the judge reads (your screenshots, the first load's files and bytes, and
// your source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to
// be byte for byte what its own copy writes.
//
// Before copying, it validates app/data/trophies.json against the official
// list: exactly 55 trophies, the right grade split (1 platinum, 2 gold,
// 6 silver, 46 bronze), every guide non-blank. A bad data file fails loudly
// here instead of failing the gate silently.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// --- Validate the trophy data before handing anything in. ---
const dataPath = join(here, 'app', 'data', 'trophies.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const trophies = data.trophies ?? data;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  throw new Error(`trophies.json must hold exactly 55 trophies, found ${trophies.length}`);
}
const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
for (const t of trophies) {
  if (typeof t.name !== 'string' || !t.name) throw new Error('trophy with no name');
  if (typeof t.guide !== 'string' || !t.guide.trim()) throw new Error(`trophy ${t.name} has no guide`);
  if (!(t.grade in grades)) throw new Error(`trophy ${t.name} has unknown grade ${t.grade}`);
  grades[t.grade] += 1;
}
const expected = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
for (const [g, n] of Object.entries(expected)) {
  if (grades[g] !== n) throw new Error(`expected ${n} ${g} trophies, found ${grades[g]}`);
}
console.log(`trophies.json OK: 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze), all with guides`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
console.log(`dossier.json written to ${out}`);
