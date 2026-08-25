import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Ensure `fetch` is available in Node (fallback to node-fetch if needed)
if (typeof globalThis.fetch === 'undefined') {
  try {
    const mod = await import('node-fetch');
    // node-fetch exports default
    globalThis.fetch = mod.default ?? mod;
  } catch (e) {
    console.warn('Global fetch is not available and node-fetch could not be imported.');
  }
}

const PORT = 5173;
const BASE = `http://localhost:${PORT}`;
let ROUTES = ['/', '/villas', '/villas/3bed-upper-floor', '/villas/2bed-pool-house'];

// If a sitemap exists, prefer its URLs to build the prerender list
try {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const raw = fs.readFileSync(sitemapPath, 'utf-8');
    const locs = Array.from(raw.matchAll(/<loc>(.*?)<\/loc>/g)).map((m) => m[1]);
    const parsed = locs
      .map((u) => {
        try {
          const p = new URL(u);
          return p.pathname.replace(/\/$/, '') || '/';
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .map((p) => (p === '' ? '/' : p));
    if (parsed.length) {
      ROUTES = Array.from(new Set(parsed));
    }
  }
} catch (e) {
  // ignore and use default ROUTES
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(BASE + '/');
      if (res.ok) return;
    } catch (e) {}
    await wait(500);
  }
  throw new Error('Server did not start in time');
}

async function fetchAndWrite(route) {
  const url = BASE + route;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const outDir = path.join(process.cwd(), 'dist', route === '/' ? '' : route);
  const filePath = path.join(outDir, 'index.html');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(filePath, html, 'utf-8');
  console.log('Wrote', filePath);
}

async function main() {
  console.log('Building site...');
  // run npm run build in a platform-aware way
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  const build = spawn(npmCmd, ['run', 'build'], { stdio: 'inherit', shell: true });
  await new Promise((resolve, reject) => {
    build.on('error', reject);
    build.on('close', (code) => (code === 0 ? resolve() : reject(new Error('Build failed'))));
  });

  console.log('Starting preview server...');
  const preview = spawn(npxCmd, ['vite', 'preview', '--port', String(PORT)], { stdio: 'inherit', shell: true });

  try {
    await waitForServer();
    for (const route of ROUTES) {
      await fetchAndWrite(route);
    }
  } finally {
    console.log('Stopping preview server');
    try {
      if (preview && typeof preview.kill === 'function') preview.kill();
    } catch (e) {
      // ignore
    }
  }

  console.log('Prerender complete. Files are in dist/.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
