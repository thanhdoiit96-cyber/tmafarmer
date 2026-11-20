"""Build full-body action atlases from the approved farmer sprites."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
CELL_W, CELL_H = 48, 64
SCALE = 4
FRAMES = 4
ACTIONS = ("water", "fertilize", "spray", "harvest", "feed")
DIRECTIONS = 4
ATLAS_COLUMNS = len(ACTIONS) * FRAMES

SOURCES = {
    "female": (ROOT / "public/pixel/characters-v2-hd.png", tuple(range(4))),
    "male": (ROOT / "public/pixel/farmer-male-poses.png", (0, 0, 0, 0)),
}


def load_bases(avatar):
    source, idle_columns = SOURCES[avatar]
    sheet = Image.open(source).convert("RGBA")
    bases = []
    for direction in range(DIRECTIONS):
        row = []
        for column in idle_columns:
            cell = sheet.crop((column * CELL_W, direction * CELL_H,
                               (column + 1) * CELL_W, (direction + 1) * CELL_H))
            if cell.size != (CELL_W, CELL_H):
                raise ValueError(f"Unexpected {avatar} frame size: {cell.size}")
            row.append(cell)
        bases.append(row)
    return bases


def action_body(base, action, frame):
    """Squash the complete sprite by a few pixels, anchoring its feet."""
    crouch = {
        "water": (0, 0, 1, 0),
        "fertilize": (0, 1, 2, 0),
        "spray": (0, 1, 2, 0),
        "harvest": (0, 1, 3, 1),
        "feed": (0, 1, 3, 1),
    }[action][frame]
    bounds = base.getchannel("A").getbbox()
    body = base.crop(bounds)
    if crouch:
        body = body.resize((body.width, max(1, body.height - crouch)), Image.Resampling.NEAREST)
    result = Image.new("RGBA", base.size)
    left = (CELL_W - body.width) // 2
    top = min(CELL_H - 1, bounds[3] - body.height)
    result.alpha_composite(body, (left, top))
    return result


def draw_water(draw, x, y, frame):
    ink, shade, body, light = "#514235", "#527d7a", "#86b8ae", "#c5ded0"
    draw.polygon([(x+3,y+2),(x+8,y+1),(x+11,y+4),(x+10,y+10),
                  (x+3,y+10),(x+1,y+8),(x+2,y+3)], fill=ink)
    draw.polygon([(x+3,y+3),(x+7,y+2),(x+10,y+4),(x+9,y+9),
                  (x+3,y+9),(x+2,y+7)], fill=body)
    draw.rectangle((x+3,y+3,x+6,y+4), fill=light)
    draw.rectangle((x+8,y+5,x+9,y+8), fill=shade)
    draw.line([(x+3,y+2),(x+4,y),(x+8,y),(x+10,y+3)], fill=ink, width=1)
    draw.line([(x+4,y+2),(x+5,y+1),(x+7,y+1),(x+8,y+3)], fill=light, width=1)
    draw.line([(x+10,y+4),(x+13,y+3),(x+14,y+4)], fill=ink, width=1)
    draw.point((x+13,y+4), fill=light)
    if frame in (1, 2):
        drops = ((x+14,y+7),(x+15,y+9),(x+13,y+11)) if frame == 2 else ((x+14,y+7),)
        for point in drops:
            draw.point(point, fill="#78c5bd")
            draw.point((point[0], point[1]+1), fill="#b3e4d7")


def draw_fertilizer(draw, x, y, frame):
    ink, shade, bag, light = "#4b4934", "#627b45", "#a6ae62", "#d4d38a"
    draw.polygon([(x+2,y+3),(x+4,y+1),(x+10,y+1),(x+12,y+3),
                  (x+11,y+11),(x+3,y+11)], fill=ink)
    draw.polygon([(x+3,y+3),(x+5,y+2),(x+9,y+2),(x+11,y+3),
                  (x+10,y+10),(x+4,y+10)], fill=bag)
    draw.rectangle((x+5,y,x+9,y+1), fill=ink)
    draw.rectangle((x+5,y+1,x+8,y+2), fill=light)
    draw.line([(x+4,y+4),(x+9,y+4)], fill=light, width=1)
    draw.point((x+6,y+6), fill=shade)
    draw.point((x+8,y+7), fill=shade)
    if frame in (1, 2):
        grains = ((13,9),(14,11),(12,12)) if frame == 2 else ((13,10),)
        for dx, dy in grains:
            draw.point((x+dx,y+dy), fill="#d4bb72")


def draw_spray(draw, x, y, frame):
    ink, shade, bottle, light = "#3c4937", "#557b4d", "#87aa67", "#d4dca0"
    draw.polygon([(x+4,y+3),(x+10,y+3),(x+11,y+5),(x+10,y+11),
                  (x+3,y+11),(x+2,y+9),(x+3,y+5)], fill=ink)
    draw.polygon([(x+4,y+4),(x+9,y+4),(x+10,y+5),(x+9,y+10),
                  (x+4,y+10),(x+3,y+9),(x+4,y+5)], fill=bottle)
    draw.rectangle((x+5,y+1,x+8,y+3), fill=ink)
    draw.rectangle((x+6,y,x+9,y+2), fill=shade)
    draw.point((x+7,y+1), fill=light)
    draw.line([(x+3,y+6),(x+1,y+5),(x,y+5)], fill=ink, width=1)
    draw.point((x+4,y+6), fill=light)
    if frame in (1, 2, 3):
        count = 2 if frame == 1 else 4
        for index in range(count):
            dx = 12 + (index % 2) * 2 + ((frame + index) % 2)
            dy = 4 + (index * 3 + frame) % 7
            draw.point((x+dx,y+dy), fill="#a9d4a1")
            if frame >= 2 and index % 2 == 0:
                draw.point((x+dx+1,y+dy), fill="#d8e5ad")


def draw_harvest(draw, x, y, frame):
    ink, shade, wicker, light = "#51392b", "#805333", "#a87342", "#d39b58"
    draw.line([(x+2,y+4),(x+4,y+1),(x+10,y+1),(x+12,y+4)], fill=ink, width=1)
    draw.polygon([(x+1,y+4),(x+13,y+4),(x+11,y+11),(x+3,y+11)], fill=ink)
    draw.polygon([(x+2,y+5),(x+12,y+5),(x+10,y+10),(x+4,y+10)], fill=wicker)
    draw.line([(x+3,y+6),(x+11,y+6)], fill=light, width=1)
    draw.line([(x+4,y+8),(x+10,y+8)], fill=shade, width=1)
    draw.line([(x+5,y+5),(x+5,y+10)], fill=shade, width=1)
    draw.line([(x+9,y+5),(x+9,y+10)], fill=light, width=1)
    if frame >= 1:
        draw.polygon([(x+3,y+3),(x+4,y),(x+7,y+1),(x+7,y+4)], fill="#b94c3d")
        draw.point((x+5,y), fill="#71904c")
    if frame >= 2:
        draw.polygon([(x+7,y+3),(x+8,y),(x+11,y+1),(x+11,y+4)], fill="#e2bb63")
        draw.point((x+9,y), fill="#789451")
    if frame == 3:
        draw.point((x+12,y+2), fill="#a8bf69")


def draw_feed(draw, x, y, frame):
    ink, shade, wood, grain = "#4d392c", "#765039", "#a36e41", "#e5c575"
    draw.polygon([(x+1,y+3),(x+13,y+3),(x+11,y+10),(x+3,y+10)], fill=ink)
    draw.polygon([(x+2,y+4),(x+12,y+4),(x+10,y+9),(x+4,y+9)], fill=wood)
    draw.line([(x+3,y+5),(x+11,y+5)], fill=grain, width=1)
    draw.line([(x+4,y+8),(x+10,y+8)], fill=shade, width=1)
    for dx, dy in ((5,3),(7,2),(9,3),(11,2)):
        draw.point((x+dx,y+dy), fill=grain)
    if frame >= 1:
        crumbs = ((13,6),(14,8),(12,10)) if frame == 2 else ((13,7),)
        for dx, dy in crumbs:
            draw.point((x+dx,y+dy), fill=grain)
    draw.polygon([(x+3,y+13),(x+5,y+11),(x+9,y+11),(x+11,y+13),
                  (x+10,y+15),(x+4,y+15)], fill="#b79c68")
    draw.ellipse((x+9,y+10,x+12,y+13), fill="#e4d2a2")
    draw.point((x+12,y+12), fill="#c98248")
    draw.point((x+10,y+11), fill="#342c25")
    draw.line([(x+5,y+15),(x+5,y+16)], fill=shade)
    draw.line([(x+9,y+15),(x+9,y+16)], fill=shade)


DRAW_TOOL = {"water": draw_water, "fertilize": draw_fertilizer, "spray": draw_spray,
             "harvest": draw_harvest, "feed": draw_feed}


def tool_origin(direction, action, frame):
    x = 30
    y = {"water": (34,34,35,34), "fertilize": (36,37,38,36),
         "spray": (36,37,38,36),
         "harvest": (37,38,39,37), "feed": (38,39,41,38)}[action][frame]
    return x, y


def build_avatar(avatar):
    bases = load_bases(avatar)
    source_atlas = Image.new("RGBA", (ATLAS_COLUMNS * CELL_W * SCALE,
                                       DIRECTIONS * CELL_H * SCALE))
    for direction in range(DIRECTIONS):
        for action_index, action in enumerate(ACTIONS):
            for frame in range(FRAMES):
                pose = action_body(bases[direction][frame], action, frame)
                tool_layer = Image.new("RGBA", (CELL_W, CELL_H))
                tool_draw = ImageDraw.Draw(tool_layer)
                x, y = tool_origin(direction, action, frame)
                DRAW_TOOL[action](tool_draw, x, y, frame)
                if direction == 2:
                    tool_layer = ImageOps.mirror(tool_layer)
                pose.alpha_composite(tool_layer)
                col = action_index * FRAMES + frame
                high_res = pose.resize((CELL_W * SCALE, CELL_H * SCALE), Image.Resampling.NEAREST)
                source_atlas.alpha_composite(high_res,
                    (col * CELL_W * SCALE, direction * CELL_H * SCALE))
    source_path = ROOT / "docs/assets" / f"farmer-action-atlas-v1-source-{avatar}.png"
    runtime_path = ROOT / "public/pixel" / f"farmer-action-atlas-v1-{avatar}.png"
    source_atlas.save(source_path, optimize=True)
    runtime = source_atlas.resize((ATLAS_COLUMNS * CELL_W, DIRECTIONS * CELL_H),
                                  Image.Resampling.NEAREST)
    runtime.save(runtime_path, optimize=True)


def main():
    for avatar in SOURCES:
        build_avatar(avatar)


if __name__ == "__main__":
    main()
