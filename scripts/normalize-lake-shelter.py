from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'docs/assets/lake-shelter-source-v1.png').convert('RGBA')
source.putalpha(source.getchannel('A').point(lambda p: 255 if p >= 128 else 0))
sprite = source.crop(source.getchannel('A').getbbox())
sprite.thumbnail((102, 96), Image.Resampling.LANCZOS)
sprite.putalpha(sprite.getchannel('A').point(lambda p: 255 if p >= 128 else 0))
out = Image.new('RGBA', (106, 100))
out.alpha_composite(sprite, ((106 - sprite.width) // 2, 98 - sprite.height))
out.save(root / 'public/pixel/lake-shelter-v1.png', optimize=True)
assert set(out.getchannel('A').tobytes()) == {0, 255}
print('lake-shelter-v1.png: 106x100 RGBA, alpha 0/255, baseline 98')
