"""Regenerate the 2× runtime atlases from the original V2 illustrations."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "docs" / "assets"
OUTPUT = ROOT / "public" / "pixel"
DENSITY = 2
ALPHA_CUTOFF = 128


def source(name):
    with Image.open(SOURCES / name) as image:
        return image.convert("RGBA")


def cell(image, column, row, columns, rows):
    width, height = image.size
    return image.crop((
        column * width // columns, row * height // rows,
        (column + 1) * width // columns, (row + 1) * height // rows,
    ))


def place(atlas, image, x, y, width, height):
    sprite = image.resize((width * DENSITY, height * DENSITY), Image.Resampling.LANCZOS)
    mask = sprite.getchannel("A").point(lambda value: 255 if value >= ALPHA_CUTOFF else 0)
    if mask.getbbox() is None:
        raise ValueError(f"Empty sprite at ({x}, {y})")
    sprite.putalpha(mask)
    atlas.paste(sprite, (x * DENSITY, y * DENSITY), mask)


def main():
    characters = source("character-atlas-v2-source.png")
    character_atlas = Image.new("RGBA", (384 * DENSITY, 128 * DENSITY))
    for row in range(4):
        for col in range(16):
            place(character_atlas, cell(characters, col, row, 16, 4), col * 24, row * 32, 24, 32)
    character_atlas.save(OUTPUT / "characters-v2-hd.png", optimize=True)

    objects = Image.new("RGBA", (384 * DENSITY, 128 * DENSITY))
    place(objects, source("farmhouse-v2-source.png"), 0, 0, 96, 80)
    crops = source("crops-v2-source.png")
    chicken = source("chicken-v2-source.png")
    for row in range(3):
        for col in range(4):
            place(objects, cell(crops, col, row, 4, 3), 96 + col * 24, row * 24, 24, 24)
            frame = row * 4 + col
            place(objects, cell(chicken, col, row, 4, 3), 192 + frame % 8 * 24, frame // 8 * 24, 24, 24)
    objects.save(OUTPUT / "vertical-slice-v2-hd.png", optimize=True)


if __name__ == "__main__":
    main()
