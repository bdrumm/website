import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export async function mountReview(root, buffer) {
 const host=root.querySelector('[data-model-stage]'),status=root.querySelector('[data-status]');
 let renderer;
 try { renderer=new T.WebGLRenderer({antialias:true,alpha:true}); }
 catch { status.textContent=root.dataset.remote==='true'?'3D is unavailable. The rendered review views remain available below.':'3D is unavailable here. Open the remote review link for the model and rendered views.';return; }
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 renderer.localClippingEnabled=true;host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Baguette V3 printable assembly. Drag to orbit, pinch or scroll to zoom.');
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-350,350,210,-210,.1,4000);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.85;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xffffff,0x778496,1.6));const key=new T.DirectionalLight(0xfff4e4,2.2);key.position.set(-200,450,500);scene.add(key);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minZoom=.4;controls.maxZoom=8;
 const {scene:model}=await new GLTFLoader().parseAsync(buffer,'');scene.add(model);
 const hinge=model.getObjectByName('LidHinge'),meshes=[];model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.side=T.DoubleSide;meshes.push({mesh:o,rest:o.position.clone()});}});
 const angle=root.querySelector('[data-angle]'),angleValue=root.querySelector('[data-angle-value]'),exploded=root.querySelector('[data-explode]'),cutaway=root.querySelector('[data-cutaway]');
 let view=root.dataset.defaultView||'overall',halfWidth=350,disposed=false;
 const presets={overall:{target:[0,0,-20],position:[120,180,680],width:350},hinge:{target:[-60,0,-39.5],position:[-60,75,-200],width:82},latch:{target:[90,-7,46],position:[105,25,225],width:40},joint:{target:[-4,0,0],position:[28,80,190],width:85}};
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfWidth*h/w;camera.bottom=-halfWidth*h/w;camera.updateProjectionMatrix();}
 function pose(){const degrees=Number(angle.value);hinge.rotation.x=-T.MathUtils.degToRad(degrees);angleValue.textContent=degrees+'°';
  for(const {mesh,rest} of meshes){mesh.position.copy(rest);if(mesh.name.endsWith('_A'))mesh.position.x-=exploded.checked?58:0;else if(mesh.name.endsWith('_B'))mesh.position.x+=exploded.checked?58:0;
   if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[0]=degrees>0?1:0;
   mesh.material.clippingPlanes=cutaway.checked?[new T.Plane(new T.Vector3(0,-1,0),0)]:[];
  }
  status.textContent=degrees>0?'Latches shown released · '+degrees+'° open':'Closed assembly';
 }
 function select(name){view=name;const p=presets[name];controls.target.fromArray(p.target);camera.position.fromArray(p.position);camera.zoom=1;halfWidth=p.width;root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));resize();controls.update();}
 root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.view)));
 for(const input of [angle,exploded,cutaway])input.addEventListener('input',pose);
 const params=new URLSearchParams(location.search);if(root.dataset.remote==='true'){angle.value=String(Math.max(0,Math.min(180,Number(params.get('angle'))||0)));exploded.checked=params.get('explode')==='1';cutaway.checked=params.get('cut')==='1';view=presets[params.get('view')]?params.get('view'):view;}
 pose();select(view);const observer=new ResizeObserver(resize);observer.observe(host);
 root.querySelector('[data-copy-link]')?.addEventListener('click',async()=>{const url=new URL(location.href);url.searchParams.set('view',view);url.searchParams.set('angle',angle.value);url.searchParams.set('explode',exploded.checked?'1':'0');url.searchParams.set('cut',cutaway.checked?'1':'0');try{await navigator.clipboard.writeText(url.href);status.textContent='Review link copied';}catch{history.replaceState(null,'',url);status.textContent='This view is saved in the address bar';}});
 function frame(){if(disposed)return;requestAnimationFrame(frame);controls.update();if(!document.hidden)renderer.render(scene,camera);}frame();
 window.addEventListener('pagehide',()=>{disposed=true;observer.disconnect();controls.dispose();env.dispose();meshes.forEach(({mesh})=>{mesh.geometry.dispose();mesh.material.dispose();});renderer.dispose();},{once:true});
}
