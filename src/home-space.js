import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { installAction } from './model-actions.js';
import { stepSpace } from './home-physics.js';
import { homePlacement, stationRotation } from './home-composition.js';
import { StationAppUI, tourFrame } from './station-app-ui.js';

const stage = document.getElementById('project-space');
if (stage) mountSpace(stage);

async function mountSpace(stage) {
  const status = document.getElementById('space-status');
  const pause = document.querySelector('[data-space-motion]');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const projects = window.PARAMETRIC_SHOP?.projects || [];
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    status.textContent = 'Choose a project below. The 3D space is unavailable in this browser.';
    pause.hidden = true;
    return;
  }
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true'); // Real links provide the accessible navigation.
  stage.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-8, 8, 4, -4, .1, 60);
  camera.position.set(0, 0, 24);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .85;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8b98b4, 1.5));
  for (const [x, y, z, color, power] of [[-5, 8, 10, 0xfff6e8, 2.6], [6, -2, 6, 0xbddcff, 1.3]]) {
    const light = new THREE.DirectionalLight(color, power);
    light.position.set(x, y, z); scene.add(light);
  }
  const abort = new AbortController();
  const on = (target, event, callback, options = {}) => target.addEventListener(event, callback, { ...options, signal: abort.signal });
  let disposed = false, inView = true, paused = preference.matches, focusWithin = false, time = 0, previous = 0;
  let hovered = null, drag = null, width = 1, height = 1, mobile = false;
  const pointer = { x: 0, y: 0, active: false };
  const bounds = { x: 8, y: 4, drift: .6 };
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2(), projected = new THREE.Vector3();
  const orientation = {
    trout: [.24, -.18, -.16],
    'baguette-holder': [.25, .15, -.6],
    'modular-garage': [.3, -.52, .07],
    station: [.25, -.32, -.13]
  };
  const bodies = projects.map((project, index) => {
    const label = stage.querySelector(`[data-project="${project.id}"]`);
    const pivot = new THREE.Group();
    pivot.userData.projectId = project.id;
    scene.add(pivot);
    label?.classList.add('is-loading');
    return { project, label, pivot, index, x: 0, y: 0, vx: 0, vy: 0, homeX: 0, homeY: 0,
      extentX: 1.5, extentY: 1.3, radius: 1.2, held: false, model: null, action: null,
      motionTime:0,rotation: orientation[project.id] || [.2, -.3, 0] };
  });

  function syncPause() {
    pause.setAttribute('aria-pressed', String(paused));
    pause.innerHTML = paused ? 'Resume motion <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
  }
  syncPause();
  on(pause, 'click', () => { paused = !paused; pointer.active = false; syncPause(); });
  on(preference, 'change', () => { paused = preference.matches; syncPause(); });
  on(stage, 'focusin', () => { focusWithin = true; pointer.active = false; });
  on(stage, 'focusout', event => { focusWithin = stage.contains(event.relatedTarget); });

  function measureBody(body) {
    if (!body.model) return;
    const size = new THREE.Box3().setFromObject(body.pivot).getSize(new THREE.Vector3());
    // A stable spherical envelope contains Station throughout its full turn.
    const spinRadius=body.project.id==='station'?body.spinRadius*body.pivot.scale.x:0;
    body.extentX = (spinRadius||size.x/2) + .2;
    body.extentY = (spinRadius||size.y/2) + .65;
    body.radius = spinRadius||Math.max(.65,Math.min(1.6,Math.hypot(size.x,size.y)*.31));
    body.labelOffset = (spinRadius||size.y/2) + .3;
  }
  function resize() {
    width = stage.clientWidth; height = stage.clientHeight;
    if (!width || !height) return;
    mobile = width < 740;
    bounds.y = mobile ? 6.4 : 4.3;
    bounds.x = bounds.y * width / height;
    bounds.drift = mobile ? .25 : .62;
    camera.left = -bounds.x; camera.right = bounds.x; camera.top = bounds.y; camera.bottom = -bounds.y;
    camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
    bodies.forEach((body, index) => {
      const {position} = homePlacement(body.project.id,mobile,index);
      body.homeX = position[0] * bounds.x;
      body.homeY = position[1] * bounds.y + .15;
      body.x = body.homeX; body.y = body.homeY; body.vx = body.vy = 0;
      // Scale the entire composition to fit narrow phones, including rotated silhouettes.
      body.pivot.scale.setScalar(mobile ? Math.min(.80,width/520) : Math.min(1,bounds.x/7.5));
      measureBody(body);
    });
    renderBodies(0, false);
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
  const intersection = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }); intersection.observe(stage);

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    ndc.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    pointer.x = ndc.x * bounds.x; pointer.y = ndc.y * bounds.y;
  }
  function hit() {
    scene.updateMatrixWorld(true); raycaster.setFromCamera(ndc, camera);
    const intersections = raycaster.intersectObjects(bodies.filter(body => body.model).map(body => body.pivot), true);
    if (!intersections.length) return null;
    let object = intersections[0].object;
    while (object && !object.userData.projectId) object = object.parent;
    return bodies.find(body => body.project.id === object?.userData.projectId) || null;
  }
  function highlight(body) {
    hovered = body;
    canvas.style.cursor = body ? 'pointer' : 'default';
    for (const item of bodies) item.label?.classList.toggle('is-active', item === body);
  }
  on(canvas, 'pointermove', event => {
    updatePointer(event);
    if (drag) {
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (distance > 7) drag.moved = true;
      if (drag.moved && !paused && !focusWithin) {
        const x = pointer.x + drag.offsetX, y = pointer.y + drag.offsetY;
        drag.body.vx = THREE.MathUtils.clamp((x - drag.body.x) * 10, -7, 7);
        drag.body.vy = THREE.MathUtils.clamp((y - drag.body.y) * 10, -7, 7);
        drag.body.x = x; drag.body.y = y;
        stage.classList.add('is-dragging');
      }
      return;
    }
    const body = hit(); highlight(body);
    // Stop nudging the hovered object so it remains easy to select.
    pointer.active = !body && event.pointerType !== 'touch' && !paused;
  });
  on(canvas, 'pointerdown', event => {
    if (event.button !== 0) return;
    updatePointer(event); const body = hit();
    if (!body) return;
    pointer.active = false; body.held = true;
    drag = { body, startX: event.clientX, startY: event.clientY, offsetX: body.x - pointer.x, offsetY: body.y - pointer.y, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  function release(event, navigate) {
    if (!drag) return;
    const { body, moved } = drag;
    body.held = false; drag = null; stage.classList.remove('is-dragging');
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (navigate && !moved) location.assign(`project.html?id=${encodeURIComponent(body.project.id)}`);
  }
  on(canvas, 'pointerup', event => release(event, true));
  on(canvas, 'pointercancel', event => release(event, false));
  on(canvas, 'lostpointercapture', event => release(event, false));
  on(canvas, 'pointerleave', () => { pointer.active = false; if (!drag) highlight(null); });
  for (const body of bodies) if (body.label) {
    on(body.label, 'pointerenter', () => { pointer.active = false; highlight(body); });
    on(body.label, 'pointerleave', () => highlight(null));
    on(body.label, 'focus', () => highlight(body));
    on(body.label, 'blur', () => highlight(null));
  }

  function renderBodies(dt, animated) {
    for (const body of bodies) {
      body.pivot.position.set(body.x, body.y, Math.sin(time * .4 + body.index) * .2);
      if(body.project.id==='station'){
        if(animated&&body!==hovered&&!body.held)body.motionTime+=dt;
        body.pivot.rotation.set(...stationRotation(body.motionTime));
      }else body.pivot.rotation.set(body.rotation[0] + Math.sin(time * .45 + body.index) * .07,
          body.rotation[1] + Math.sin(time * .3 + body.index) * .13, body.rotation[2] + Math.sin(time * .4 + body.index) * .045);
      if (animated) body.action?.update(dt, true);
      if (!body.label) continue;
      projected.set(body.x, body.y - (body.labelOffset || 1.1), 0).project(camera);
      const padding = body.label.offsetWidth / 2 + 10;
      const x = THREE.MathUtils.clamp((projected.x + 1) / 2 * width, padding, width - padding);
      const y = THREE.MathUtils.clamp((1 - projected.y) / 2 * height, 24, height - 30);
      body.label.style.left = `${x}px`; body.label.style.top = `${y}px`;
    }
  }
  resize();
  renderer.setAnimationLoop(now => {
    const dt = Math.min((now - (previous || now)) / 1000, 1 / 30); previous = now;
    if (disposed || !inView || document.hidden) return;
    const animated = !paused && !focusWithin;
    if (animated) {
      time += dt;
      // Hover acts as a temporary anchor, so motion never makes a link run away.
      if (hovered && !drag) hovered.held = true;
      stepSpace(bodies, dt, time, bounds, pointer);
      if (hovered && !drag) hovered.held = false;
    }
    renderBodies(dt, animated); renderer.render(scene, camera);
  });
  on(canvas, 'webglcontextlost', event => {
    event.preventDefault(); renderer.setAnimationLoop(null);
    status.textContent = 'The 3D space paused. Choose any project link to continue.';
    pause.hidden = true;
  });
  on(canvas, 'webglcontextrestored', () => location.reload());

  function disposeObject(object) {
    object.traverse(child => {
      child.geometry?.dispose();
      for (const material of child.material ? (Array.isArray(child.material) ? child.material : [child.material]) : []) {
        for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
        material.dispose();
      }
    });
  }
  on(window, 'pagehide', event => {
    if (event.persisted) return; // Retain the scene when the browser caches this page for Back.
    disposed = true; abort.abort(); renderer.setAnimationLoop(null);
    resizeObserver.disconnect(); intersection.disconnect();
    disposeObject(scene); environment.dispose(); renderer.dispose();
  });

  const loader = new GLTFLoader();
  let loaded = 0, failed = 0;
  await Promise.allSettled(bodies.map(async body => {
    try {
      const gltf = await loader.loadAsync(`assets/models/home/${body.project.id}.glb${body.project.id==='station'?'?v=clean-shell-3':body.project.id==='baguette-holder'?'?v=contiguous-1':''}`);
      if (disposed) { disposeObject(gltf.scene); return; }
      const size = new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
      const center = new THREE.Box3().setFromObject(gltf.scene).getCenter(new THREE.Vector3());
      const targetSize = homePlacement(body.project.id,mobile,body.index).size;
      const scale = targetSize / Math.max(size.x, size.y, size.z);
      gltf.scene.scale.multiplyScalar(scale);
      gltf.scene.position.sub(center.multiplyScalar(scale));
      body.model = gltf.scene;
      if(body.project.id==='station'){
        // Measure the actual round silhouette, rather than the diagonal of its box.
        gltf.scene.updateMatrixWorld(true);
        const vertex=new THREE.Vector3();let radiusSquared=0;
        gltf.scene.traverse(object=>{
          const positions=object.geometry?.attributes.position;if(!positions)return;
          for(let i=0;i<positions.count;i++){
            vertex.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld);
            radiusSquared=Math.max(radiusSquared,vertex.lengthSq());
          }
        });
        body.spinRadius=Math.sqrt(radiusSquared);
      }
      body.pivot.add(gltf.scene);
      if (body.project.id === 'trout') body.action = installAction(gltf.scene, 'swim');
      if (body.project.id === 'station') {
        const screen = gltf.scene.getObjectByName('StationScreen');
        if (screen?.isMesh) {
          await Promise.all([document.fonts.load('500 24px Geist'),document.fonts.load('500 14px "Geist Mono"')]);
          if(disposed)return;
          const surface=document.createElement('canvas');surface.width=surface.height=1024;
          const context=surface.getContext('2d');context.scale(2,2);
          const ui=new StationAppUI(context);ui.render('home',tourFrame('home',2),0,0,true);
          const texture=new THREE.CanvasTexture(surface);
          texture.colorSpace=THREE.SRGBColorSpace;
          texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
          screen.material.dispose(); screen.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
        }
      }
      body.label?.classList.remove('is-loading');
      measureBody(body); loaded++;
    } catch {
      failed++; body.label?.classList.remove('is-loading');
    }
    if (!disposed) status.textContent = loaded + failed < bodies.length ? `${loaded} of ${bodies.length} objects in the space…` : failed ? 'Some objects could not load. Every project is available through its link.' : '';
  }));
}
