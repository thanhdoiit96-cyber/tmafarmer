"""Register authored extension aisles to the world grid; export runtime plates."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'docs/assets/expansion-terrain-v7-source.png').convert('RGB')
# Authored stone centerlines registered to their world-space centerlines.
sx = [0, 350, 884, 1340, 1544]
sy = [0, 50, 244, 436, 628, 825, 1018]
dx = [0, 205, 478, 716, 820]
dy = [0, 27, 143, 259, 375, 491, 540]
sx = [round(x * source.width / 1544) for x in sx]
sy = [round(y * source.height / 1018) for y in sy]
out = Image.new('RGB', (1640, 1080))
for row in range(len(sy)-1):
    for col in range(len(sx)-1):
        cell = source.crop((sx[col], sy[row], sx[col+1], sy[row+1]))
        cell = cell.resize(((dx[col+1]-dx[col])*2, (dy[row+1]-dy[row])*2), Image.Resampling.LANCZOS)
        out.paste(cell, (dx[col]*2, dy[row]*2))
out.save(root / 'public/pixel/expansion-terrain-v7.png', optimize=True)

pond_source = root / 'docs/assets/parcel-pond-v7-source.png'
if pond_source.exists():
    pond = Image.open(pond_source).convert('RGBA')
    alpha = pond.getchannel('A')
    if alpha.getextrema()[0] != 0 or not alpha.getbbox():
        raise ValueError('Pond source must have real alpha')
    pond = pond.crop(alpha.getbbox()).resize((364, 188), Image.Resampling.LANCZOS)
    pond.putalpha(pond.getchannel('A').point(lambda value: 255 if value >= 128 else 0))
    pond.save(root / 'public/pixel/parcel-pond-v7.png', optimize=True)

grove_source = root / 'docs/assets/parcel-grove-v7-source.png'
if grove_source.exists():
    grove = Image.open(grove_source).convert('RGBA')
    alpha = grove.getchannel('A')
    if alpha.getextrema()[0] != 0 or not alpha.getbbox():
        raise ValueError('Grove source must have real alpha')
    grove = grove.crop(alpha.getbbox()).resize((120, 60), Image.Resampling.LANCZOS)
    grove.putalpha(grove.getchannel('A').point(lambda value: 255 if value >= 128 else 0))
    grove.save(root / 'public/pixel/parcel-grove-v7.png', optimize=True)
