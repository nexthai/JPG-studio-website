"""Run the Python API and React development server; Ctrl+C stops both."""
import signal
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
children = []

def stop(*_):
    for child in children:
        if child.poll() is None:
            child.terminate()
    for child in children:
        try:
            child.wait(timeout=5)
        except subprocess.TimeoutExpired:
            child.kill()
            child.wait()

if __name__ == '__main__':
    if not (ROOT / 'frontend' / 'node_modules' / 'vite').exists():
        sys.exit('Please run: cd frontend && npm install')
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
    try:
        children.append(subprocess.Popen([sys.executable, str(ROOT / 'backend' / 'server.py')]))
        children.append(subprocess.Popen(['node', str(ROOT / 'frontend' / 'node_modules' / 'vite' / 'bin' / 'vite.js'), '--host', '127.0.0.1'], cwd=ROOT / 'frontend'))
        print('Open http://127.0.0.1:5173 — Ctrl+C stops both servers.', flush=True)
        while all(child.poll() is None for child in children):
            try:
                children[0].wait(timeout=0.5)
            except subprocess.TimeoutExpired:
                pass
        sys.exit(next((child.returncode for child in children if child.returncode), 0))
    except KeyboardInterrupt:
        pass
    finally:
        stop()
