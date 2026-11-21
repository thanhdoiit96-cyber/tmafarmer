"""Normalize four authored poses independently, with shared scale and feet."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
for species in ['dog', 'cat']:
    image = Image.open(root / f'docs/assets/yard-{species}-v1-source.png').convert('RGBA')
    if image.getchannel('A').getextrema()[0] != 0:
        raise ValueError(f'{species}: transparent source required')
    w, h = image.size
    poses = []
    for row in range(2):
        for col in range(2):
            cell = image.crop((col*w//2, row*h//2, (col+1)*w//2, (row+1)*h//2))
            bounds = cell.getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox()
            if not bounds:
                raise ValueError(f'{species}: empty pose {row},{col}')
            poses.append(cell.crop(bounds))
    factor = min(52/max(p.width for p in poses), 44/max(p.height for p in poses))
    atlas = Image.new('RGBA', (128, 112))
    for i, pose in enumerate(poses):
        pose = pose.resize((round(pose.width*factor), round(pose.height*factor)), Image.Resampling.LANCZOS)
        pose.putalpha(pose.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
        atlas.alpha_composite(pose, (i%2*64+(64-pose.width)//2, i//2*56+52-pose.height))
    atlas.save(root / f'public/pixel/yard-{species}-v1.png')
    print(species, atlas.size, atlas.getchannel('A').getextrema())
