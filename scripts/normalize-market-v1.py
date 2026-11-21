"""Export authored market assets with stable per-row scale and hard alpha."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]

def source(name):
    image = Image.open(root / 'docs/assets' / name).convert('RGBA')
    if image.getchannel('A').getextrema()[0] != 0:
        raise ValueError('Source needs real transparent alpha')
    return image

board = source('market-order-board-v1-source.png')
board = board.crop(board.getchannel('A').getbbox()).resize((96, 116), Image.Resampling.LANCZOS)
board.putalpha(board.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
board.save(root / 'public/pixel/market-order-board-v1.png')

image = source('market-shoppers-v1-source.png')
atlas = Image.new('RGBA', (192, 192))
for row in range(3):
    cells = [image.crop((round(col*image.width/4), round(row*image.height/3),
                         round((col+1)*image.width/4), round((row+1)*image.height/3))) for col in range(4)]
    boxes = [cell.getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox() for cell in cells]
    if any(b is None for b in boxes):
        raise ValueError('Empty shopper pose')
    left, top = min(b[0] for b in boxes), min(b[1] for b in boxes)
    right, bottom = max(b[2] for b in boxes), max(b[3] for b in boxes)
    scale = min(42/(right-left), 60/(bottom-top))
    size = (round((right-left)*scale), round((bottom-top)*scale))
    for col, cell in enumerate(cells):
        frame = cell.crop((left, top, right, bottom)).resize(size, Image.Resampling.LANCZOS)
        frame.putalpha(frame.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
        atlas.alpha_composite(frame, (col*48+(48-size[0])//2, row*64+62-size[1]))
atlas.save(root / 'public/pixel/market-shoppers-v1.png')
print('Market board: 96x116; shoppers: 192x192 (4x3, 48x64 cells), hard RGBA alpha')
