from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SPECIES = ('goat', 'sheep')
CELL_WIDTH, CELL_HEIGHT = 56, 48

atlas = Image.new('RGBA', (CELL_WIDTH * len(SPECIES), CELL_HEIGHT))
for column, species in enumerate(SPECIES):
    with Image.open(ROOT / 'docs' / 'assets' / f'{species}-v1-source.png') as source:
        sprite = source.convert('RGBA')
    alpha = sprite.getchannel('A').point(lambda value: 255 if value >= 128 else 0)
    sprite.putalpha(alpha)
    sprite = sprite.crop(alpha.getbbox())
    sprite.thumbnail((CELL_WIDTH - 2, CELL_HEIGHT - 3), Image.Resampling.NEAREST)
    x = column * CELL_WIDTH + (CELL_WIDTH - sprite.width) // 2
    y = CELL_HEIGHT - sprite.height - 1
    atlas.paste(sprite, (x, y))

atlas.save(ROOT / 'public' / 'pixel' / 'livestock-v1.png', optimize=True)
