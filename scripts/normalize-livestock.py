from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SPECIES = ('goat', 'sheep')
CELL_WIDTH, CELL_HEIGHT = 56, 48

atlas = Image.new('RGBA', (CELL_WIDTH * (len(SPECIES) + 2), CELL_HEIGHT))


def place(sprite, column, threshold):
    alpha = sprite.getchannel('A').point(lambda value: 255 if value >= threshold else 0)
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError(f'Empty livestock frame {column}')
    sprite.putalpha(alpha)
    sprite = sprite.crop(bounds)
    sprite.thumbnail((CELL_WIDTH - 2, CELL_HEIGHT - 3), Image.Resampling.NEAREST)
    x = column * CELL_WIDTH + (CELL_WIDTH - sprite.width) // 2
    y = CELL_HEIGHT - sprite.height - 1
    atlas.paste(sprite, (x, y))


for column, species in enumerate(SPECIES):
    with Image.open(ROOT / 'docs' / 'assets' / f'{species}-v1-source.png') as source:
        place(source.convert('RGBA'), column, 128)

with Image.open(ROOT / 'docs' / 'assets' / 'livestock-goose-rabbit-source.png') as source:
    sheet = source.convert('RGBA')
    middle = sheet.width // 2
    for column, (left, right) in enumerate(((0, middle), (middle, sheet.width)), start=len(SPECIES)):
        place(sheet.crop((left, 0, right, sheet.height)), column, 245)

atlas.save(ROOT / 'public' / 'pixel' / 'livestock-v2.png', optimize=True)
