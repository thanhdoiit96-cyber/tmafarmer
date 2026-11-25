"""Export authored dry soil and livestock task symbols with hard alpha."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def clean(image):
    image = image.convert('RGBA')
    image.putalpha(image.getchannel('A').point(lambda a: 255 if a >= 160 else 0))
    return image


source = clean(Image.open(ROOT / 'docs/assets/soil-dry-v1-source.png'))
# Register the entire authored bed to the existing 40x26 world footprint.
soil = clean(source.crop(source.getbbox()).resize((62, 40), Image.Resampling.LANCZOS))
tile = Image.new('RGBA', (64, 42))
tile.paste(soil, (1, 1))
tile.save(ROOT / 'public/pixel/soil-dry-v1.png', optimize=True)

source = clean(Image.open(ROOT / 'docs/assets/animal-task-icons-v1-source.png'))
atlas = Image.new('RGBA', (64, 32))
for index in range(2):
    cell = source.crop((index * source.width // 2, 0,
                        (index + 1) * source.width // 2, source.height))
    cell = cell.crop(cell.getbbox())
    cell.thumbnail((28, 28), Image.Resampling.LANCZOS)
    cell = clean(cell)
    atlas.paste(cell, (index * 32 + (32 - cell.width) // 2, (32 - cell.height) // 2))
atlas.save(ROOT / 'public/pixel/animal-task-icons-v1.png', optimize=True)

preview = Image.new('RGBA', (128, 60))
preview.paste(tile, (0, 9))
preview.paste(atlas, (64, 14))
preview.resize((768, 360), Image.Resampling.NEAREST).save(
    ROOT / 'docs/assets/soil-animal-ui-v1-preview.png')
