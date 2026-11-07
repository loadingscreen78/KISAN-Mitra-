"""Convert a SimReady produce asset (USD + UsdPreviewSurface) into a small GLB.

- Composes the stage (instance proxies included) and bakes world transforms.
- Triangulates, de-indexes faceVarying normals/UVs, then welds identical corners.
- Converts Z-up to glTF's Y-up and recentres the model on its bounding box.
- Embeds the 512px texture copies: albedo as JPEG, normal and ORM as PNG.
  ORM already matches glTF (R occlusion, G roughness, B metallic).

usage: usd_to_glb.py <root.usd> <out.glb>
"""
import io
import pathlib
import sys

import numpy as np
from PIL import Image
from pxr import Gf, Usd, UsdGeom, UsdShade
import pygltflib as gl

root_usd, out_path = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
stage = Usd.Stage.Open(str(root_usd))
z_up = UsdGeom.GetStageUpAxis(stage) == UsdGeom.Tokens.z

positions, normals, uvs, indices = [], [], [], []
texture_paths = {}
vertex_offset = 0

for prim in stage.Traverse(Usd.TraverseInstanceProxies()):
    if not prim.IsA(UsdGeom.Mesh):
        continue
    mesh = UsdGeom.Mesh(prim)
    points = np.asarray(mesh.GetPointsAttr().Get(), dtype=np.float64)
    counts = np.asarray(mesh.GetFaceVertexCountsAttr().Get())
    face_indices = np.asarray(mesh.GetFaceVertexIndicesAttr().Get())

    xf = mesh.ComputeLocalToWorldTransform(Usd.TimeCode.Default())
    matrix = np.array(xf, dtype=np.float64)  # row-major, row vectors
    world = np.c_[points, np.ones(len(points))] @ matrix
    world = world[:, :3]
    normal_matrix = np.linalg.inv(matrix[:3, :3]).T

    corner_pos = world[face_indices]

    raw_normals = mesh.GetNormalsAttr().Get()
    interp = mesh.GetNormalsInterpolation()
    if raw_normals is not None and len(raw_normals):
        n = np.asarray(raw_normals, dtype=np.float64)
        corner_nrm = n if interp == 'faceVarying' else n[face_indices]
        corner_nrm = corner_nrm @ normal_matrix.T
    else:
        corner_nrm = None

    st = UsdGeom.PrimvarsAPI(prim).GetPrimvar('st')
    if st and st.HasValue():
        values = np.asarray(st.Get(), dtype=np.float64)
        st_idx = st.GetIndices()
        if st_idx is not None and len(st_idx):
            values = values[np.asarray(st_idx)]
        corner_uv = values if st.GetInterpolation() == 'faceVarying' else values[face_indices]
    else:
        corner_uv = np.zeros((len(face_indices), 2))

    # Fan triangulation over corners.
    tris = []
    start = 0
    for count in counts:
        for k in range(1, count - 1):
            tris.append((start, start + k, start + k + 1))
        start += count
    tris = np.asarray(tris, dtype=np.int64)

    if corner_nrm is None:
        corner_nrm = np.zeros_like(corner_pos)
        a, b, c = corner_pos[tris[:, 0]], corner_pos[tris[:, 1]], corner_pos[tris[:, 2]]
        face_n = np.cross(b - a, c - a)
        for column in range(3):
            np.add.at(corner_nrm, tris[:, column], face_n)

    positions.append(corner_pos)
    normals.append(corner_nrm)
    uvs.append(corner_uv)
    indices.append(tris + vertex_offset)
    vertex_offset += len(corner_pos)

    material, _ = UsdShade.MaterialBindingAPI(prim).ComputeBoundMaterial()
    if material and not texture_paths:
        for shader_prim in Usd.PrimRange(material.GetPrim()):
            shader = UsdShade.Shader(shader_prim)
            if not shader or shader.GetIdAttr().Get() != 'UsdUVTexture':
                continue
            asset = shader.GetInput('file').Get()
            name = shader_prim.GetName().lower()
            resolved = pathlib.Path(asset.resolvedPath or (pathlib.Path(shader_prim.GetStage().GetRootLayer().realPath).parent / asset.path))
            # "normal" contains "orm", so test for it first.
            if 'normal' in name:
                texture_paths['normal'] = resolved
            elif 'albedo' in name or 'diffuse' in name or 'base' in name:
                texture_paths['albedo'] = resolved
            elif 'orm' in name:
                texture_paths['orm'] = resolved

pos = np.concatenate(positions)
nrm = np.concatenate(normals)
uv = np.concatenate(uvs)
tri = np.concatenate(indices)

if z_up:
    pos = np.c_[pos[:, 0], pos[:, 2], -pos[:, 1]]
    nrm = np.c_[nrm[:, 0], nrm[:, 2], -nrm[:, 1]]
nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-12
uv = np.c_[uv[:, 0], 1.0 - uv[:, 1]]

# Recentre on the bounding box so the model spins around its middle.
pos -= (pos.min(axis=0) + pos.max(axis=0)) / 2

# Weld identical corners.
key = np.round(np.c_[pos * 1e5, nrm * 1e3, uv * 1e4]).astype(np.int64)
_, first, inverse = np.unique(key, axis=0, return_index=True, return_inverse=True)
pos, nrm, uv = pos[first], nrm[first], uv[first]
tri = inverse.reshape(-1)[tri]

pos = pos.astype(np.float32)
nrm = nrm.astype(np.float32)
uv = uv.astype(np.float32)
index_type = np.uint16 if len(pos) < 65536 else np.uint32
tri = tri.astype(index_type).reshape(-1)


def find_texture(kind: str) -> pathlib.Path | None:
    """Prefer the 512px copy that sits in Textures/.thumbs/512x512/."""
    path = texture_paths.get(kind)
    if path is None:
        return None
    # Texture paths are relative to the payload layer that authored them, so
    # look the file up by name inside this asset's folder instead.
    textures_dir = root_usd.parent / 'Textures'
    for candidate in (textures_dir / '.thumbs' / '512x512' / (path.name + '.png'), textures_dir / path.name):
        if candidate.exists():
            return candidate
    return None


def encode(path: pathlib.Path, fmt: str) -> bytes:
    image = Image.open(path)
    image = image.convert('RGB')
    if max(image.size) > 512:
        image.thumbnail((512, 512), Image.LANCZOS)
    buffer = io.BytesIO()
    if fmt == 'JPEG':
        image.save(buffer, 'JPEG', quality=86, optimize=True)
    else:
        image.save(buffer, 'PNG', optimize=True)
    return buffer.getvalue()


blob = bytearray()
buffer_views, accessors = [], []


def add_view(data: bytes, target=None) -> int:
    while len(blob) % 4:
        blob.append(0)
    offset = len(blob)
    blob.extend(data)
    buffer_views.append(gl.BufferView(buffer=0, byteOffset=offset, byteLength=len(data), target=target))
    return len(buffer_views) - 1


def add_accessor(array: np.ndarray, component, kind, target, with_bounds=False) -> int:
    view = add_view(array.tobytes(), target)
    accessor = gl.Accessor(bufferView=view, componentType=component, count=len(array) if array.ndim > 1 else array.size, type=kind)
    if with_bounds:
        accessor.min = array.min(axis=0).tolist()
        accessor.max = array.max(axis=0).tolist()
    accessors.append(accessor)
    return len(accessors) - 1


pos_acc = add_accessor(pos, gl.FLOAT, gl.VEC3, gl.ARRAY_BUFFER, with_bounds=True)
nrm_acc = add_accessor(nrm, gl.FLOAT, gl.VEC3, gl.ARRAY_BUFFER)
uv_acc = add_accessor(uv, gl.FLOAT, gl.VEC2, gl.ARRAY_BUFFER)
idx_acc = add_accessor(tri, gl.UNSIGNED_SHORT if index_type == np.uint16 else gl.UNSIGNED_INT, gl.SCALAR, gl.ELEMENT_ARRAY_BUFFER)

images, textures = [], []


def add_texture(kind: str, fmt: str):
    path = find_texture(kind)
    if path is None:
        return None
    view = add_view(encode(path, fmt))
    images.append(gl.Image(bufferView=view, mimeType='image/jpeg' if fmt == 'JPEG' else 'image/png'))
    textures.append(gl.Texture(source=len(images) - 1, sampler=0))
    return len(textures) - 1


albedo = add_texture('albedo', 'JPEG')
normal = add_texture('normal', 'PNG')
orm = add_texture('orm', 'PNG')

pbr = gl.PbrMetallicRoughness(baseColorFactor=[1, 1, 1, 1], metallicFactor=1.0, roughnessFactor=1.0)
if albedo is not None:
    pbr.baseColorTexture = gl.TextureInfo(index=albedo)
if orm is not None:
    pbr.metallicRoughnessTexture = gl.TextureInfo(index=orm)
else:
    pbr.metallicFactor, pbr.roughnessFactor = 0.0, 0.7
material = gl.Material(name=root_usd.stem, pbrMetallicRoughness=pbr)
if normal is not None:
    material.normalTexture = gl.NormalMaterialTexture(index=normal)
if orm is not None:
    material.occlusionTexture = gl.OcclusionTextureInfo(index=orm) if hasattr(gl, "OcclusionTextureInfo") else gl.OcclusionMaterialTexture(index=orm)

gltf = gl.GLTF2(
    asset=gl.Asset(version='2.0', generator='KisanMitra usd_to_glb', copyright='NVIDIA SimReady Assets, CC BY 4.0'),
    scene=0,
    scenes=[gl.Scene(nodes=[0])],
    nodes=[gl.Node(mesh=0, name=root_usd.stem)],
    meshes=[gl.Mesh(primitives=[gl.Primitive(attributes=gl.Attributes(POSITION=pos_acc, NORMAL=nrm_acc, TEXCOORD_0=uv_acc), indices=idx_acc, material=0)])],
    materials=[material],
    samplers=[gl.Sampler(magFilter=gl.LINEAR, minFilter=gl.LINEAR_MIPMAP_LINEAR, wrapS=gl.REPEAT, wrapT=gl.REPEAT)],
    images=images,
    textures=textures,
    accessors=accessors,
    bufferViews=buffer_views,
    buffers=[gl.Buffer(byteLength=len(blob))],
)
gltf.set_binary_blob(bytes(blob))
out_path.parent.mkdir(parents=True, exist_ok=True)
gltf.save_binary(str(out_path))
size = pos.max(axis=0) - pos.min(axis=0)
print(f'{out_path.name}: {len(pos)} verts, {len(tri) // 3} tris, size {np.round(size, 3)} m, textures {sorted(texture_paths)}, {out_path.stat().st_size / 1024:.0f} KB')
