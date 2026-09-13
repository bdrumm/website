import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Box3,Color,Group,MathUtils,PerspectiveCamera,Raycaster,Vector3} from 'three';
import {clonePrintModel,applyPrintFinish} from './baguette-render-model.js';
import {BAGUETTE_FINISHES,createFinishStore} from './baguette-finishes.js';
import {LIFESTYLE_SCENES,DETAIL_SCENES,STRAP_EYES} from './baguette-scenes.js';
import {applyPresentationScale,sizePresentation,setOpening,photoAnchor} from './baguette-presentation.js';

const bytes=await readFile(new URL('../reviews/baguette-v3/baguette-v3.glb',import.meta.url));
const {scene:source}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
source.updateMatrixWorld(true);

test('perspective strap endpoints project to their exact photo attachment coordinates at any depth',()=>{
 for(const preset of Object.values(LIFESTYLE_SCENES)){
  const camera=new PerspectiveCamera(30,1.5,.1,5000),width=621.74/preset.width,height=width/1.5,distance=height/(2*Math.tan(Math.PI/12));
  camera.position.z=distance;camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  for(const [x,y] of preset.strapTops||[[.2,.3],[.8,.7]])for(const z of [-55,0,15,80]){
   const point=photoAnchor(width,height,distance,x,y,z).project(camera);
   assert.ok(Math.abs((point.x+1)/2-x)<1e-10);assert.ok(Math.abs((1-point.y)/2-y)<1e-10);
  }
 }
});

test('each selected type changes the whole assembly uniformly and returns exactly to the source size',()=>{
 const {model}=clonePrintModel(source),assembly=new Group();assembly.add(model);assembly.updateMatrixWorld(true);
 const baseline=new Box3().setFromObject(model).getSize(new Vector3());
 for(const id of ['mini','pro','pro-max','mini','pro-max']){
  const {scale}=sizePresentation(id);applyPresentationScale(assembly,scale);
  const size=new Box3().setFromObject(model).getSize(new Vector3());
  for(const axis of ['x','y','z'])assert.ok(Math.abs(size[axis]-baseline[axis]*scale)<1e-6);
  model.traverse(mesh=>{if(mesh.isMesh)assert.equal(mesh.geometry,source.getObjectByName(mesh.name).geometry);});
 }
 assert.ok(new Box3().setFromObject(model).getSize(new Vector3()).equals(baseline));
});

test('changing size never lifts the base off a table or moves the suspension plane',()=>{
 const {model}=clonePrintModel(source),assembly=new Group();assembly.add(model);
 const floorY=new Box3().setFromObject(source.getObjectByName('base_A')).min.y;
 for(const id of ['pro-max','pro','mini']){
  const {scale}=sizePresentation(id);applyPresentationScale(assembly,scale,'ground',floorY);
  for(const angle of [0,50,100]){setOpening(model,angle);assembly.updateMatrixWorld(true);assert.ok(Math.abs(new Box3().setFromObject(model.getObjectByName('base_A')).min.y-floorY)<1e-6);}
  applyPresentationScale(assembly,scale,'hanging',floorY);
  for(const [x,y,z] of STRAP_EYES){const eye=assembly.localToWorld(new Vector3(x,y,z));assert.ok(Math.abs(eye.y-y)<1e-6);assert.ok(Math.abs(eye.z-z)<1e-6);assert.ok(Math.abs(eye.x-x*scale)<1e-6);}
 }
});

test('every composite shares the exact manufacturing geometry and keeps the source intact',()=>{
 const initial=[];source.traverse(mesh=>{if(mesh.isMesh)initial.push({mesh,matrix:mesh.matrixWorld.clone(),color:mesh.material.color.clone(),morph:[...(mesh.morphTargetInfluences||[])]});});
 for(const preset of [...Object.values(LIFESTYLE_SCENES),...Object.values(DETAIL_SCENES)]){
  const {model}=clonePrintModel(source,preset);model.updateMatrixWorld(true);
  for(const {mesh,matrix,color,morph} of initial){
   const copy=model.getObjectByName(mesh.name);
   assert.equal(copy.geometry,mesh.geometry,`${mesh.name}: no replacement or resampling`);
   assert.notEqual(copy.material,mesh.material);
   assert.deepEqual(copy.scale.toArray(),mesh.scale.toArray());
   assert.ok(mesh.matrixWorld.equals(matrix));assert.ok(mesh.material.color.equals(color));
   assert.deepEqual(mesh.morphTargetInfluences||[],morph);
   if(!preset.angle&&!preset.explode)assert.ok(copy.matrixWorld.equals(matrix));
  }
 }
});

test('open previews pivot the original lid hinge and release latches without moving the base',()=>{
 const {model:closed}=clonePrintModel(source),{model:open}=clonePrintModel(source,{angle:100});
 closed.updateMatrixWorld(true);open.updateMatrixWorld(true);
 assert.equal(open.getObjectByName('LidHinge').rotation.x,-MathUtils.degToRad(100));
 assert.deepEqual(open.getObjectByName('LidHinge').position.toArray(),source.getObjectByName('LidHinge').position.toArray());
 for(const name of ['base_A','base_B'])assert.ok(new Box3().setFromObject(open.getObjectByName(name)).equals(new Box3().setFromObject(closed.getObjectByName(name))));
 let released=0;open.traverse(mesh=>{if(mesh.morphTargetInfluences){assert.equal(mesh.morphTargetInfluences[0],1);released++;}});assert.ok(released>0);
});

test('accessory connections pass through both real strap slots and bear on their outer bridges',()=>{
 const bases=['base_A','base_B'].map(name=>source.getObjectByName(name));
 const ray=new Raycaster();
 for(const [x,,z] of STRAP_EYES){
  ray.set(new Vector3(x,20,z),new Vector3(0,-1,0));
  assert.equal(ray.intersectObjects(bases,false).length,0,'The connection must pass through an actual opening');
  ray.set(new Vector3(x,20,z+6.5),new Vector3(0,-1,0));
  assert.ok(ray.intersectObjects(bases,false).length>0,'The slot must retain an outer load-bearing bridge');
 }
});

test('one finish selection updates every product clone and preserves section annotation colors',()=>{
 const store=createFinishStore('invalid'),models=[...Object.values(LIFESTYLE_SCENES),...Object.values(DETAIL_SCENES)].map(p=>clonePrintModel(source,p).model);
 const initialSourceColor=source.getObjectByName('base_A').material.color.clone();
 const annotations=[];models.forEach(model=>model.traverse(mesh=>{if(mesh.isMesh&&mesh.userData.annotationColor)annotations.push([mesh,mesh.material.color.clone()]);}));
 const unsub=store.subscribe(finish=>models.forEach(model=>applyPrintFinish(model,finish.color)));
 for(const finish of BAGUETTE_FINISHES){store.set(finish.id);models.forEach(model=>model.traverse(mesh=>{if(mesh.isMesh&&!mesh.userData.annotationColor)assert.ok(mesh.material.color.equals(new Color(finish.color)));}));}
 store.set('unknown');assert.equal(store.value.id,'cobalt');
 annotations.forEach(([mesh,color])=>assert.ok(mesh.material.color.equals(color)));
 assert.ok(source.getObjectByName('base_A').material.color.equals(initialSourceColor));
 unsub();store.set('ivory');assert.ok(models[0].getObjectByName('base_A').material.color.equals(new Color(BAGUETTE_FINISHES.at(-1).color)));
});
