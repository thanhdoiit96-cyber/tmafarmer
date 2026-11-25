"""Normalize the authored hoe symbol to the shared task-icon grid."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
image = Image.open(ROOT / 'docs/assets/till-task-icon-v1-source.png').convert('RGBA')
image.putalpha(image.getchannel('A').point(lambda a: 255 if a >= 160 else 0))
image = image.crop(image.getbbox())
image.thumbnail((28, 28), Image.Resampling.LANCZOS)
image.putalpha(image.getchannel('A').point(lambda a: 255 if a >= 160 else 0))
atlas = Image.new('RGBA', (32, 32))
atlas.paste(image, ((32-image.width)//2, (32-image.height)//2))
atlas.save(ROOT / 'public/pixel/till-task-icon-v1.png', optimize=True)
atlas.resize((192, 192), Image.Resampling.NEAREST).save(
    ROOT / 'docs/assets/till-task-icon-v1-preview.png')
