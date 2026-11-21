"""Draw and export detailed late-game crop art on the game's 48 px pixel grid."""
from math import cos, pi, sin
from pathlib import Path
import random

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
S = 1
CELL = 48
MASTER_SCALE = 4
SOURCE_CELL = CELL * MASTER_SCALE
ART_CELL = CELL * S
KINDS = ('coffee', 'lotus', 'dragonfruit', 'blackRice')
PALETTE = {
    'ink': '#30352d', 'soil0': '#493628', 'soil1': '#68432f', 'soil2': '#93603e',
    'soil3': '#b47b4c', 'soil4': '#d2a06a', 'leaf0': '#315b38', 'leaf1': '#477744',
    'leaf2': '#65934a', 'leaf3': '#8eae57', 'leaf4': '#bdd17a', 'water0': '#376a68',
    'water1': '#568f86', 'water2': '#82b3a0', 'pink0': '#a94364', 'pink1': '#d46b82',
    'pink2': '#f0a0a2', 'pink3': '#ffe0b1', 'fruit0': '#a72f4c', 'fruit1': '#cf4261',
    'fruit2': '#ed6c78', 'fruit3': '#ffa080', 'grain0': '#493b61', 'grain1': '#69527e',
    'grain2': '#96729a', 'grain3': '#c19bad', 'gold0': '#a77b3a', 'gold1': '#d2a34f',
    'gold2': '#f0ce76',
}


def p(n):
    return round(n * S)


def points(values):
    return [(p(x), p(y)) for x, y in values]


def polygon(draw, values, color):
    draw.polygon(points(values), fill=color)


def line(draw, values, color, width=1):
    draw.line(points(values), fill=color, width=max(1, p(width)), joint='curve')


def ellipse(draw, box, color, outline=None, width=1):
    draw.ellipse(tuple(p(x) for x in box), fill=color, outline=outline, width=max(1, p(width)))


def rounded(draw, box, radius, color, outline=None, width=1):
    draw.rounded_rectangle(tuple(p(x) for x in box), radius=p(radius), fill=color, outline=outline, width=max(1, p(width)))


def leaf(draw, start, tip, width, ramp, veins=True):
    """A sculpted leaf with a dark pixel rim, a lit shoulder and inset vein."""
    x1, y1 = start; x2, y2 = tip
    dx, dy = x2 - x1, y2 - y1
    length = max(0.001, (dx * dx + dy * dy) ** .5)
    nx, ny = -dy / length, dx / length
    profile = ((.04, .08), (.20, .42), (.43, .56), (.68, .43), (.88, .18), (1, 0))
    edge = [(x1 + dx * t + nx * width * k, y1 + dy * t + ny * width * k) for t, k in profile]
    edge += [(x1 + dx * t - nx * width * k, y1 + dy * t - ny * width * k) for t, k in reversed(profile[:-1])]
    polygon(draw, edge, PALETTE['leaf0'])
    inset = [(x1 + dx * .06 + (x - x1 - dx * .06) * .88, y1 + dy * .06 + (y - y1 - dy * .06) * .88) for x, y in edge]
    polygon(draw, inset, ramp[0])
    highlight = [
        (x1 + dx * .13 + nx * width * .08, y1 + dy * .13 + ny * width * .08),
        (x1 + dx * .36 + nx * width * .47, y1 + dy * .36 + ny * width * .47),
        (x1 + dx * .60 + nx * width * .33, y1 + dy * .60 + ny * width * .33),
        (x1 + dx * .42 + nx * width * .13, y1 + dy * .42 + ny * width * .13),
    ]
    polygon(draw, highlight, ramp[1])
    if veins and length > 5:
        line(draw, [(x1 + dx * .12, y1 + dy * .12), (x1 + dx * .88, y1 + dy * .88)], ramp[2], .48)
        for t in (.38, .58, .75):
            cx, cy = x1 + dx * t, y1 + dy * t
            line(draw, [(cx, cy), (cx + nx * width * .30, cy + ny * width * .30)], ramp[2], .32)


def soil_plot(wet=False, seed=17):
    im = Image.new('RGBA', (ART_CELL, ART_CELL), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    # Rounded, clumpy soil mound with a dark underside and warm upper-left facets.
    polygon(d,[(4,37),(6,35),(8,34),(11,34),(13,32),(17,33),(20,34),(23,32),(27,33),
               (31,32),(34,33),(38,33),(42,35),(44,37),(43,40),(40,42),(8,42),(5,40)],PALETTE['soil0'])
    polygon(d,[(6,37),(9,35),(13,35),(15,33),(19,34),(23,35),(26,33),(30,34),(34,33),
               (38,34),(42,36),(42,38),(38,40),(10,40),(6,39)],PALETTE['soil1'])
    polygon(d,[(9,36),(14,35),(18,36),(22,35),(26,35),(30,35),(35,34),(39,36),(40,38),(34,39),(13,39),(8,38)],PALETTE['soil2'])
    polygon(d,[(12,36),(16,35),(20,36),(24,35),(28,36),(33,35),(36,36),(35,37),(15,38),(10,37)],'#815336')
    line(d, [(8,36), (12,35), (16,36), (21,35)], PALETTE['soil4'], .8)
    line(d, [(27,35), (31,35), (35,34.5), (38,35.5)], '#bd8754', .7)
    rng = random.Random(seed)
    for _ in range(115):
        x, y = rng.uniform(5, 43), rng.uniform(34, 40)
        c = rng.choice((PALETTE['soil0'], PALETTE['soil1'], PALETTE['soil2'], PALETTE['soil3'], '#c5905c'))
        ellipse(d, (x, y, x + rng.uniform(.45, 1.7), y + rng.uniform(.35, 1.0)), c)
    # Side clods and lit crumbs keep the rounded base tactile at 1x.
    ellipse(d, (6, 37, 10, 40), '#573b2c'); ellipse(d, (38, 36, 43, 39), '#51372a')
    ellipse(d, (10, 34, 14, 35), '#d1a06a'); ellipse(d, (31, 33, 35, 34), '#c28a58')
    if wet:
        polygon(d, [(5, 39), (12, 38), (19, 39), (27, 38), (35, 39), (43, 38), (42, 41), (7, 41)], PALETTE['water0'])
        line(d, [(8, 39), (14, 39)], PALETTE['water2'], .7)
        line(d, [(29, 39), (34, 39)], PALETTE['water1'], .7)
    return im


def stem(draw, path, shade='#315b38', light='#83a94f', width=1.6):
    line(draw, path, shade, width)
    shifted = [(x - .55, y) for x, y in path]
    line(draw, shifted, light, .42)


def dragon_pad(draw, root, tip, width):
    """Broad ribbed dragon-fruit paddle; keep its outline chunky at runtime size."""
    leaf(draw, root, tip, width, ('#3e7042', '#79a64e', '#bbce70'), False)
    x1, y1 = root; x2, y2 = tip
    line(draw, [(x1, y1), (x1 + (x2-x1)*.48-.35, y1 + (y2-y1)*.48), (x2-.4, y2+.8)], '#b7c96c', .62)
    for t in (.24, .48, .72):
        x=x1+(x2-x1)*t; y=y1+(y2-y1)*t
        ellipse(draw,(x-.28,y-.32,x+.42,y+.4),'#e0d98d')
        line(draw,[(x,y),(x+(y2-y1)/max(1,abs(y2-y1))*.7,y-1.1)],'#e7dfa0',.38)


def coffee(stage):
    im = soil_plot(seed=11); d = ImageDraw.Draw(im)
    if stage == 0:
        stem(d, [(24, 35), (24, 31), (23, 28)], width=1.3)
        leaf(d, (23, 30), (18, 26), 2.1, ('#69974c','#a7c56c','#385f3b'))
        leaf(d, (24, 30), (30, 26), 2.1, ('#7ba850','#b8cc70','#456e3b'))
        ellipse(d, (22, 29, 25, 31), '#8ea856')
    else:
        stem(d, [(24, 35), (24, 29), (23, 23), (19, 18), (17, 13)], width=1.7)
        stem(d, [(23, 27), (29, 23), (33, 18), (34, 13)], width=1.4)
        stem(d, [(23, 23), (18, 22), (13, 18)], width=1.2)
        stem(d, [(28, 24), (33, 25), (37, 21)], width=1.1)
        if stage >= 2:
            stem(d, [(20, 19), (24, 15), (28, 13)], width=1.0)
        leaves = [
            ((23,30),(11,29),4.5,0),((23,29),(34,31),4.6,1),((22,28),(6,25),4.8,1),
            ((22,27),(17,31),4.1,0),((23,26),(39,27),4.6,0),((21,25),(9,22),4.8,1),
            ((22,24),(31,27),4.7,0),((20,22),(5,20),4.5,0),((21,22),(16,25),4.4,1),
            ((23,22),(39,22),4.8,1),((21,21),(11,17),4.5,0),((22,20),(28,24),4.5,1),
            ((19,19),(6,15),4.0,1),((20,19),(17,13),4.5,0),((23,18),(24,12),4.8,1),
            ((26,18),(32,13),4.6,0),((29,19),(41,15),4.2,1),((31,21),(42,19),4.3,0),
            ((17,17),(10,12),4.2,0),((24,16),(19,8),4.5,1),((27,16),(29,8),4.5,0),
            ((33,17),(39,11),4.0,1),((15,23),(4,22),3.7,0),((34,25),(44,24),3.6,1),
        ]
        if stage == 1: leaves = leaves[:12]
        if stage == 2: leaves = leaves[:19]
        for i, (a,b,w,bright) in enumerate(leaves):
            ramp=('#3f703f','#70994a','#b5ca71') if (i+bright)%3 else ('#548344','#8eaa52','#c6d57a')
            leaf(d,a,b,w*1.32,ramp)
        if stage >= 2:
            for x,y in [(12,22),(18,21),(26,20),(33,18),(38,21),(22,15),(30,14)]:
                ellipse(d,(x-.1,y,x+2.1,y+2.4),'#355d39')
                ellipse(d,(x,y-.1,x+1.8,y+2.1),'#76a34d')
                ellipse(d,(x+.35,y+.18,x+1.0,y+.82),'#c5d67a')
        if stage == 3:
            # Berries hang in visible paired clusters along the outer branches.
            for x,y in [(9,22),(13,24),(16,20),(20,23),(27,22),(31,24),(35,20),(39,22),
                        (14,16),(19,17),(25,15),(30,17),(35,14),(23,12)]:
                ellipse(d,(x+.15,y+.2,x+2.55,y+3.0),'#702c37')
                ellipse(d,(x,y,x+2.35,y+2.7),'#bd3e43','#71313a',.38)
                ellipse(d,(x+.25,y+.2,x+1.05,y+1.05),'#f59668')
                line(d,[(x+1.75,y+1.05),(x+2.0,y+1.55)],'#e76a57',.35)
    return im


def lotus_leaf(draw, cx, cy, rx, ry, color):
    # Broad floating pad with its characteristic notch, rim and radial veins.
    ellipse(draw,(cx-rx,cy-ry,cx+rx,cy+ry),PALETTE['leaf0'])
    ellipse(draw,(cx-rx+.55,cy-ry+.5,cx+rx-.35,cy+ry-.25),color)
    notch = [(cx,cy),(cx+rx*.42,cy-ry*.78),(cx+rx*.15,cy-ry*.03)]
    polygon(draw,notch,PALETTE['water0'])
    line(draw,[(cx,cy),(cx-rx*.58,cy-ry*.45)],'#b4cb78',.42)
    line(draw,[(cx,cy),(cx-rx*.74,cy+.02)],'#a7c06d',.42)
    line(draw,[(cx,cy),(cx-rx*.43,cy+ry*.5)],'#91b15f',.42)
    line(draw,[(cx,cy),(cx+rx*.42,cy+ry*.53)],'#416e43',.42)
    ellipse(draw,(cx-rx*.5,cy-ry*.55,cx-rx*.08,cy-ry*.34),'#c4d481')


def lotus_flower(draw,cx,cy,scale=1,open_flower=True):
    if not open_flower:
        polygon(draw,[(cx-2*scale,cy+2*scale),(cx-1.5*scale,cy-2*scale),(cx,cy-5*scale),(cx+1.5*scale,cy-2*scale),(cx+2*scale,cy+2*scale)],PALETTE['pink1'])
        line(draw,[(cx,cy+1),(cx,cy-4*scale)],PALETTE['pink3'],.55)
        return
    # Layered petals, warm center and a darker underside retain detail at 48 px.
    for angle in range(0,360,45):
        rad=angle*pi/180
        px=cx+cos(rad)*2.1*scale; py=cy+sin(rad)*2.0*scale
        ellipse(draw,(px-1.1*scale,py-2.1*scale,px+1.1*scale,py+2.1*scale),PALETTE['pink0'])
    for angle in range(0,360,60):
        rad=angle*pi/180
        px=cx+cos(rad)*1.7*scale; py=cy+sin(rad)*1.6*scale
        ellipse(draw,(px-.75*scale,py-1.6*scale,px+.75*scale,py+1.3*scale),PALETTE['pink2'])
    ellipse(draw,(cx-1.25*scale,cy-1.0*scale,cx+1.25*scale,cy+1.35*scale),PALETTE['gold1'])
    for dx,dy in [(-.5,-.2),(0,-.35),(.5,.1),(-.2,.45)]: ellipse(draw,(cx+dx*scale,cy+dy*scale,cx+(dx+.22)*scale,cy+(dy+.22)*scale),PALETTE['gold2'])


def lotus(stage):
    im=soil_plot(True,23); d=ImageDraw.Draw(im)
    if stage == 0:
        stem(d,[(24,36),(23,32),(24,29)],'#426e42','#82a95a',1.1)
        lotus_leaf(d,22,28,3.2,1.8,'#5f9553')
    elif stage == 1:
        stem(d,[(24,35),(24,30)],'#416e45','#81a85a',1.1)
        lotus_leaf(d,16,29,6.4,2.7,'#578b4e')
        lotus_leaf(d,29,27,7.2,3.0,'#6b9c54')
        lotus_leaf(d,23,26,4.8,2.4,'#83aa59')
    else:
        lotus_leaf(d,13,29,7.2,3.1,'#54884b')
        lotus_leaf(d,34,28,7.6,3.0,'#659951')
        lotus_leaf(d,23,30,6.5,2.7,'#477a46')
        lotus_leaf(d,19,24,6.8,2.8,'#81a958')
        lotus_leaf(d,30,23,6.9,2.9,'#6d9b50')
        stem(d,[(24,32),(24,24),(24,18)],'#3c7044','#80a758',1.25)
        lotus_flower(d,24,16,1.0,stage==3)
        if stage == 3:
            stem(d,[(18,32),(17,27),(16,24)],'#3c7044','#80a758',.9)
            lotus_flower(d,16,23,.62,True)
            # A mature lotus seed head beside the open bloom.
            ellipse(d,(27,18,31,22),'#507b42','#344f35',.45)
            for x,y in [(28,19),(30,19),(29,21),(27.7,21)]: ellipse(d,(x,y,x+.45,y+.45),'#344f35')
            ellipse(d,(27.5,18.4,28.5,19.0),'#a8c26d')
    return im


def dragonfruit(stage):
    im=soil_plot(seed=37); d=ImageDraw.Draw(im)
    if stage == 0:
        stem(d,[(24,35),(24,31),(23,28)],'#356f45','#87aa54',1.3)
        leaf(d,(23,31),(19,27),2.0,('#53874a','#90ad58','#bfd076'))
        leaf(d,(24,31),(29,27),2.0,('#477d47','#83a950','#b4ca6b'))
    else:
        # Build a fuller branching cactus from broad pads before adding the bamboo trellis.
        if stage >= 2:
            line(d,[(13,35),(13,10)],'#694a32',1.7); line(d,[(35,35),(35,10)],'#694a32',1.7)
            line(d,[(12,12),(36,12)],'#9a7043',2.0)
            line(d,[(13,13),(13,35)],'#d0a166',.55); line(d,[(35,13),(35,35)],'#c09259',.5)
            for y in (18,24,30):
                line(d,[(12,y),(14,y)],'#bc8b4f',.7); line(d,[(34,y),(36,y)],'#bc8b4f',.7)
        dragon_pad(d,(24,35),(23,14),5.8 if stage==1 else 6.3)
        if stage >= 2:
            dragon_pad(d,(23,30),(15,18),5.8)
            dragon_pad(d,(24,29),(33,17),5.8)
        if stage >= 3:
            dragon_pad(d,(22,24),(8,20),5.3)
            dragon_pad(d,(28,24),(40,20),5.1)
            dragon_pad(d,(23,20),(20,9),4.8)
        if stage == 2:
            lotus_flower(d,32,15,.72,False)
        elif stage == 3:
            # Two clearly readable fruits with green bracts, rather than tiny scattered dots.
            for x,y,size in [(17,19,1.0),(31,20,1.0)]:
                ellipse(d,(x-3.6*size,y-4.0*size,x+3.6*size,y+4.2*size),'#702840')
                ellipse(d,(x-3.1*size,y-3.8*size,x+3.1*size,y+3.8*size),PALETTE['fruit1'])
                ellipse(d,(x-2.1*size,y-3.0*size,x+.15*size,y+2.9*size),PALETTE['fruit2'])
                for sx,sy,flip in [(-2.2,-2.8,False),(2.1,-2.3,True),(-2.4,.1,True),(2.2,.5,False),(-.7,2.4,False)]:
                    tx=x+sx*size; ty=y+sy*size
                    leaf(d,(x, y+sy*.42*size),(tx,ty),.95,('#3e7042','#8eae53','#d0d681'),False)
                ellipse(d,(x-1.7,y-2.8,x-.8,y-1.8),'#ffe0a3')
    return im


def rice_panicle(draw, root, tip, grain_color, stage):
    rx,ry=root; tx,ty=tip
    # Thick, gently bowed stem and individually readable kernels at 48px.
    middle=((rx+tx)/2-.5,(ry+ty)/2+(.5 if stage==3 else 0))
    stem(draw,[root,middle,tip],'#526d3b','#a6b968',1.05)
    vx,vy=tx-rx,ty-ry
    for idx,t in enumerate((.17,.31,.45,.59,.72,.84,.94)):
        x=rx+vx*t; y=ry+vy*t
        spread=1.85*(1-t*.18)
        for sign in (-1,1):
            gx=x+sign*spread; gy=y+(.8 if stage==3 else .2)
            kernel=('#493b61' if idx%3==0 else '#69527e' if idx%2 else '#755d84') if stage==3 else ('#85804c' if stage==2 else '#8fa052')
            edge='#382a45' if stage==3 else '#4d613b'
            ellipse(draw,(gx-.86,gy-.95,gx+.92,gy+1.0),kernel,edge,.28)
            if stage==3:
                line(draw,[(gx-.42,gy-.2),(gx+.18,gy+.35)],'#b58eb5',.34)
                ellipse(draw,(gx-.42,gy-.63,gx-.04,gy-.2),'#c19bad')
    ellipse(draw,(tx-.65,ty-.65,tx+.65,ty+.65),grain_color)


def black_rice(stage):
    im=soil_plot(True,47); d=ImageDraw.Draw(im)
    if stage == 0:
        stem(d,[(24,35),(24,31),(22,28)],'#527745','#a3bb67',1.0)
        leaf(d,(24,32),(18,27),2.1,('#5b874c','#9fbb62','#c6d27c'))
        leaf(d,(24,32),(29,26),2.0,('#62894e','#a6c16a','#cbd47e'))
    elif stage == 1:
        leaves=[((24,35),(11,24),2.4),((24,35),(16,20),2.5),((24,35),(21,18),2.4),((24,35),(26,19),2.5),((24,35),(32,21),2.5),((24,35),(39,25),2.2),((23,35),(18,26),2.1),((24,35),(29,26),2.0)]
        for i,(a,b,w) in enumerate(leaves): leaf(d,a,b,w,('#4f7846','#86a755','#beca70') if i%2 else ('#64894b','#a5b95e','#d0d47a'),False)
    else:
        leaves=[((24,35),(6,25),3.3),((24,35),(11,19),3.4),((24,35),(16,23),3.2),((24,35),(21,17),3.5),((24,35),(26,18),3.4),((24,35),(31,21),3.3),((24,35),(39,26),3.1),((23,35),(17,28),2.8),((25,35),(29,28),2.7)]
        for i,(a,b,w) in enumerate(leaves): leaf(d,a,b,w,('#507345','#8ba450','#c0c873') if i%2 else ('#66894a','#aebd65','#d4d484'),False)
        ear=PALETTE['grain1'] if stage==2 else PALETTE['grain0']
        for root,tip in [((19,26),(12,10)),((21,25),(18,5)),((24,24),(24,4)),((26,25),(30,6)),((29,26),(37,11))]:
            rice_panicle(d,root,tip,ear,stage)
        if stage==2:
            for x,y in [(14,9),(20,6),(28,8),(34,11)]:
                ellipse(d,(x-.45,y-.8,x+.6,y+.5),PALETTE['grain3'])
        if stage==3:
            for x,y in [(15,12),(21,9),(28,11),(34,14)]:
                line(d,[(x-1,y),(x+1,y+1)],PALETTE['grain3'],.45)
    return im


def alpha_bounds(frame):
    alpha=frame.getchannel('A').point(lambda value:255 if value>=145 else 0)
    return alpha.getbbox()


def export():
    rows=(coffee,lotus,dragonfruit,black_rice)
    source=Image.new('RGBA',(SOURCE_CELL*4,SOURCE_CELL*4),(0,0,0,0))
    cells=[]
    for row,draw_crop in enumerate(rows):
        for stage in range(4):
            art=draw_crop(stage)
            x,y=stage*SOURCE_CELL,row*SOURCE_CELL
            master=art.resize((SOURCE_CELL,SOURCE_CELL),Image.Resampling.NEAREST)
            source.alpha_composite(master,(x,y))
            cells.append((row,stage,art))
    source.save(ROOT/'docs/assets/progression-crops-v3-source.png',optimize=True)
    atlas=Image.new('RGBA',(CELL*4,CELL*4),(0,0,0,0)); metadata={}
    for row,stage,art in cells:
        # Art is authored on the native 48px grid to keep the runtime clusters crisp.
        reduced=art
        alpha=reduced.getchannel('A').point(lambda value:255 if value>=145 else 0)
        reduced.putalpha(alpha)
        x,y=stage*CELL,row*CELL
        atlas.alpha_composite(reduced,(x,y))
        bbox=alpha_bounds(reduced)
        if bbox is None: raise ValueError(f'Empty frame {row=} {stage=}')
        key=KINDS[row]
        metadata.setdefault(key,{'row':row,'bounds':[]})['bounds'].append(list(bbox))
    atlas.save(ROOT/'public/pixel/progression-crops-v3.png',optimize=True)
    lines=[f"  {key}:{{row:{value['row']},bounds:{value['bounds']}}}," for key,value in metadata.items()]
    (ROOT/'public/pixel/progression-crop-frames-v3.mjs').write_text(
        '// Generated by scripts/generate-progression-crops-v3.py.\nexport default {\n'+ '\n'.join(lines)+'\n};\n',encoding='utf-8')
    make_preview(source,atlas)
    print('Wrote source 768x768 and runtime atlas 192x192 with alpha-thresholded 48x48 frames.')


def make_preview(source,atlas):
    # Compare established 48px crops, source art, and runtime art at the same 4x display size.
    margin=24; title_h=46; label_w=116; cell=192; gap=8
    width=margin*2+label_w+9*cell+8*gap
    height=margin*2+title_h+4*(24+cell)+3*gap
    board=Image.new('RGBA',(width,height),'#18231f'); d=ImageDraw.Draw(board)
    font=ImageFont.load_default()
    d.text((margin,margin),'LATE-GAME CROPS V3  |  REFERENCE / SOURCE / RUNTIME @ 4x',font=font,fill='#f4e4c2')
    labels=('COFFEE','LOTUS','DRAGON FRUIT','BLACK RICE')
    reference=Image.open(ROOT/'public/pixel/vertical-slice-v2-hd.png').convert('RGBA')
    crop_reference=Image.open(ROOT/'public/pixel/crop-stages-v2.png').convert('RGBA')
    reference_boxes=[
        (crop_reference,(3*CELL,0,4*CELL,CELL)),
        (crop_reference,(3*CELL,CELL,4*CELL,2*CELL)),
        (crop_reference,(3*CELL,3*CELL,4*CELL,4*CELL)),
        (reference,(7*CELL,2*CELL,8*CELL,3*CELL)),
    ]
    for row,label in enumerate(labels):
        y=margin+title_h+row*(24+cell+gap)
        d.text((margin,y+8),label,font=font,fill='#e0bd83')
        ref_image,ref_box=reference_boxes[row]
        ref=ref_image.crop(ref_box).resize((cell,cell),Image.Resampling.NEAREST)
        ref_x=margin+label_w
        board.alpha_composite(ref,(ref_x,y+24))
        d.text((ref_x+4,y+4),'REFERENCE 48px @ 4x',font=font,fill='#cbd4c1')
        for stage in range(4):
            x=margin+label_w+(1+stage*2)*(cell+gap)
            src=source.crop((stage*SOURCE_CELL,row*SOURCE_CELL,(stage+1)*SOURCE_CELL,(row+1)*SOURCE_CELL))
            run=atlas.crop((stage*CELL,row*CELL,(stage+1)*CELL,(row+1)*CELL)).resize((cell,cell),Image.Resampling.NEAREST)
            board.alpha_composite(src,(x,y+24)); board.alpha_composite(run,(x+cell+gap,y+24))
            d.text((x+4,y+4),f'STAGE {stage+1}  SRC',font=font,fill='#cbd4c1')
            d.text((x+cell+gap+4,y+4),f'STAGE {stage+1}  48px @ 4x',font=font,fill='#cbd4c1')
    board.save(ROOT/'docs/assets/progression-crops-v3-preview.png',optimize=True)


if __name__=='__main__':
    export()

