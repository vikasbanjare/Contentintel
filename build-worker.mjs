// Builds worker.js = worker.src.js with the research corpus injected.
// Research stays server-side (never shipped in index.html) so it isn't scrapeable.
import { readFileSync, writeFileSync } from 'fs';
const w0 = {};
globalThis.window = w0;
for (const f of ['research.js','research1.js','research2.js','research3.js','research4.js','research5.js','research6.js']) {
  let src; try { src = readFileSync(f, 'utf8'); } catch (e) { continue; }
  try { (0, eval)(src); } catch (e) { console.log('eval fail', f, e.message.slice(0,80)); }
}
const research = JSON.stringify(w0.CI_RESEARCH || {});
let w = readFileSync('worker.src.js', 'utf8');
const marker = '// __CI_RESEARCH_DATA__';
if (!w.includes(marker)) { console.error('marker missing in worker.src.js'); process.exit(1); }
w = w.replace(marker, 'const CI_RESEARCH_DATA = ' + research + ';');
writeFileSync('worker.js', w);
console.log('worker.js:', w.length.toLocaleString(), 'bytes | research', research.length.toLocaleString(), 'bytes | keys:', Object.keys(w0.CI_RESEARCH||{}).join(','));
