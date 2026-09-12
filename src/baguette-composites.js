import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {clonePrintModel,applyPrintFinish} from './baguette-render-model.js';
import {LIFESTYLE_SCENES,DETAIL_SCENES,STRAP_EYES} from './baguette-scenes.js';

function weaveTexture(){
 const size=64,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,v=190+((x%8<4)===(y%8<4)?32:0)+Math.round(12*Math.sin(x*2.3+y*3.7));
  data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
 }
 const texture=new T.DataTexture(data,size,size);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;return texture;
}

function ribbon(points,width=15,ground=false){
 const curve=new T.CatmullRomCurve3(points),positions=[],uv=[],indices=[],steps=48;
 for(let i=0;i<=steps;i++){
  const t=i/steps,p=curve.getPoint(t),tangent=curve.getTangent(t);
  const side=new T.Vector3().crossVectors(tangent,new T.Vector3(0,ground?1:0,ground?0:1)).normalize().multiplyScalar(width/2);
  positions.push(...p.clone().sub(side).toArray(),...p.clone().add(side).toArray());uv.push(0,t*32,1,t*32);
  if(i<steps){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

function addStrapEyes(group,material,ownedGeometry){
 for(const [x,y,z] of STRAP_EYES){
  const points=[[x,y-5,z],[x,y+5,z],[x,y+6,z+7],[x,y,z+15],[x,y-6,z+7]].map(p=>new T.Vector3(...p));
  const geometry=new T.TubeGeometry(new T.CatmullRomCurve3(points,true),48,1.15,8,true);ownedGeometry.push(geometry);
  const loop=new T.Mesh(geometry,material);loop.castShadow=true;group.add(loop);
 }
}

function makeLighting(scene,preset={}){
 scene.environmentIntensity=.55;
 scene.add(new T.HemisphereLight('#fff8ef','#929fa9',.65));
 const key=new T.DirectionalLight(preset.keyColor||'#fff1df',1.9);key.position.fromArray(preset.key||[-350,600,650]);
 const shadowExtent=preset.camera?preset.width*1.5:700;
 key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-shadowExtent;key.shadow.camera.right=shadowExtent;key.shadow.camera.top=shadowExtent;key.shadow.camera.bottom=-shadowExtent;key.shadow.camera.near=1;key.shadow.camera.far=2600;key.shadow.normalBias=preset.camera?.025:.12;key.shadow.bias=-.00008;key.shadow.radius=4;scene.add(key);
 const fill=new T.DirectionalLight('#dbe5f5',.3);fill.position.set(600,80,400);scene.add(fill);
 return key;
}

function shadowPlane(scene,placement,ground,geometry,materials){
 const g=new T.PlaneGeometry(1300,700),m=new T.ShadowMaterial({opacity:ground?.24:.1,depthWrite:false});geometry.push(g);materials.push(m);
 const plane=new T.Mesh(g,m);plane.receiveShadow=true;
 if(ground){plane.rotation.x=-Math.PI/2;plane.position.y=-43.7;placement.add(plane);}
 else{plane.position.copy(placement.position);plane.position.z-=95;scene.add(plane);}
}

// One shared WebGL renderer feeds all visible preview canvases. Geometry and the
// lighting environment are loaded once; off-screen/hidden cards do no rendering.
export async function mountBaguetteComposites(root,buffer,finishes){
 const surfaces=[...root.querySelectorAll('[data-lifestyle-scene],[data-cad-preview]')];
 if(!surfaces.length)return;
 let renderer;
 try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}
 catch{for(const host of surfaces){host.classList.add('preview-unavailable');host.querySelector('[data-scene-status]')?.replaceChildren('3D preview unavailable on this device.');}return;}
 renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.localClippingEnabled=true;renderer.setClearColor(0,0);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.05);room.dispose();pmrem.dispose();
 let source;
 try{({scene:source}=await new GLTFLoader().parseAsync(buffer,''));}
 catch(error){environment.dispose();renderer.dispose();throw error;}
 const weave=weaveTexture(),strapMaterial=new T.MeshStandardMaterial({color:'#53533d',map:weave,roughness:.92,metalness:0,side:T.DoubleSide});
 const records=[],ownedGeometry=[],ownedMaterials=[strapMaterial];
 let frameId=0,disposed=false,parallaxEnabled=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const vector=new T.Vector3();

 for(const host of surfaces){
  const lifestyle=host.dataset.lifestyleScene,preset=lifestyle?LIFESTYLE_SCENES[lifestyle]:DETAIL_SCENES[host.dataset.cadPreview];
  if(!preset)continue;
  const scene=new T.Scene();scene.environment=environment.texture;
  const camera=new T.OrthographicCamera(-350,350,230,-230,.1,5000);
  const {model,materials}=clonePrintModel(source,preset);ownedMaterials.push(...materials);
  const placement=new T.Group();placement.add(model);scene.add(placement);
  const key=makeLighting(scene,preset),canvas=document.createElement('canvas');canvas.className='baguette-render-canvas';canvas.setAttribute('role','img');
  const context=canvas.getContext('2d',{alpha:true});if(!context)continue;
  host.append(canvas);
  const record={host,lifestyle,preset,scene,camera,model,placement,key,canvas,context,straps:[],visible:false,dirty:true,x:0,y:0,targetX:0,targetY:0};
  if(lifestyle){
   // Uniform physical scale and rigid transforms only. Image coordinates calibrate
   // a lens framing; they never stretch or deform the manufacturing mesh.
   const width=621.74/preset.width,height=width/1.5;
   camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.position.set(0,0,1600);camera.lookAt(0,0,0);camera.updateProjectionMatrix();
   placement.position.set((preset.center[0]-.5)*width,(.5-preset.center[1])*height,0);placement.rotation.set(...preset.rotation,'ZYX');
   record.width=width;record.height=height;
   key.target.position.copy(placement.position);scene.add(key.target);
   addStrapEyes(placement,strapMaterial,ownedGeometry);
   if(preset.strapTops){
    for(let i=0;i<2;i++){const strap=new T.Mesh(new T.BufferGeometry(),strapMaterial);strap.castShadow=true;record.straps.push(strap);scene.add(strap);}
   }else{
    const points=[[-271.5,-3.5,69],[-291,-40,105],[-185,-42,186],[25,-42,221],[243,-42,144],[271.5,-3.5,69]].map(p=>new T.Vector3(...p));
    const geometry=ribbon(points,15,true);ownedGeometry.push(geometry);const strap=new T.Mesh(geometry,strapMaterial);strap.castShadow=strap.receiveShadow=true;placement.add(strap);
   }
   shadowPlane(scene,placement,preset.ground,ownedGeometry,ownedMaterials);
   if(preset.occlusion){const plate=host.querySelector('.baguette-scene-background').cloneNode();plate.className='baguette-scene-occlusion';plate.style.clipPath=preset.occlusion;plate.alt='';host.append(plate);}
   host.tabIndex=0;host.setAttribute('aria-label',`${lifestyle} scene. Move the pointer or use arrow keys for a small change in perspective.`);
   host.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const box=host.getBoundingClientRect();record.targetX=(event.clientX-box.left)/box.width*2-1;record.targetY=(event.clientY-box.top)/box.height*2-1;requestRender();});
   host.addEventListener('pointerleave',()=>{record.targetX=record.targetY=0;requestRender();});
   host.addEventListener('keydown',event=>{const direction={ArrowLeft:[-.3,0],ArrowRight:[.3,0],ArrowUp:[0,-.3],ArrowDown:[0,.3],Home:[0,0],Escape:[0,0]}[event.key];if(!direction)return;event.preventDefault();if(['Home','Escape'].includes(event.key))record.targetX=record.targetY=0;else{record.targetX=T.MathUtils.clamp(record.targetX+direction[0],-1,1);record.targetY=T.MathUtils.clamp(record.targetY+direction[1],-1,1);}requestRender();});
  }else{
   camera.position.fromArray(preset.camera);camera.lookAt(...preset.target);camera.left=-preset.width;camera.right=preset.width;camera.top=preset.width/1.6;camera.bottom=-preset.width/1.6;camera.updateProjectionMatrix();
   key.target.position.fromArray(preset.target);scene.add(key.target);scene.environmentIntensity=.8;
  }
  records.push(record);
 }

 function requestRender(){if(!frameId&&!disposed)frameId=requestAnimationFrame(render);}
 function render(){
  frameId=0;if(disposed||document.hidden)return;
  let moving=false;
  for(const r of records){
   if(!r.visible)continue;
   const rect=r.host.getBoundingClientRect();if(!rect.width||!rect.height||rect.bottom<0||rect.top>innerHeight)continue;
   const scroll=T.MathUtils.clamp((innerHeight/2-(rect.top+rect.height/2))/innerHeight,-.5,.5);
   const targetX=parallaxEnabled?r.targetX:0,targetY=parallaxEnabled?r.targetY+scroll*.24:0;
   const dx=targetX-r.x,dy=targetY-r.y;
   if(Math.abs(dx)+Math.abs(dy)>.001){r.x+=dx*.16;r.y+=dy*.16;r.dirty=true;moving=true;}
   if(!r.dirty)continue;
   const dpr=Math.min(devicePixelRatio||1,1.75),w=Math.min(1800,Math.round(rect.width*dpr)),h=Math.round(w*rect.height/rect.width);
   if(r.canvas.width!==w||r.canvas.height!==h){r.canvas.width=w;r.canvas.height=h;}
   const shadowSize=r.lifestyle&&w>1200?2048:1024;
   if(r.key.shadow.mapSize.x!==shadowSize){r.key.shadow.dispose();r.key.shadow.map=null;r.key.shadow.mapSize.set(shadowSize,shadowSize);}
   if(r.lifestyle){
    const [rx,ry,rz]=r.preset.rotation;r.placement.rotation.set(rx+r.y*.012,ry+r.x*.018,rz+r.x*.003);r.placement.updateMatrixWorld(true);
    r.host.style.setProperty('--scene-x',`${r.x*2}px`);r.host.style.setProperty('--scene-y',`${r.y*2}px`);
    for(let i=0;i<r.straps.length;i++){
     const [x,y]=r.preset.strapTops[i];const anchor=r.placement.localToWorld(vector.set(STRAP_EYES[i][0],-3.5,69)).clone();
     const top=new T.Vector3((x-.5)*r.width,(.5-y)*r.height,15);
     const geometry=ribbon([anchor,anchor.clone().lerp(top,.08),anchor.clone().lerp(top,.6),top]);r.straps[i].geometry.dispose();r.straps[i].geometry=geometry;
    }
   }
   renderer.setSize(w,h,false);renderer.toneMappingExposure=r.preset.exposure||1;renderer.render(r.scene,r.camera);
   r.context.clearRect(0,0,w,h);r.context.drawImage(renderer.domElement,0,0);r.dirty=false;
   r.host.classList.add('is-rendered');r.host.querySelector('[data-scene-status]')?.setAttribute('hidden','');
  }
  if(moving)requestRender();
 }
 const visibility=new IntersectionObserver(entries=>{for(const entry of entries){const r=records.find(r=>r.host===entry.target);r.visible=entry.isIntersecting;if(r.visible)r.dirty=true;else{r.key.shadow.dispose();r.key.shadow.map=null;}}requestRender();},{rootMargin:'100px'});
 const size=new ResizeObserver(entries=>{for(const entry of entries){const r=records.find(r=>r.host===entry.target);if(r)r.dirty=true;}requestRender();});
 for(const r of records){visibility.observe(r.host);size.observe(r.host);}
 const unsubscribe=finishes.subscribe(finish=>{for(const r of records){applyPrintFinish(r.model,finish.color,r.preset);r.canvas.setAttribute('aria-label',`Baguette holder in ${finish.name}. ${r.lifestyle||r.host.dataset.cadPreview} view, rendered from the printable CAD model.`);r.dirty=true;}requestRender();});
 const motionButton=root.querySelector('[data-parallax-toggle]');
 function updateMotion(){motionButton?.setAttribute('aria-pressed',String(parallaxEnabled));if(motionButton)motionButton.textContent=parallaxEnabled?'Parallax on':'Parallax off';for(const r of records)r.dirty=true;requestRender();}
 motionButton?.addEventListener('click',()=>{parallaxEnabled=!parallaxEnabled;updateMotion();});
 reducedMotion.addEventListener('change',()=>{parallaxEnabled=!reducedMotion.matches;updateMotion();});updateMotion();
 window.addEventListener('scroll',requestRender,{passive:true});document.addEventListener('visibilitychange',requestRender);
 window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frameId);visibility.disconnect();size.disconnect();unsubscribe();window.removeEventListener('scroll',requestRender);document.removeEventListener('visibilitychange',requestRender);for(const r of records){for(const strap of r.straps)strap.geometry.dispose();r.key.shadow.map?.dispose();}for(const geometry of ownedGeometry)geometry.dispose();for(const material of ownedMaterials)material.dispose();source.traverse(o=>{if(o.isMesh)o.geometry.dispose();});weave.dispose();environment.dispose();renderer.dispose();},{once:true});
 return {records,renderer};
}
