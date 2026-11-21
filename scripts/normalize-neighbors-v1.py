"""Export the approved neighborhood as separate plate, homes and pavilion."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
assets = root / 'docs/assets'
out = root / 'public/pixel'
plate = Image.open(assets / 'neighbors-background-v2-source.png').convert('RGB')
plate.resize((960, 576), Image.Resampling.LANCZOS).save(out / 'scene-background-neighbors-v1.png')

def transparent(name):
    image = Image.open(assets / name).convert('RGBA')
    if image.getchannel('A').getextrema()[0] != 0:
        raise ValueError('Expected genuine transparent master: ' + name)
    return image

def fit(image, size):
    box = image.getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox()
    if box is None:
        raise ValueError('Empty asset')
    sprite = ImageOps.contain(image.crop(box), size, Image.Resampling.LANCZOS)
    sprite.putalpha(sprite.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
    cell = Image.new('RGBA', size)
    cell.alpha_composite(sprite, ((size[0]-sprite.width)//2, size[1]-sprite.height))
    return cell

homes = transparent('neighbor-homes-v1-source.png')
atlas = Image.new('RGBA', (2100, 216))
for tier in range(5):
    frame = homes.crop((round(tier*homes.width/5), 0, round((tier+1)*homes.width/5), homes.height))
    atlas.alpha_composite(fit(frame, (420, 216)), (tier*420, 0))
atlas.save(out / 'neighbor-homes-v1.png')
fit(transparent('neighbor-hall-v1-source.png'), (180, 180)).save(out / 'neighbor-hall-v1.png')
print('Plate 960x576; 5 homes 420x216; hall 180x180; transparent hard-alpha sprites')
