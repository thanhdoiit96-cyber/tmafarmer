"""Build six-frame watering and harvest pose atlases from approved farmer sprites."""
from pathlib import Path

from PIL import Image, ImageDraw

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

PALETTES = {
    "female": {
        "ink": "#5b392e", "shade": "#754833", "mid": "#995a39",
        "cloth": "#aa6742", "light": "#c68453", "skin_ink": "#aa704d",
        "skin": "#e4ad7a", "skin_light": "#f3cc96",
    },
    "male": {
        "ink": "#263b38", "shade": "#31534b", "mid": "#456a5d",
        "cloth": "#557969", "light": "#78927a", "skin_ink": "#a97655",
        "skin": "#e1ab7a", "skin_light": "#f1ca95",
    },
}


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


def frame_arm(action, index):
    if action == "water":
        elbow = ((34, 37), (35, 36), (36, 35), (36, 34), (35, 36), (34, 38))[index]
        hand = ((40, 43), (41, 41), (42, 39), (42, 38), (42, 40), (40, 43))[index]
    else:
        elbow = ((34, 37), (35, 39), (37, 42), (36, 42), (35, 39), (34, 36))[index]
        hand = ((40, 41), (42, 44), (42, 47), (42, 46), (41, 43), (40, 40))[index]
    # The same reachable hand path is mirrored for the left-facing profile.
    return [(30, 34), elbow, hand]


def draw_arm(layer, points, palette):
    scale = SOURCE_SCALE
    p = palette
    points = [(x * scale, y * scale) for x, y in points]
    draw = ImageDraw.Draw(layer)
    # A stepped outline, sleeve shade, warm cloth ramp, and a single light seam.
    draw.line(points, fill=p["ink"], width=5 * scale, joint="curve")
    draw.line(points, fill=p["shade"], width=4 * scale, joint="curve")
    draw.line(points, fill=p["mid"], width=3 * scale, joint="curve")
    draw.line([(x, y - scale) for x, y in points], fill=p["cloth"], width=2 * scale, joint="curve")
    draw.line([(x, y - scale) for x, y in points], fill=p["light"], width=scale, joint="curve")

    hx, hy = points[-1]
    # Cuff overlaps the palm so the hand reads as gripping the tool or basket rim.
    draw.rectangle((hx - 2 * scale, hy - 2 * scale, hx + 2 * scale, hy + 2 * scale), fill=p["ink"])
    draw.rectangle((hx - scale, hy - scale, hx + scale, hy + scale), fill=p["skin_ink"])
    draw.rectangle((hx, hy - scale, hx + scale, hy), fill=p["skin"])
    draw.point((hx, hy - scale), fill=p["skin_light"])
    # A short cuff glint keeps the sleeve distinct from the skin at runtime size.
    draw.line([(hx - 2 * scale, hy - 3 * scale), (hx + scale, hy - 2 * scale)], fill=p["light"], width=scale)


def build_avatar(avatar):
    source_atlas = Image.new("RGBA", (ATLAS_COLUMNS * CELL[0] * SOURCE_SCALE,
                                       DIRECTIONS * CELL[1] * SOURCE_SCALE))
    bases = load_bases(avatar)
    for direction, base in enumerate(bases):
        for action_index, action in enumerate(("water", "harvest")):
            for frame in range(FRAMES_PER_ACTION):
                layer = Image.new("RGBA", base.size)
                points = frame_arm(action, frame)
                if direction == 2:
                    points = [(CELL[0] - 1 - x, y) for x, y in points]
                draw_arm(layer, points, PALETTES[avatar])
                pose = base.copy()
                pose.alpha_composite(layer)
                col = action_index * FRAMES_PER_ACTION + frame
                source_atlas.alpha_composite(pose, (col * CELL[0] * SOURCE_SCALE,
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
