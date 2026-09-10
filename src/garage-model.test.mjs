import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {AnimationMixer,LoopOnce,Matrix4,Vector3,Box3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createGarageModelMotion} from './garage-model.js';
const metadata=JSON.parse(await readFile(new URL('../assets/models/garage-simplified-structure.json',import.meta.url)));
const audit=JSON.parse(await readFile(new URL('../assets/models/garage-simplified-structure-audit.json',import.meta.url)));
async function load(path='../assets/models/garage-simplified-structure.glb'){
 const bytes=await readFile(new URL(path,import.meta.url));
 return {bytes,...await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')};
}
const sourceNodes=model=>{const nodes=[];model.traverse(o=>{if(o.userData.sourceName)nodes.push(o);});return nodes;};
const error=(a,b)=>Math.max(...a.elements.map((v,i)=>Math.abs(v-b.elements[i])));

test('published garage preserves the September 10 source and its continuous structural shells',async()=>{
 const {bytes,scene,animations}=await load();
 assert.equal(createHash('sha256').update(bytes).digest('hex'),audit.fullModelSha256);
 assert.equal(metadata.sourceBlendSha256,'d2e20f530ace280876a91d0b583dc716b5a67fa8079ab2b3708090403a480a88');
 assert.equal(scene.getObjectByName('SYSTEM_ROOT').userData.sourceBlendSha256,metadata.sourceBlendSha256);
 const nodes=sourceNodes(scene);assert.equal(nodes.length,60);assert.equal(new Set(nodes.map(n=>n.userData.sourceName)).size,60);assert.equal(animations.length,21);
 for(const module of ['Garage','Kitchen','Dining'])assert.ok(nodes.find(n=>n.userData.sourceName===module+'_Structural_Module'));
 assert.ok(!nodes.some(n=>/^Floor_|^Rear_wall_|_Left_side_|_Right_side_/.test(n.userData.sourceName)));
 for(const node of nodes)node.traverse(o=>{if(o.isMesh)for(const value of o.geometry.attributes.position.array)assert.ok(Number.isFinite(value));});
});

test('all 80 animation frames reconstruct the verified Blender snapshot matrices',async()=>{
 const {scene,animations}=await load(),mixer=new AnimationMixer(scene),nodes=sourceNodes(scene);
 const actions=animations.map(clip=>{const a=mixer.clipAction(clip);a.setLoop(LoopOnce,1);a.clampWhenFinished=true;a.play();a.paused=true;return a;});
 for(let frame=1;frame<=80;frame++){
  for(const action of actions)action.time=frame/24;mixer.update(0);
  for(const node of nodes){const info=metadata.objects[node.userData.sourceName];if(!info.animated)continue;node.updateMatrix();
   assert.ok(error(node.matrix,new Matrix4().fromArray(info.deltaMatrices[frame-1]))<.000003,`${node.name} frame ${frame}`);
  }
 }
 mixer.stopAllAction();mixer.uncacheRoot(scene);
});

test('door and underfolding roof controls stay independent; exploded parts return without drift',async()=>{
 const {scene,animations}=await load(),motion=createGarageModelMotion(scene,animations),nodes=sourceNodes(scene);
 motion.update({door:100,roof:100});
 for(const node of nodes){const info=metadata.objects[node.userData.sourceName];if(!info.animated)continue;node.updateMatrix();
  const frame=node.name.includes('_roof_')?80:40;
  assert.ok(error(node.matrix,new Matrix4().fromArray(info.deltaMatrices[frame-1]))<.000003,node.name);
 }
 const shell=scene.getObjectByName('Garage_Structural_Module'),shellPosition=shell.position.clone();
 const front=scene.getObjectByName('Garage_Removable_Front_Frame'),frontPosition=front.position.clone();
 motion.update({door:100,roof:100,explode:100});
 const poses=new Map(nodes.map(n=>[n,n.position.clone()]));
 for(let i=0;i<50;i++)motion.update({door:100,roof:100,explode:100});
 for(const [node,position] of poses)assert.ok(node.position.distanceTo(position)<1e-9,node.name+' drift');
 assert.ok(shell.position.distanceTo(shellPosition)<1e-9,'Structural shell stays whole');
 assert.ok(front.position.distanceTo(frontPosition.clone().add(new Vector3(0,.01,.065)))<1e-9);
 motion.update({door:0,roof:0,explode:0});
 for(const node of nodes){node.updateMatrix();assert.ok(error(node.matrix,new Matrix4())<.000003,node.name+' returned to closed');}
 motion.dispose();
});

test('stacked view aligns continuous shells and detaches only the lower roofs',async()=>{
 const {scene,animations}=await load(),motion=createGarageModelMotion(scene,animations);
 ['Garage','Kitchen','Dining'].forEach((module,i)=>scene.getObjectByName('UNIT_'+module).position.set(0,i*128,0));
 motion.update({detachLowerRoofs:true,showConnectors:false});scene.updateMatrixWorld(true);
 for(const [i,module] of ['Garage','Kitchen','Dining'].entries()){
  const shell=scene.getObjectByName(module+'_Structural_Module'),box=new Box3().setFromObject(shell);
  assert.ok(Math.abs(box.min.x+3)<.00001&&Math.abs(box.max.x+1)<.00001,module+' width');
  assert.ok(Math.abs(box.min.y-i*1.28)<.00001,module+' stack pitch');
  for(const leaf of ['front','rear'])assert.equal(scene.getObjectByName(module+'_roof_'+leaf).visible,module==='Dining');
 }
 assert.ok(sourceNodes(scene).filter(n=>n.name.startsWith('Universal_side_clip')).every(n=>!n.visible));
 motion.update();assert.ok(sourceNodes(scene).filter(n=>n.name.includes('_roof_')).every(n=>n.visible));motion.dispose();
});

test('home and catalogue contain the latest individual garage in its half-open source pose',async()=>{
 const {bytes,scene}=await load('../assets/models/home/modular-garage-simplified.glb');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),audit.previewSha256);
 const root=scene.getObjectByName('UNIT_Garage');assert.equal(root.userData.sourceBlendSha256,metadata.sourceBlendSha256);
 for(const node of sourceNodes(scene)){
  assert.equal(node.userData.module,'garage');
  const info=metadata.objects[node.userData.sourceName];node.updateMatrix();
  assert.ok(error(node.matrix,new Matrix4().fromArray(info.animated?info.deltaMatrices[39]:new Matrix4().elements))<.000003,node.name);
 }
 assert.ok(scene.getObjectByName('Garage_Structural_Module'));assert.equal(scene.getObjectByName('UNIT_Kitchen'),undefined);
});
