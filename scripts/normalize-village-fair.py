"""Export approved fair masters; normalize each sprite independently, hard alpha."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
master = Image.open(root / 'docs/assets/village-fair-props-source-v1.png').convert('RGBA')
atlas = Image.new('RGBA', (256, 256))
for row in range(4):
    for col in range(4):
        cell = master.crop((round(col*master.width/4), round(row*master.height/4),
                            round((col+1)*master.width/4), round((row+1)*master.height/4)))
        cell.putalpha(cell.getchannel('A').point(lambda a: 255 if a >= 160 else 0))
        bounds = cell.getbbox()
        if not bounds:
            raise ValueError('Empty source cell')
        cell = cell.crop(bounds)
        cell.thumbnail((58, 50), Image.Resampling.LANCZOS)
        cell.putalpha(cell.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
        atlas.alpha_composite(cell, (col*64+(64-cell.width)//2, row*64+56-cell.height))
atlas.save(root / 'public/pixel/village-fair-props-v1.png', optimize=True)
plate = Image.open(root / 'docs/assets/village-fair-clean-source-v1.png').convert('RGB')
plate.resize((800, 480), Image.Resampling.LANCZOS).save(root / 'public/pixel/village-fair-clean-v1.png', optimize=True)
assert set(atlas.getchannel('A').get_flattened_data()).issubset({0, 255})
print('Exported plate 800x480 and independent RGBA 64x64 cells, atlas 256x256.')
