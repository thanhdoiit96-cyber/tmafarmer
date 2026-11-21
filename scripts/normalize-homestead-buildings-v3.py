"""Normalize authored homestead buildings; preserve source masters and hard alpha."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
for name, size in [('homestead-workshop', (220, 176)), ('parcel-shelter', (160, 88))]:
    source = root / 'docs' / 'assets' / f'{name}-v3-source.png'
    image = Image.open(source).convert('RGBA')
    alpha = image.getchannel('A')
    if not alpha.getbbox() or alpha.getextrema()[0] != 0:
        raise ValueError(f'{source.name}: transparent alpha required')
    image = image.crop(alpha.getbbox()).resize(size, Image.Resampling.LANCZOS)
    image.putalpha(image.getchannel('A').point(lambda value: 255 if value >= 128 else 0))
    image.save(root / 'public' / 'pixel' / f'{name}-v3.png')
    print(name, size, image.getchannel('A').getextrema())
