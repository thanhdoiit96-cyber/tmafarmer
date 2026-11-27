"""Normalize approved three-region source per cell; preserve original master."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'docs/assets/lotus-three-regions-source-v1.png').convert('RGBA')
atlas = Image.new('RGBA', (224, 144))
limits = [(44, 35), (32, 43), (48, 34), (27, 26)]
for row in range(3):
    for col in range(4):
        box = (round(col * source.width / 4), round(row * source.height / 3), round((col+1) * source.width / 4), round((row+1) * source.height / 3))
        cell = source.crop(box)
        alpha = cell.getchannel('A').point(lambda a: 255 if a >= 160 else 0)
        cell.putalpha(alpha)
        bounds = alpha.getbbox()
        if bounds is None:
            raise ValueError('Empty cell')
        cell = cell.crop(bounds)
        cell.thumbnail(limits[col], Image.Resampling.LANCZOS)
        cell.putalpha(cell.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
        atlas.alpha_composite(cell, (col*56+(56-cell.width)//2, row*48+45-cell.height))
for row in range(3):
    for col in range(4):
        bounds = atlas.crop((col*56,row*48,(col+1)*56,(row+1)*48)).getchannel('A').getbbox()
        assert bounds and bounds[0]>0 and bounds[1]>0 and bounds[2]<56 and bounds[3]<48, (row,col,bounds)
assert {value for count,value in atlas.getchannel('A').getcolors()} == {0,255}
atlas.save(root / 'public/pixel/lotus-porch-v1.png', optimize=True)
# One small comparison sheet at integer zoom; never ship it as runtime art.
atlas.resize((896,576), Image.Resampling.NEAREST).save(root / 'docs/assets/lotus-three-regions-runtime-v1.png', optimize=True)
print('source', source.size, 'alpha', source.getchannel('A').getextrema(), 'runtime', atlas.size)
