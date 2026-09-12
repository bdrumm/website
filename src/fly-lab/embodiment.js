import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

function box(group, position, scale, color) {
  const m = new THREE.Mesh(
    new RoundedBoxGeometry(...scale, 3, Math.min(...scale) * 0.18),
    new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.2 }),
  );
  m.position.set(...position);
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
}
function rod(group, a, b, r, color) {
  const x = new THREE.Vector3(...a),
    y = new THREE.Vector3(...b),
    d = y.clone().sub(x);
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, d.length(), 10),
    new THREE.MeshStandardMaterial({ color, roughness: 0.55 }),
  );
  m.position.copy(x.add(y).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  group.add(m);
  return m;
}
export function makeChair(parent, task, locked, immobilized = false) {
  const g = new THREE.Group();
  parent.add(g);
  box(g, [-0.8, -0.05, 0], [7.3, 0.4, 4.2], 0x233a50);
  box(g, [-4.65, 2.0, 0], [0.5, 4.7, 4.4], 0x2e4a64);
  for (const x of [-3.7, 1.7])
    for (const z of [-1.6, 1.6])
      rod(g, [x, -0.2, z], [x, -2, z], 0.16, 0x8babc0);
  if (locked) {
    for (const x of [-1.6, 0.8]) {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(1.65, 0.13, 8, 48),
        new THREE.MeshStandardMaterial({ color: 0x75afdb, roughness: 0.62 }),
      );
      band.rotation.y = Math.PI / 2;
      band.position.set(x, 1.75, 0);
      g.add(band);
      for (const side of [-1, 1])
        rod(g, [x, 1.7, side * 1.7], [x, -0.1, side * 2.1], 0.11, 0x75afdb);
    }
  }
  if (task === "bus") {
    rod(g, [4.7, -0.5, 0], [4.5, 2.5, 0], 0.15, 0x8ca6b8);
    const wheel = new THREE.Group();
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.15, 10, 40),
      new THREE.MeshStandardMaterial({ color: 0x263749 }),
    );
    rim.rotation.y = Math.PI / 2;
    wheel.add(rim);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      rod(
        wheel,
        [0, 0, 0],
        [0, 1.4 * Math.sin(a), 1.4 * Math.cos(a)],
        0.075,
        0x78929d,
      );
    }
    wheel.position.set(4.5, 2.5, 0);
    g.add(wheel);
    g.userData.wheel = wheel;
    box(g, [2.4, -0.04, -2.3], [1.2, 0.2, 0.9], 0xa4bfcd);
    box(g, [1.9, 0.55, 2.3], [0.55, 0.35, 0.65], 0x233a50);
    const selector = new THREE.Group();
    selector.position.set(1.9, 1.4, 2.3);
    box(selector, [0, 0, 0], [0.28, 0.24, 0.35], 0x8dbcd1);
    rod(selector, [0, -0.5, 0], [0, 0, 0], 0.075, 0x8babc0);
    g.add(selector);
    g.userData.selector = selector;
  } else {
    box(g, [3.8, 0.82, 0], [1.6, 0.4, 4.5], 0x315573);
    for (const side of [-1, 1])
      box(
        g,
        [3.8, 1.13, side * 1.55],
        [0.85, 0.18, 0.85],
        side > 0 ? 0x91d9bb : 0x7ab9eb,
      );
    box(g, [2.4, -0.04, -2.3], [1.1, 0.2, 0.9], 0xb4bede);
  }
  if (task === "website") {
    g.userData.webControls = {
      back: box(g, [1.9, 0.77, 2.3], [0.75, 0.22, 0.75], 0xe4ad60),
      scroll_up: box(g, [0.5, -0.04, 2.7], [0.85, 0.2, 0.8], 0x91d9bb),
      scroll_down: box(g, [0.5, -0.04, -2.7], [0.85, 0.2, 0.8], 0x7ab9eb),
    };
  }
  if (immobilized) box(g, [0.3, 3.8, 0], [0.3, 0.18, 3.4], 0x97c3e1);
  return g;
}
export function makeBus() {
  const g = new THREE.Group();
  const paint = 0xdba84d,
    trim = 0x26313a;
  box(g, [0, -1.8, 0], [18, 1.3, 8], paint);
  box(g, [0, -1.05, 0], [16.7, 0.16, 7.5], 0x3a4147);
  box(g, [-7.8, 0.4, 0], [1.3, 4, 8], paint);
  const wheels = [];
  for (const side of [-1, 1]) {
    const z = side * 3.8;
    box(g, [-1, 0, z], [14, 2, 0.4], paint);
    box(g, [-1, -0.5, z + side * 0.22], [13.4, 0.15, 0.09], trim);
    box(g, [-1, 0.85, z + side * 0.22], [13.4, 0.055, 0.09], 0xece2c9);
    for (const x of [-6, 5]) {
      const carrier = new THREE.Group(),
        rotor = new THREE.Group();
      carrier.position.set(x, -2, z);
      carrier.add(rotor);
      g.add(carrier);
      const tire = new THREE.Mesh(
        new THREE.TorusGeometry(1.04, 0.36, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0x171c20, roughness: 0.92 }),
      );
      rotor.add(tire);
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.4, 32),
        new THREE.MeshStandardMaterial({
          color: 0x8896a0,
          metalness: 0.8,
          roughness: 0.3,
        }),
      );
      rim.rotation.x = Math.PI / 2;
      rotor.add(rim);
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.48, 24),
        new THREE.MeshStandardMaterial({
          color: 0x38434b,
          metalness: 0.65,
          roughness: 0.4,
        }),
      );
      hub.rotation.x = Math.PI / 2;
      rotor.add(hub);
      for (let j = 0; j < 8; j++) {
        const angle = (j * Math.PI) / 4;
        const bolt = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 6, 6),
          new THREE.MeshStandardMaterial({
            color: 0xb4bec4,
            metalness: 0.8,
            roughness: 0.3,
          }),
        );
        bolt.position.set(
          Math.cos(angle) * 0.47,
          Math.sin(angle) * 0.47,
          side * 0.24,
        );
        rotor.add(bolt);
      }
      wheels.push({ carrier, rotor, front: x > 0 });
    }
  }
  box(g, [8, -0.55, 0], [0.65, 1.4, 7.8], paint);
  box(g, [8.4, -1.4, 0], [0.4, 0.42, 7.8], trim);
  box(g, [-8.65, -1.4, 0], [0.45, 0.42, 7.7], trim);
  const glass = box(g, [8, 1, 0], [0.12, 1.8, 7.5], 0xabc8d3);
  glass.material = new THREE.MeshPhysicalMaterial({
    color: 0xb8d3db,
    transparent: true,
    opacity: 0.24,
    roughness: 0.13,
    metalness: 0.05,
    depthWrite: false,
  });
  for (const z of [-3.76, 3.76])
    rod(g, [8, 0.1, z], [8, 1.95, z], 0.075, 0xa8bac3);
  rod(g, [8, 1.94, -3.76], [8, 1.94, 3.76], 0.075, 0xa8bac3);
  for (const z of [-2.8, 2.8]) {
    const lamp = box(g, [8.36, -0.3, z], [0.1, 0.45, 0.9], 0xffeed1);
    lamp.material.emissive.set(0xffe1a0);
    lamp.material.emissiveIntensity = 0.7;
    const tail = box(g, [-8.48, 0.05, z], [0.07, 0.32, 0.65], 0x8e2022);
    tail.material.emissive.set(0xc71d23);
    tail.material.emissiveIntensity = 0.4;
  }
  for (let i = 0; i < 5; i++)
    box(g, [8.36, -0.55, (i - 2) * 0.27], [0.08, 0.34, 0.11], trim);
  g.traverse((m) => {
    if (m.isMesh) m.castShadow = m.receiveShadow = true;
  });
  glass.castShadow = false;
  g.userData = { cutaway: true, wheels };
  return g;
}
export function advanceBus(bus, distance, steering) {
  for (const wheel of bus.userData.wheels || []) {
    wheel.rotor.rotation.z -= distance / 1.4;
    wheel.carrier.rotation.y = wheel.front
      ? -THREE.MathUtils.degToRad(steering)
      : 0;
  }
}
export function updateLegMesh(mesh, a, b) {
  const x = new THREE.Vector3(...a),
    y = new THREE.Vector3(...b),
    d = y.clone().sub(x);
  mesh.position.copy(x.add(y).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    d.clone().normalize(),
  );
  const width = mesh.userData.anatomical ? d.length() : 1;
  mesh.scale.set(width, d.length(), width);
}
export function makeLegs(parent) {
  const all = {};
  for (const name of ["L1", "R1", "L2", "R2", "L3", "R3"]) {
    const group = new THREE.Group();
    parent.add(group);
    const material = new THREE.MeshStandardMaterial({
      color: 0x37312d,
      roughness: 0.6,
    });
    const upper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.1, 1, 8),
        material,
      ),
      lower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.055, 1, 8),
        material,
      );
    group.add(upper, lower);
    const joint = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 10, 8),
      material,
    );
    group.add(joint);
    const cuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.085, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x86bce1 }),
    );
    group.add(cuff);
    for (const m of [upper, lower, joint, cuff]) m.userData.region = name;
    all[name] = { group, upper, lower, joint, cuff };
  }
  return all;
}
export function applyPose(legs, body) {
  for (const [name, pose] of Object.entries(body.pose.joints)) {
    const m = legs[name];
    updateLegMesh(m.upper, pose.root, pose.joint);
    updateLegMesh(m.lower, pose.joint, pose.foot);
    m.joint.position.set(...pose.joint);
    m.cuff.position.set(...pose.joint);
    m.cuff.visible = !pose.enabled;
  }
}

export function makeWing(parent, side) {
  const group = new THREE.Group();
  group.position.set(0.9, 2.85, side * 0.75);
  parent.add(group);
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(-1.1, 0.15, -3.4, 1.7, -5.4, 1.55);
  shape.bezierCurveTo(-6.4, 1.4, -6.2, 0.15, -5.3, -0.1);
  shape.bezierCurveTo(-3.8, -0.45, -1.1, -0.3, 0, 0);
  const geometry = new THREE.ShapeGeometry(shape, 24);
  geometry.rotateX(Math.PI / 2);
  if (side < 0) geometry.scale(1, 1, -1);
  const surface = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0xc3d7d4,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
      roughness: 0.42,
      metalness: 0.1,
      depthWrite: false,
    }),
  );
  group.add(surface);
  for (const [x, z] of [
    [-5.5, 1.15],
    [-5.8, 0.55],
    [-5.4, 0],
    [-3.4, -0.1],
  ])
    rod(group, [0, 0.015, 0], [x, 0.015, z * side], 0.018, 0x89998d);
  rod(
    group,
    [-2.1, 0.02, side * 0.5],
    [-3.1, 0.02, side * 1.2],
    0.014,
    0x89998d,
  );
  const clip = box(
    group,
    [-1.2, 0.13, side * 0.35],
    [0.18, 0.16, 1.05],
    0x8dbcd1,
  );
  group.userData = { side, region: side > 0 ? "LW" : "RW", surface, clip };
  surface.userData.region = group.userData.region;
  return group;
}
