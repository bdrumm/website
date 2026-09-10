import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Raycaster, Vector3 } from 'three';
import { installAction } from './model-actions.js';

async function loadModel(path) {
  const bytes = await readFile(new URL(path, import.meta.url));
  const { scene } = await new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  scene.updateMatrixWorld(true);
  return scene;
}

for (const path of ['../assets/models/baguette-holder.glb', '../assets/models/home/baguette-holder.glb']) {
  test(`${path}: the exterior flows continuously through the center joint`, async () => {
    const scene = await loadModel(path);
    const ray = new Raycaster();
    // Sample the exterior around the old -4 mm joint. The old print bevel
    // produced a 3.29 mm step in one 0.25 mm interval on the front surface.
    for (const [y, z] of [[1, 0], [-1, 0], [0, 1], [.6, .8]]) {
      let previous;
      for (let x = -12; x <= 6; x += .25) {
        ray.set(new Vector3(x, y * 150, z * 150), new Vector3(0, -y, -z));
        const hit = ray.intersectObject(scene, true)[0];
        assert.ok(hit, `Missing exterior at ${x} mm, direction ${y},${z}`);
        const radius = Math.hypot(hit.point.y, hit.point.z);
        assert.ok(radius > 30, 'A ray must hit the exterior shell, not the interior bore');
        if (previous !== undefined) assert.ok(Math.abs(radius - previous) < .2,
          `Discontinuous center surface at ${x} mm, direction ${y},${z}`);
        previous = radius;
      }
    }
    scene.traverse(object => {
      if (!object.isMesh) return;
      const normals = object.geometry.attributes.normal;
      for (let i = 0; i < normals.count; i++) {
        const length = Math.hypot(normals.getX(i), normals.getY(i), normals.getZ(i));
        assert.ok(Number.isFinite(length) && Math.abs(length - 1) < .001,
          `${object.name}: invalid surface normal`);
      }
    });
  });
}

test('the continuous shell keeps the original lid hinge and returns exactly to closed', async () => {
  const scene = await loadModel('../assets/models/baguette-holder.glb');
  const lid = scene.getObjectByName('lid');
  const base = scene.getObjectByName('base');
  const hinge = scene.getObjectByName('LidHinge');
  assert.equal(lid.parent, hinge);
  assert.ok(Math.abs(hinge.position.z + 45.43847678735865) < .0001);
  const baseBounds = new Box3().setFromObject(base);
  const lidBounds = new Box3().setFromObject(lid);
  const action = installAction(scene, 'open');
  action.update(1 / 60, true, true);
  scene.updateMatrixWorld(true);
  assert.equal(hinge.rotation.x, -Math.PI);
  assert.ok(new Box3().setFromObject(base).equals(baseBounds));
  assert.ok(new Box3().setFromObject(lid).max.z < -40);
  action.update(1 / 60, false, true);
  scene.updateMatrixWorld(true);
  assert.ok(new Box3().setFromObject(lid).equals(lidBounds));
});
