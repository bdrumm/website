import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Euler,Vector3} from 'three';
import {stationRotation} from './home-composition.js';

test('Station navigation retains a smooth circular screen and valid geometry during a front-facing sway',async()=>{
  const bytes=await readFile(new URL('../assets/models/home/station.glb',import.meta.url));
  const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const screen=gltf.scene.getObjectByName('StationScreen');
  assert.ok(screen?.isMesh,'The screen must remain independently textureable.');
  const positions=screen.geometry.attributes.position;
  const angles=[];
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i),radius=Math.hypot(x,y);
    if(radius<.001)continue;
    assert.ok(Math.abs(radius-2.2)<.0001,'Display perimeter must retain its original radius.');
    angles.push(Math.atan2(y,x));
  }
  angles.sort((a,b)=>a-b);
  for(let i=1;i<angles.length;i++)assert.ok(angles[i]-angles[i-1]<=Math.PI/64+.0001,'No coarse polygon edges.');
  assert.ok(angles.length>=128,'Keep every circular display segment.');
  let vertices=0;
  gltf.scene.traverse(object=>{
    const geometry=object.geometry;if(!geometry)return;
    vertices+=geometry.attributes.position.count;
    assert.ok([...geometry.attributes.position.array].every(Number.isFinite));
    for(const index of geometry.index?.array||[])assert.ok(index<geometry.attributes.position.count);
  });
  assert.ok(vertices>30000,'Preserve smooth shell and exterior detail.');
  const normal=new Vector3(0,0,1),front=[],yaw=[];
  for(let t=0;t<=600;t+=.25){
    const rotation=stationRotation(t);yaw.push(rotation[1]);
    front.push(normal.clone().applyEuler(new Euler(...rotation)).z);
  }
  assert.ok(Math.min(...front)>.65,'Station must keep its display facing the viewer throughout the sway.');
  assert.ok(Math.max(...yaw)-Math.min(...yaw)>1,'Station should still show a visible side-to-side sway.');
});

test('the catalogue garage model contains only the individual garage',async()=>{
  const bytes=await readFile(new URL('../assets/models/home/modular-garage-simplified.glb',import.meta.url));
  const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  assert.ok(gltf.scene.getObjectByName('UNIT_Garage'));
  assert.equal(gltf.scene.getObjectByName('UNIT_Kitchen'),undefined);
  assert.equal(gltf.scene.getObjectByName('UNIT_Dining'),undefined);
});
