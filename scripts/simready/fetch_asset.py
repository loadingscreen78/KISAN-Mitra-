"""Download the parts of one SimReady asset needed for a web model.

Fetches the root USD, the base/geometry/instance payloads, the 512px texture
copies, the transparent thumbnail render and the licence. Physics payloads and
full resolution textures are skipped.

usage: fetch_asset.py <asset_name> <dest_root>
"""
import json
import pathlib
import sys
import urllib.request

asset, dest_root = sys.argv[1], pathlib.Path(sys.argv[2])
thumb_only = len(sys.argv) > 3 and sys.argv[3] == 'thumb'
API = f'https://huggingface.co/api/datasets/nvidia/simready-assets/tree/main/{asset}?recursive=true'
RAW = 'https://huggingface.co/datasets/nvidia/simready-assets/resolve/main/'

with urllib.request.urlopen(API, timeout=60) as response:
    entries = [e for e in json.load(response) if e['type'] == 'file']


def wanted(path: str) -> bool:
    rel = path.split('/', 1)[1]
    if thumb_only:
        return rel == '.metadata/LICENSE.txt' or (rel.endswith('.usd_transparent.png') and '/256x256/' in rel)
    if rel == '.metadata/LICENSE.txt':
        return True
    if rel.startswith('simready_usd/') and rel.count('/') == 1 and rel.endswith('.usd'):
        return True
    if rel.startswith('simready_usd/payloads/') and rel.endswith(('.usd', '.usda')):
        return True
    if '/Textures/.thumbs/512x512/' in rel:
        return True
    if rel.endswith('.usd_transparent.png') and '/256x256/' in rel:
        return True
    return False


total = 0
for entry in entries:
    if not wanted(entry['path']):
        continue
    target = dest_root / entry['path']
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists() or target.stat().st_size != entry.get('size'):
        urllib.request.urlretrieve(RAW + entry['path'], target)
    total += entry.get('size', 0)
print(f'{asset}: {total / 1e6:.1f} MB')
