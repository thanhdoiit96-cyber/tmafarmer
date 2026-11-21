"""Verify a cleanup backup and optionally restore missing files, never overwrite."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('archive', type=Path)
parser.add_argument('--prefix', default='', help='Restore only this project-relative file or folder')
parser.add_argument('--apply', action='store_true', help='Write missing files after verification')
args = parser.parse_args()
archive = args.archive.resolve()
backup_root = (ROOT / '.local/cleanup-backups').resolve()
if not archive.is_relative_to(backup_root):
    parser.error('Archive must be inside .local/cleanup-backups')
prefix = args.prefix.replace('\\', '/').rstrip('/')
with zipfile.ZipFile(archive) as backup:
    manifest = json.loads(backup.read('_cleanup-manifest.json'))
    selected = [entry for entry in manifest['files'] if not prefix or
                entry['path'] == prefix or entry['path'].startswith(prefix + '/')]
    if not selected:
        parser.error('No matching files')
    destinations = []
    for entry in selected:
        name = entry['path']
        target = (ROOT / name).resolve()
        if not target.is_relative_to(ROOT) or target == ROOT or name.startswith(('.git/', '.agents/')):
            raise ValueError('Unsafe archive path: ' + name)
        if args.apply and target.exists():
            raise FileExistsError('Will not overwrite existing file: ' + name)
        if backup.getinfo(name).file_size != entry['bytes']:
            raise ValueError('Incorrect size: ' + name)
        digest = hashlib.sha256()
        with backup.open(name) as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b''):
                digest.update(block)
        if digest.hexdigest() != entry['sha256']:
            raise ValueError('Incorrect checksum: ' + name)
        destinations.append((entry, target))
    print('Verified', len(selected), 'files;', sum(e['bytes'] for e in selected), 'bytes')
    if args.apply:
        for entry, target in destinations:
            target.parent.mkdir(parents=True, exist_ok=True)
            with backup.open(entry['path']) as source, target.open('xb') as output:
                for block in iter(lambda: source.read(1024 * 1024), b''):
                    output.write(block)
        print('Restored missing files')
    else:
        print('Dry run only. Add --apply to restore; existing files are never overwritten.')
