import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {configureRotationControls,rotateModelWithKey} from './model-rotation-controls.js';
import {clonePrintModel,applyPrintFinish} from './baguette-render-model.js';
import {sizePresentation,applyPresentationScale,setOpening} from './baguette-presentation.js';

export async function mountBaguetteViewer(root,buffer,finishes,options){
 const host=root.querySelector('[data-model-stage]'),status=root.querySelector('[data-status]');
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;host.append(renderer.domElement);
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-360,360,200,-200,.1,4000);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();scene.environment=environment.texture;scene.environmentIntensity=.55;
 scene.add(new T.HemisphereLight('#fff8ef','#8b96a4',.65));const key=new T.DirectionalLight('#fff1df',1.9);key.position.set(-250,500,500);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-450,right:450,top:450,bottom:-450,near:1,far:1800});key.shadow.normalBias=.06;key.shadow.bias=-.00006;scene.add(key);
 let source;
 try{({scene:source}=await new GLTFLoader().parseAsync(buffer,''));}catch(error){environment.dispose();renderer.dispose();throw error;}
 const {model,materials}=clonePrintModel(source);const assembly=new T.Group();assembly.add(model);scene.add(assembly);
 source.updateMatrixWorld(true);const floorY=new T.Box3().setFromObject(source.getObjectByName('base_A')).min.y;
 const floorGeometry=new T.PlaneGeometry(1200,650),floorMaterial=new T.ShadowMaterial({opacity:.19,depthWrite:false}),floor=new T.Mesh(floorGeometry,floorMaterial);floor.rotation.x=-Math.PI/2;floor.position.y=floorY-.25;floor.receiveShadow=true;scene.add(floor);
 const controls=new OrbitControls(camera,canvas);configureRotationControls(controls);controls.enableDamping=true;
 camera.position.set(120,180,680);controls.target.set(0,-8,0);controls.update();
 let selected=sizePresentation(options.value.size),scale=selected.scale,targetScale=scale,angle=0,targetAngle=0,disposed=false,frameId=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');applyPresentationScale(assembly,scale,'ground',floorY);
 const opening=root.querySelector('[data-open-case]'),maxAngle=model.getObjectByName('BaguetteV3').userData.maxOpenAngle;
 function label(){canvas.setAttribute('aria-label',`${selected.name} in ${finishes.value.name}. ${selected.current?'Current CAD model':'Uniform scale concept'}. Drag or use arrow keys to rotate; scroll to move the page.`);status.textContent=selected.current?'Pro Max · Current prototype':`${selected.name} · Scale preview`;}
 function requestRender(){if(!disposed&&!frameId)frameId=requestAnimationFrame(render);}
 function render(){
  frameId=0;if(disposed||document.hidden)return;
  const rect=host.getBoundingClientRect();if(!rect.width||rect.bottom<0||rect.top>innerHeight)return;
  const moving=Math.abs(scale-targetScale)>.0005||Math.abs(angle-targetAngle)>.02;
  if(reduced.matches){scale=targetScale;angle=targetAngle;}else{scale+=(targetScale-scale)*.2;angle+=(targetAngle-angle)*.2;}
  if(!moving){scale=targetScale;angle=targetAngle;}
  applyPresentationScale(assembly,scale,'ground',floorY);setOpening(model,angle);controls.update();renderer.render(scene,camera);
  if(moving)requestRender();
 }
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);const halfWidth=Math.max(360,135*w/h);camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfWidth*h/w;camera.bottom=-halfWidth*h/w;camera.updateProjectionMatrix();requestRender();}
 canvas.addEventListener('keydown',event=>{if(rotateModelWithKey(camera,controls,event.key)){event.preventDefault();requestRender();}});controls.addEventListener('change',requestRender);
 opening.addEventListener('click',()=>{targetAngle=targetAngle?0:maxAngle;opening.textContent=targetAngle?'Close case':'Open case';opening.setAttribute('aria-pressed',String(targetAngle>0));requestRender();});
 root.querySelector('[data-copy-link]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);status.textContent='Setup link copied';}catch{status.textContent='Your setup is saved in the page address.';}});
 const unsubscribeFinish=finishes.subscribe(finish=>{applyPrintFinish(model,finish.color,finish);label();requestRender();});
 const unsubscribeOptions=options.subscribe(value=>{selected=sizePresentation(value.size);targetScale=selected.scale;label();requestRender();});
 const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(host);const visibility=new IntersectionObserver(requestRender);visibility.observe(host);document.addEventListener('visibilitychange',requestRender);
 resize();requestRender();
 window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frameId);unsubscribeFinish();unsubscribeOptions();sizeObserver.disconnect();visibility.disconnect();document.removeEventListener('visibilitychange',requestRender);controls.dispose();key.shadow.dispose();floorGeometry.dispose();floorMaterial.dispose();materials.forEach(material=>material.dispose());source.traverse(mesh=>{if(mesh.isMesh)mesh.geometry.dispose();});environment.dispose();renderer.dispose();},{once:true});
}
