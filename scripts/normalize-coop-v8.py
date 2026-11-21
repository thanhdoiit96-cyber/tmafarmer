"""Export the authored coop plate at 2x its 480x288 world registration."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'docs/assets/coop-scene-v8-source.png').convert('RGB')
source.resize((960, 576), Image.Resampling.LANCZOS).save(
    root / 'public/pixel/scene-background-coop-v8.png', optimize=True)
