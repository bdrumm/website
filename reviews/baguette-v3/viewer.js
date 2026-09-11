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
 const hinge=model.getObjectByName('LidHinge'),meshes=[];model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.side=T.DoubleSide;meshes.push({mesh:o,rest:o.position.clone(),color:o.material.color.clone()});}});
 const maxAngle=model.getObjectByName('BaguetteV3').userData.maxOpenAngle;
 const angle=root.querySelector('[data-angle]'),angleValue=root.querySelector('[data-angle-value]'),exploded=root.querySelector('[data-explode]'),cutaway=root.querySelector('[data-cutaway]');
 angle.max=String(maxAngle);
 let view=root.dataset.defaultView||'overall',halfWidth=350,disposed=false;
 const presets={overall:{target:[0,0,-20],position:[120,180,680],width:350},hinge:{target:[150,0,-41],position:[190,150,10],width:32},section:{target:[150,0,-41],position:[50,2,-44],width:15},latch:{target:[150,0,43],position:[170,30,225],width:35},catch:{target:[150,-4,42],position:[245,5,45],width:18},jointsection:{target:[1.5,39.8,0],position:[1.5,39.8,100],width:22},joint:{target:[-4,10,0],position:[-85,150,220],width:85}};
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfWidth*h/w;camera.bottom=-halfWidth*h/w;camera.updateProjectionMatrix();}
 function pose(){const degrees=Number(angle.value);hinge.rotation.x=-T.MathUtils.degToRad(degrees);angleValue.textContent=degrees+'°';
  for(const {mesh,rest,color} of meshes){mesh.visible=mesh.userData.reviewSection?(mesh.userData.sectionType==='joint'?view==='jointsection':view==='section'):!['section','jointsection'].includes(view);mesh.position.copy(rest);if(mesh.name.endsWith('_A'))mesh.position.x-=exploded.checked?24:0;else if(mesh.name.endsWith('_B'))mesh.position.x+=exploded.checked?24:0;
   if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[0]=degrees>0?1:0;
   mesh.material.color.copy(color);if(['catch','section'].includes(view)&&mesh.name.startsWith('base'))mesh.material.color.set('#638c9a');
   mesh.material.clippingPlanes=cutaway.checked?(['section','jointsection'].includes(view)?[]:view==='catch'?[new T.Plane(new T.Vector3(-1,0,0),150),new T.Plane(new T.Vector3(1,0,0),-136),new T.Plane(new T.Vector3(0,0,1),-30)]:[new T.Plane(new T.Vector3(0,-1,0),0)]):[];
  }
  status.textContent=view==='jointsection'?'Light: section A tongue · Dark: section B socket':view==='section'?'Blue: base / pin · Gold: lid · '+degrees+'°':degrees>0?'Latches shown released · '+degrees+'° open':(view==='catch'?'Blue: catch · Gold: latch':'Closed assembly');
 }
 function select(name){if(['catch','section','jointsection'].includes(view)&&name!==view)cutaway.checked=false;view=name;cutaway.disabled=['section','jointsection'].includes(name);exploded.disabled=['section','jointsection'].includes(name);angle.disabled=name==='jointsection';if(name==='jointsection')angle.value='0';if(['section','jointsection'].includes(name)){cutaway.checked=true;exploded.checked=false;}if(name==='catch'){angle.value='0';cutaway.checked=true;}pose();const p=presets[name];controls.target.fromArray(p.target);camera.position.fromArray(p.position);camera.zoom=1;halfWidth=p.width;root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));resize();controls.update();}
 root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view==='hinge'&&Number(angle.value)===0){angle.value=String(maxAngle);pose();}if(b.dataset.view==='joint'){angle.value=String(maxAngle);exploded.checked=true;cutaway.checked=false;}if(b.dataset.view==='latch'){angle.value='0';pose();}select(b.dataset.view);}));
 for(const input of [angle,exploded,cutaway])input.addEventListener('input',pose);
 const params=new URLSearchParams(location.search);if(root.dataset.remote==='true'){angle.value=String(Math.max(0,Math.min(maxAngle,params.has('angle')?Number(params.get('angle')):Number(angle.value))));exploded.checked=params.get('explode')==='1';cutaway.checked=params.get('cut')==='1';view=presets[params.get('view')]?params.get('view'):view;}
 pose();select(view);const observer=new ResizeObserver(resize);observer.observe(host);
 root.querySelector('[data-copy-link]')?.addEventListener('click',async()=>{const url=new URL(location.href);url.searchParams.set('view',view);url.searchParams.set('angle',angle.value);url.searchParams.set('explode',exploded.checked?'1':'0');url.searchParams.set('cut',cutaway.checked?'1':'0');try{await navigator.clipboard.writeText(url.href);status.textContent='Review link copied';}catch{history.replaceState(null,'',url);status.textContent='This view is saved in the address bar';}});
 function frame(){if(disposed)return;requestAnimationFrame(frame);controls.update();if(!document.hidden)renderer.render(scene,camera);}frame();
 window.addEventListener('pagehide',()=>{disposed=true;observer.disconnect();controls.dispose();env.dispose();meshes.forEach(({mesh})=>{mesh.geometry.dispose();mesh.material.dispose();});renderer.dispose();},{once:true});
}
