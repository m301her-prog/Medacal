from pathlib import Path
from PIL import Image
source = Image.open('assets/icon.png').convert('RGBA')
for size in (192, 512):
    source.resize((size, size), Image.Resampling.LANCZOS).save(Path('public') / f'icon-{size}.png', format='PNG', optimize=True)
    print(f'created public/icon-{size}.png')
