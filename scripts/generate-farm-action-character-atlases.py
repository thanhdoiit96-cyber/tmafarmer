"""Build safe action atlases from approved sprites without painting duplicate limbs."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CELL = (48, 64)
SOURCE_SCALE = 4
RUNTIME_SCALE = 1
FRAMES_PER_ACTION = 6
ATLAS_COLUMNS = FRAMES_PER_ACTION * 2
DIRECTIONS = 4

SOURCES = {
    "female": ROOT / "public/pixel/characters-v2-hd.png",
    "male": ROOT / "public/pixel/farmer-male-poses.png",
}
SOURCE_OUTPUT = ROOT / "docs/assets/farmer-action-poses-v1-source"
RUNTIME_OUTPUT = ROOT / "public/pixel/farmer-action-poses-v1"

def load_bases(avatar):
    sheet = Image.open(SOURCES[avatar]).convert("RGBA")
    bases = []
    for direction in range(DIRECTIONS):
        # Female idle is column 0; male idle is column 0 of his four-pose atlas.
        frame = sheet.crop((0, direction * CELL[1], CELL[0], (direction + 1) * CELL[1]))
        if frame.size != CELL:
            raise ValueError(f"Unexpected {avatar} frame size: {frame.size}")
        bases.append(frame.resize((CELL[0] * SOURCE_SCALE, CELL[1] * SOURCE_SCALE), Image.Resampling.NEAREST))
    return bases


def build_avatar(avatar):
    source_atlas = Image.new("RGBA", (ATLAS_COLUMNS * CELL[0] * SOURCE_SCALE,
                                       DIRECTIONS * CELL[1] * SOURCE_SCALE))
    bases = load_bases(avatar)
    for direction, base in enumerate(bases):
        for col in range(ATLAS_COLUMNS):
            source_atlas.alpha_composite(base, (col * CELL[0] * SOURCE_SCALE,
                                                 direction * CELL[1] * SOURCE_SCALE))

    source_atlas.save(SOURCE_OUTPUT.with_name(SOURCE_OUTPUT.name + f"-{avatar}.png"), optimize=True)
    runtime = source_atlas.resize((ATLAS_COLUMNS * CELL[0] * RUNTIME_SCALE,
                                   DIRECTIONS * CELL[1] * RUNTIME_SCALE), Image.Resampling.NEAREST)
    runtime.save(RUNTIME_OUTPUT.with_name(RUNTIME_OUTPUT.name + f"-{avatar}.png"), optimize=True)


def main():
    for avatar in SOURCES:
        build_avatar(avatar)


if __name__ == "__main__":
    main()
