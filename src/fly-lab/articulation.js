import * as THREE from "three";
const V = (x) => new THREE.Vector3(...x);
const UP = new THREE.Vector3(0, 1, 0);
const clamp = THREE.MathUtils.clamp;
const radians = THREE.MathUtils.degToRad;
const smoothstep = (t) => t * t * (3 - 2 * t);

// Anatomical surface rig. The task controller's accepted foot contacts remain
// authoritative; these angles are an illustrative IK reconstruction, not MN torques.
export function solveLegChain(segments, target, side, curl = 0, stride = 0) {
  const root = V(segments[0].root);
  const coxaDirection = V(segments[0].rest_direction)
    .applyAxisAngle(new THREE.Vector3(1, 0, 0), -side * radians(10))
    .applyAxisAngle(UP, clamp(stride * 0.06, -0.12, 0.12));
  const hip = root.clone().addScaledVector(coxaDirection, segments[0].length);
  const upper = segments[1].length,
    lower = segments[2].length;
  const minReach = Math.sqrt(
    upper * upper + lower * lower - 2 * upper * lower * Math.cos(radians(18)),
  );
  const maxReach = Math.sqrt(
    upper * upper + lower * lower - 2 * upper * lower * Math.cos(radians(165)),
  );
  let best;
  // Coupled distal joints form an arched foot. Try ankle pitches to retain the
  // exact task contact without stretching a segment or inverting the knee.
  for (const pitch of [0, -20, 20, -40, 40, -60]) {
    const points = Array(segments.length + 1);
    points[segments.length] = target.clone();
    for (let k = segments.length - 1; k >= 3; k--) {
      const slope = radians(
        clamp(
          [66, 43, 25, 12, segments[0].source_body?.includes("T3") ? 20 : 5][
            k - 3
          ] +
            pitch +
            curl * (k === 7 ? 0.5 : 1),
          0,
          86,
        ),
      );
      const forward = new THREE.Vector3(1, 0, side * 0.12).normalize();
      const direction = forward.multiplyScalar(Math.cos(slope));
      direction.y = -Math.sin(slope);
      points[k] = points[k + 1]
        .clone()
        .addScaledVector(direction, -segments[k].length);
    }
    const distance = hip.distanceTo(points[3]);
    const error = Math.max(0, minReach - distance, distance - maxReach);
    if (!best || error < best.error) best = { points, distance, error };
    if (error < 1e-8) break;
  }
  const points = best.points;
  const axis = points[3].clone().sub(hip).normalize();
  const distance = clamp(best.distance, minReach, maxReach);
  if (best.error > 1e-8) {
    const offset = hip.clone().addScaledVector(axis, distance).sub(points[3]);
    for (let k = 3; k < points.length; k++) points[k].add(offset);
  }
  // A fixed outward pole keeps knee flexion in one plane and prevents flips.
  const pole = new THREE.Vector3(0.15, 0.5, side);
  pole.addScaledVector(axis, -pole.dot(axis));
  if (pole.lengthSq() < 1e-8) pole.set(1, 0, 0).cross(axis);
  pole.normalize();
  const along =
    (upper * upper - lower * lower + distance * distance) / (2 * distance);
  points[0] = root;
  points[1] = hip;
  points[2] = hip
    .clone()
    .addScaledVector(axis, along)
    .addScaledVector(
      pole,
      Math.sqrt(Math.max(0, upper * upper - along * along)),
    );
  return { points, targetError: points.at(-1).distanceTo(target) };
}

function moveContact(point, translation, turn) {
  return point.applyAxisAngle(UP, turn).sub(translation);
}

export function advanceArticulatedLegs(legs, body, dt, motion, smooth = true) {
  const translation = V(motion.translation || [motion.distance || 0, 0, 0]);
  const turn = motion.turn || 0;
  const travel = translation.length() + Math.abs(turn) * 2.7;
  const locomotion =
    smooth &&
    !body.pose.seated &&
    !body.constraints.torso_locked &&
    !body.motor_response?.enabled &&
    body.constraints.joint_limit >= 35;
  const moving = locomotion && travel > 1e-6;
  const duty = 0.64;
  for (const [name, pose] of Object.entries(body.pose.joints)) {
    const leg = legs[name];
    if (!leg?.segments) continue;
    const target = V(pose.foot),
      side = name[0] === "L" ? 1 : -1;
    const signature = JSON.stringify([
      body.constraints,
      body.pose.seated,
      !!body.motor_response?.enabled,
    ]);
    if (!leg.foot || leg.constraintKey !== signature) {
      leg.foot = target.clone();
      leg.phase = ["L1", "R2", "L3"].includes(name) ? 0.1 : 0.6;
      leg.swingStart = leg.swingEnd = null;
    }
    leg.constraintKey = signature;
    let curl = 0;
    if (locomotion && pose.enabled) {
      moveContact(leg.foot, translation, turn);
      if (leg.swingStart) moveContact(leg.swingStart, translation, turn);
      if (leg.swingEnd) moveContact(leg.swingEnd, translation, turn);
      const previous = leg.phase;
      // Complete a lifted step when motion ends, then keep the foot planted.
      const increment = moving
        ? travel / 2.6
        : leg.phase >= duty
          ? dt * 2.4
          : 0;
      leg.phase = (leg.phase + increment) % 1;
      if (leg.phase >= duty && !leg.swingStart) {
        leg.swingStart = leg.foot.clone();
        const forward =
          translation.lengthSq() > 1e-10
            ? translation.clone().normalize()
            : new THREE.Vector3(side * turn, 0, 0).normalize();
        leg.swingEnd = target.clone().addScaledVector(forward, 1.8);
      }
      if (leg.phase < previous && leg.swingEnd) {
        leg.foot.copy(leg.swingEnd);
        leg.swingStart = leg.swingEnd = null;
      }
      if (leg.phase >= duty && leg.swingStart) {
        const t = (leg.phase - duty) / (1 - duty),
          arc = Math.sin(Math.PI * t);
        leg.foot.copy(leg.swingStart).lerp(leg.swingEnd, smoothstep(t));
        leg.foot.y += 0.48 * arc * arc;
        curl = 24 * arc;
      }
      // Keep stance anchored in world coordinates rather than sweeping the
      // entire limb as one rigid piece. No gait phase runs while stationary.
    } else {
      leg.swingStart = leg.swingEnd = null;
      leg.foot.lerp(
        target,
        !smooth || !pose.enabled || body.constraints.joint_limit === 0
          ? 1
          : 1 - Math.exp(-dt * 18),
      );
    }
    const solved = solveLegChain(
      leg.segments,
      leg.foot,
      side,
      curl,
      leg.foot.x - target.x,
    );
    leg.renderPoints = solved.points;
    leg.targetError = solved.targetError;
    for (let k = 0; k < leg.segments.length; k++) {
      const segment = leg.segments[k],
        object = segment.object;
      object.position.copy(solved.points[k]);
      object.quaternion.setFromUnitVectors(
        V(segment.rest_direction),
        solved.points[k + 1].clone().sub(solved.points[k]).normalize(),
      );
      object.scale.setScalar(1);
    }
    leg.cuff.position.copy(solved.points[2]);
    leg.cuff.visible = !pose.enabled;
  }
}

export function buildBodySurface(body, grid) {
  const sourceNames = new Set(grid.source_meshes);
  const buckets = Array.from({ length: grid.nx * grid.nz }, () => []);
  body.traverse((mesh) => {
    if (!mesh.isMesh || !sourceNames.has(mesh.name)) return;
    const p = mesh.geometry.attributes.position,
      indices = mesh.geometry.index;
    for (let k = 0; k < indices.count; k += 3) {
      const tri = [];
      for (let j = 0; j < 3; j++) {
        const i = indices.getX(k + j);
        tri.push(p.getX(i), p.getY(i), p.getZ(i));
      }
      const minX = Math.min(tri[0], tri[3], tri[6]),
        maxX = Math.max(tri[0], tri[3], tri[6]);
      const minZ = Math.min(tri[2], tri[5], tri[8]),
        maxZ = Math.max(tri[2], tri[5], tri[8]);
      const x0 = clamp(
          Math.floor((minX - grid.x_min) / grid.cell_size),
          0,
          grid.nx - 1,
        ),
        x1 = clamp(
          Math.floor((maxX - grid.x_min) / grid.cell_size),
          0,
          grid.nx - 1,
        );
      const z0 = clamp(
          Math.floor((minZ - grid.z_min) / grid.cell_size),
          0,
          grid.nz - 1,
        ),
        z1 = clamp(
          Math.floor((maxZ - grid.z_min) / grid.cell_size),
          0,
          grid.nz - 1,
        );
      for (let z = z0; z <= z1; z++)
        for (let x = x0; x <= x1; x++) buckets[z * grid.nx + x].push(tri);
    }
  });
  if (!buckets.some((b) => b.length))
    throw new Error("Missing anatomical body collision surfaces");
  return { ...grid, buckets };
}

export function roofHeight(roof, x, z) {
  const ix = Math.floor((x - roof.x_min) / roof.cell_size),
    iz = Math.floor((z - roof.z_min) / roof.cell_size);
  if (ix < 0 || iz < 0 || ix >= roof.nx || iz >= roof.nz) return -Infinity;
  if (!roof.buckets) return roof.heights[iz * roof.nx + ix] ?? -Infinity;
  let top = -Infinity;
  for (const t of roof.buckets[iz * roof.nx + ix]) {
    const ax = t[0],
      az = t[2],
      bx = t[3],
      bz = t[5],
      cx = t[6],
      cz = t[8];
    const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
    if (Math.abs(d) < 1e-12) continue;
    const u = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d;
    const v = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d;
    if (u >= -1e-7 && v >= -1e-7 && u + v <= 1 + 1e-7)
      top = Math.max(top, u * t[1] + v * t[4] + (1 - u - v) * t[7]);
  }
  return top;
}

export function wingSamples(wing) {
  const samples = [],
    seen = new Set();
  const append = (x, y, z) => {
    const key = `${x.toFixed(5)},${y.toFixed(5)},${z.toFixed(5)}`;
    if (!seen.has(key)) {
      seen.add(key);
      samples.push(x, y, z);
    }
  };
  wing.traverse((mesh) => {
    if (!mesh.isMesh || mesh.userData.clip) return;
    const p = mesh.geometry.attributes.position,
      index = mesh.geometry.index;
    for (let i = 0; i < p.count; i++) append(p.getX(i), p.getY(i), p.getZ(i));
    // Interior points catch a long triangle spanning the thorax even when
    // its corner vertices are all outside. Bound sampling spacing to .09.
    if (!index) return;
    for (let i = 0; i < index.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(p, index.getX(i));
      const b = new THREE.Vector3().fromBufferAttribute(p, index.getX(i + 1));
      const c = new THREE.Vector3().fromBufferAttribute(p, index.getX(i + 2));
      const count = Math.ceil(
        Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) / 0.09,
      );
      if (count <= 1) continue;
      for (let j = 0; j <= count; j++)
        for (let k = 0; k <= count - j; k++) {
          const point = a
            .clone()
            .multiplyScalar(1 - (j + k) / count)
            .addScaledVector(b, j / count)
            .addScaledVector(c, k / count);
          append(point.x, point.y, point.z);
        }
    }
  });
  return new Float32Array(samples);
}

export function wingClearance(samples, root, quaternion, roof) {
  const rotation = new THREE.Matrix4().makeRotationFromQuaternion(
    quaternion,
  ).elements;
  let clearance = Infinity;
  for (let i = 0; i < samples.length; i += 3) {
    const x = samples[i],
      y = samples[i + 1],
      z = samples[i + 2];
    // The proximal insertion is seated in the thorax; only the membrane
    // beyond that small hinge attachment may be considered free surface.
    if (x * x + y * y + z * z < 0.3 * 0.3) continue;
    const px = rotation[0] * x + rotation[4] * y + rotation[8] * z + root.x;
    const py = rotation[1] * x + rotation[5] * y + rotation[9] * z + root.y;
    const pz = rotation[2] * x + rotation[6] * y + rotation[10] * z + root.z;
    clearance = Math.min(clearance, py - roofHeight(roof, px, pz));
  }
  return clearance;
}

export function wingQuaternion(restDirection, side, sweep, lift, feather = 0) {
  const direction = new THREE.Vector3(
    -Math.cos(sweep) * Math.cos(lift),
    Math.sin(lift),
    side * Math.sin(sweep) * Math.cos(lift),
  );
  const q = new THREE.Quaternion().setFromUnitVectors(restDirection, direction);
  return new THREE.Quaternion()
    .setFromAxisAngle(direction, side * feather)
    .multiply(q);
}

export function safeWingPose(wing, roof, sweep, lift, feather) {
  const data = wing.userData;
  for (const extraSweep of [0, 8, 16, 26, 40]) {
    for (let extraLift = 0; extraLift <= 48; extraLift += 4) {
      const q = wingQuaternion(
        data.restDirection,
        data.side,
        radians(sweep + extraSweep),
        radians(lift + extraLift),
        radians(feather),
      );
      const clearance = wingClearance(data.samples, wing.position, q, roof);
      if (clearance >= 0.055)
        return {
          quaternion: q,
          clearance,
          sweep: sweep + extraSweep,
          lift: lift + extraLift,
        };
    }
  }
  // Never use a known intersecting pose. A previously certified pose is also
  // valid for a restrained wing; the body envelope is in the same local frame.
  if (data.safePose) return data.safePose;
  throw new Error("No body-clear wing pose found for this anatomical asset");
}

export function advanceAppendages(
  fly,
  wings,
  body,
  dt,
  motion = {},
  smooth = true,
) {
  if (!body) return;
  const active = smooth && motion.running && body.constraints.joint_limit > 0;
  const turn = motion.turn || 0,
    distance = motion.distance || 0;
  const moving = active && (distance > 1e-5 || Math.abs(turn) > 1e-5);
  const head = fly.userData.head;
  if (head) {
    const requested =
      body.effective_action === "turn_left"
        ? 0.06
        : body.effective_action === "turn_right"
          ? -0.06
          : 0;
    const yaw = active
      ? clamp(
          requested - (turn / Math.max(dt, 0.001)) * 0.1,
          -radians(10),
          radians(10),
        )
      : 0;
    head.userData.yaw = THREE.MathUtils.lerp(
      head.userData.yaw || 0,
      yaw,
      smooth ? 1 - Math.exp(-dt * 12) : 1,
    );
    head.userData.phase = (head.userData.phase || 0) + distance * 2;
    const pitch = moving ? Math.sin(head.userData.phase) * radians(1.3) : 0;
    head.quaternion.setFromEuler(
      new THREE.Euler(0, head.userData.yaw, pitch, "YXZ"),
    );
  }
  for (const wing of wings) {
    const d = wing.userData;
    d.clip.visible = body.constraints.wings_locked;
    if (!d.samples || !fly.userData.bodyRoof) continue;
    const unlocked = active && !body.constraints.wings_locked;
    const motor = body.motor_response?.enabled
      ? body.motor_response.wings?.[d.side > 0 ? "L" : "R"]?.applied_degrees ||
        0
      : 0;
    const target = unlocked
      ? clamp(
          (moving ? 2.5 : 0) +
            motor * 0.14 +
            ((d.side * turn) / Math.max(dt, 0.001)) * 1.5,
          0,
          8,
        )
      : 0;
    d.opening = THREE.MathUtils.lerp(
      d.opening || 0,
      target,
      smooth && !body.constraints.wings_locked ? 1 - Math.exp(-dt * 7) : 1,
    );
    // Grounded fly: folded-wing settling at the thoracic hinge, no invented
    // low-frequency flight beat. Biological wingbeats cannot be resolved at60fps.
    const key = d.opening.toFixed(2);
    if (d.poseKey !== key) {
      d.safePose = safeWingPose(
        wing,
        fly.userData.bodyRoof,
        30 + d.opening,
        d.opening * 0.5,
        -45 + d.opening * 0.7,
      );
      wing.quaternion.copy(d.safePose.quaternion);
      d.poseKey = key;
    }
  }
}
