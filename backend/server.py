"""Local studio website: JSON API and built React frontend. No Python dependencies."""
import argparse
import json
import mimetypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'backend' / 'data' / 'site.json'
DIST = ROOT / 'frontend' / 'dist'

class Handler(BaseHTTPRequestHandler):
    def send_body(self, status, body, content_type):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

    def send_json(self, status, payload):
        self.send_body(status, json.dumps(payload, ensure_ascii=False).encode(), 'application/json; charset=utf-8')

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        if '..' in Path(path).parts or '\\' in path:
            return self.send_json(404, {'error': 'Not found'})
        if path.startswith('/api/'):
            try:
                data = json.loads(DATA.read_text(encoding='utf-8'))
            except (OSError, ValueError):
                return self.send_json(500, {'error': 'Website content is unavailable. Check backend/data/site.json.'})
            if path == '/api/site':
                return self.send_json(200, data)
            if path.startswith('/api/apps/'):
                slug = path.removeprefix('/api/apps/').rstrip('/')
                app = next((app for app in data['apps'] if app['slug'] == slug), None)
                return self.send_json(200, app) if app else self.send_json(404, {'error': 'App not found'})
            return self.send_json(404, {'error': 'API endpoint not found'})
        target = (DIST / path.lstrip('/')).resolve()
        if not target.is_relative_to(DIST.resolve()):
            return self.send_json(404, {'error': 'Not found'})
        if path == '/' or (path.startswith('/apps/') and '.' not in path):
            target = DIST / 'index.html'
        if target.is_file():
            return self.send_body(200, target.read_bytes(), mimetypes.guess_type(target)[0] or 'application/octet-stream')
        return self.send_json(404, {'error': 'Not found. Build the frontend with npm run build if needed.'})


def create_server(host='127.0.0.1', port=8000):
    return ThreadingHTTPServer((host, port), Handler)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    server = create_server(args.host, args.port)
    print(f'Studio website: http://{args.host}:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
