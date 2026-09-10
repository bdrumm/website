import {createGarageModelMotion} from './garage-model.js';
import {configureRotationControls,rotateModelWithKey} from './model-rotation-controls.js';
import {createConfigurationMotion, rowExplosionOffset, explodedRowView} from './garage-configuration.js';
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
async function createGarageScene(host, getSettings, modelUrl = "assets/models/garage-simplified-structure.glb", onConfigurationChange = () => {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute("aria-label", "Garage 3D model. Drag or use arrow keys to rotate; use the zoom buttons or plus and minus keys to zoom. Scroll to move the page.");
  const world = new THREE.Scene();
  world.background = new THREE.Color("#d8dcd7");
  world.fog = new THREE.Fog("#d8dcd7", 20, 50);
  const camera = new THREE.PerspectiveCamera(33, 1, 0.04, 80);
  camera.position.set(4.3, 3.4, 5.9);
  const controls = new OrbitControls(camera, renderer.domElement);
  configureRotationControls(controls);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 1.2;
  controls.maxDistance = 18;
  controls.maxPolarAngle = Math.PI / 2 - 0.035;
  controls.autoRotateSpeed = 0.65;
  controls.target.set(0, 0.65, 0);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.045);
  world.environment = environment.texture;
  world.environmentIntensity = 0.65;
  room.dispose();
  pmrem.dispose();
  const hemisphere = new THREE.HemisphereLight("#f3f6ed", "#9ea799", 1.65);
  world.add(hemisphere);
  const key = new THREE.DirectionalLight("#fff3dc", 3.4);
  key.position.set(-3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 25;
  key.shadow.bias = -15e-5;
  key.shadow.normalBias = 0.015;
  key.shadow.radius = 4;
  world.add(key);
  const fill = new THREE.DirectionalLight("#dce9ff", 1.15);
  fill.position.set(5, 3, -4);
  world.add(fill);
  const pixels = new Uint8Array(256 * 256 * 4);
  let seed = 8123;
  for (let i = 0; i < pixels.length; i += 4) {
    seed = seed * 1664525 + 1013904223 >>> 0;
    const v = 170 + (seed >>> 25);
    pixels[i] = v;
    pixels[i + 1] = v;
    pixels[i + 2] = v;
    pixels[i + 3] = 255;
  }
  const grain = new THREE.DataTexture(pixels, 256, 256, THREE.RGBAFormat);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(90, 90);
  grain.needsUpdate = true;
  const floorMaterial = new THREE.MeshStandardMaterial({ color: "#d1d7cb", roughness: 0.88, bumpMap: grain, bumpScale: 0.012 });
  function updateTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    world.background.set(dark ? '#0a1328' : '#d8dcd7');
    world.fog.color.copy(world.background);
    floorMaterial.color.set(dark ? '#13243a' : '#d1d7cb');
  }
  updateTheme();
  window.addEventListener('themechange', updateTheme);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.012;
  floor.receiveShadow = true;
  world.add(floor);
  let gltf;
  try {
    gltf = await new GLTFLoader().loadAsync(modelUrl);
  } catch (error) {
    window.removeEventListener('themechange', updateTheme);
    controls.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    environment.dispose();
    floor.geometry.dispose();
    floorMaterial.dispose();
    grain.dispose();
    throw error;
  }
  const model = gltf.scene;
  world.add(model);
  const system = model.getObjectByName("SYSTEM_ROOT");
  const units = ["Garage", "Kitchen", "Dining"].map((n) => model.getObjectByName(`UNIT_${n}`));
  if (!system || units.some((u) => !u)) throw new Error("Required source modules were not found.");
  // Keep display separation outside UNIT transforms, so interrupted transport always
  // snapshots the same source coordinates used by the configuration planner.
  const spacingGroups = units.map((unit, index) => {
    const group = new THREE.Group();
    group.name = `DisplaySpacing_${index}`;
    unit.parent.add(group);
    group.add(unit);
    return group;
  });
  const modelMotion = createGarageModelMotion(model, gltf.animations);
  const printMaterials = /* @__PURE__ */ new Set();
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (printMaterials.has(material)) return;
        printMaterials.add(material);
        if (material instanceof THREE.MeshStandardMaterial) {
          material.envMapIntensity = 0.65;
          if (material.metalness < 0.4) {
            material.onBeforeCompile = (shader) => {
              shader.vertexShader = "varying vec3 vSurfacePosition;\n" + shader.vertexShader;
              shader.vertexShader = shader.vertexShader.replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvSurfacePosition = (modelMatrix * vec4(transformed, 1.0)).xyz;");
              shader.fragmentShader = "varying vec3 vSurfacePosition;\n" + shader.fragmentShader;
              shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\nfloat filament = sin(vSurfacePosition.y * 3141.59);\ndiffuseColor.rgb *= 0.993 + 0.007 * filament;");
            };
            material.customProgramCacheKey = () => "garage-filament-v1";
          }
        }
      });
    }
  });
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(world, camera));
  const ao = new SSAOPass(world, camera, 1, 1);
  ao.kernelRadius = 10;
  ao.minDistance = 1e-3;
  ao.maxDistance = 0.1;
  composer.addPass(ao);
  composer.addPass(new OutputPass());
  let inViewport = false;
  const intersection = new IntersectionObserver((entries) => {
    inViewport = entries[0].isIntersecting;
  });
  intersection.observe(host);
  let needsFraming = true;
  const resized = () => {
    needsFraming = true;
    const width = host.clientWidth || 800;
    const height = host.clientHeight || 620;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
  };
  resized();
  const observer = new ResizeObserver(resized);
  observer.observe(host);
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let motionReduced = motionPreference.matches;
  let frame = 0;
  let previousTime = performance.now();
  let previousLayout = "";
  let previousReset = -1;
  let previousExplode = 0;
  let door = getSettings().door;
  let roof = getSettings().roof;
  let exploded = 0;
  let closingFrom = {door, roof, exploded, layout: ""};
  let cameraTransition = true;
  const cameraDestination = new THREE.Vector3();
  const targetDestination = new THREE.Vector3();
  const configuration = createConfigurationMotion(units, { animateEntrance: true, onChange: onConfigurationChange });
  const updateMotionPreference = event => {
    motionReduced = event.matches;
    if (motionReduced) configuration.setLayout(getSettings().layout, true);
  };
  motionPreference.addEventListener('change', updateMotionPreference);
  // Keep the source root fixed: a simultaneous recenter would make a vertical lift diagonal.
  system.position.set(-3, 0.08, 1.2);
  const stopCameraTransition = () => {
    cameraTransition = false;
  };
  controls.addEventListener("start", stopCameraTransition);
  const zoom = factor => {
    if (!Number.isFinite(factor) || factor <= 0) return;
    cameraTransition = false;
    const offset = camera.position.clone().sub(controls.target);
    const distance = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
    camera.position.copy(controls.target).add(offset.setLength(distance));
    controls.update();
  };
  renderer.domElement.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (["+", "=", "-"].includes(event.key)) zoom(event.key === "-" ? 1.25 : .8);
    else if (!rotateModelWithKey(camera, controls, event.key)) return;
    event.preventDefault();
    cameraTransition = false;
  });
  const update = (now) => {
    const s = getSettings();
    const canRender = !document.hidden && inViewport && s.visible;
    const dt = canRender ? Math.min((now - previousTime) / 1e3, 0.05) : 0;
    previousTime = now;
    const blend = motionReduced ? 1 : 1 - Math.exp(-dt * 8);
    if (needsFraming || s.layout !== previousLayout || s.reset !== previousReset) {
      const initialLayout = previousLayout === "";
      needsFraming = false;
      if (s.layout !== previousLayout) closingFrom = {door, roof, exploded, layout: previousLayout};
      previousLayout = s.layout;
      previousReset = s.reset;
      configuration.setLayout(s.layout, motionReduced);
      const narrow = camera.aspect < 1.25;
      if (s.layout === "row") {
        cameraDestination.set(6.2, 5.4, narrow ? 13.5 : 10);
        targetDestination.set(0, 0.75, 0);
      } else if (s.layout === "stack") {
        cameraDestination.set(5.5, 4.7, 8);
        targetDestination.set(0, 1.85, 0);
      } else {
        cameraDestination.set(4.1, 3, narrow ? 7.2 : 5.5);
        targetDestination.set(0, 0.7, 0);
      }
      if (s.layout !== "row") { cameraDestination.x -= 2; targetDestination.x -= 2; }
      const aspectFit = Math.max(1, 1.15 / camera.aspect);
      cameraDestination.sub(targetDestination).multiplyScalar(aspectFit).add(targetDestination);
      controls.maxDistance = Math.max(18, cameraDestination.distanceTo(targetDestination) * 1.6);
      if (initialLayout) {
        camera.position.copy(cameraDestination);
        controls.target.copy(targetDestination);
      }
      cameraTransition = true;
    }
    if (s.explode !== previousExplode) {
      previousExplode = s.explode;
      cameraTransition = true;
    }
    configuration.update(dt);
    if (configuration.active) {
      const t = configuration.preparation;
      const closed = t * t * (3 - 2 * t);
      door = closingFrom.door * (1 - closed);
      roof = closingFrom.roof * (1 - closed);
      exploded = closingFrom.exploded * (1 - closed);
    } else {
      door += (s.door - door) * blend;
      roof += ((s.layout === "stack" ? 0 : s.roof) - roof) * blend;
      exploded += ((s.layout === "stack" ? 0 : s.explode) - exploded) * blend;
    }
    const spreadRow = s.layout === "row" || (configuration.active && closingFrom.layout === "row");
    spacingGroups.forEach((group, index) => {
      group.position.x = rowExplosionOffset(index, spreadRow ? exploded / 100 : 0);
    });
    modelMotion.update({door, roof, explode: exploded,
      detachLowerRoofs: s.layout === "stack" || (configuration.active && closingFrom.layout === "stack"),
      showConnectors: s.layout === "row" && !configuration.active && exploded < .1});
    if (cameraTransition) {
      const extra = exploded / 100;
      const currentCameraGoal = cameraDestination.clone().add(new THREE.Vector3(extra * 0.8, extra * 1.5, extra * 1.8));
      const currentTargetGoal = targetDestination.clone().add(new THREE.Vector3(0, extra * 0.3, 0));
      if (spreadRow) {
        const expandedView = explodedRowView(camera.aspect);
        currentCameraGoal.copy(cameraDestination).lerp(new THREE.Vector3().fromArray(expandedView.camera), extra);
        currentTargetGoal.copy(targetDestination).lerp(new THREE.Vector3().fromArray(expandedView.target), extra);
      }
      controls.maxDistance = Math.max(18, currentCameraGoal.distanceTo(currentTargetGoal) * 1.6);
      camera.position.lerp(currentCameraGoal, blend);
      controls.target.lerp(currentTargetGoal, blend);
      if (camera.position.distanceTo(currentCameraGoal) < 5e-3 && controls.target.distanceTo(currentTargetGoal) < 5e-3) cameraTransition = false;
    }
    controls.autoRotate = s.rotate && !cameraTransition && !configuration.active;
    controls.update();
    const viewDistance = camera.position.distanceTo(controls.target);
    world.fog.near = viewDistance + 12;
    world.fog.far = viewDistance + 45;
    const far = Math.max(80, viewDistance + 60);
    if (camera.far !== far) { camera.far = far; camera.updateProjectionMatrix(); }
    if (canRender) composer.render();
    frame = requestAnimationFrame(update);
  };
  frame = requestAnimationFrame(update);
  return { zoom, dispose() {
    window.removeEventListener('themechange', updateTheme);
    cancelAnimationFrame(frame);
    observer.disconnect();
    intersection.disconnect();
    controls.dispose();
    motionPreference.removeEventListener('change', updateMotionPreference);
    modelMotion.dispose();
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose();
    });
    printMaterials.forEach((material) => material.dispose());
    environment.dispose();
    floor.geometry.dispose();
    floorMaterial.dispose();
    grain.dispose();
    composer.dispose();
    ao.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  } };
}
export {
  createGarageScene
};
