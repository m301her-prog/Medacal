from pathlib import Path
from PIL import Image

source = Path('assets/icon-foreground.png')
image = Image.open(source).convert('RGBA')
# The supplied artwork is a landscape canvas; use its centered square artwork
# as the standard Android icon while keeping the requested source path intact.
side = min(image.size)
left = (image.width - side) // 2
top = (image.height - side) // 2
square = image.crop((left, top, left + side, top + side))
for name in ('icon.png', 'icon-background.png', 'icon-only.png'):
    square.save(Path('assets') / name, format='PNG', optimize=True)
# Re-encode the requested source with a truthful PNG container.
image.save(source, format='PNG', optimize=True)
print(f'normalized {source}: {image.size} RGBA PNG; generated square icon sources: {side}x{side}')
