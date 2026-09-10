"""Make lightweight navigation models from the existing display GLBs.

Run with Blender --background --factory-startup --python scripts/build-home-models.py.
Detailed project viewers and original models are unchanged.
"""
import bpy
from pathlib import Path
import subprocess
import sys

selected = set(sys.argv[sys.argv.index('--') + 1:]) if '--' in sys.argv else set()

root = Path(__file__).resolve().parents[1]
destination = root / 'assets/models/home'
destination.mkdir(exist_ok=True)
for source, name, budget in [
    ('trout-v10', 'trout', 55000),
    ('baguette-holder', 'baguette-holder', 24000),
    ('garage-simple-hinges', 'modular-garage', 32000),
]:
    if selected and name not in selected:
        continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(root / f'assets/models/{source}.glb'))
    if name == 'modular-garage':
        for obj in list(bpy.data.objects):
            if obj.name.startswith(('UNIT_Kitchen', 'UNIT_Dining')):
                for child in list(obj.children_recursive):
                    bpy.data.objects.remove(child, do_unlink=True)
                bpy.data.objects.remove(obj, do_unlink=True)
        for obj in list(bpy.data.objects):
            if obj.name.startswith('Universal_side_clip'):
                bpy.data.objects.remove(obj, do_unlink=True)
    meshes = [obj for obj in bpy.data.objects if obj.type == 'MESH']
    faces = sum(len(obj.data.polygons) for obj in meshes)
    for obj in bpy.data.objects:
        obj.animation_data_clear()
    for obj in meshes:
        if len(obj.data.polygons) > 200:
            bpy.context.view_layer.objects.active = obj
            modifier = obj.modifiers.new('Navigation mesh reduction', 'DECIMATE')
            modifier.ratio = min(1, budget / max(1, faces))
            bpy.ops.object.modifier_apply(modifier=modifier.name)
    bpy.ops.export_scene.gltf(filepath=str(destination / f'{name}.glb'), export_format='GLB',
                              export_animations=False, export_cameras=False, export_lights=False)
    print(name, (destination / f'{name}.glb').stat().st_size, 'bytes')

# Station needs intact circular topology, rather than generic decimation.
if not selected or 'station' in selected:
    subprocess.run(['node', str(root / 'scripts/build-home-station.mjs')], check=True)
