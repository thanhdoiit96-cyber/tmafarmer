"""Draw the farm-action prop atlas in the game's established hard-pixel palette."""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "assets" / "farm-action-atlas-v1-source.png"
OUTPUT = ROOT / "public" / "pixel" / "farm-action-atlas-v1.png"
SCALE = 2
CELL = (24, 16)

INK = "#403b2e"
WOOD_DARK = "#68472f"
WOOD = "#9a6740"
WOOD_LIGHT = "#d5a15b"
CREAM = "#f2d590"
TIN_DARK = "#47584d"
TIN = "#8ba59a"
TIN_LIGHT = "#c7d7b8"
WATER = "#72cbc5"
WATER_LIGHT = "#d0f0d7"
GREEN = "#5d8b49"
RED = "#c6533c"
GOLD = "#e4a832"


def rect(draw, xy, color):
    draw.rectangle(xy, fill=color)


def watering_can(frame):
    image = Image.new("RGBA", CELL)
    d = ImageDraw.Draw(image)
    # Low, rounded enamel body with a readable dark outline and two light ramps.
    tilt = [0, 0, -1, -1][frame]
    x, y = 7, 6 + tilt
    rect(d, (x + 2, y, x + 10, y + 1), INK)
    rect(d, (x, y + 2, x + 12, y + 8), INK)
    rect(d, (x + 1, y + 1, x + 11, y + 7), TIN_DARK)
    rect(d, (x + 2, y + 2, x + 9, y + 6), TIN)
    rect(d, (x + 3, y + 2, x + 6, y + 3), TIN_LIGHT)
    rect(d, (x + 2, y + 6, x + 10, y + 6), INK)
    # Handle and rivets are built into the same pixel silhouette.
    rect(d, (x + 3, y - 1, x + 7, y - 1), WOOD_DARK)
    rect(d, (x + 3, y, x + 3, y + 1), WOOD_LIGHT)
    rect(d, (x + 2, y + 3, x + 2, y + 3), CREAM)
    rect(d, (x + 9, y + 3, x + 9, y + 3), TIN_LIGHT)
    # Slanted spout and a perforated rose; its direction follows the pour.
    if frame < 2:
        rect(d, (x + 11, y + 2, x + 14, y + 2), TIN_DARK)
        rect(d, (x + 13, y + 1, x + 15, y + 1), TIN)
        rect(d, (x + 15, y, x + 17, y + 1), INK)
        rect(d, (x + 16, y, x + 16, y), TIN_LIGHT)
    else:
        rect(d, (x + 11, y + 4, x + 14, y + 4), TIN_DARK)
        rect(d, (x + 13, y + 5, x + 15, y + 5), TIN)
        rect(d, (x + 15, y + 5, x + 17, y + 6), INK)
        rect(d, (x + 16, y + 5, x + 16, y + 5), TIN_LIGHT)
    # A small alternating stream keeps the pour legible without visual noise.
    if frame == 1:
        rect(d, (21, 8, 21, 9), WATER)
        rect(d, (20, 11, 20, 11), WATER_LIGHT)
    elif frame == 2:
        rect(d, (21, 12, 21, 13), WATER)
        rect(d, (19, 14, 20, 14), WATER_LIGHT)
    elif frame == 3:
        rect(d, (20, 13, 20, 14), WATER)
        rect(d, (17, 14, 18, 14), WATER_LIGHT)
    return image


def harvest_basket(frame):
    image = Image.new("RGBA", CELL)
    d = ImageDraw.Draw(image)
    # Willow rim, curved sides, and alternating weave highlight.
    rect(d, (5, 7, 18, 8), INK)
    rect(d, (6, 8, 17, 8), WOOD_LIGHT)
    rect(d, (6, 9, 17, 13), WOOD_DARK)
    rect(d, (7, 9, 16, 12), WOOD)
    rect(d, (8, 9, 8, 12), WOOD_LIGHT)
    rect(d, (11, 9, 11, 12), WOOD_LIGHT)
    rect(d, (14, 9, 14, 12), WOOD_LIGHT)
    rect(d, (7, 13, 16, 13), INK)
    rect(d, (8, 12, 15, 12), WOOD_LIGHT)
    # Arched handle rises behind produce.
    rect(d, (8, 4, 8, 6), WOOD_DARK)
    rect(d, (9, 3, 14, 3), WOOD_DARK)
    rect(d, (15, 4, 15, 6), WOOD_DARK)
    rect(d, (9, 4, 9, 5), WOOD_LIGHT)
    rect(d, (10, 4, 13, 4), WOOD)
    # Produce enters progressively as the collection action completes.
    fruit = [
        [(10, 7, 12, 8, GOLD), (13, 7, 15, 8, GREEN), (11, 6, 11, 6, CREAM)],
        [(8, 6, 10, 8, RED), (11, 5, 13, 8, GOLD), (14, 6, 16, 8, GREEN)],
        [(7, 5, 9, 8, GREEN), (10, 4, 12, 8, RED), (13, 5, 15, 8, GOLD)],
        [(7, 5, 9, 8, RED), (10, 4, 12, 8, GOLD), (13, 5, 15, 8, GREEN)],
    ][frame]
    for x1, y1, x2, y2, color in fruit:
        rect(d, (x1, y1, x2, y2), color)
        rect(d, (x1, y1, x1, y1), CREAM)
    # Tiny leaf tips tie the harvest to the existing crop greens.
    rect(d, (8, 4, 9, 4), GREEN)
    rect(d, (14, 4, 15, 4), GREEN)
    return image


def main():
    source = Image.new("RGBA", (CELL[0] * 4, CELL[1] * 2))
    for frame in range(4):
        source.alpha_composite(watering_can(frame), (frame * CELL[0], 0))
        source.alpha_composite(harvest_basket(frame), (frame * CELL[0], CELL[1]))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    SOURCE.parent.mkdir(parents=True, exist_ok=True)
    source.save(SOURCE, optimize=True)
    source.resize((source.width * SCALE, source.height * SCALE), Image.Resampling.NEAREST).save(OUTPUT, optimize=True)


if __name__ == "__main__":
    main()
