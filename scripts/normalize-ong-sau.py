"""Export the approved four-cell NPC master; preserve registration and real alpha."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/assets/ong-sau-idle-source-v1.png'
TARGET = ROOT / 'public/pixel/ong-sau-idle-v1.png'

image = Image.open(SOURCE).convert('RGBA')
assert image.width % 4 == 0
width = image.width // 4
cells = [image.crop((i * width, 0, (i + 1) * width, image.height)) for i in range(4)]
for cell in cells:
    cell.putalpha(cell.getchannel('A').point(lambda p: 255 if p >= 128 else 0))
boxes = [cell.getchannel('A').getbbox() for cell in cells]
assert all(boxes)
box = (min(b[0] for b in boxes), min(b[1] for b in boxes),
       max(b[2] for b in boxes), max(b[3] for b in boxes))
factor = min(44 / (box[2] - box[0]), 58 / (box[3] - box[1]))
size = (round((box[2] - box[0]) * factor), round((box[3] - box[1]) * factor))
atlas = Image.new('RGBA', (192, 64))
for i, cell in enumerate(cells):
    sprite = cell.crop(box).resize(size, Image.Resampling.LANCZOS)
    sprite.putalpha(sprite.getchannel('A').point(lambda p: 255 if p >= 128 else 0))
    atlas.alpha_composite(sprite, (i * 48 + (48 - size[0]) // 2, 59 - size[1]))
assert len({atlas.crop((i * 48, 0, (i + 1) * 48, 64)).tobytes() for i in range(4)}) == 4
assert set(atlas.getchannel('A').tobytes()) == {0, 255}
atlas.save(TARGET, optimize=True)
review = Image.new('RGBA', (768, 256), '#e8dfc9')
review.alpha_composite(atlas.resize((768, 256), Image.Resampling.NEAREST))
review.convert('RGB').save(ROOT / 'docs/assets/ong-sau-idle-review-v1.png', optimize=True)
print(f'{TARGET.relative_to(ROOT)}: 192x64 RGBA, four 48x64 cells, common crop {box}, baseline 59')
