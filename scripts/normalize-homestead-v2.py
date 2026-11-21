"""Export approved transparent homestead props without changing their artwork."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
for name, size in [('parcel-shelter', (96, 80)), ('parcel-pond', (360, 80))]:
    source = root / 'docs' / 'assets' / f'{name}-v2-source.png'
    image = Image.open(source).convert('RGBA')
    bounds = image.getchannel('A').getbbox()
    if not bounds or image.getchannel('A').getextrema()[0] != 0:
        raise ValueError(f'{source.name} must have a real transparent background')
    image = image.crop(bounds).resize(size, Image.Resampling.LANCZOS)
    image.putalpha(image.getchannel('A').point(lambda alpha: 255 if alpha >= 128 else 0))
    image.save(root / 'public' / 'pixel' / f'{name}-v2.png')
    print(name, size)
