import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {rotateModelWithKey} from './model-rotation-controls.js';
export type PrintScene = { group: (id: string) => void; focus: (id: string) => void; options: (highlight: boolean, tiles: boolean) => void; visible: (shown: boolean) => void; zoom: (factor: number) => void; capture: () => Promise<Blob>; dispose: () => void };
export async function createPrintScene(host: HTMLElement, onPick: (id: string) => void, signal?: AbortSignal): Promise<PrintScene> {
  if (signal?.aborted) throw new DOMException('Print view cancelled', 'AbortError');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setClearColor('#e8eae4'); renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const theme=()=>renderer.setClearColor(document.documentElement.dataset.theme==='dark'?'#0a1328':'#e8eae4'); theme();window.addEventListener('themechange',theme);
  renderer.domElement.tabIndex=0; renderer.domElement.setAttribute('role','img');
  renderer.domElement.setAttribute('aria-label','Printable parts in their supplied orientations. Drag to orbit, scroll or use plus and minus to zoom. Select a part from the list for its print notes.');
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7b8874, 2.3));
  const sun = new THREE.DirectionalLight(0xffffff, 3); sun.position.set(-3, 6, 4); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 1.5); fill.position.set(4, 2, -3); scene.add(fill);
  const camera = new THREE.PerspectiveCamera(40, 1, .001, 100);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.minDistance = .006; controls.maxDistance = 15;
  const resize = () => { const { width, height } = host.getBoundingClientRect(); renderer.setSize(Math.max(width, 1), Math.max(height, 1)); camera.aspect = Math.max(width,1) / Math.max(height, 1); camera.updateProjectionMatrix(); };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  let raf = 0, stopped = false, visible = true, inView = false;
  const intersection=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;}); intersection.observe(host);
  let cleanupScene = () => {};
  const disposeObjects = (root: THREE.Object3D) => root.traverse(o => {
    if (o instanceof THREE.Mesh) { o.geometry.dispose(); const materials = Array.isArray(o.material) ? o.material : [o.material]; materials.forEach(m => m.dispose()); }
  });
  const stop = () => {
    if (stopped) return;
    stopped = true; window.removeEventListener('themechange',theme); cancelAnimationFrame(raf); observer.disconnect(); intersection.disconnect(); controls.dispose(); cleanupScene(); renderer.dispose(); renderer.domElement.remove(); signal?.removeEventListener('abort', stop);
  };
  signal?.addEventListener('abort', stop, { once: true });
  const render = () => { if (stopped) return; if(visible && inView && !document.hidden){controls.update(); renderer.render(scene, camera);} raf = requestAnimationFrame(render); }; render();
  let model: THREE.Group;
  try { model = (await new GLTFLoader().loadAsync('assets/garage/print-positions/print-layout.glb?v=20260911')).scene; }
  catch (error) { stop(); throw error; }
  if (stopped) { disposeObjects(model); throw new DOMException('Print view cancelled', 'AbortError'); }
  scene.add(model); model.updateMatrixWorld(true);
  const parts = new Map<string, THREE.Object3D>();
  model.traverse(o => { if (o.userData.stl_group) parts.set(String(o.userData.stl_group), o); });
  const frames = (objects: THREE.Object3D[]) => {
    const box = new THREE.Box3(); for (const object of objects) box.union(new THREE.Box3().setFromObject(object));
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    const extent = Math.max(size.x, size.y, size.z, .035); const distance = extent * 1.8 / Math.min(camera.aspect, 1);
    camera.position.copy(center).add(new THREE.Vector3(.7, .95, 1.3).normalize().multiplyScalar(distance));
    controls.target.copy(center); controls.update();
  };
  let activeGroup = 'all', showTiles = true, steep = false;
  type Alternate = { mesh: THREE.Mesh; original: THREE.BufferGeometry; normal: THREE.Material | THREE.Material[]; coloured: THREE.BufferGeometry; material: THREE.MeshStandardMaterial };
  const alternate: Alternate[] = []; let prepared = false;
  const prepareHighlights = () => {
    if (prepared) return; prepared = true;
    for (const root of parts.values()) root.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return;
      const original = o.geometry, geometry = original.index ? original.toNonIndexed() : original.clone();
      const position = geometry.getAttribute('position'), colours = new Float32Array(position.count * 3);
      const base = Array.isArray(o.material) ? o.material[0] : o.material;
      const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 });
      const baseColour = base instanceof THREE.MeshStandardMaterial ? base.color : new THREE.Color('#729085');
      const red = new THREE.Color('#d8513f'), low = new THREE.Box3().setFromObject(o).min.y;
      const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), u = new THREE.Vector3(), v = new THREE.Vector3();
      for (let i = 0; i < position.count; i += 3) {
        a.fromBufferAttribute(position, i).applyMatrix4(o.matrixWorld); b.fromBufferAttribute(position, i + 1).applyMatrix4(o.matrixWorld); c.fromBufferAttribute(position, i + 2).applyMatrix4(o.matrixWorld);
        const normal = u.subVectors(b, a).cross(v.subVectors(c, a)).normalize();
        const colour = normal.y < -.7073 && Math.min(a.y, b.y, c.y) > low + .0001 ? red : baseColour;
        for (let j = 0; j < 3; j++) colour.toArray(colours, (i + j) * 3);
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3));
      alternate.push({ mesh: o, original, normal: o.material, coloured: geometry, material });
    });
  };
  const visibility = () => { model.traverse(o => { if (o.userData.print_group) o.visible = (activeGroup === 'all' || o.userData.print_group === activeGroup) && (showTiles || o.userData.kind !== 'illustrative_bed'); }); };
  const group = (id: string) => { activeGroup = id; visibility(); frames([...parts.values()].filter(o => id === 'all' || o.userData.print_group === id)); };
  const focus = (id: string) => { const object = parts.get(id); if (object) frames([object]); };
  const options = (highlight: boolean, tiles: boolean) => { showTiles = tiles; visibility(); if (highlight) prepareHighlights(); steep = highlight; for (const a of alternate) { a.mesh.geometry = steep ? a.coloured : a.original; a.mesh.material = steep ? a.material : a.normal; } };
  const ray = new THREE.Raycaster(), pointer = new THREE.Vector2(); let down = [0, 0];
  const pointerDown = (e: PointerEvent) => { down = [e.clientX, e.clientY]; };
  const pointerUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const r = renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(pointer, camera);
    for (const hit of ray.intersectObjects([...parts.values()].filter(o => o.visible), true)) { let o: THREE.Object3D | null = hit.object; while (o && !o.userData.stl_group) o = o.parent; if (o) { onPick(String(o.userData.stl_group)); break; } }
  };
  renderer.domElement.addEventListener('pointerdown', pointerDown); renderer.domElement.addEventListener('pointerup', pointerUp); group('all');
  cleanupScene = () => {
    renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointerup', pointerUp);
    for (const a of alternate) { a.coloured.dispose(); a.material.dispose(); a.mesh.geometry = a.original; a.mesh.material = a.normal; }
    disposeObjects(model);
  };
  const zoom=(factor:number)=>{if(!Number.isFinite(factor)||factor<=0)return;const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();};
  renderer.domElement.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey)return;
    if(['+','=','-'].includes(event.key))zoom(event.key==='-'?1.25:.8);
    else if(!rotateModelWithKey(camera,controls,event.key))return;
    event.preventDefault();
  });
  return { group, focus, options, zoom, visible:shown=>{visible=shown;}, capture:()=>{
    renderer.render(scene,camera);
    return new Promise((resolve,reject)=>renderer.domElement.toBlob(blob=>blob?resolve(blob):reject(new Error('Image capture failed.')),'image/png'));
  }, dispose: stop };
}
