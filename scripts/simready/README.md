# SimReady produce pipeline

Turns assets from [NVIDIA SimReady Assets](https://huggingface.co/datasets/nvidia/simready-assets)
(CC BY 4.0) into the web files in `public/models/produce/`. Credit every asset you
add in `public/models/produce/ATTRIBUTION.md`.

## Setup

```bash
uv venv .venv-usd
uv pip install --python .venv-usd/Scripts/python.exe usd-core==26.11 numpy pillow pygltflib
npm install --prefix .gltf-tools @gltf-transform/cli@4.5.1
```

Keep both folders out of git.

## Add a crop

```bash
# 1. Download only what a web model needs (root USD, payloads, 512px textures,
#    transparent render, licence). Pass `thumb` as a third argument to fetch
#    just the render.
.venv-usd/Scripts/python.exe scripts/simready/fetch_asset.py food_produce_tomato_a01 .simready

# 2. Convert to GLB (Y up, recentred, textures embedded)
.venv-usd/Scripts/python.exe scripts/simready/usd_to_glb.py \
  .simready/food_produce_tomato_a01/simready_usd/sm_food_produce_tomato_a01_01.usd tomato-raw.glb

# 3. Compress geometry with meshopt and textures as WebP
.gltf-tools/node_modules/.bin/gltf-transform optimize tomato-raw.glb public/models/produce/tomato.glb \
  --compress meshopt --texture-compress webp --texture-size 512

# 4. Renders for lists: add the asset to ASSETS in make_thumbs.py, then
.venv-usd/Scripts/python.exe scripts/simready/make_thumbs.py .simready public/models/produce/thumbs
```

Then map the crop name to its file in `src/lib/produce.ts`. Keep each GLB under
about 120 KB; scans with seams on every face (corn) do not simplify well and
are better used as renders only.
