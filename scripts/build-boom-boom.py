#!/usr/bin/env python3
"""Package the Boom Boom v16 print kit for project.html?id=boom-boom.

Reads the assembly-pose meshes written by the kit's build_print_model.py
(print_parts/work/*_assembly_colorN.npz, the same topology as the released
3MF objects) and writes:

  assets/models/boom-boom.glb               assembled train, one node per printed part
  assets/models/boom-boom.provenance.json   source hashes and part list
  assets/boom-boom/*.jpg                    web copies of the kit's studio renders
  assets/boom-boom/files/*.3mf              released print files, hash-checked against delivery_manifest.json

Each part node carries extras.explode, a millimetre offset used by the
viewer's Explode action. Vertices are stored with KHR_mesh_quantization
(int16 positions, about 0.003 mm steps; int8 normals), which three.js
loads natively. The alternative twin horns and the separate
receiver test module are not part of the assembled train and are omitted.
The source folder is only read.

Usage (Python with numpy, trimesh and Pillow):
  python3 scripts/build-boom-boom.py /path/to/boom_boom /path/to/Boom_Boom_complete.zip
"""
import argparse
import hashlib
import json
import math
import struct
import zipfile
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image

SITE = Path(__file__).resolve().parent.parent
GLB = SITE / 'assets/models/boom-boom.glb'
PROVENANCE = SITE / 'assets/models/boom-boom.provenance.json'
IMAGES = SITE / 'assets/boom-boom'
FILES = IMAGES / 'files'

# Filament palette from print_parts/manifest.json, in color-index order.
PALETTE = [
    ('Vermilion orange', '#E45526', .55),
    ('Warm ivory roof', '#E6DFCB', .6),
    ('Slate glass', '#858991', .28),
    ('Charcoal chassis and pupils', '#23282A', .62),
    ('Satin gray trim', '#91958A', .5),
    ('Ivory eyes and lamp', '#FFFDF1', .45),
    ('Amber nose', '#EFB43D', .4),
]

# Printed parts on the assembled train (source prefix, display name, explode offset in mm).
# Model axes: +X right side, -Y toward the face, +Z up. The viewer frames the assembled
# train, so the stack sits slightly high (the camera looks down on it) and stays inside
# that frame through a full orbit; the lower base is the fixed reference.
PARTS = [
    ('01_Train_body', 'Train body', (0, 0, 24)),
    ('28_Roof_vents', 'Roof vents', (0, 0, 50)),
    ('14_Light_module', 'Roof light', (0, -4, 58)),
    ('20_Left_eye', 'Left eye', (-4, -20, 24)),
    ('21_Right_eye', 'Right eye', (4, -20, 24)),
    ('22_Smile', 'Smile', (0, -20, 19)),
    ('23_Amber_front_light', 'Amber front light', (0, -24, 24)),
    ('24_Left_grab_handle', 'Left grab handle', (-16, 0, 24)),
    ('25_Right_grab_handle', 'Right grab handle', (16, 0, 24)),
    ('19_Lower_base', 'Lower base', (0, 0, 0)),
    ('26_Rear_clip', 'Rear coupling', (0, 14, 0)),
    ('16_Front_truck', 'Front truck', (0, 0, -20)),
    ('18_Tank_electronics', 'Tank and electronics', (0, 0, -20)),
    ('17_Rear_truck', 'Rear truck', (0, 0, -20)),
]
for n, axle in enumerate((2, 5, 8, 11), start=1):
    PARTS += [
        (f'{axle:02d}_Axle_{n}', f'Axle {n}', (0, 0, -38)),
        (f'{axle + 1:02d}_Wheel_{n}_L', f'Wheel {n} left', (-12, 0, -38)),
        (f'{axle + 2:02d}_Wheel_{n}_R', f'Wheel {n} right', (12, 0, -38)),
    ]

RENDERS = {
    'assembled_light': 'assembled-light', 'assembled_horns': 'assembled-horns', 'exploded': 'exploded',
    'underside': 'underside', 'lower_base_mounts': 'lower-base-mounts', 'undercarriage_mounts': 'undercarriage-mounts',
    'undercarriage_print_layout': 'undercarriage-print-layout', 'wheel_assembly_detail': 'wheel-assembly',
    'face_alignment': 'face-alignment', 'front_side_junction': 'front-side-junction', 'cab_detail': 'cab-detail',
    'roof_vent_detail': 'roof-vents', 'rear_door_detail': 'rear-door', 'coupler_grasp': 'coupler-grasp',
    'coupler_test': 'coupler-test', 'connector_mount_detail': 'connector-mount',
}

# Released print files (path in the release archive -> published name).
DOWNLOADS = {
    'print_parts/Boom_Boom_v16_multicolor.3mf': 'Boom_Boom_v16_multicolor.3mf',
    'print_parts/Boom_Boom_plate_1_colors.3mf': 'Boom_Boom_plate_1_colors.3mf',
    'print_parts/Boom_Boom_plate_2_colors.3mf': 'Boom_Boom_plate_2_colors.3mf',
    'print_parts/Boom_Boom_plate_3_colors.3mf': 'Boom_Boom_plate_3_colors.3mf',
    'print_parts/Boom_Boom_coupler_test.3mf': 'Boom_Boom_coupler_test.3mf',
    'print_parts/fit_test/Boom_Boom_multicolor.3mf': 'Boom_Boom_fit_test.3mf',
}


def linear(hex_color):
    rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb] + [1.0]


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def quat_multiply(a, b):
    ax, ay, az, aw = a
    bx, by, bz, bw = b
    return [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx,
            aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz]


class Buffer:
    def __init__(self):
        self.data = bytearray()
        self.views = []
        self.accessors = []

    def add(self, array, component, kind, target, normalized=False, bounds=False):
        while len(self.data) % 4:
            self.data.append(0)
        view = {'buffer': 0, 'byteOffset': len(self.data), 'byteLength': array.nbytes, 'target': target}
        if array.ndim == 2:
            view['byteStride'] = array.strides[0]
        self.views.append(view)
        self.data += array.tobytes()
        accessor = {'bufferView': len(self.views) - 1, 'componentType': component, 'count': len(array), 'type': kind}
        if normalized:
            accessor['normalized'] = True
        if bounds:
            accessor['min'] = array[:, :3].min(0).tolist()
            accessor['max'] = array[:, :3].max(0).tolist()
        self.accessors.append(accessor)
        return len(self.accessors) - 1


def shade(vertices, faces):
    mesh = trimesh.Trimesh(vertices, faces, process=False)
    # Split vertices along creases so machined edges stay crisp and curved surfaces stay smooth.
    shaded = trimesh.graph.smooth_shade(mesh, angle=math.radians(35))
    normals = np.array(shaded.vertex_normals)
    # A few vertices sit where adjacent face normals cancel; give them one face's normal instead.
    weak = np.flatnonzero(np.linalg.norm(normals, axis=1) < .5)
    if len(weak):
        owner = np.full(len(normals), -1)
        owner[shaded.faces.reshape(-1)] = np.repeat(np.arange(len(shaded.faces)), 3)
        normals[weak] = [shaded.face_normals[owner[i]] if owner[i] >= 0 else (0, 0, 1) for i in weak]
    return shaded.vertices, normals, shaded.faces


def primitive(buffer, positions, normals, faces, center, extent, material):
    # KHR_mesh_quantization: int16 positions dequantized by the part node's scale and translation,
    # int8 normals, each padded to a four-byte vertex stride.
    quantized = np.zeros((len(positions), 4), np.int16)
    quantized[:, :3] = np.round((positions - center) / extent * 32767)
    packed = np.zeros((len(normals), 4), np.int8)
    packed[:, :3] = np.round(np.clip(normals, -1, 1) * 127)
    index_type, component = (np.uint16, 5123) if len(positions) < 65536 else (np.uint32, 5125)
    return {
        'attributes': {'POSITION': buffer.add(quantized, 5122, 'VEC3', 34962, normalized=True, bounds=True),
                       'NORMAL': buffer.add(packed, 5120, 'VEC3', 34962, normalized=True)},
        'indices': buffer.add(np.ascontiguousarray(faces.reshape(-1), dtype=index_type), component, 'SCALAR', 34963),
        'material': material,
    }


def build_glb(source, release_sha):
    work = source / 'print_parts/work'
    buffer = Buffer()
    meshes, nodes, parts, triangles = [], [], [], 0
    for prefix, name, explode in PARTS:
        files = sorted(work.glob(f'{prefix}_assembly_color*.npz'))
        if not files:
            raise SystemExit(f'Missing assembly meshes for {prefix}')
        shaded = []
        for file in files:
            data = np.load(file)
            shaded.append((int(file.stem.rsplit('color', 1)[1]), *shade(data['V'], data['F'].astype(np.int64))))
        low = np.min([v.min(0) for _, v, _, _ in shaded], axis=0)
        high = np.max([v.max(0) for _, v, _, _ in shaded], axis=0)
        center, extent = (low + high) / 2, float((high - low).max() / 2)
        primitives = [primitive(buffer, v, n, f, center, extent, color) for color, v, n, f in shaded]
        triangles += sum(len(f) for _, _, _, f in shaded)
        meshes.append({'name': name, 'primitives': primitives})
        nodes.append({'name': name, 'mesh': len(meshes) - 1, 'translation': center.tolist(), 'scale': [extent] * 3,
                      'extras': {'explode': list(map(float, explode)), 'part': prefix}})
        parts.append({'part': prefix, 'name': name, 'colors': [int(f.stem.rsplit('color', 1)[1]) for f in files]})
    # Z-up millimetres to glTF Y-up, then a three-quarter turn so the face and side read together.
    half = math.radians(-90) / 2
    upright = [math.sin(half), 0, 0, math.cos(half)]
    yaw = math.radians(-58) / 2
    rotation = quat_multiply([0, math.sin(yaw), 0, math.cos(yaw)], upright)
    nodes.append({'name': 'BoomBoom', 'rotation': rotation, 'children': list(range(len(PARTS)))})
    materials = [{'name': name, 'pbrMetallicRoughness': {'baseColorFactor': linear(hex_color), 'metallicFactor': 0.0,
                  'roughnessFactor': roughness}} for name, hex_color, roughness in PALETTE]
    while len(buffer.data) % 4:
        buffer.data.append(0)
    document = {
        'asset': {'version': '2.0', 'generator': 'parametric.space build-boom-boom.py',
                  'extras': {'title': 'Boom Boom modular printing kit, v16', 'units': 'millimetres',
                             'release3mfSha256': release_sha}},
        'extensionsUsed': ['KHR_mesh_quantization'], 'extensionsRequired': ['KHR_mesh_quantization'],
        'scene': 0, 'scenes': [{'name': 'Boom Boom', 'nodes': [len(nodes) - 1]}],
        'nodes': nodes, 'meshes': meshes, 'materials': materials,
        'buffers': [{'byteLength': len(buffer.data)}], 'bufferViews': buffer.views, 'accessors': buffer.accessors,
    }
    payload = json.dumps(document, separators=(',', ':')).encode()
    payload += b' ' * (-len(payload) % 4)
    body = bytes(buffer.data)
    GLB.parent.mkdir(parents=True, exist_ok=True)
    with GLB.open('wb') as out:
        out.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(payload) + 8 + len(body)))
        out.write(struct.pack('<II', len(payload), 0x4E4F534A) + payload)
        out.write(struct.pack('<II', len(body), 0x004E4942) + body)
    return parts, triangles


def build_images(release):
    IMAGES.mkdir(parents=True, exist_ok=True)
    for name, slug in RENDERS.items():
        with release.open(f'boom_boom/print_parts/renders/{name}.png') as handle:
            image = Image.open(handle).convert('RGB')
        image.thumbnail((1600, 1600), Image.LANCZOS)
        image.save(IMAGES / f'{slug}.jpg', 'JPEG', quality=84, optimize=True, progressive=True)


def copy_downloads(release, manifest):
    expected = {f['path']: f['sha256'] for f in manifest['files']}
    FILES.mkdir(parents=True, exist_ok=True)
    published = []
    for member, name in DOWNLOADS.items():
        data = release.read(f'boom_boom/{member}')
        digest = hashlib.sha256(data).hexdigest()
        if digest != expected[member]:
            raise SystemExit(f'{member} does not match delivery_manifest.json')
        (FILES / name).write_bytes(data)
        published.append({'file': f'assets/boom-boom/files/{name}', 'release': member, 'sha256': digest, 'bytes': len(data)})
    return published


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('source', type=Path, help='boom_boom project folder (read only)')
    parser.add_argument('release_zip', type=Path, help='verified Boom_Boom_complete.zip (renders and print files are read from it)')
    args = parser.parse_args()
    release = zipfile.ZipFile(args.release_zip)
    manifest = json.loads(release.read('boom_boom/delivery_manifest.json'))
    release_sha = next(f['sha256'] for f in manifest['files'] if f['path'] == 'print_parts/Boom_Boom_v16_multicolor.3mf')
    parts, triangles = build_glb(args.source, release_sha)
    build_images(release)
    downloads = copy_downloads(release, manifest)
    sources = sorted((args.source / 'print_parts/work').glob('*_assembly_color*.npz'))
    PROVENANCE.write_text(json.dumps({
        'model': 'assets/models/boom-boom.glb',
        'revision': manifest['revision'],
        'units': 'millimetres',
        'release3mf': {'file': 'Boom_Boom_v16_multicolor.3mf', 'sha256': release_sha},
        'releaseZipSha256': sha256(args.release_zip),
        'downloads': downloads,
        'triangles': triangles,
        'parts': parts,
        'omitted': ['15_Twin_horn_module (alternative roof accessory)', '27_Mating_receiver (separate coupling test module)'],
        'sourceMeshes': {p.name: sha256(p) for p in sources if any(p.name.startswith(q[0]) for q in PARTS)},
        'palette': [{'name': n, 'color': c} for n, c, _ in PALETTE],
        'note': 'Visualization of the released print geometry. Colors are the kit filament palette; materials are display styling.',
    }, indent=1) + '\n')
    print(f'{GLB.relative_to(SITE)}: {GLB.stat().st_size / 1e6:.2f} MB, {len(parts)} parts, {triangles} triangles')


if __name__ == '__main__':
    main()
