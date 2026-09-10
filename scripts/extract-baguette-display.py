"""Extract the continuous display shell from the matching v2 design source.

Usage: python scripts/extract-baguette-display.py /path/to/baguette_case_v2.py /tmp/baguette-display.json
Uses the design's existing Python dependencies. The print source is read only.
The display retains the shell, ribs, hinge, latches and strap lugs, stopping
before the print-segment spigot, socket and backward center chamfer are cut.
"""
import ast
import json
from pathlib import Path
import sys

source, output = map(Path, sys.argv[1:3])
source = source.resolve()
tree = ast.parse(source.read_text(), filename=str(source))
build = next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == 'build')
joint_start = next(i for i, node in enumerate(build.body)
                   if isinstance(node, ast.Assign)
                   and any(isinstance(target, ast.Name) and target.id == 'b_wall' for target in node.targets))
build.body = build.body[:joint_start] + ast.parse('return trough, lid, x_axis, D').body
ast.fix_missing_locations(tree)
sys.path.insert(0, str(source.parent))
design = {'__file__': str(source), '__name__': 'baguette_display_source'}
exec(compile(tree, str(source), 'exec'), design)
design['set_circular_segments'](64)
trough, lid, axis, _ = design['build']('final')
parts = []
for name, solid in [('base', trough), ('lid', lid)]:
    mesh = design['to_trimesh'](solid)
    assert mesh.is_watertight and mesh.is_winding_consistent, f'{name}: invalid shell'
    # Remove only detached numerical CSG debris, never any connected feature.
    components = mesh.split(only_watertight=False)
    body = max(components, key=lambda component: abs(component.volume))
    assert sum(abs(c.volume) for c in components if c is not body) < 0.1
    assert body.is_watertight and body.is_winding_consistent
    vertices = body.vertices[:, [1, 2, 0]]  # Source XYZ -> viewer YZX.
    parts.append({'name': name, 'vertices': vertices.tolist(), 'triangles': body.faces.tolist()})
    print(f'{name}: {len(body.faces):,} triangles; one watertight continuous shell', flush=True)
output.write_text(json.dumps({'axis': [0, 0, axis], 'parts': parts,
                             'continuousDisplayShell': True}, separators=(',', ':')))
print(f'Wrote {output}', flush=True)
