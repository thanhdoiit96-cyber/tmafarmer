from PIL import Image
from pathlib import Path
src=Image.open('docs/assets/crop-care-icons-v1-source.png').convert('RGBA')
out=Image.new('RGBA',(128,32))
for i in range(4):
    cell=src.crop((round(i*src.width/4),0,round((i+1)*src.width/4),src.height))
    cell.putalpha(cell.getchannel('A').point(lambda a:255 if a>=128 else 0))
    cell=cell.crop(cell.getbbox());cell.thumbnail((28,28),Image.Resampling.LANCZOS)
    cell.putalpha(cell.getchannel('A').point(lambda a:255 if a>=128 else 0))
    out.paste(cell,(i*32+(32-cell.width)//2,(32-cell.height)//2))
out.save('public/pixel/crop-care-icons-v1.png')
out.resize((768,192),Image.Resampling.NEAREST).save('docs/assets/crop-care-icons-v1-preview.png')
