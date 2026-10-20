import importlib.util
import json
import threading
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen

MODULE = Path(__file__).resolve().parents[1] / 'server.py'

class ServerContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not MODULE.exists():
            return
        spec = importlib.util.spec_from_file_location('studio_server', MODULE)
        cls.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.module)
        cls.server = cls.module.create_server('127.0.0.1', 0)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, 'server'):
            cls.server.shutdown()
            cls.server.server_close()

    def setUp(self):
        self.assertTrue(MODULE.exists(), 'Python website server is not implemented yet')

    def get_json(self, path):
        with urlopen(self.base + path) as response:
            return json.load(response)

    def test_home_content_and_app_details_share_editable_data(self):
        site = self.get_json('/api/site')
        self.assertEqual(site['studio']['name'], 'JPG studio')
        self.assertEqual([app['slug'] for app in site['apps']], ['dailytodo'])
        for app in site['apps']:
            self.assertEqual(self.get_json('/api/apps/' + app['slug']), app)

    def test_privacy_page_serves_complete_policy_instead_of_spa_shell(self):
        with urlopen(self.base + '/apps/dailytodo/privacy') as response:
            self.assertEqual(response.status, 200)
            self.assertIn('text/html', response.headers.get('Content-Type'))
            html = response.read().decode('utf-8')
        self.assertIn('PRIVACY POLICY', html)
        self.assertIn('DailyChecks - Track Daily Wins', html)
        self.assertIn('12. HOW CAN YOU REVIEW, UPDATE, OR DELETE', html)
        self.assertIn('nexthaitian@gmail.com', html)
        self.assertNotIn('type="module"', html)

    def test_unknown_app_returns_json_404(self):
        with self.assertRaises(HTTPError) as error:
            urlopen(self.base + '/api/apps/does-not-exist')
        self.assertEqual(error.exception.code, 404)
        self.assertIn('error', json.load(error.exception))
        error.exception.close()

    def test_missing_image_is_not_served_as_html(self):
        with self.assertRaises(HTTPError) as error:
            urlopen(self.base + '/images/missing.png')
        self.assertEqual(error.exception.code, 404)
        error.exception.close()

    def test_encoded_traversal_cannot_read_project_files(self):
        with self.assertRaises(HTTPError) as error:
            urlopen(self.base + '/%2e%2e/backend/data/site.json')
        self.assertEqual(error.exception.code, 404)
        error.exception.close()

if __name__ == '__main__':
    unittest.main()
