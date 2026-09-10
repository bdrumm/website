import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeVertices, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { readFile, writeFile } from 'node:fs/promises';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); });
  }
};
const data = JSON.parse(await readFile(process.argv[2], 'utf8'));
if (!data.continuousDisplayShell) {
  throw new Error('Generate the continuous shell with scripts/extract-baguette-display.py first.');
}
const model = new THREE.Group();
model.name = 'Baguette holder — hinged assembly';
const pivot = new THREE.Group();
pivot.name = 'LidHinge';
pivot.position.fromArray(data.axis);
model.add(pivot);
const material = new THREE.MeshPhysicalMaterial({
  name: 'Warm gold silk', color: '#d9ad63', metalness: .48, roughness: .34,
  clearcoat: .22, clearcoatRoughness: .32, iridescence: .1, iridescenceIOR: 1.32
});
for (const part of data.parts) {
  const raw = new THREE.BufferGeometry();
  raw.setAttribute('position', new THREE.Float32BufferAttribute(part.vertices.flat(), 3));
  raw.setIndex(part.triangles.flat());
  // Smooth the curved crust, preserving the crisp rims, clips and hinge edges.
  const creased = toCreasedNormals(raw, THREE.MathUtils.degToRad(45));
  const geometry = mergeVertices(creased, 1e-5);
  raw.dispose();
  creased.dispose();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = part.name;
  if (part.name === 'lid') {
    mesh.position.fromArray(data.axis).negate();
    pivot.add(mesh);
  } else model.add(mesh);
}
model.userData = {
  source: 'baguette_v2.3mf and matching baguette_case_v2.py',
  description: 'Continuous display shell before print-segment coupling cuts; original longitudinal lid hinge retained.',
  units: 'millimetres', continuousDisplayShell: true, manufacturingModel: false
};
const result = await new GLTFExporter().parseAsync(model, { binary: true });
await writeFile('assets/models/baguette-holder.glb', Buffer.from(result));
console.log('Exported continuous hinged model:', result.byteLength, 'bytes');
