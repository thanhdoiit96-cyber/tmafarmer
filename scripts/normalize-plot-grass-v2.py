"""Normalize four authored low grass clusters for crop-bed corners."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
image = Image.open(root / 'docs/assets/plot-edge-grass-v2-source.png').convert('RGBA')
if image.getchannel('A').getextrema()[0] != 0:
    raise ValueError('Grass source requires transparent alpha')
atlas = Image.new('RGBA', (192, 32))
for col in range(4):
    frame = image.crop((round(col*image.width/4), 0, round((col+1)*image.width/4), image.height))
    box = frame.getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox()
    if not box:
        raise ValueError('Missing grass variant')
    sprite = ImageOps.contain(frame.crop(box), (46, 29), Image.Resampling.LANCZOS)
    sprite.putalpha(sprite.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
    atlas.alpha_composite(sprite, (col*48+(48-sprite.width)//2, 31-sprite.height))
atlas.save(root / 'public/pixel/plot-edge-grass-v2.png')
print('Grass atlas 192x32, 4 variants, hard RGBA alpha')
