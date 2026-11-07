# Produce scans

The 3D models (`*.glb`) and renders (`thumbs/*.webp`) in this folder are derived
from **NVIDIA SimReady Assets**
(https://huggingface.co/datasets/nvidia/simready-assets), licensed under
**Creative Commons Attribution 4.0 International** (CC BY 4.0,
https://creativecommons.org/licenses/by/4.0/). The full licence text is in
`LICENSE.txt`.

## Changes made

- USD geometry and UsdPreviewSurface materials converted to glTF binary (GLB),
  recentred, rotated from Z up to Y up, and compressed with meshopt.
- Textures taken from the 512px copies in each asset and re-encoded as WebP.
- Renders cropped from each asset's transparent 256x256 thumbnail and saved as
  256px WebP.

The conversion scripts live in `scripts/simready/`.

## Source assets

| File | SimReady asset |
| --- | --- |
| tomato.glb, thumbs/tomato.webp | food_produce_tomato_a01 |
| onion.glb, thumbs/onion.webp | food_produce_onion_c01 |
| potato.glb, thumbs/potato.webp | food_produce_potato_c01 |
| capsicum.glb, thumbs/capsicum.webp | food_produce_bellPepper_a01 |
| brinjal.glb, thumbs/brinjal.webp | food_produce_eggplant_a01 |
| mango.glb, thumbs/mango.webp | food_produce_mango_a01 |
| thumbs/corn.webp | food_produce_corn_b01 |
| thumbs/sweet-potato.webp | food_produce_sweetPotato_a01 |
| thumbs/banana.webp | food_produce_banana_a01 |
| thumbs/mushroom.webp | food_produce_mushroom_a01 |
| thumbs/lemon.webp | food_produce_lemon_a01 |
| thumbs/garlic.webp | food_produce_garlic_bulb_a01 |
| thumbs/carrot.webp | food_produce_freshCarrot_a01 |
| thumbs/bitter-gourd.webp | food_produce_bitterMelon_a01 |
| thumbs/squash.webp | food_produce_squash_a01 |
| thumbs/apple.webp | food_produce_apple_redDelicous_a01 |
| thumbs/grape.webp | food_produce_grape_a01 |
| thumbs/orange.webp | food_produce_orange_a01 |
| thumbs/peach.webp | food_produce_peach_a01 |
| thumbs/strawberry.webp | food_produce_strawberry_a01 |
