"""Export the authored village well; retain transparent hard sprite edges."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
image = Image.open(root / 'docs/assets/village-well-v1-source.png').convert('RGBA')
alpha = image.getchannel('A')
if not alpha.getbbox() or alpha.getextrema()[0] != 0:
    raise ValueError('Well source must have genuine transparent alpha')
image = image.crop(alpha.getbbox()).resize((104, 124), Image.Resampling.LANCZOS)
image.putalpha(image.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
image.save(root / 'public/pixel/village-well-v1.png')
print(image.size, image.getchannel('A').getextrema())
