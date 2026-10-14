import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8'));
assert.equal(config.assets.directory, './frontend/dist', 'Deploy only the compiled frontend/dist folder.');
const dist = path.resolve(root, config.assets.directory);
const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
const modules = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
assert.ok(modules.length, 'The built page must load a compiled module.');
assert.doesNotMatch(html, /\/src\/|\.jsx(?:["?]|$)/, 'Raw JSX source must never be deployed.');
for (const src of modules) {
  assert.match(src, /^\/assets\/.+\.js$/, `Unexpected module URL: ${src}`);
  assert.ok(existsSync(path.join(dist, src.slice(1))), `Missing compiled module: ${src}`);
}
function checkDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) checkDirectory(fullPath);
    else assert.ok(!/\.(?:jsx|tsx)$/.test(entry.name), `Raw source in deployment assets: ${fullPath}`);
  }
}
checkDirectory(dist);
console.log(`Cloudflare build verified: ${modules.length} compiled JS module(s), no raw JSX.`);
