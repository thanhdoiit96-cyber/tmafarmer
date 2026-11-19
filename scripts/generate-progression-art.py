from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SCALE = 4


def rgba(size):
    return Image.new('RGBA', size, (0, 0, 0, 0))


def rect(d, box, color):
    d.rectangle(box, fill=color)


def poly(d, points, color):
    d.polygon(points, fill=color)


def line(d, points, color, width=1):
    d.line(points, fill=color, width=width, joint='curve')


def soil(d, wet=False):
    # A compact, warm field mound shared by all four growth stages.
    poly(d, [(5, 36), (10, 33), (17, 32), (24, 33), (33, 32), (42, 35), (43, 39), (38, 42), (10, 42), (5, 39)], '#704b35')
    poly(d, [(8, 35), (14, 33), (22, 34), (31, 33), (39, 36), (36, 38), (12, 38)], '#a96e43')
    rect(d, (11, 35, 17, 35), '#d99b5c')
    rect(d, (31, 34, 35, 34), '#d99b5c')
    rect(d, (9, 39, 13, 39), '#503b30')
    rect(d, (34, 40, 39, 40), '#503b30')
    if wet:
        rect(d, (6, 39, 41, 40), '#477c7b')
        rect(d, (12, 39, 17, 39), '#88b8a5')


def leaf(d, x, y, color, flip=False):
    if flip:
        poly(d, [(x, y + 3), (x + 5, y), (x + 9, y + 1), (x + 6, y + 5), (x + 2, y + 6)], color)
        line(d, [(x + 1, y + 4), (x + 7, y + 1)], '#b2c87b')
    else:
        poly(d, [(x, y + 1), (x + 4, y), (x + 8, y + 4), (x + 5, y + 6), (x + 1, y + 4)], color)
        line(d, [(x + 1, y + 2), (x + 6, y + 4)], '#b2c87b')


def coffee(stage):
    im = rgba((48, 48)); d = ImageDraw.Draw(im); soil(d)
    if stage == 0:
        line(d, [(24, 34), (24, 30), (22, 28)], '#4f7541', 2)
        leaf(d, 17, 26, '#76a451'); leaf(d, 23, 26, '#91b85a', True)
    elif stage == 1:
        line(d, [(24, 34), (24, 23)], '#654a37', 2)
        for x, y, flip in [(15, 23, False), (23, 20, True), (18, 17, True), (25, 15, False), (28, 23, True)]:
            leaf(d, x, y, '#527f46' if y % 2 else '#79a550', flip)
    elif stage == 2:
        line(d, [(24, 34), (24, 17), (18, 13), (27, 18), (32, 14)], '#604936', 2)
        for x, y, f in [(12, 19, False), (17, 13, True), (22, 9, False), (26, 11, True), (31, 9, False), (30, 18, True), (20, 20, False)]:
            leaf(d, x, y, '#568147' if y % 2 else '#86aa55', f)
        for x, y in [(20, 17), (27, 20), (30, 13)]: rect(d, (x, y, x + 1, y + 2), '#6ea74f')
    else:
        line(d, [(24, 34), (24, 16), (16, 12), (29, 17), (34, 12)], '#604936', 2)
        for x, y, f in [(10, 19, False), (15, 12, True), (20, 8, False), (26, 10, True), (32, 8, False), (31, 18, True), (19, 20, False), (35, 16, True)]:
            leaf(d, x, y, '#507a42' if y % 2 else '#84a94f', f)
        for x, y in [(18, 18), (21, 21), (28, 19), (32, 16), (29, 12)]:
            rect(d, (x, y, x + 2, y + 2), '#a63f38'); rect(d, (x, y, x, y), '#f18455')
    return im


def lotus(stage):
    im = rgba((48, 48)); d = ImageDraw.Draw(im); soil(d, True)
    if stage == 0:
        line(d, [(24, 35), (24, 30)], '#4b8156', 2)
        leaf(d, 20, 27, '#5c9b64')
    elif stage == 1:
        line(d, [(24, 35), (24, 26)], '#47794e', 2)
        poly(d, [(10, 28), (13, 24), (19, 23), (23, 25), (19, 29), (13, 30)], '#4d8958')
        poly(d, [(24, 25), (28, 22), (35, 23), (39, 27), (34, 29), (27, 28)], '#60985d')
        line(d, [(12, 28), (19, 25)], '#a5c378'); line(d, [(27, 26), (35, 25)], '#a5c378')
    elif stage == 2:
        for x, y, flip in [(9, 26, False), (27, 24, True), (17, 22, False)]: leaf(d, x, y, '#568d58', flip)
        line(d, [(24, 32), (24, 16)], '#47804e', 2)
        poly(d, [(21, 18), (21, 12), (24, 8), (27, 12), (27, 18)], '#e8959e')
        poly(d, [(22, 17), (23, 10), (24, 15), (26, 10), (26, 18)], '#ffd19a')
        rect(d, (23, 16, 25, 18), '#e3b64e')
    else:
        for x, y, flip in [(7, 27, False), (29, 25, True), (15, 24, False)]: leaf(d, x, y, '#538b55', flip)
        line(d, [(24, 33), (24, 19)], '#47794e', 2)
        poly(d, [(20, 22), (18, 19), (20, 16), (23, 18), (24, 14), (27, 17), (30, 19), (27, 22)], '#9a5440')
        poly(d, [(20, 20), (23, 19), (25, 20), (28, 19), (27, 22), (22, 23)], '#d28a50')
        rect(d, (22, 20, 23, 21), '#e9ba69')
    return im


def dragonfruit(stage):
    im = rgba((48, 48)); d = ImageDraw.Draw(im); soil(d)
    # A small bamboo trellis gives the crop a clear silhouette from stage two onward.
    if stage >= 2:
        rect(d, (14, 13, 15, 34), '#8b6441'); rect(d, (33, 13, 34, 34), '#8b6441')
        rect(d, (13, 13, 35, 14), '#bd8a51'); rect(d, (14, 20, 34, 21), '#a97949')
    if stage == 0:
        line(d, [(24, 35), (24, 30)], '#438657', 2); rect(d, (22, 29, 26, 30), '#69a84d')
    elif stage == 1:
        rect(d, (22, 24, 25, 34), '#428b57'); rect(d, (19, 26, 21, 30), '#579b5b'); rect(d, (26, 27, 28, 31), '#579b5b')
        rect(d, (23, 21, 24, 23), '#83b858')
    else:
        # Three jointed cactus arms, with dragon fruit hanging in the late stage.
        rect(d, (22, 17, 26, 35), '#438a52'); rect(d, (19, 21, 21, 30), '#4c9557'); rect(d, (18, 21, 22, 23), '#4c9557')
        rect(d, (27, 19, 29, 29), '#4c9557'); rect(d, (26, 19, 30, 21), '#4c9557')
        for x, y in [(23, 20), (24, 26), (20, 25), (28, 24)]: rect(d, (x, y, x, y + 1), '#a6c66a')
        if stage == 2:
            poly(d, [(29, 21), (31, 18), (33, 20), (32, 22)], '#ffe0a0')
        else:
            for x, y in [(28, 21), (18, 25), (24, 14)]:
                poly(d, [(x, y), (x + 2, y - 2), (x + 5, y - 1), (x + 5, y + 3), (x + 2, y + 4), (x, y + 2)], '#c83f65')
                rect(d, (x + 1, y - 2, x + 2, y - 1), '#87a957'); rect(d, (x + 4, y, x + 5, y + 1), '#e9838b')
    return im


def black_rice(stage):
    im = rgba((48, 48)); d = ImageDraw.Draw(im); soil(d, True)
    if stage == 0:
        line(d, [(24, 35), (23, 30)], '#658847', 2)
        leaf(d, 18, 27, '#78a65c'); leaf(d, 23, 27, '#91b26b', True)
    elif stage == 1:
        for x, y, lean in [(17, 26, -4), (23, 25, 0), (28, 25, 4)]:
            line(d, [(24, 35), (x, y)], '#628549', 2)
            poly(d, [(x, y), (x + lean, y - 9), (x + lean + 2, y - 10), (x + 2, y)], '#719852')
            line(d, [(x + 1, y - 1), (x + lean + 1, y - 8)], '#a8bd72')
    else:
        for x, tip, grain in [(14, 10, -5), (20, 8, -2), (27, 9, 3), (33, 12, 6)]:
            line(d, [(24, 35), (x, tip + 10)], '#607f48', 2)
            poly(d, [(x, tip + 10), (x + grain, tip), (x + grain + 2, tip - 2), (x + 3, tip + 11)], '#78964d')
            line(d, [(x + 2, tip + 10), (x + grain + 1, tip + 1)], '#b5be72')
            if stage == 2:
                for k in range(3): rect(d, (x + grain + k, tip + 2 + k * 2, x + grain + k + 1, tip + 3 + k * 2), '#776a91')
            else:
                for k in range(3): rect(d, (x + grain + k, tip + 2 + k * 2, x + grain + k + 1, tip + 4 + k * 2), '#66506e')
                rect(d, (x + grain + 1, tip + 3, x + grain + 1, tip + 3), '#c1a572')
    return im


def crop_atlas():
    rows = [coffee, lotus, dragonfruit, black_rice]
    atlas = rgba((192, 192))
    for row, crop in enumerate(rows):
        for stage in range(4): atlas.alpha_composite(crop(stage), (stage * 48, row * 48))
    return atlas


def quail():
    im = rgba((56, 48)); d = ImageDraw.Draw(im)
    # Warm chestnut quail, compact body, cream flecks, plume, beak and orange feet.
    poly(d, [(9, 34), (10, 27), (14, 20), (23, 17), (32, 19), (39, 24), (41, 31), (36, 36), (17, 38)], '#76503b')
    poly(d, [(12, 30), (16, 24), (23, 21), (31, 22), (35, 27), (32, 31), (22, 34), (15, 33)], '#b8794b')
    poly(d, [(17, 30), (22, 25), (30, 26), (32, 30), (26, 34), (19, 33)], '#e0b77b')
    poly(d, [(30, 22), (34, 17), (38, 20), (36, 25)], '#a96b45')
    poly(d, [(35, 17), (38, 12), (39, 18)], '#d6a45e')
    rect(d, (35, 21, 36, 22), '#302c29'); rect(d, (36, 21, 36, 21), '#fff0bf')
    poly(d, [(40, 23), (47, 25), (40, 27)], '#d69b4f')
    for x, y in [(19, 26), (24, 23), (28, 29), (18, 31), (33, 27)]: rect(d, (x, y, x + 1, y + 1), '#f0d49c')
    line(d, [(22, 36), (21, 41)], '#d58b46', 2); line(d, [(32, 35), (33, 41)], '#d58b46', 2)
    line(d, [(18, 42), (24, 42)], '#a9683e'); line(d, [(30, 42), (36, 42)], '#a9683e')
    rect(d, (13, 29, 15, 31), '#664536')
    return im


def buffalo():
    im = rgba((56, 48)); d = ImageDraw.Draw(im)
    # Broad, slate-brown water buffalo with shoulder hump and crescent horns.
    poly(d, [(5, 33), (7, 25), (13, 21), (22, 19), (29, 20), (34, 24), (41, 24), (47, 29), (47, 35), (40, 38), (13, 38)], '#4e5146')
    poly(d, [(9, 30), (12, 24), (19, 23), (24, 25), (28, 29), (26, 35), (13, 35)], '#73745e')
    poly(d, [(29, 24), (35, 22), (42, 25), (46, 30), (43, 34), (35, 34), (31, 30)], '#5d6050')
    poly(d, [(8, 24), (5, 19), (3, 17), (5, 16), (10, 20), (14, 21)], '#c6ae7d')
    poly(d, [(16, 21), (18, 17), (21, 15), (22, 17), (20, 21)], '#c6ae7d')
    line(d, [(8, 23), (5, 19), (4, 17)], '#eee0b2', 1)
    line(d, [(18, 20), (20, 17), (21, 16)], '#eee0b2', 1)
    poly(d, [(36, 28), (45, 28), (48, 31), (46, 35), (38, 35)], '#8d7760')
    rect(d, (43, 29, 44, 30), '#292d2a'); rect(d, (46, 32, 47, 32), '#d3b78d')
    # Four sturdy legs and split hooves.
    for x in (14, 23, 34, 41):
        rect(d, (x, 34, x + 3, 41), '#45483f'); rect(d, (x - 1, 41, x + 4, 43), '#332f2b')
        rect(d, (x + 1, 41, x + 1, 42), '#8e7659')
    line(d, [(8, 29), (5, 33), (6, 36)], '#4a483d', 2)
    rect(d, (13, 25, 18, 26), '#909079'); rect(d, (30, 26, 34, 27), '#909079')
    return im


def livestock_atlas():
    atlas = rgba((112, 48))
    atlas.alpha_composite(quail(), (0, 0))
    atlas.alpha_composite(buffalo(), (56, 0))
    return atlas


def save(master, runtime_name, master_name):
    source = master.resize((master.width * SCALE, master.height * SCALE), Image.Resampling.NEAREST)
    source_path = ROOT / 'docs' / 'assets' / master_name
    target_path = ROOT / 'public' / 'pixel' / runtime_name
    source_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    source.save(source_path, optimize=True)
    # Re-open and downsample each file through nearest-neighbour to keep the alpha mask crisp.
    source.resize(master.size, Image.Resampling.NEAREST).save(target_path, optimize=True)
    print(f'{target_path.relative_to(ROOT)} {master.width}x{master.height} RGBA; source {source.width}x{source.height}')


save(crop_atlas(), 'progression-crops-v1.png', 'progression-crops-v1-source.png')
save(livestock_atlas(), 'progression-livestock-v1.png', 'progression-livestock-v1-source.png')
