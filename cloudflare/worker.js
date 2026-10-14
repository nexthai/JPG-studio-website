// Cloudflare adapter for the existing read-only Python API.
// Wrangler bundles this JSON from the same source used by backend/server.py.
import site from '../backend/data/site.json' with { type: 'json' };

function jsonResponse(request, payload, status = 200, extraHeaders = {}) {
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/src/')) {
      return new Response('Not found', { status: 404 });
    }
    if (pathname.startsWith('/api/')) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return jsonResponse(request, { error: 'Method not allowed' }, 405, { Allow: 'GET, HEAD' });
      }
      if (pathname === '/api/site') {
        return jsonResponse(request, site);
      }
      if (pathname.startsWith('/api/apps/')) {
        const slug = decodeURIComponent(pathname.slice('/api/apps/'.length)).replace(/\/$/, '');
        const app = site.apps.find(app => app.slug === slug);
        return app
          ? jsonResponse(request, app)
          : jsonResponse(request, { error: 'App not found' }, 404);
      }
      return jsonResponse(request, { error: 'API endpoint not found' }, 404);
    }
    const response = await env.ASSETS.fetch(request);
    // Missing images/scripts must not masquerade as the HTML SPA shell.
    if (/\.(?:jsx?|mjs|css|json|png|jpe?g|svg|webp|ico)$/i.test(pathname)
      && response.headers.get('Content-Type')?.includes('text/html')) {
      return new Response('Not found', { status: 404 });
    }
    return response;
  },
};
