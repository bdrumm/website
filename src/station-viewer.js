import {configureRotationControls,rotateModelWithKey} from './model-rotation-controls.js';
import * as THREE from 'three';
import {installAction} from './model-actions.js';
import {createBaguetteExperience} from './baguette-experience.js';
import {installStation} from './station-experience.js';
import {configureStationPreview,tiltStationWithKey} from './station-preview-controls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export async function mountModelViewer(host,modelUrl,title="3D print",actionKind=""){
 const isStation=actionKind==='station';
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-label',title+(isStation?' model. Drag or use arrow keys to tilt slightly. Scroll to move the page.':' model. Drag or use arrow keys to rotate. Scroll to move the page.'));canvas.tabIndex=0;
 const stage=document.createElement('div');stage.className='model-stage';stage.append(canvas);host.append(stage);
 const status=document.createElement('p');status.className='viewer-status';status.setAttribute('role','status');status.textContent='Loading 3D model…';host.append(status);
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});}catch{status.textContent='3D is unavailable in this browser. Try another browser to view the model.';stage.remove();return;}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(-.1,1.8,12.5);
 scene.add(new THREE.HemisphereLight(0xffffff,0xa1a5bf,2.5));for(const [x,y,z,power] of [[-5,7,6,3],[5,2,-5,2],[0,-3,5,1]]){const light=new THREE.DirectionalLight(0xffffff,power);light.position.set(x,y,z);scene.add(light);}
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const controls=new OrbitControls(camera,canvas);configureRotationControls(controls);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=7;controls.maxDistance=26;controls.target.set(.1,0,0);controls.autoRotate=!isStation&&actionKind!=='swim'&&!reducedMotion;controls.autoRotateSpeed=1.3;
 if(isStation)configureStationPreview(camera,controls);
 const toolbar=document.createElement('div');toolbar.className='model-controls';host.append(toolbar);
 function button(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',fn);toolbar.append(b);return b;}
 const pause=button(controls.autoRotate?'Pause rotation':'Start rotation',()=>{if(actionKind==='station'){const enabled=stationExperience?.toggleMotion();pause.textContent=enabled?'Pause motion':'Resume motion';pause.setAttribute('aria-pressed',String(!!enabled));return;}controls.autoRotate=!controls.autoRotate;pause.textContent=controls.autoRotate?'Pause rotation':'Start rotation';pause.setAttribute('aria-pressed',String(controls.autoRotate));});pause.setAttribute('aria-pressed',String(controls.autoRotate));
 let actionActive=actionKind==='swim'&&!reducedMotion,modelAction,experience,stationExperience,stationEnvironment,loaded=false,carrying=false;
 const actionButton=actionKind&&actionKind!=='station'?button(actionKind==='open'?'Open':(actionActive?'Stop swimming':'Swim'),()=>{
  if(carrying){carrying=false;experience.setCarry(false);carryButton.textContent='Shoulder carry';carryButton.setAttribute('aria-pressed','false');}actionActive=!actionActive;controls.autoRotate=false;pause.textContent='Start rotation';pause.setAttribute('aria-pressed','false');
  actionButton.textContent=actionKind==='open'?(actionActive?'Close':'Open'):(actionActive?'Stop swimming':'Swim');actionButton.setAttribute('aria-pressed',String(actionActive));
  status.textContent=actionKind==='open'?(actionActive?'Opening the hinged lid.':'Closing the hinged lid.'):(actionActive?'Swimming · Drag to explore':'Returning to rest.');
 }):null;
 if(actionButton){actionButton.disabled=true;actionButton.setAttribute('aria-pressed',String(actionActive));}
 function stopOrbit(){controls.autoRotate=false;if(actionKind!=='station'){pause.textContent='Start rotation';pause.setAttribute('aria-pressed','false');}}
 function setOpen(value){actionActive=value;actionButton.textContent=value?'Close':'Open';actionButton.setAttribute('aria-pressed',String(value));}
 const loadButton=actionKind==='open'?button('Load baguette',()=>{
  loaded=!loaded;experience.setLoaded(loaded);stopOrbit();if(carrying){carrying=false;experience.setCarry(false);carryButton.textContent='Shoulder carry';carryButton.setAttribute('aria-pressed','false');}
  setOpen(true);loadButton.textContent=loaded?'Unload baguette':'Load baguette';loadButton.setAttribute('aria-pressed',String(loaded));status.textContent=loaded?'Opening and loading the baguette.':'Opening and removing the baguette.';
 }):null;
 const carryButton=actionKind==='open'?button('Shoulder carry',()=>{
  carrying=!carrying;experience.setCarry(carrying);stopOrbit();if(carrying)setOpen(false);carryButton.textContent=carrying?'Return to product':'Shoulder carry';carryButton.setAttribute('aria-pressed',String(carrying));status.textContent=carrying?'Shoulder carry · Flexible fabric strap attached at both connectors.':'Product view · Drag to rotate';
 }):null;
 for(const b of [loadButton,carryButton])if(b){b.disabled=true;b.setAttribute('aria-pressed','false');}
 canvas.addEventListener('keydown',e=>{if((isStation?tiltStationWithKey:rotateModelWithKey)(camera,controls,e.key))e.preventDefault();});
 const resize=()=>{const width=stage.clientWidth,height=stage.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();const fit=4.6/(Math.tan(THREE.MathUtils.degToRad(18))*camera.aspect);const offset=camera.position.clone().sub(controls.target);if(offset.length()<fit)camera.position.copy(controls.target).add(offset.setLength(Math.min(fit,26)));controls.update();};const observer=new ResizeObserver(resize);observer.observe(stage);resize();
 try{const gltf=await new GLTFLoader().loadAsync(modelUrl+(modelUrl.includes('?')?'&':'?')+'v='+(actionKind==='station'?'station-clean-sway-4':'display-edge-2'));const bounds=new THREE.Box3().setFromObject(gltf.scene);const center=bounds.getCenter(new THREE.Vector3());const size=bounds.getSize(new THREE.Vector3());const scale=8/Math.max(size.x,size.y,size.z);gltf.scene.position.copy(center).multiplyScalar(-scale);gltf.scene.scale.setScalar(scale);scene.add(gltf.scene);modelAction=installAction(gltf.scene,actionKind);if(actionKind==='open'){experience=createBaguetteExperience(gltf.scene);loadButton.disabled=false;carryButton.disabled=false;}if(actionButton)actionButton.disabled=false;status.textContent=actionActive?'Swimming · Drag to explore':'Drag to rotate · Scroll to move the page';if(actionKind==='station'){const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();stationEnvironment=pmrem.fromScene(room,.04);scene.environment=stationEnvironment.texture;room.dispose();pmrem.dispose();resize();stationExperience=await installStation(gltf.scene,button,status,stopOrbit,host);pause.textContent=reducedMotion?'Resume motion':'Pause motion';pause.setAttribute('aria-pressed',String(!reducedMotion));controls.addEventListener('start',()=>stationExperience.setInteracting(true));controls.addEventListener('end',()=>stationExperience.setInteracting(false));}}catch{status.textContent='The model could not load. Try reloading or downloading the model.';observer.disconnect();renderer.dispose();stage.remove();toolbar.remove();return;}
 let visible=true;const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});intersection.observe(stage);const clock=new THREE.Clock();renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);if(!visible||document.hidden)return;modelAction?.update(dt,actionActive,reducedMotion);experience?.update(dt,reducedMotion);stationExperience?.update(dt);controls.update(dt);renderer.render(scene,camera);});
 window.addEventListener('pagehide',()=>{stationExperience?.dispose();stationEnvironment?.dispose();renderer.setAnimationLoop(null);observer.disconnect();intersection.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer.dispose();},{once:true});
}
