import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { updateLegMesh } from "./embodiment.js";
import {
  advanceArticulatedLegs,
  wingSamples,
  safeWingPose,
  advanceAppendages,
  buildBodySurface,
} from "./articulation.js";
export { advanceAppendages };
const v = (x) => new THREE.Vector3(...x);
export async function loadFlyAnatomy(fly, legs, wings, placeholder) {
  const [gltf, rig] = await Promise.all([
    new GLTFLoader().loadAsync("/fly-lab/assets/fly-anatomy.glb"),
    fetch("/fly-lab/assets/fly-rig.json").then((r) => r.json()),
  ]);
  return attachFlyAnatomy(gltf.scene, rig, fly, legs, wings, placeholder);
}

export function attachFlyAnatomy(
  scene,
  rig,
  fly,
  legs,
  wings,
  placeholder = [],
) {
  const parts = new Map(scene.children.map((c) => [c.name, c]));
  for (const object of placeholder) {
    fly.remove(object);
    object.traverse((c) => {
      c.geometry?.dispose();
      if (c.material)
        for (const m of Array.isArray(c.material) ? c.material : [c.material])
          m.dispose();
    });
  }
  const style = (object, region, materials = []) =>
    object.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = m.receiveShadow = true;
      m.material = m.material.clone();
      if (region) m.userData.region = region;
      else if (m.name.startsWith("haltere_"))
        m.userData.region = m.name.includes("left") ? "LH" : "RH";
      materials.push(m.material);
    });
  const body = parts.get("body");
  fly.add(body);
  style(body);
  fly.userData.anatomy = body;
  fly.userData.bodyRoof = buildBodySurface(body, rig.body_roof);
  const head = parts.get("head");
  head.position.set(...rig.head.root);
  fly.add(head);
  style(head);
  fly.userData.head = head;
  for (const [name, leg] of Object.entries(legs)) {
    leg.materials = [];
    leg.upper.visible = leg.lower.visible = leg.joint.visible = false;
    leg.segments = rig[name].segments.map((segment) => {
      const object = parts.get(segment.group);
      object.position.set(...segment.root);
      leg.group.add(object);
      style(object, name, leg.materials);
      return { ...segment, object };
    });
    leg.foot = null;
  }
  wings.splice(0, wings.length);
  for (const side of ["L", "R"]) {
    const wing = parts.get("wing_" + side),
      sign = side === "L" ? 1 : -1;
    wing.position.set(...rig["wing_" + side].root);
    fly.add(wing);
    style(wing, side + "W");
    let surface;
    wing.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = false;
      m.material.depthWrite = m.material.opacity >= 1;
      if (m.name.includes("membrane")) surface = m;
    });
    const positions = surface.geometry.attributes.position;
    const tip = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(positions, i);
      if (point.lengthSq() > tip.lengthSq()) tip.copy(point);
    }
    const samples = wingSamples(wing);
    const clip = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.15, 1.1),
      new THREE.MeshStandardMaterial({
        color: 0x88b6c7,
        roughness: 0.3,
        metalness: 0.65,
      }),
    );
    clip.position.set(-0.9, 0.15, sign * 0.15);
    clip.userData.clip = true;
    wing.add(clip);
    wing.userData = {
      side: sign,
      region: side + "W",
      surface,
      clip,
      samples,
      restDirection: tip.normalize(),
    };
    wing.userData.safePose = safeWingPose(
      wing,
      fly.userData.bodyRoof,
      30,
      0,
      -45,
    );
    wing.quaternion.copy(wing.userData.safePose.quaternion);
    wings.push(wing);
  }
  return {
    parts: 85,
    source: "FlyBody anatomical mesh · articulated legs, neck and wing hinges",
  };
}

export function advanceLegs(legs, body, dt, distance = 0, smooth = true) {
  if (!body) return;
  if (legs.L1?.segments) {
    const motion = typeof distance === "number" ? { distance } : distance;
    advanceArticulatedLegs(legs, body, dt, motion, smooth);
    return;
  }
  if (typeof distance !== "number") distance = distance.distance || 0;
  const moving =
    !body.pose.seated && distance > 1e-5 && !body.constraints.torso_locked;
  const constraintKey = JSON.stringify(body.constraints);
  for (const [name, pose] of Object.entries(body.pose.joints)) {
    const leg = legs[name];
    if (!leg) continue;
    const targetU = v(pose.joint).sub(v(pose.root)).normalize(),
      targetL = v(pose.foot).sub(v(pose.joint)).normalize();
    if (!leg.directionU) {
      leg.directionU = targetU.clone();
      leg.directionL = targetL.clone();
    }
    const exact =
      !smooth ||
      body.pose.seated ||
      body.constraints.joint_limit < 35 ||
      body.motor_response?.enabled ||
      leg.constraintKey !== constraintKey;
    leg.constraintKey = constraintKey;
    const blend = pose.enabled && !exact ? 1 - Math.exp(-dt * 18) : 1;
    const turn = (from, to) => {
      const q = new THREE.Quaternion().setFromUnitVectors(from, to);
      const eased = new THREE.Quaternion().slerp(q, blend);
      return from.applyQuaternion(eased).normalize();
    };
    turn(leg.directionU, targetU);
    turn(leg.directionL, targetL);
    const root = v(pose.root),
      joint = root.clone().addScaledVector(leg.directionU, pose.upper_length),
      foot = joint.clone().addScaledVector(leg.directionL, pose.lower_length);
    // Display-only stride lift is tied to actual displacement, never an idle loop.
    // Tight limits, task contacts and motor-inspection poses use the exact rig.
    if (
      moving &&
      smooth &&
      !exact &&
      pose.enabled &&
      body.constraints.joint_limit >= 35 &&
      !body.motor_response?.enabled
    ) {
      leg.stride = (leg.stride || 0) + distance / 1.8;
      const phase =
        (leg.stride + (["L1", "R2", "L3"].includes(name) ? 0 : 0.5)) % 1;
      const lift = phase < 0.5 ? Math.sin(Math.PI * 2 * phase) * 0.13 : 0;
      const axis = leg.directionU.clone().cross(leg.directionL).normalize();
      const direction = leg.directionL.clone().applyAxisAngle(axis, -lift);
      const next = joint.clone().addScaledVector(direction, pose.lower_length);
      if (next.y >= foot.y) foot.copy(next);
    }
    if (foot.y < 0.1) {
      joint.copy(v(pose.joint));
      foot.copy(v(pose.foot));
    }
    updateLegMesh(leg.upper, root.toArray(), joint.toArray());
    updateLegMesh(leg.lower, joint.toArray(), foot.toArray());
    leg.joint.position.copy(joint);
    leg.cuff.position.copy(joint);
    leg.cuff.visible = !pose.enabled;
  }
}
