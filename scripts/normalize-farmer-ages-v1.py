"""Export full-body age variants, preserving shared body scale and hard alpha."""
from pathlib import Path
from statistics import median, linear_regression
from PIL import Image

root = Path(__file__).resolve().parents[1]
variants = ('female-middle', 'male-middle', 'female-elder', 'male-elder')

def frames(image, columns):
    mask=image.getchannel('A').point(lambda a:255 if a>=128 else 0)
    def runs(values):
        groups=[]
        for value in values:
            if groups and value<=groups[-1][-1]+3:groups[-1].append(value)
            else:groups.append([value])
        return groups
    ys=[y for y in range(image.height) if sum(v>0 for v in mask.crop((0,y,image.width,y+1)).get_flattened_data())>image.width*.025]
    bands=[(g[0],g[-1]+1) for g in runs(ys) if len(g)>image.height*.05]
    if len(bands)!=4:
        raise ValueError(f'Expected four separated direction rows, found {bands}')
    boundaries=[max(0,bands[0][0]-10)]+[(bands[i][1]+bands[i+1][0])//2 for i in range(3)]+[min(image.height,bands[-1][1]+10)]
    head=mask.crop((0,bands[0][0],image.width,bands[0][0]+round((bands[0][1]-bands[0][0])*.3)))
    xs=[x for x in range(head.width) if sum(v>0 for v in head.crop((x,0,x+1,head.height)).get_flattened_data())>=3]
    heads=[g for g in runs(xs) if len(g)>image.width/columns*.12]
    centers=[(g[0]+g[-1])/2 for g in heads]
    if len(centers)<4:raise ValueError('Missing first four head anchors')
    expected=image.width/columns
    indexes=[round((center-centers[0])/expected) for center in centers]
    step, origin=linear_regression(indexes,centers)
    if not .85*image.width/columns<step<1.15*image.width/columns:
        raise ValueError(f'Unexpected column pitch: {step}')
    left=origin-step/2
    edges=[round(left+i*step) for i in range(columns+1)]
    if columns==22:
        if len(centers)!=22:raise ValueError('Elder source must contain 22 registered poses')
        edges=[max(0,round(centers[0]-step/2))]+[round((a+b)/2) for a,b in zip(centers,centers[1:])]+[image.width]
    print('Registration',image.size,'rows',boundaries,'pitch',step,'left',left)
    result = []
    for row in range(4):
        for column in range(columns):
            cell = image.crop((edges[column],boundaries[row],edges[column+1],boundaries[row+1]))
            alpha = cell.getchannel('A').point(lambda a: 255 if a >= 128 else 0)
            bounds = alpha.getbbox()
            if bounds is None:
                raise ValueError(f'Missing pose at {row},{column}')
            cell.putalpha(alpha)
            result.append(cell.crop(bounds))
    return result

for key in variants:
    for kind, columns in [('base', 12), ('actions', 24)]:
        path = root / f'docs/assets/farmer-{key}-{kind}-v1-source.png'
        if not path.exists():
            raise FileNotFoundError(path)
        source = Image.open(path).convert('RGBA')
        if source.getchannel('A').getextrema()[0] != 0:
            raise ValueError('Source needs genuine alpha')
        source_columns=22 if key=='female-elder' and kind=='actions' else columns
        sprites = frames(source, source_columns)
        if source_columns==22:
            # Source has three spray/feed phases. Hold their ready/recovery poses
            # to fill four-frame timing; never invent limbs or missing actions.
            mapping=list(range(8))+[10,8,9,10]+list(range(11,19))+[19,19,20,21]
            sprites=[sprites[row*22+column] for row in range(4) for column in mapping]
        # Global scale per sheet, never independently stretch raised tools/limbs.
        scale = min(44/max(s.width for s in sprites), 58/max(s.height for s in sprites))
        if kind=='actions':
            base=Image.open(root / f'public/pixel/farmer-{key}-base-v1.png').convert('RGBA')
            box=base.crop((0,0,48,64)).getchannel('A').getbbox()
            standing_height=box[3]-box[1]
            scale=min(46/max(s.width for s in sprites),60/max(s.height for s in sprites),standing_height/sprites[0].height)
        atlas = Image.new('RGBA', (columns*48, 256))
        for i, sprite in enumerate(sprites):
            size = (max(1, round(sprite.width*scale)), max(1, round(sprite.height*scale)))
            sprite = sprite.resize(size, Image.Resampling.LANCZOS)
            sprite.putalpha(sprite.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
            atlas.alpha_composite(sprite, ((i%columns)*48+(48-size[0])//2, (i//columns)*64+59-size[1]))
        target = root / f'public/pixel/farmer-{key}-{kind}-v1.png'
        atlas.save(target)
        print(target.name, atlas.size)
