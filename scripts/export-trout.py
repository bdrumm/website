"""Export the matching assembled Blender scene as a colored web model.

Run Blender with --background --factory-startup --disable-autoexec, the matching
.blend, --python scripts/export-trout.py -- --source-3mf source.3mf --output out.glb.
The source 3MF and Blender file are never modified.
"""

import argparse
import hashlib
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Matrix

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source-3mf', required=True, type=Path)
parser.add_argument('--output', required=True, type=Path)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
source_hash = hashlib.sha256(args.source_3mf.read_bytes()).hexdigest()

# V10 opens on an inspection scene; export its complete assembled scene.
scene = next(s for s in bpy.data.scenes if s.name.endswith('— assembled'))
bpy.context.window.scene = scene
objects = [o for o in scene.objects if o.type == 'MESH' and 'assembled' in o.name]
if not objects:
    raise ValueError('The matching file has no assembled trout meshes')
bpy.ops.object.select_all(action='DESELECT')
source_triangles = 0
for obj in objects:
    obj.hide_set(False)
    obj.hide_viewport = False
    obj.select_set(True)
    obj.data = obj.data.copy()
    mirrored = obj.matrix_world.determinant() < 0
    obj.data.transform(obj.matrix_world)
    if mirrored:
        obj.data.flip_normals()
    obj.matrix_world = Matrix.Identity(4)
    source_triangles += sum(len(face.vertices) - 2 for face in obj.data.polygons)
    bpy.context.view_layer.objects.active = obj
    if len(obj.data.polygons) > 12000:
        modifier = obj.modifiers.new('Web detail reduction', 'DECIMATE')
        modifier.ratio = max(.08, 12000 / len(obj.data.polygons))
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    for face in obj.data.polygons:
        face.use_smooth = True

coordinates = []
for obj in objects:
    values = np.empty(len(obj.data.vertices) * 3)
    obj.data.vertices.foreach_get('co', values)
    coordinates.append(values.reshape(-1, 3))
lo = np.min(np.vstack(coordinates), axis=0)
hi = np.max(np.vstack(coordinates), axis=0)

material = bpy.data.materials.new('Coral mint violet silk')
material.use_nodes = True
nodes = material.node_tree.nodes
surface = nodes.get('Principled BSDF')
surface.inputs['Metallic'].default_value = .38
surface.inputs['Roughness'].default_value = .31
surface.inputs['Coat Weight'].default_value = .3
attribute = nodes.new('ShaderNodeVertexColor')
attribute.layer_name = 'Silk'
material.node_tree.links.new(attribute.outputs['Color'], surface.inputs['Base Color'])


def linear(color):
    return np.where(color <= .04045, color / 12.92, ((color + .055) / 1.055) ** 2.4)


mint = linear(np.array([168, 236, 173]) / 255)
coral = linear(np.array([244, 116, 152]) / 255)
violet = linear(np.array([174, 117, 229]) / 255)
for obj, coords in zip(objects, coordinates):
    height = np.clip((coords[:, 2] - lo[2]) / (hi[2] - lo[2]), 0, 1)
    length = np.clip((coords[:, 0] - lo[0]) / (hi[0] - lo[0]), 0, 1)
    blend = np.clip((height - .35) / .35, 0, 1)
    blend = blend * blend * (3 - 2 * blend)
    colors = mint[None, :] * (1 - blend[:, None]) + coral[None, :] * blend[:, None]
    tail = np.clip((length - .72) / .25, 0, 1) * .95
    colors = colors * (1 - tail[:, None]) + violet[None, :] * tail[:, None]
    color_attribute = obj.data.color_attributes.new(name='Silk', type='FLOAT_COLOR', domain='POINT')
    color_attribute.data.foreach_set('color', np.column_stack([colors, np.ones(len(colors))]).ravel())
    obj.data.materials.clear()
    obj.data.materials.append(material)

# One mesh and material keep the detailed trout inexpensive to draw.
bpy.context.view_layer.objects.active = objects[0]
bpy.ops.object.join()
model = bpy.context.object
model.name = 'Articulated Trout V10 — assembled'
model['source'] = args.source_3mf.name
model['source_sha256'] = source_hash
model['assembly_source'] = Path(bpy.data.filepath).name
model['description'] = 'Assembled print geometry optimized for the web, with coral, mint and violet visualization colors.'
args.output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=str(args.output.resolve()), export_format='GLB', use_selection=True,
    export_animations=False, export_yup=True, export_extras=True,
)
print('EXPORTED', args.output, 'source triangles:', source_triangles,
      'web polygons:', len(model.data.polygons), 'bounds:', lo.tolist(), hi.tolist(), flush=True)
