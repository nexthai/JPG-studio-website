import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../../', import.meta.url);
const workerPath = new URL('cloudflare/worker.js', root);
const configPath = new URL('wrangler.jsonc', root);
const data = JSON.parse(readFileSync(new URL('backend/data/site.json', root), 'utf8'));
async function getWorker() {
  assert.ok(existsSync(workerPath), 'Workers adapter is not implemented');
  return (await import(workerPath.href)).default;
}

test('Workers deploys compiled dist assets instead of raw JSX source', () => {
  assert.ok(existsSync(configPath), 'Workers deployment configuration is missing');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  assert.equal(config.assets.directory, './frontend/dist');
  assert.equal(config.assets.not_found_handling, 'single-page-application');
  assert.ok(config.assets.run_worker_first.includes('/api/*'));
  const html = readFileSync(new URL('frontend/dist/index.html', root), 'utf8');
  assert.match(html, /src="\/assets\/[^"\s]+\.js"/);
  assert.doesNotMatch(html, /\/src\/|\.jsx/);
});

test('Worker provides the same site content as the Python backend', async () => {
  const worker = await getWorker();
  const response = await worker.fetch(new Request('https://studio.test/api/site'), {});
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Type'), /application\/json/);
  assert.deepEqual(await response.json(), data);
});

test('Worker app lookup returns current app and rejects a removed app', async () => {
  const worker = await getWorker();
  const app = data.apps[0];
  const response = await worker.fetch(new Request(`https://studio.test/api/apps/${app.slug}`), {});
  assert.deepEqual(await response.json(), app);
  const missing = await worker.fetch(new Request('https://studio.test/api/apps/market-tracker'), {});
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get('Content-Type'), /application\/json/);
});

test('Unknown API paths return JSON errors rather than the SPA HTML', async () => {
  const worker = await getWorker();
  const response = await worker.fetch(new Request('https://studio.test/api/missing'), {});
  assert.equal(response.status, 404);
  assert.ok((await response.json()).error);
});

test('HEAD API requests have JSON headers and an empty body', async () => {
  const worker = await getWorker();
  const response = await worker.fetch(new Request('https://studio.test/api/site', { method: 'HEAD' }), {});
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Type'), /application\/json/);
  assert.equal(await response.text(), '');
});

test('Read-only API rejects write requests', async () => {
  const worker = await getWorker();
  const response = await worker.fetch(new Request('https://studio.test/api/site', { method: 'POST' }), {});
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'GET, HEAD');
});
