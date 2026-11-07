"""Turn SimReady transparent renders into small square WebP crop images.

Crops each render to its visible pixels, pads to a square with a little air,
and saves 256px WebP with alpha.

usage: make_thumbs.py <assets_root> <out_dir>
"""
import pathlib
import sys

from PIL import Image

ASSETS = {
    'food_produce_tomato_a01': 'tomato',
    'food_produce_onion_c01': 'onion',
    'food_produce_potato_c01': 'potato',
    'food_produce_bellPepper_a01': 'capsicum',
    'food_produce_eggplant_a01': 'brinjal',
    'food_produce_mango_a01': 'mango',
    'food_produce_corn_b01': 'corn',
    'food_produce_sweetPotato_a01': 'sweet-potato',
    'food_produce_banana_a01': 'banana',
    'food_produce_mushroom_a01': 'mushroom',
    'food_produce_lemon_a01': 'lemon',
    'food_produce_garlic_bulb_a01': 'garlic',
    'food_produce_freshCarrot_a01': 'carrot',
    'food_produce_bitterMelon_a01': 'bitter-gourd',
    'food_produce_squash_a01': 'squash',
    'food_produce_apple_redDelicous_a01': 'apple',
    'food_produce_grape_a01': 'grape',
    'food_produce_orange_a01': 'orange',
    'food_produce_peach_a01': 'peach',
    'food_produce_strawberry_a01': 'strawberry',
}

root, out_dir = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)

for asset, slug in ASSETS.items():
    renders = list((root / asset).rglob('*.usd_transparent.png'))
    if not renders:
        print('MISSING', asset)
        continue
    image = Image.open(renders[0]).convert('RGBA')
    alpha = image.getchannel('A')
    box = alpha.point(lambda a: 255 if a > 8 else 0).getbbox()
    if box is None:
        print('EMPTY', asset)
        continue
    if alpha.getextrema()[0] == 255:
        print('NO TRANSPARENCY', asset)
    image = image.crop(box)
    side = int(max(image.size) * 1.08)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(image, ((side - image.width) // 2, (side - image.height) // 2))
    canvas = canvas.resize((256, 256), Image.LANCZOS)
    target = out_dir / f'{slug}.webp'
    canvas.save(target, 'WEBP', quality=82, method=6)
    print(f'{slug:14s} {target.stat().st_size / 1024:5.1f} KB  from {renders[0].name}')
