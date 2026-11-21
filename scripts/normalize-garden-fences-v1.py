"""Normalize six authored fence modules without changing game footprints."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
image = Image.open(root / 'docs/assets/garden-fences-v1-source.png').convert('RGBA')
if image.getchannel('A').getextrema()[0] != 0:
    raise ValueError('Fence source needs real transparent alpha')
atlas = Image.new('RGBA', (192, 288))
for row in range(3):
    for col in range(2):
        # The authored horizontal modules occupy the wider left column.
        left, right = (0, round(image.width*.68)) if col == 0 else (round(image.width*.68), image.width)
        frame = image.crop((left, round(row*image.height/3), right, round((row+1)*image.height/3)))
        bounds = frame.getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox()
        if not bounds:
            raise ValueError('Missing fence segment')
        sprite = ImageOps.contain(frame.crop(bounds), (96, 36) if col == 0 else (36, 96), Image.Resampling.LANCZOS)
        sprite.putalpha(sprite.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
        x = (96-sprite.width)//2 if col == 0 else 126+(36-sprite.width)//2
        y = row*96+96-sprite.height
        atlas.alpha_composite(sprite, (x, y))
atlas.save(root / 'public/pixel/garden-fences-v1.png')
print('Fence atlas 192x288, three styles, horizontal and side modules, alpha 0/255')
