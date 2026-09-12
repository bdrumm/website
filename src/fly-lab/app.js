import {labApi, prepareRuntime, decorateRuntime, installRuntimeControls, isDemo, pendingDraft, clearDraft} from "./runtime.js";
import * as THREE from "three";
import { JourneyView } from "./journey.js";
import { initMonitorResize } from "./layout.js";
import { renderTraining } from "./training.js";
import { renderBehavior } from "./behavior.js";
import { renderInternal } from "./internal.js";
import {
  websiteClickWeight,
  setWebsiteClickWeight,
  rateBarsMarkup,
} from "./readout.js";
import { loadFlyAnatomy, advanceLegs, advanceAppendages } from "./fly-model.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { NeuronView } from "./neurons.js";
import { MotorView, colorMotorBody } from "./motor.js";
import {
  makeChair,
  makeBus,
  advanceBus,
  makeLegs,
  applyPose,
  makeWing,
} from "./embodiment.js";

const $ = (id) => document.getElementById(id),
  clone = (x) => structuredClone(x);
const labels = {
  turn_left: "Turn left",
  turn_right: "Turn right",
  forward: "Move forward",
  reverse: "Reverse",
  rest: "Rest",
  click: "Click",
  back: "Back",
  focus_previous: "Previous control",
  focus_next: "Next control",
  scroll_up: "Scroll up",
  scroll_down: "Scroll down",
};
const websiteLabels = {
  turn_left: "Previous control",
  turn_right: "Next control",
  forward: "Click",
  reverse: "Back",
  rest: "Wait",
};
const actionLabel = (action, task) =>
  (task === "website" ? websiteLabels[action] : null) ||
  labels[action] ||
  action;
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const format = (n, d = 1) =>
  Number.isFinite(Number(n))
    ? Number(n).toLocaleString(undefined, {
        maximumFractionDigits: d,
        minimumFractionDigits: d,
      })
    : "—";
let config = null,
  defaults = null,
  presetList = [],
  lastState = null,
  preview = null,
  activeTool = null,
  chartMode = "reward",
  cameraMode = "orbit",
  showTrail = true,
  toastTimer,
  runKey = null,
  lastSceneSignature = "",
  savedList = [];
let motorView;
let journeyView;
let neuronView,
  rigLegs,
  chair,
  busActor,
  avatar,
  screenBoard,
  screenTexture,
  stationFloor,
  bodyKey = null,
  sceneHazards = [],
  lastScreen = null;
let renderer,
  scene,
  camera,
  controls,
  worldGroup,
  fly,
  trailLine,
  ground,
  flyWings = [],
  flyLegs = [],
  sceneFood = [],
  renderWorld = null,
  targetFly = new THREE.Vector3(),
  heading = 0,
  flyHeading = 0;

async function api(path, body) { return labApi(path, body); }

function toast(message, error = false) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").classList.toggle("error", error);
  $("toast").hidden = false;
  toastTimer = setTimeout(
    () => ($("toast").hidden = true),
    error ? 9000 : 3600,
  );
}
async function act(fn) {
  try {
    await fn();
  } catch (error) {
    toast(error.message, true);
  }
}
function download(value, name) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sphere(parent, color, scale, position, options = {}) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 20, 14),
    new THREE.MeshStandardMaterial({ color, roughness: 0.48, ...options }),
  );
  mesh.scale.set(...scale);
  mesh.position.set(...position);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
function segment(parent, a, b, r, color) {
  const va = new THREE.Vector3(...a),
    vb = new THREE.Vector3(...b),
    delta = vb.clone().sub(va);
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 0.7, delta.length(), 7),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 }),
  );
  m.position.copy(va.add(vb).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    delta.normalize(),
  );
  m.castShadow = true;
  parent.add(m);
  return m;
}
function createFly() {
  const group = new THREE.Group();
  sphere(group, 0x573b2d, [2.5, 1.25, 1.3], [-1.3, 1.5, 0]);
  sphere(group, 0xba8154, [1.65, 1.45, 1.35], [1.15, 1.75, 0]);
  sphere(group, 0x514035, [1.1, 1.05, 1.1], [2.65, 1.85, 0]);
  sphere(group, 0x9e241d, [0.7, 0.85, 0.52], [2.95, 2.1, 0.85]);
  sphere(group, 0x9e241d, [0.7, 0.85, 0.52], [2.95, 2.1, -0.85]);
  for (const side of [-1, 1]) {
    const wing = makeWing(group, side);
    flyWings.push(wing);
    segment(
      group,
      [3.1, 2.5, side * 0.45],
      [4.2, 2.95, side * 0.8],
      0.085,
      0x2f2726,
    );
    for (let i = 0; i < 3; i++) {
      const leg = new THREE.Group();
      const x = 1.8 - i * 1.6;
      segment(
        leg,
        [x, 1.6, side * 0.7],
        [x + 0.35, 1.0, side * 2.3],
        0.105,
        0x34302e,
      );
      segment(
        leg,
        [x + 0.35, 1.0, side * 2.3],
        [x - 0.45, 0.13, side * 3.0],
        0.075,
        0x34302e,
      );
      group.add(leg);
      flyLegs.push(leg);
    }
  }
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(8.5, 8.6, 64),
    new THREE.MeshBasicMaterial({
      color: 0xa3d4e9,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.06;
  group.add(ring);
  return group;
}
function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose();
    if (child.material) {
      for (const mat of Array.isArray(child.material)
        ? child.material
        : [child.material])
        mat.dispose();
    }
  });
}
function initScene() {
  try {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x152231, 150, 350);
    camera = new THREE.PerspectiveCamera(43, 1, 0.1, 600);
    camera.position.set(92, 96, 111);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    $("viewport").append(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 1.2;
    controls.maxDistance = 240;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xc9e7fc, 0x263a50, 1.5));
    const key = new THREE.DirectionalLight(0xffebd7, 3.0);
    key.position.set(50, 100, 40);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {
      left: -110,
      right: 110,
      top: 110,
      bottom: -110,
      near: 1,
      far: 250,
    });
    key.shadow.normalBias = 0.12;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x6aa7dc, 1.3);
    fill.position.set(-40, 30, -60);
    scene.add(fill);
    worldGroup = new THREE.Group();
    scene.add(worldGroup);
    fly = createFly();
    const placeholder = [...fly.children];
    flyLegs.forEach((leg) => fly.remove(leg));
    rigLegs = makeLegs(fly);
    loadFlyAnatomy(fly, rigLegs, flyWings, placeholder)
      .then((info) => {
        $("fly-model-label").textContent = info.source;
        bodyKey = null;
      })
      .catch((error) => {
        $("fly-model-label").textContent =
          "Basic rig · anatomical mesh unavailable";
        toast(error.message, true);
      });
    scene.add(fly);
    trailLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: 0x99dfc5,
        transparent: true,
        opacity: 0.7,
      }),
    );
    scene.add(trailLine);
    new ResizeObserver(() => {
      const { width, height } = $("viewport").getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }).observe($("viewport"));
    let pointerStart;
    renderer.domElement.addEventListener(
      "pointerdown",
      (e) => (pointerStart = [e.clientX, e.clientY]),
    );
    renderer.domElement.addEventListener("pointerup", (e) => {
      if (
        !activeTool &&
        pointerStart &&
        Math.hypot(e.clientX - pointerStart[0], e.clientY - pointerStart[1]) < 5
      ) {
        const r = renderer.domElement.getBoundingClientRect(),
          ray = new THREE.Raycaster();
        ray.setFromCamera(
          new THREE.Vector2(
            ((e.clientX - r.left) / r.width) * 2 - 1,
            (-(e.clientY - r.top) / r.height) * 2 + 1,
          ),
          camera,
        );
        const hit = ray
          .intersectObject(fly, true)
          .find((h) => h.object.userData.region);
        if (hit) motorView?.select(hit.object.userData.region);
      }
      if (
        !activeTool ||
        !pointerStart ||
        Math.hypot(e.clientX - pointerStart[0], e.clientY - pointerStart[1]) >
          5 ||
        lastState?.active
      )
        return;
      const rect = renderer.domElement.getBoundingClientRect(),
        mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      const hit = ray.ray.intersectPlane(
        new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
        new THREE.Vector3(),
      );
      if (hit) {
        const size = config.scene.size,
          x = Math.round(hit.x + size / 2),
          y = Math.round(hit.z + size / 2);
        if (x < 3 || y < 3 || x > size - 3 || y > size - 3) {
          toast("Place objects inside the arena.", true);
          return;
        }
        readForm();
        if (activeTool === "start") {
          config.scene.start = [x, y, config.scene.start[2]];
        } else {
          const type = {
            food: "foods",
            obstacle: "obstacles",
            hazard: "hazards",
          }[activeTool];
          config.scene[type].push({
            x,
            y,
            radius: Math.min(
              activeTool === "hazard" ? 7 : activeTool === "obstacle" ? 6 : 4,
              x,
              y,
              size - x,
              size - y,
            ),
          });
        }
        renderObjects();
        act(applyPreview);
      }
    });
    let last = performance.now();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden) {
        last = now;
        return;
      }
      if (now - last < 1000 / 60 - 0.5) return;
      const dt = Math.min((now - last) / 1000, 0.08);
      last = now;
      if (renderWorld) {
        const alpha = reduced ? 1 : 1 - Math.exp(-dt * 8);
        const prior = fly.position.clone();
        fly.position.lerp(targetFly, alpha);
        const previousHeading = flyHeading;
        flyHeading +=
          Math.atan2(
            Math.sin(heading - flyHeading),
            Math.cos(heading - flyHeading),
          ) * alpha;
        fly.rotation.y = -flyHeading;
        const translation = fly.position
          .clone()
          .sub(prior)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), flyHeading)
          .divideScalar(Math.max(0.01, fly.scale.x));
        const motion = {
          distance: translation.length(),
          translation: translation.toArray(),
          turn: flyHeading - previousHeading,
          running: lastState?.active && lastState.status === "running",
        };
        advanceLegs(rigLegs, renderWorld.embodiment, dt, motion, !reduced);
        advanceAppendages(
          fly,
          flyWings,
          renderWorld.embodiment,
          dt,
          motion,
          !reduced,
        );
        if (busActor) {
          busActor.position.copy(fly.position);
          busActor.rotation.copy(fly.rotation);
          advanceBus(
            busActor,
            fly.position.distanceTo(prior) * Math.sign(translation.x),
            renderWorld.embodiment?.pose.steering_degrees || 0,
          );
        }
        if (cameraMode === "body") {
          const delta = fly.position.clone().sub(controls.target);
          camera.position.add(delta);
          controls.target.copy(fly.position);
        }
        if (cameraMode === "follow") {
          const desired = fly.position
            .clone()
            .add(
              new THREE.Vector3(
                -Math.cos(heading) * 31,
                25,
                -Math.sin(heading) * 31,
              ),
            );
          camera.position.lerp(desired, 0.04);
          controls.target.lerp(fly.position, 0.08);
        }
      }
      controls.update();
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  } catch (error) {
    $("render-error").hidden = false;
    $("render-error").textContent =
      `3D rendering is unavailable: ${error.message}. Enable WebGL in your browser. Training controls and telemetry remain available.`;
  }
}

function buildWorld(world) {
  if (!scene) return;
  const s = world.scene,
    size = s.size;
  const signature = JSON.stringify({
    size,
    foods: s.foods.map(({ x, y, radius }) => ({ x, y, radius })),
    obstacles: s.obstacles,
    hazards: s.hazards.map((h) => h.radius),
    task: world.taskinfo?.kind || "arena",
  });
  if (signature !== lastSceneSignature) {
    lastSceneSignature = signature;
    disposeObject(worldGroup);
    scene.remove(worldGroup);
    worldGroup = new THREE.Group();
    scene.add(worldGroup);
    sceneFood = [];
    sceneHazards = [];
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(size + 5, 2.2, size + 5),
      new THREE.MeshStandardMaterial({ color: 0x1b2d3e, roughness: 0.78 }),
    );
    platform.position.y = -1.3;
    platform.receiveShadow = true;
    worldGroup.add(platform);
    ground = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshStandardMaterial({
        color: 0x31485c,
        roughness: 0.97,
        metalness: 0.05,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.12;
    ground.receiveShadow = true;
    worldGroup.add(ground);
    const grid = new THREE.GridHelper(size, 20, 0x7197ac, 0x48677d);
    grid.material.transparent = true;
    grid.material.opacity = 0.28;
    grid.position.y = -0.08;
    worldGroup.add(grid);
    for (const side of [-1, 1]) {
      for (const alongX of [true, false]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(
            alongX ? size + 0.4 : 0.5,
            0.9,
            alongX ? 0.5 : size + 0.4,
          ),
          new THREE.MeshStandardMaterial({
            color: 0x7296ad,
            metalness: 0.45,
            roughness: 0.4,
          }),
        );
        rail.position.set(
          alongX ? 0 : (side * size) / 2,
          0.3,
          alongX ? (side * size) / 2 : 0,
        );
        worldGroup.add(rail);
      }
    }
    for (const item of s.obstacles) {
      const obj = new THREE.Mesh(
        new THREE.CylinderGeometry(item.radius, item.radius, 9, 32),
        new THREE.MeshStandardMaterial({
          color: 0x6c8298,
          metalness: 0.22,
          roughness: 0.52,
        }),
      );
      obj.position.set(item.x - size / 2, 4.5, item.y - size / 2);
      obj.castShadow = true;
      obj.receiveShadow = true;
      worldGroup.add(obj);
      const cap = new THREE.Mesh(
        new THREE.RingGeometry(item.radius - 0.3, item.radius, 48),
        new THREE.MeshBasicMaterial({
          color: 0xa7c0d5,
          side: THREE.DoubleSide,
        }),
      );
      cap.rotation.x = -Math.PI / 2;
      cap.position.set(obj.position.x, 9.03, obj.position.z);
      worldGroup.add(cap);
    }
    for (const item of s.hazards) {
      const disk = new THREE.Mesh(
        new THREE.CircleGeometry(item.radius, 48),
        new THREE.MeshBasicMaterial({
          color: 0xdb647c,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        }),
      );
      disk.rotation.x = -Math.PI / 2;
      disk.position.set(item.x - size / 2, 0.03, item.y - size / 2);
      worldGroup.add(disk);
      const outline = new THREE.Mesh(
        new THREE.RingGeometry(item.radius - 0.12, item.radius, 48),
        new THREE.MeshBasicMaterial({
          color: 0xef8aa2,
          side: THREE.DoubleSide,
        }),
      );
      outline.rotation.x = -Math.PI / 2;
      outline.position.copy(disk.position);
      outline.position.y = 0.04;
      worldGroup.add(outline);
      sceneHazards.push([disk, outline]);
    }
    for (const item of s.foods) {
      const group = new THREE.Group();
      group.position.set(item.x - size / 2, 0, item.y - size / 2);
      const food = sphere(
        group,
        0xb5efaa,
        [item.radius * 0.7, 1.8, item.radius * 0.7],
        [0, 1.5, 0],
        { emissive: 0x75aa69, emissiveIntensity: 0.25, roughness: 0.5 },
      );
      food.castShadow = true;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(item.radius - 0.12, item.radius + 0.12, 64),
        new THREE.MeshBasicMaterial({
          color: 0xacf4c6,
          side: THREE.DoubleSide,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;
      group.add(ring);
      worldGroup.add(group);
      sceneFood.push(group);
    }
    fly.position.set(world.fly.x - size / 2, 0, world.fly.y - size / 2);
    flyHeading = world.fly.heading;
    controls.maxDistance = size * 3.5;
    if (cameraMode === "top") {
      camera.position.set(
        0.01,
        (size / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) * 1.2,
        0.01,
      );
      controls.target.set(0, 0, 0);
    }
    if (world.taskinfo?.kind === "bus") {
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(size, 14),
        new THREE.MeshStandardMaterial({ color: 0x414753, roughness: 0.95 }),
      );
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.005;
      worldGroup.add(road);
      for (let x = -size / 2; x < size / 2; x += 12) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(5, 0.05, 0.4),
          new THREE.MeshBasicMaterial({ color: 0xe3d9a9 }),
        );
        stripe.position.set(x, 0.04, 0);
        worldGroup.add(stripe);
      }
    }
  }
  sceneFood.forEach((g, i) => (g.visible = !s.foods[i].collected));
  sceneHazards.forEach((pair, i) =>
    pair.forEach((mesh) => {
      mesh.position.x = s.hazards[i].x - size / 2;
      mesh.position.z = s.hazards[i].y - size / 2;
    }),
  );
  renderWorld = world;
  targetFly.set(world.fly.x - size / 2, 0, world.fly.y - size / 2);
  heading = world.fly.heading;
  updateBody(world);
  const points = world.trail.map(
    (p) => new THREE.Vector3(p[0] - size / 2, 0.13, p[1] - size / 2),
  );
  trailLine.geometry.dispose();
  trailLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
  trailLine.visible = showTrail;
  $("coordinates").textContent =
    `X ${format(world.fly.x)} / Y ${format(world.fly.y)} / ${format((world.fly.heading * 180) / Math.PI, 0)}°`;
  $("arena-dimensions").textContent = `${size} × ${size}`;
}

function updateBody(world) {
  if (!fly) return;
  const body = world.embodiment,
    kind = world.taskinfo?.kind || "arena";
  const key = JSON.stringify({ kind, preset: body?.constraints });
  if (key !== bodyKey) {
    bodyKey = key;
    for (const object of [chair, busActor, avatar, screenBoard, stationFloor]) {
      if (object) {
        object.parent?.remove(object);
        disposeObject(object);
      }
    }
    chair = busActor = avatar = screenBoard = stationFloor = null;
    screenTexture?.dispose();
    screenTexture = null;
    lastScreen = null;
    if (body?.pose.seated)
      chair = makeChair(
        fly,
        kind,
        body.constraints.torso_locked,
        body.constraints.resolved_preset === "immobilized",
      );
    if (kind === "bus") {
      busActor = makeBus();
      scene.add(busActor);
    }
    if (kind === "arcade") {
      avatar = new THREE.Mesh(
        new THREE.ConeGeometry(2, 3.5, 6),
        new THREE.MeshStandardMaterial({
          color: 0xf0c567,
          emissive: 0x665020,
          emissiveIntensity: 0.2,
        }),
      );
      scene.add(avatar);
    }
    if (kind === "website") {
      screenBoard = new THREE.Mesh(
        new THREE.PlaneGeometry(64, 40),
        new THREE.MeshBasicMaterial({
          color: 0xcedded,
          side: THREE.DoubleSide,
        }),
      );
      screenBoard.position.set(0, 25, 5);
      scene.add(screenBoard);
    }
    if (["arcade", "website"].includes(kind)) {
      stationFloor = new THREE.Mesh(
        new THREE.BoxGeometry(22, 1.3, 18),
        new THREE.MeshStandardMaterial({ color: 0x24394d }),
      );
      stationFloor.position.set(0, 0.45, world.scene.size / 2 + 14);
      scene.add(stationFloor);
      camera.position.set(105, 108, 142);
      controls.target.set(0, 9, 15);
    }
  }
  if (body) {
    fly.scale.setScalar(
      kind === "arena" && !body.pose.seated
        ? (world.scene.fly_radius || 1.2) / 8.5
        : 1,
    );
    if (!rigLegs.L1.segments && !rigLegs.L1.directionU)
      applyPose(rigLegs, body);
  }
  if (kind === "bus") {
    targetFly.y = 3.8;
    if (chair?.userData.selector)
      chair.userData.selector.position.y =
        body?.pose.gear === "reverse" ? 0.9 : 1.4;
    if (chair?.userData.wheel)
      chair.userData.wheel.rotation.x = -THREE.MathUtils.degToRad(
        body?.pose.steering_degrees || 0,
      );
  }
  if (kind === "website" && chair?.userData.webControls) {
    const press = body?.pose.panel_button;
    for (const [action, control] of Object.entries(
      chair.userData.webControls,
    )) {
      control.material.emissive.set(action === press ? 0x519d65 : 0x000000);
      control.material.emissiveIntensity = action === press ? 0.6 : 0;
    }
  }
  if (["arcade", "website"].includes(kind)) {
    targetFly.set(0, 3, world.scene.size / 2 + 14);
    heading = -Math.PI / 2;
    if (avatar) {
      avatar.position.set(
        world.fly.x - world.scene.size / 2,
        2,
        world.fly.y - world.scene.size / 2,
      );
      avatar.rotation.y = -world.fly.heading;
    }
  }
  if (screenBoard && world.screen && lastScreen !== world.screen) {
    lastScreen = world.screen;
    const image = new Image(),
      targetBoard = screenBoard,
      requestedScreen = world.screen;
    image.onload = () => {
      if (screenBoard !== targetBoard || lastScreen !== requestedScreen) return;
      screenTexture?.dispose();
      screenTexture = new THREE.Texture(image);
      screenTexture.colorSpace = THREE.SRGBColorSpace;
      screenTexture.needsUpdate = true;
      screenBoard.material.map = screenTexture;
      screenBoard.material.color.set(0xffffff);
      screenBoard.material.needsUpdate = true;
    };
    image.src = world.screen;
  }
}
const restraintDefaults = {
  auto: { legs: ["L1", "R1", "L2", "R2", "L3", "R3"], limit: 45 },
  free: { legs: ["L1", "R1", "L2", "R2", "L3", "R3"], limit: 45 },
  operator_chair: { legs: ["L1", "R1", "L2", "R2", "L3", "R3"], limit: 45 },
  bus_harness: { legs: ["L1", "R1", "L2", "R2", "L3", "R3"], limit: 35 },
  forelegs_only: { legs: ["L1", "R1"], limit: 35 },
  immobilized: { legs: [], limit: 0 },
};
let restraintEdited = false;
function fillRestraint(value) {
  const name = value?.preset || "auto",
    r = restraintDefaults[name];
  $("restraint-preset").value = name;
  $("wings-locked").checked =
    value?.wings_locked ??
    !(name === "free" || (name === "auto" && $("task-mode").value === "arena"));
  $("joint-limit").value = value?.joint_limit ?? r.limit;
  const legs = value?.allowed_legs || r.legs;
  document
    .querySelectorAll("[data-leg]")
    .forEach((input) => (input.checked = legs.includes(input.dataset.leg)));
  restraintEdited = Boolean(
    value?.allowed_legs || value?.joint_limit !== undefined,
  );
}
function setNumericOption(id, value) {
  const select = $(id);
  if (![...select.options].some((o) => o.value === String(value)))
    select.add(new Option(`${value} ms`, String(value)));
  select.value = String(value);
}

function fillForm(value) {
  config = clone(value);
  config.scene.reward = { ...defaults.scene.reward, ...config.scene.reward };
  const presetIndex = presetList.findIndex(
    (p) => p.task === config.task && p.scene.name === config.scene.name,
  );
  $("preset").value = presetIndex < 0 ? "" : String(presetIndex);
  $("task-mode").value = config.task || "arena";
  $("website-url").value = config.website_url || "demo";
  $("website-task").value = config.website_task || "";
  $("website-goal").value = config.website_goal || "";
  $("website-navigation").value = config.website_navigation || "follow_links";
  $("website-settings").hidden = !["website", "super"].includes(config.task);
  fillRestraint(config.restraint);
  $("motor-motion").checked = config.motor_view?.motion || false;
  $("motor-gain").value = config.motor_view?.gain_degrees ?? 8;
  $("motor-scale").value = config.motor_view?.rate_scale_hz ?? 40;
  $("scene-name").value = config.scene.name;
  $("arena-size").value = config.scene.size;
  $("move-distance").value = config.scene.move_distance;
  $("start-heading").value = config.scene.start[2];
  $("turn-degrees").value = config.scene.turn_degrees;
  $("turn-move").value = config.scene.turn_move;
  $("learning").checked = config.neural.learning;
  $("episodes").value = config.episodes;
  $("max-steps").value = config.max_steps;
  $("seed").value = config.seed;
  $("randomize").checked = config.scene.randomize_food;
  if (
    config.checkpoint &&
    ![...$("checkpoint").options].some((o) => o.value === config.checkpoint)
  ) {
    $("checkpoint").add(
      new Option(`Saved brain · ${config.checkpoint}`, config.checkpoint),
    );
  }
  $("checkpoint").value = config.checkpoint ?? "";
  const internal = config.internal || {};
  $("internal-enabled").checked = internal.enabled ?? true;
  $("internal-resume").checked = internal.resume ?? true;
  $("internal-energy").value = internal.body?.initial_energy ?? 0.8;
  $("internal-current").value = internal.maximum_current ?? 2;
  const training = config.training || {};
  $("continuous-training").checked = training.continuous || false;
  $("training-mode").value = training.mode || "practice";
  $("training-block").value = training.block_episodes ?? 2;
  $("training-probes").value = training.evaluation_episodes ?? 0;
  $("autosave-steps").value = training.autosave_steps ?? 100;
  document
    .querySelectorAll("[data-training-task]")
    .forEach(
      (e) =>
        (e.checked = (
          training.tasks || ["arena", "bus", "arcade", "website"]
        ).includes(e.dataset.trainingTask)),
    );
  syncTrainingControls();
  setNumericOption("neural-ms", config.neural.neural_ms);
  setNumericOption("pace-ms", config.pace_ms);
  $("pulse-ms").value = config.neural.pulse_ms;
  $("pulse-current").value = config.neural.pulse_current;
  $("deadband").value = config.deadband;
  for (const key of Object.keys(config.scene.reward))
    $(`reward-${key}`).value = config.scene.reward[key];
  $("decoder").value = JSON.stringify(config.decoder, null, 2);
  syncClickWeight();
  $("run-title").textContent = config.scene.name;
  $("mode-label").textContent = isDemo() ? "ENVIRONMENT ONLY" : config.neural.learning
    ? "LEARNING"
    : "FROZEN MEMORY";
  renderObjects();
  syncTaskControls();
}
function readForm() {
  if (!config) return;
  config.task = $("task-mode").value;
  config.website_url = $("website-url").value.trim() || "demo";
  config.website_task = $("website-task").value;
  config.website_goal = $("website-goal").value;
  config.website_navigation = $("website-navigation").value;
  config.restraint = { preset: $("restraint-preset").value };
  if (restraintEdited) {
    config.restraint.allowed_legs = [
      ...document.querySelectorAll("[data-leg]:checked"),
    ].map((x) => x.dataset.leg);
    config.restraint.joint_limit = +$("joint-limit").value;
  }
  config.motor_view = {
    motion: $("motor-motion").checked,
    gain_degrees: +$("motor-gain").value,
    rate_scale_hz: +$("motor-scale").value,
  };
  config.restraint.wings_locked = $("wings-locked").checked;
  config.scene.name = $("scene-name").value;
  config.scene.size = +$("arena-size").value;
  config.scene.move_distance = +$("move-distance").value;
  config.scene.start[2] = +$("start-heading").value;
  config.scene.turn_degrees = +$("turn-degrees").value;
  config.scene.turn_move = +$("turn-move").value;
  config.neural.learning = $("learning").checked;
  config.episodes = +$("episodes").value;
  config.max_steps = +$("max-steps").value;
  config.seed = +$("seed").value;
  config.scene.randomize_food = $("randomize").checked;
  config.checkpoint = $("checkpoint").value || null;
  config.internal = {
    enabled: $("internal-enabled").checked,
    resume: $("internal-resume").checked,
    maximum_current: +$("internal-current").value,
    body: {
      ...(config.internal?.body || {}),
      initial_energy: +$("internal-energy").value,
    },
  };
  const mode = $("training-mode").value;
  config.training = {
    mode,
    continuous:
      $("continuous-training").checked &&
      mode !== "evaluate" &&
      config.neural.learning,
    tasks:
      mode === "practice"
        ? config.task === "super"
          ? ["bus", "arcade", "website"]
          : [config.task]
        : [...document.querySelectorAll("[data-training-task]:checked")].map(
            (e) => e.dataset.trainingTask,
          ),
    block_episodes: +$("training-block").value,
    evaluation_episodes: +$("training-probes").value,
    autosave_steps: +$("autosave-steps").value,
  };
  config.neural.neural_ms = +$("neural-ms").value;
  config.pace_ms = +$("pace-ms").value;
  config.neural.pulse_ms = +$("pulse-ms").value;
  config.neural.pulse_current = +$("pulse-current").value;
  config.deadband = +$("deadband").value;
  for (const key of Object.keys(config.scene.reward))
    config.scene.reward[key] = +$(`reward-${key}`).value;
  try {
    config.decoder = JSON.parse($("decoder").value);
    syncClickWeight();
  } catch {
    throw new Error("The neural decoder must contain valid JSON.");
  }
}
function renderObjects() {
  const root = $("objects");
  root.innerHTML = "";
  let total = 0;
  for (const [group, name, css] of [
    ["foods", "Food", "food"],
    ["obstacles", "Barrier", "obstacle"],
    ["hazards", "Zone", "hazard"],
  ])
    config.scene[group].forEach((object, index) => {
      total++;
      const row = document.createElement("div");
      row.className = "object-row";
      row.innerHTML = `<div class="object-head"><i class="key ${css}"></i>${name} ${index + 1}<button aria-label="Remove ${name} ${index + 1}">×</button></div><div class="object-inputs">${["x", "y", "radius"].map((k) => `<label>${k === "radius" ? "Radius" : k.toUpperCase()}<input type="number" step="1" aria-label="${name} ${index + 1} ${k}" value="${object[k]}"></label>`).join("")}</div>`;
      row.querySelector("button").onclick = () => {
        config.scene[group].splice(index, 1);
        renderObjects();
        act(applyPreview);
      };
      row.querySelectorAll("input").forEach(
        (input, i) =>
          (input.onchange = () => {
            config.scene[group][index][["x", "y", "radius"][i]] = +input.value;
          }),
      );
      root.append(row);
    });
  $("object-count").textContent = total;
}
async function applyPreview() {
  readForm();
  const result = await api("/api/preview", config);
  config = result.config;
  preview = result;
  syncTaskControls();
  buildWorld(preview.world);
  $("retina").src = preview.frame;
  $("frame-tick").textContent = "PREVIEW";
  $("run-title").textContent = config.scene.name;
  $("mode-label").textContent = isDemo() ? "ENVIRONMENT ONLY" : config.neural.learning
    ? "LEARNING"
    : "FROZEN MEMORY";
  if (isDemo()) decorateRuntime({...lastState, config, active:false, previewing:true});
  return result;
}
function syncTaskControls() {
  const task = $("task-mode").value,
    arena = task === "arena";
  $("arena-editor").hidden = !arena;
  $("add-reverse").hidden = !["bus", "super"].includes(task);
  $("add-website-actions").hidden = $("website-readout-help").hidden = ![
    "website",
    "super",
  ].includes(task);
  $("task-layout-note").hidden = arena;
  $("task-layout-note").textContent =
    task === "website"
      ? "Explore controls, click, go Back, and scroll. The success URL is the food goal. Add website actions under Readout for older configurations."
      : ["bus", "super"].includes(task)
        ? "Bus controls: forward, reverse, steer, and brake at stops. Add reverse under Readout when loading an older configuration."
        : "This task uses its own stage layout. Movement, training, decoder, and body settings still apply.";
  $("start-heading").disabled = !arena;
  $("turn-move").disabled = ["bus", "super", "website"].includes(task);
  $("turn-degrees").disabled = task === "website";
  $("move-distance").disabled = task === "website";
  $("arena-size").disabled = task === "website";
  $("randomize").disabled = !arena;
  if (!arena && activeTool) setTool(activeTool);
  syncTrainingControls();
}
function setTool(tool) {
  activeTool = activeTool === tool ? null : tool;
  document
    .querySelectorAll("[data-tool]")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.tool === activeTool),
    );
  $("placement-note").hidden = !activeTool;
  $("placement-note").textContent = activeTool
    ? `Click the arena to place ${activeTool === "start" ? "the starting position" : `a ${activeTool}`}. Esc to finish.`
    : "";
  if (controls) controls.enableRotate = !activeTool;
}

function renderState(state) {
  lastState = state;
  journeyView?.render(state);
  renderTraining(state);
  renderBehavior(state, { preview: !!preview && !state.active });
  renderInternal(state, { preview: !!preview && !state.active });
  const active = !!state.active;
  $("connection-label").textContent = "Compute engine connected";
  $("connection-dot").style.background = "var(--green)";
  $("run-status").textContent = state.status.toUpperCase();
  $("run-status").className = `pill ${state.status}`;
  $("status-message").textContent = state.error || state.message;
  $("continuous-training").disabled =
    (!!state.assay && active) ||
    (active
      ? !state.config.neural.learning ||
        state.config.training.mode === "evaluate" ||
        state.status === "stopping"
      : !config.neural.learning || config.training?.mode === "evaluate");
  if (state.active)
    $("continuous-training").checked = !!state.continuous?.enabled;
  $("continuous-summary").textContent =
    state.continuous?.enabled && state.active
      ? `Continuous training · ${state.continuous.completed_sessions || 0} sessions completed. Stop gives food and saves.`
      : "Each session continues from its saved brain. Stop gives food and saves.";
  $("start").disabled = active;
  $("run-assay").disabled = active;
  $("start").textContent = config?.neural.learning
    ? "▶ Start training"
    : "▶ Start frozen run";
  $("pause").disabled =
    !active || !["running", "paused", "pausing"].includes(state.status);
  $("pause").textContent = state.status === "paused" ? "▶ Resume" : "Ⅱ Pause";
  $("stop").disabled =
    !active ||
    ["saving", "stopping", "completed", "stopped", "failed"].includes(
      state.status,
    );
  $("step").disabled = active && state.status !== "paused";
  $("setup-fields").disabled = active;
  for (const id of ["save-brain", "give-reward", "give-aversive"])
    $(id).disabled = !active || !["running", "paused"].includes(state.status);
  if (
    state.assay ||
    ["baseline", "after", "evaluate"].includes(state.training?.phase)
  ) {
    $("give-reward").disabled = true;
    $("give-aversive").disabled = true;
  }
  if (active && activeTool) setTool(activeTool);
  if (state.run_id !== runKey) {
    runKey = state.run_id;
    if (runKey) preview = null;
  }
  if (!preview || active) buildWorld(state.world);
  const visibleConfig = active ? state.config : config;
  $("mode-label").textContent = (
    active
      ? (state.training?.learning ?? visibleConfig?.neural.learning)
      : visibleConfig?.neural.learning
  )
    ? "LEARNING"
    : "FROZEN MEMORY";
  $("activity-state").textContent = state.brain_ready
    ? "MEASURED OUTPUT"
    : "AWAITING INPUT";
  const w = !active && preview ? preview.world : state.world,
    n = !active && preview ? null : state.neural;
  const task = w.taskinfo,
    body = w.embodiment;
  $("task-banner").hidden = !task;
  $("task-title").textContent = task?.title || "";
  $("task-objective").textContent = task?.objective || "";
  $("task-performance").textContent =
    task?.kind === "bus"
      ? `${task.direction === "reverse" ? "REVERSE" : task.direction === "forward" ? "DRIVE" : "BRAKE"} · ${task.passengers} aboard · ${task.delivered} delivered · dwell ${task.dwell}/2`
      : task?.kind === "arcade"
        ? `${task.lives} lives · ${task.score} points`
        : task?.kind === "website"
          ? `${task.control_count ?? 0} controls · ${task.explored ?? 0} areas explored`
          : "";
  $("website-monitor").hidden = task?.kind !== "website";
  if (task?.kind === "website") {
    const semantic = {
      forward: "click",
      reverse: "back",
      turn_left: "focus_previous",
      turn_right: "focus_next",
    };
    const selected = task.action_result?.action;
    $("website-actions").innerHTML = (visibleConfig?.decoder.actions || [])
      .map(
        (a) =>
          `<span class="website-action ${selected === (semantic[a.name] || a.name) ? "selected" : ""}">${escape(actionLabel(a.name, "website"))}</span>`,
      )
      .join("");
    $("website-focus").textContent = task.focused
      ? `Focused: ${task.focused.label} · ${task.focused.role || task.focused.tag}`
      : "No focused control";
    $("website-outcome").textContent = task.action_result
      ? `${task.action_result.status}: ${task.action_result.message}`
      : "Website opens when the stage starts.";
    $("website-position").textContent = task.scroll
      ? `${task.history?.can_back ? "Back available" : "Start of visit"} · Scroll ${Math.round(task.scroll.y)} / ${Math.round(task.scroll.max_y)} px · ${task.goal_configured ? task.food_proxy : "Exploration only: set a success URL to define the food goal"}`
      : "";
  }
  $("progress-label").textContent = (
    task?.progress_label || "FOOD COLLECTED"
  ).toUpperCase();
  $("effective-action").textContent = body
    ? actionLabel(body.effective_action, task?.kind)
    : "Awaiting command";
  $("constraint-reason").textContent = body?.blocked
    ? body.reason
    : body?.constraints.label || "No action yet.";
  $("constraint-reason").style.color = body?.blocked ? "var(--red)" : "";
  neuronView?.setActivity(
    !active && preview
      ? null
      : state.activity
        ? {
            ...state.activity,
            window_id: `${state.run_id}:${state.episode}:${state.frame_kind}:${state.frame_tick}`,
          }
        : null,
  );
  motorView?.update(n?.motor, body, state.frame_kind);
  colorMotorBody(
    rigLegs || {},
    flyWings,
    n?.motor,
    motorView?.highlight ? motorView.selected : null,
  );
  $("metric-episode").innerHTML =
    `${!active && preview ? "—" : state.episode || "—"} <small>/ ${active || !preview ? state.training?.planned_episodes || visibleConfig.episodes : visibleConfig.episodes}</small>`;
  $("metric-step").textContent = w.steps;
  $("metric-reward").textContent = format(w.total_reward, 2);
  $("metric-reward").style.color =
    w.total_reward < 0 ? "var(--red)" : "var(--green)";
  $("metric-food").innerHTML =
    `${w.collected} <small>/ ${task?.goal_count ?? w.scene.foods.length}</small>`;
  $("metric-time").innerHTML =
    `${format(state.neural_ms_total / 1000)} <small>s</small>`;
  if (!preview || active) {
    $("retina").src = state.frame;
    $("frame-tick").textContent =
      state.frame_kind === "preview"
        ? "PREVIEW"
        : `${state.frame_kind === "feedback" ? "FEEDBACK" : "TICK"} ${state.frame_tick ?? "—"}`;
  }
  $("action-label").textContent = n?.action
    ? actionLabel(n.action, task?.kind)
    : state.frame_kind === "feedback"
      ? "Feedback only"
      : "Awaiting decision";
  const reasons = {
    selected:
      n?.action_weights && Object.values(n.action_weights).some((w) => w !== 1)
        ? "Highest weighted score among active readouts"
        : "Highest mean firing rate",
    gate_closed: "Gate neurons did not spike",
    no_activity: "No output activity",
    below_threshold: "Below the firing-rate threshold",
    tie: "Tied activity; fallback selected",
    insufficient_margin: "Winner margin below threshold",
  };
  $("decoder-reason").textContent = n?.decoder
    ? reasons[n.decoder.reason] || n.decoder.reason
    : "The brain determines every action.";
  $("rate-bars").innerHTML = rateBarsMarkup(
    n,
    config?.decoder.actions || [],
    (name) => actionLabel(name, task?.kind),
  );
  $("gate-spikes").textContent = n
    ? n.gate_spikes === null
      ? "Disabled"
      : format(n.gate_spikes, 0)
    : "—";
  $("winner-margin").textContent = n
    ? n.decoder.margin_score != null
      ? `${format(n.decoder.margin_score)} score`
      : `${format(n.decoder.margin_hz)} Hz`
    : "—";
  $("total-spikes").textContent = n ? format(n.total_spikes, 0) : "—";
  $("kc-spikes").textContent = n ? format(n.KC_spikes, 0) : "—";
  $("dan-spikes").textContent = n
    ? `${format(n.reward_spikes, 0)} / ${format(n.aversive_spikes, 0)}`
    : "—";
  $("changed-edges").textContent = n
    ? `${format(n.memory.changed_edges, 0)} / ${format(n.memory.plastic_edges, 0)}`
    : "—";
  $("mean-efficacy").textContent = n
    ? `${format(n.memory.mean_efficacy, 4)}×`
    : "—";
  $("memory-fill").style.width = n
    ? `${(n.memory.changed_edges / Math.max(1, n.memory.plastic_edges)) * 100}%`
    : "0%";
  $("compute-time").textContent = n ? `${format(n.compute_seconds, 3)} s` : "—";
  $("observe-time").textContent =
    n?.observe_seconds !== undefined
      ? `${format(n.observe_seconds, 3)} s`
      : "—";
  $("execution-workers").textContent = state.execution
    ? `${state.execution.workers} neural + ${state.execution.recording_workers} recording`
    : "—";
  $("reward-received").textContent = format(state.reward_received ?? 0, 2);
  $("reward-delivered").textContent = format(state.reward_delivered ?? 0, 2);
  $("reinforcement-pulse").textContent = n
    ? `Applied ${n.stimulus || "none"}: ${format(n.stimulus_ms || 0, 1)} ms · ${format((n.stimulus_scale || 0) * 100, 1)}% of maximum pulse`
    : "";
  $("reward-breakdown").textContent = Object.entries(w.reward_terms || {})
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${format(value, 3)}`)
    .join(" · ");
  $("run-id").textContent = state.run_id || "No active session";
  $("episode-rows").innerHTML = state.episodes.length
    ? state.episodes
        .slice(-20)
        .map(
          (e) =>
            `<tr><td>${e.episode}</td><td>${escape(e.task || "arena")}<small class="episode-phase">${escape(e.phase || "train")}</small></td><td>${e.seed}</td><td>${e.steps}</td><td>${format(e.reward, 2)}</td><td>${e.food}</td><td style="color:${e.success ? "#a5ebc8" : "#8fa6bd"}">${e.interrupted ? "Stopped" : e.success ? "Target reached" : "Step limit"}</td></tr>`,
        )
        .join("")
    : '<tr><td colspan="7" class="empty-row">No completed episodes</td></tr>';
  drawChart();
  decorateRuntime({...state, config: visibleConfig, previewing: !!preview && !active});
}
function drawChart() {
  const canvas = $("history-chart"),
    rect = canvas.getBoundingClientRect(),
    dpr = Math.min(devicePixelRatio, 2);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  const w = rect.width,
    h = rect.height,
    data = lastState?.history || [];
  $("chart-empty").hidden = data.length > 0;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#223449";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (h * i) / 4);
    ctx.lineTo(w, (h * i) / 4);
    ctx.stroke();
  }
  const values = data.map((d) =>
    chartMode === "spikes"
      ? d.spikes
      : chartMode === "memory"
        ? d.efficacy
        : d.reward,
  );
  $("chart-label").textContent =
    chartMode === "spikes"
      ? "SPIKES PER NEURAL WINDOW"
      : chartMode === "memory"
        ? "MEAN MEMORY EFFICACY"
        : "REWARD PER DECISION";
  $("history-range").textContent = data.length
    ? `DECISIONS ${data[0].tick + 1}—${data.at(-1).tick + 1}`
    : "NO DECISIONS YET";
  if (!values.length) return;
  let lo = Math.min(...values, chartMode === "memory" ? 1 : 0),
    hi = Math.max(...values, chartMode === "memory" ? 1 : 0);
  if (hi === lo) {
    hi += chartMode === "memory" ? 0.01 : 1;
    lo -= chartMode === "memory" ? 0.01 : 0;
  }
  const y = (v) => h - 10 - ((v - lo) / (hi - lo)) * (h - 25),
    x = (i) => (i / Math.max(1, values.length - 1)) * w;
  ctx.font = "10px ui-monospace,monospace";
  ctx.fillStyle = "#607d99";
  ctx.fillText(format(hi, chartMode === "spikes" ? 0 : 2), 4, 11);
  ctx.beginPath();
  values.forEach((v, i) =>
    i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)),
  );
  const color =
    chartMode === "spikes"
      ? "#8cbbf1"
      : chartMode === "memory"
        ? "#c5b1ec"
        : "#9ce8c3";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.lineTo(x(values.length - 1), h);
  ctx.lineTo(0, h);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, color + "30");
  gradient.addColorStop(1, color + "00");
  ctx.fillStyle = gradient;
  ctx.fill();
  if (values.length === 1) {
    ctx.beginPath();
    ctx.arc(w / 2, y(values[0]), 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

async function refreshSaved() {
  const [scenarios, runs] = await Promise.all([
    api("/api/scenarios"),
    api("/api/runs"),
  ]);
  savedList = scenarios;
  $("saved-scenario").innerHTML =
    '<option value="">Choose saved scenario…</option>' +
    scenarios
      .map(
        (s) =>
          `<option value="${s.id}">${escape(s.config.scene.name)}</option>`,
      )
      .join("");
  journeyView?.setRuns(runs);
  const selected = $("checkpoint").value;
  $("checkpoint").innerHTML =
    '<option value="latest">Continue latest saved brain</option><option value="">Fresh brain · baseline weights</option>' +
    runs
      .filter((r) => r.checkpoint)
      .map(
        (r) =>
          `<option value="${r.id}">${escape(r.name)} · ${r.id.slice(8, 23)} · ${r.learning ? "learning" : "frozen"}</option>`,
      )
      .join("");
  if (
    selected &&
    ![...$("checkpoint").options].some((o) => o.value === selected)
  ) {
    $("checkpoint").add(
      new Option(`Unavailable checkpoint · ${selected}`, selected),
    );
  }
  $("checkpoint").value = selected;
  $("saved-runs").innerHTML = runs.length
    ? runs
        .slice(0, 6)
        .map(
          (r, i) =>
            `<div class="saved-run"><strong>${escape(r.name)}</strong><span>${r.episodes.length} episodes · ${r.learning ? "Learning" : "Frozen"} · ${r.checkpoint ? "Saved" : "No checkpoint"}</span><button data-load-run="${i}" ${lastState?.active ? "disabled" : ""}>Load settings${r.checkpoint ? " + brain" : ""} ↗</button></div>`,
        )
        .join("")
    : '<p class="hint">Finished runs will appear here.</p>';
  $("saved-runs")
    .querySelectorAll("[data-load-run]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          act(async () => {
            if (lastState?.active)
              throw new Error("Stop the current run before loading another.");
            const r = runs[+b.dataset.loadRun],
              c = clone(r.config);
            c.checkpoint = r.checkpoint ? r.id : null;
            c.pace_ms = 0;
            fillForm(c);
            await applyPreview();
            toast("Settings loaded. The next run starts a new episode.");
          })),
    );
}

document.querySelectorAll("[data-panel]").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll("[data-panel]")
        .forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      document
        .querySelectorAll(".setup-panel")
        .forEach((p) => (p.hidden = p.id !== b.dataset.panel));
    }),
);
document
  .querySelectorAll("[data-tool]")
  .forEach((b) => (b.onclick = () => setTool(b.dataset.tool)));
document.querySelectorAll("[data-camera]").forEach(
  (b) =>
    (b.onclick = () => {
      cameraMode = b.dataset.camera;
      if (cameraMode === "body") {
        const scale = fly.scale.x;
        camera.position
          .copy(fly.position)
          .add(new THREE.Vector3(13, 10, 15).multiplyScalar(scale));
        controls.target.copy(fly.position);
      }
      document
        .querySelectorAll("[data-camera]")
        .forEach((x) => x.classList.toggle("active", x === b));
      if (cameraMode === "top") {
        const size = renderWorld?.scene.size || 100;
        camera.position.set(
          0.01,
          (size / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) *
            1.2,
          0.01,
        );
        controls.target.set(0, 0, 0);
      } else if (cameraMode === "orbit") {
        camera.position.set(92, 96, 111);
        controls.target.set(0, 0, 0);
      }
      controls.enableRotate = cameraMode !== "top" && !activeTool;
    }),
);
$("toggle-trail").onclick = () => {
  showTrail = !showTrail;
  $("toggle-trail").classList.toggle("active", showTrail);
  $("toggle-trail").setAttribute("aria-pressed", String(showTrail));
  if (trailLine) trailLine.visible = showTrail;
};
document.querySelectorAll("[data-chart]").forEach(
  (b) =>
    (b.onclick = () => {
      chartMode = b.dataset.chart;
      document
        .querySelectorAll("[data-chart]")
        .forEach((x) => x.classList.toggle("active", x === b));
      drawChart();
    }),
);
function decoderForTask(task) {
  return presetList.find((p) => p.task === task)?.decoder || defaults.decoder;
}
$("task-mode").onchange = () => {
  try {
    const current = JSON.parse($("decoder").value);
    if (
      presetList.some(
        (p) => JSON.stringify(current) === JSON.stringify(p.decoder),
      )
    )
      $("decoder").value = JSON.stringify(
        decoderForTask($("task-mode").value),
        null,
        2,
      );
  } catch {} // Preserve incomplete or custom readouts for the user to correct.
  $("website-settings").hidden = !["website", "super"].includes(
    $("task-mode").value,
  );
  act(applyPreview);
};
$("restraint-preset").onchange = () => {
  fillRestraint({ preset: $("restraint-preset").value });
  act(applyPreview);
};
$("restore-restraint").onclick = () => {
  fillRestraint({ preset: $("restraint-preset").value });
  act(applyPreview);
};
for (const id of ["motor-motion", "motor-gain", "motor-scale", "wings-locked"])
  $(id).onchange = () => act(applyPreview);
$("joint-limit").onchange = () => {
  restraintEdited = true;
  act(applyPreview);
};
document.querySelectorAll("[data-leg]").forEach(
  (input) =>
    (input.onchange = () => {
      restraintEdited = true;
      act(applyPreview);
    }),
);
$("preset").onchange = () =>
  act(async () => {
    fillForm({
      ...presetList[+$("preset").value],
      checkpoint: config.checkpoint,
    });
    await applyPreview();
  });
function syncTrainingControls() {
  const mode = $("training-mode").value;
  $("training-tasks").hidden = mode === "practice";
  $("training-block-label").hidden = mode !== "curriculum";
  $("training-probes-label").hidden = mode === "evaluate";
  $("learning").disabled = mode === "evaluate";
  $("training-mode-help").textContent = {
    practice: "Repeat the current scenario while retaining synaptic memory.",
    rotation:
      "Interleave the selected scenarios to practice several skills with one brain.",
    curriculum:
      "Practice several episodes of each selected skill, then move to the next block. Actions always come from neural activity.",
    evaluate:
      "Measure the saved brain with memory frozen and no artificial reinforcement. This does not replace your continuing training checkpoint.",
  }[mode];
  if (mode !== "practice")
    $("website-settings").hidden = !document.querySelector(
      '[data-training-task="website"]',
    ).checked;
}
function addSharedReadout() {
  const decoder = JSON.parse($("decoder").value);
  const aliases = {
    click: "forward",
    back: "reverse",
    focus_previous: "turn_left",
    focus_next: "turn_right",
  };
  decoder.actions.forEach((a) => {
    a.name = aliases[a.name] || a.name;
  });
  if (
    new Set(decoder.actions.map((a) => a.name)).size !== decoder.actions.length
  )
    throw new Error(
      "Shared controls contain duplicate aliases. Review the readout assignments.",
    );
  for (const action of decoderForTask("super").actions)
    if (!decoder.actions.some((a) => a.name === action.name))
      decoder.actions.push(clone(action));
  $("decoder").value = JSON.stringify(decoder, null, 2);
}
$("training-mode").onchange = () =>
  act(async () => {
    const mode = $("training-mode").value;
    if (mode !== "practice") {
      if (
        config.training?.mode === "practice" ||
        !document.querySelector("[data-training-task]:checked")
      )
        document
          .querySelectorAll("[data-training-task]")
          .forEach((e) => (e.checked = true));
      addSharedReadout();
      const count = document.querySelectorAll(
        "[data-training-task]:checked",
      ).length;
      $("episodes").value = Math.max(
        +$("episodes").value,
        count * (mode === "curriculum" ? +$("training-block").value : 1),
      );
      if (mode !== "evaluate" && +$("training-probes").value === 0)
        $("training-probes").value = 1;
    }
    $("learning").checked = mode !== "evaluate";
    syncTrainingControls();
    await applyPreview();
  });
document
  .querySelectorAll("[data-training-task]")
  .forEach((e) => (e.onchange = syncTrainingControls));
$("apply-scene").onclick = () =>
  act(async () => {
    await applyPreview();
    toast("Scenario validated and applied.");
  });
$("learning").onchange = () => {
  config.neural.learning = $("learning").checked;
  $("mode-label").textContent = isDemo() ? "ENVIRONMENT ONLY" : config.neural.learning
    ? "LEARNING"
    : "FROZEN MEMORY";
  $("start").textContent = isDemo() ? "▶ Start demo" : config.neural.learning
    ? "▶ Start training"
    : "▶ Start frozen run";
};
$("neural-ms").onchange = () => {
  if (+$("pulse-ms").value > +$("neural-ms").value)
    $("pulse-ms").value = Math.min(200, +$("neural-ms").value);
};
async function start(single = false) {
  readForm();
  preview = null;
  const state = await api("/api/start", { config, single_step: single });
  renderState(state);
  toast(
    isDemo() ? (single ? "One manual rest decision completed." : "Browser demo ready. Use the manual controls to move.") : single
      ? "Loading brain for one decision."
      : "Loading the full brain. This can take a moment.",
  );
}
$("continuous-training").onchange = () =>
  act(async () => {
    const enabled = $("continuous-training").checked;
    if (lastState?.active)
      renderState(
        await api("/api/control", {
          command: enabled ? "continuous_on" : "continuous_off",
        }),
      );
    config.training = { ...config.training, continuous: enabled };
  });
$("start").onclick = () => act(() => start());
$("run-assay").onclick = () =>
  act(async () => {
    readForm();
    preview = null;
    renderState(await api("/api/assay", { config }));
    toast("Starting the controlled cue assay from the selected checkpoint.");
  });
$("step").onclick = () =>
  act(async () => {
    if (lastState?.active)
      renderState(await api("/api/control", { command: "step" }));
    else await start(true);
  });
$("pause").onclick = () =>
  act(async () =>
    renderState(
      await api("/api/control", {
        command: lastState.status === "paused" ? "resume" : "pause",
      }),
    ),
  );
$("stop").onclick = () =>
  act(async () => renderState(await api("/api/control", { command: "stop" })));
for (const [id, command] of [
  ["save-brain", "checkpoint"],
  ["give-reward", "reward"],
  ["give-aversive", "aversive"],
])
  $(id).onclick = () =>
    act(async () => {
      renderState(await api("/api/control", { command }));
      toast(
        command === "checkpoint"
          ? "Checkpoint queued at the next decision boundary."
          : "Manual reinforcement queued for the next neural window.",
      );
    });
$("save-scenario").onclick = () =>
  act(async () => {
    readForm();
    await api("/api/scenarios", config);
    await refreshSaved();
    toast("Scenario saved on this computer.");
  });
$("saved-scenario").onchange = () =>
  act(async () => {
    const saved = savedList.find((s) => s.id === $("saved-scenario").value);
    if (saved) {
      fillForm({ ...saved.config, pace_ms: 0 });
      await applyPreview();
    }
  });
$("export-scenario").onclick = () =>
  act(async () => {
    readForm();
    const validated = await api("/api/preview", config);
    download(validated.config, "fly-lab-scenario.json");
  });
$("import-scenario").onclick = () => $("import-file").click();
$("import-file").onchange = () =>
  act(async () => {
    const file = $("import-file").files[0];
    if (!file) return;
    const parsed = JSON.parse(await file.text()),
      validated = await api("/api/preview", parsed);
    fillForm(validated.config);
    preview = validated;
    buildWorld(preview.world);
    $("retina").src = preview.frame;
    $("frame-tick").textContent = "PREVIEW";
    toast("Scenario imported.");
    $("import-file").value = "";
  });
$("export-run").onclick = () =>
  act(async () =>
    download(await api("/api/export"), "fly-lab-run-summary.json"),
  );
$("refresh-runs").onclick = () => act(refreshSaved);
function syncClickWeight() {
  try {
    const decoder = JSON.parse($("decoder").value),
      weight = websiteClickWeight(decoder);
    $("website-click-weight").value = weight ?? 1;
    $("website-click-weight").disabled = weight == null;
  } catch {
    $("website-click-weight").disabled = true;
  }
}
$("website-click-weight").onchange = () =>
  act(async () => {
    const decoder = setWebsiteClickWeight(
      JSON.parse($("decoder").value),
      +$("website-click-weight").value,
    );
    $("decoder").value = JSON.stringify(decoder, null, 2);
    await applyPreview();
  });
$("decoder").addEventListener("input", syncClickWeight);
$("add-reverse").onclick = () =>
  act(async () => {
    const value = JSON.parse($("decoder").value);
    if (!value.actions.some((a) => a.name === "reverse")) {
      value.actions.push({ name: "reverse", neurons: { types: ["MDN"] } });
      $("decoder").value = JSON.stringify(value, null, 2);
      await applyPreview();
    }
    toast("Reverse control is included in this readout.");
  });
$("add-website-actions").onclick = () =>
  act(async () => {
    const value = JSON.parse($("decoder").value),
      task = $("task-mode").value;
    const wanted = decoderForTask(task === "super" ? "super" : "website");
    const canonical = (a) =>
      ({
        forward: "click",
        reverse: "back",
        turn_left: "focus_previous",
        turn_right: "focus_next",
      })[a] || a;
    for (const action of wanted.actions) {
      if (
        !value.actions.some((a) => canonical(a.name) === canonical(action.name))
      )
        value.actions.push(clone(action));
    }
    $("decoder").value = JSON.stringify(value, null, 2);
    await applyPreview();
    toast("Website controls added; existing assignments preserved.");
  });
$("reset-decoder").onclick = () => {
  $("decoder").value = JSON.stringify(
    decoderForTask($("task-mode").value),
    null,
    2,
  );
  syncClickWeight();
};
$("help-toggle").onclick = () => $("guide").showModal();
$("close-guide").onclick = () => $("guide").close();
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && activeTool) setTool(activeTool);
});
new ResizeObserver(drawChart).observe($("history-chart"));

async function boot() {
  await prepareRuntime();
  installRuntimeControls(() => { readForm(); return config; }, renderState, act, toast);
  initMonitorResize();
  initScene();
  journeyView = new JourneyView(api);
  neuronView = new NeuronView(
    $("neuron-viewport"),
    $("neuron-caption"),
    $("neuron-tooltip"),
  );
  motorView = new MotorView(neuronView);
  neuronView.load().then(() => motorView.render());
  presetList = await api("/api/presets");
  defaults = clone(presetList[0]);
  $("preset").innerHTML =
    '<option value="" disabled>Custom scenario</option>' +
    presetList
      .map((c, i) => `<option value="${i}">${escape(c.scene.name)}</option>`)
      .join("");
  const initial = await api("/api/state");
  let setup = clone(initial.assay?.practice_config || initial.config);
  const transferred = pendingDraft();
  if (transferred && !initial.active) {
    try { setup = (await api("/api/preview", transferred)).config; clearDraft(); }
    catch (error) { toast("Your browser draft is preserved, but compute could not apply it: " + error.message, true); }
  }
  if (!initial.active && initial.checkpoint?.continuing)
    setup.checkpoint = "latest";
  fillForm(setup);
  renderState(initial);
  await refreshSaved();
  let previousStatus = initial.status;
  async function poll() {
    try {
      const state = await api("/api/state");
      renderState(state);
      if (
        state.status !== previousStatus &&
        ["completed", "stopped", "failed"].includes(state.status)
      ) {
        await refreshSaved();
        if (
          state.checkpoint &&
          state.training?.training_decisions > 0 &&
          !state.active
        ) {
          config.checkpoint = "latest";
          $("checkpoint").value = "latest";
        }
      }
      previousStatus = state.status;
    } catch (error) {
      if (lastState) {
        renderBehavior(lastState, { stale: true, preview: !!preview });
        renderInternal(lastState, { stale: true, preview: !!preview });
      }
      $("connection-label").textContent = "Engine disconnected";
      $("connection-dot").style.background = "var(--red)";
      $("status-message").textContent =
        "Compute is unavailable. Your configuration is still here; reconnect when the service is ready.";
      for (const id of [
        "start",
        "run-assay",
        "pause",
        "step",
        "stop",
        "give-reward",
        "give-aversive",
        "save-brain",
      ])
        $(id).disabled = true;
    }
    setTimeout(poll, 450);
  }
  poll();
  // Optional browser-agent interface; all changes use the same validated local API.
  const context = document.modelContext;
  if (context?.registerTool) {
    const lifecycle = new AbortController();
    window.addEventListener("pagehide", () => lifecycle.abort(), {
      once: true,
    });
    for (const tool of [
      {
        name: "inspect_fly_lab",
        description:
          "Read the local scenario, training state and measured neural activity.",
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        execute: async () => {
          const s = await api("/api/state");
          return {
            status: s.status,
            episode: s.episode,
            tick: s.tick,
            neural: s.neural,
            config: s.config,
          };
        },
      },
      {
        name: "control_fly_lab",
        description:
          "Pause, resume or single-step an existing local fly-brain run.",
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        inputSchema: {
          type: "object",
          properties: {
            command: { type: "string", enum: ["pause", "resume", "step"] },
          },
          required: ["command"],
          additionalProperties: false,
        },
        execute: async (input) => {
          if (!input || !["pause", "resume", "step"].includes(input.command))
            throw new Error("Expected pause, resume or step");
          const s = await api("/api/control", { command: input.command });
          renderState(s);
          return { status: s.status, episode: s.episode, tick: s.tick };
        },
      },
    ]) {
      try {
        Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    }
  }
}
boot().catch((error) => {
  toast(error.message, true);
  $("status-message").textContent = `Unable to initialize: ${error.message}`;
});
