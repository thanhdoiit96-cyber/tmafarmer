"""Export the two approved male sprite sheets on the game's 48 × 64 grid."""

from pathlib import Path
from statistics import median
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CELL_W, CELL_H = 48, 64
BASELINE = 59
COLUMN_EDGES = (0, 335, 625, 893, 1254)
ROW_EDGES = (0, 315, 625, 930, 1254)
RATIO = .198


def normalize(source, target):
    image = Image.open(ROOT / "docs/assets" / source).convert("RGBA")
    if image.size != (COLUMN_EDGES[-1], ROW_EDGES[-1]):
        raise ValueError(f"Unexpected sprite sheet size: {image.size}")
    atlas = Image.new("RGBA", (CELL_W * 4, CELL_H * 4))
    for row, (top, bottom) in enumerate(zip(ROW_EDGES, ROW_EDGES[1:])):
        for col, (left, right) in enumerate(zip(COLUMN_EDGES, COLUMN_EDGES[1:])):
            frame = image.crop((left, top, right, bottom))
            alpha = frame.getchannel("A").point(lambda value: 255 if value >= 245 else 0)
            bounds = alpha.getbbox()
            if not bounds:
                raise ValueError(f"Empty sprite at row {row}, column {col}")
            # Anchor to the hat instead of the bounding box, whose centre moves when a hoe is raised.
            pixels = frame.load()
            straw = []
            for y in range(max(bounds[1], bounds[3] - 266), bounds[3] - 165):
                for x in range(bounds[0], bounds[2]):
                    r, g, b, a = pixels[x, y]
                    if a >= 245 and r >= 207 and g >= 146 and 92 <= b < g < r:
                        straw.append(x)
            anchor = median(straw) if straw else (bounds[0] + bounds[2]) / 2
            frame.putalpha(alpha)
            frame = frame.crop(bounds)
            width, height = (round(axis * RATIO) for axis in frame.size)
            frame = frame.resize((width, height), Image.Resampling.LANCZOS)
            mask = frame.getchannel("A").point(lambda value: 255 if value >= 145 else 0)
            crisp = Image.new("RGBA", frame.size)
            crisp.paste(frame.convert("RGB"), (0, 0), mask)
            x = max(1, min(CELL_W - width - 1, round(CELL_W / 2 - (anchor - bounds[0]) * RATIO)))
            atlas.paste(crisp, (col * CELL_W + x, row * CELL_H + BASELINE - height))
    atlas.save(ROOT / "public/pixel" / target, optimize=True)


normalize("farmer-male-walk-source.png", "farmer-male-walk.png")
normalize("farmer-male-poses-source.png", "farmer-male-poses.png")
