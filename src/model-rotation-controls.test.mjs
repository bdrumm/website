import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {configureRotationControls,rotateModelWithKey} from './model-rotation-controls.js';

function viewer(t){
 const document=new EventTarget();
 const canvas=Object.assign(new EventTarget(),{
  style:{},ownerDocument:document,clientWidth:800,clientHeight:600,
  getRootNode:()=>document,setPointerCapture(){},releasePointerCapture(){}
 });
 const camera=new PerspectiveCamera(36,4/3,.1,100);camera.position.set(8,5,12);
 const controls=new OrbitControls(camera,canvas);configureRotationControls(controls);
 t.after(()=>controls.dispose());
 return {camera,controls,canvas,document};
}
function dispatch(target,type,properties){
 const event=Object.assign(new Event(type,{cancelable:true}),properties);
 target.dispatchEvent(event);return event;
}
function pointer(target,type,x,y,id=1,pointerType='mouse'){
 return dispatch(target,type,{pointerId:id,pointerType,button:0,clientX:x,clientY:y,pageX:x,pageY:y});
}

test('wheel and trackpad pinch remain available to the page and do not change the camera',t=>{
 const {camera,controls,canvas}=viewer(t),before=camera.position.clone();
 for(const ctrlKey of [false,true])for(const deltaY of [-240,240]){
  const event=dispatch(canvas,'wheel',{deltaY,deltaMode:0,ctrlKey});controls.update();
  assert.equal(event.defaultPrevented,false);
  assert.ok(camera.position.distanceTo(before)<1e-10);
 }
 assert.equal(canvas.style.touchAction,'pan-y pinch-zoom');
});

test('mouse drag rotates the model without changing viewing distance',t=>{
 const {camera,controls,canvas,document}=viewer(t),before=camera.position.clone(),distance=controls.getDistance();
 pointer(canvas,'pointerdown',100,100);
 pointer(document,'pointermove',240,160);
 pointer(document,'pointerup',240,160);
 assert.ok(camera.position.distanceTo(before)>1);
 assert.ok(Math.abs(controls.getDistance()-distance)<1e-10);
});

test('one-finger dragging rotates while a two-finger gesture cannot zoom the model',t=>{
 const {camera,controls,canvas,document}=viewer(t),before=camera.position.clone(),distance=controls.getDistance();
 pointer(canvas,'pointerdown',100,100,1,'touch');
 pointer(document,'pointermove',160,100,1,'touch');
 assert.ok(camera.position.distanceTo(before)>1);
 const beforePinch=camera.position.clone();
 pointer(canvas,'pointerdown',200,100,2,'touch');
 pointer(document,'pointermove',300,100,2,'touch');
 pointer(document,'pointerup',300,100,2,'touch');
 pointer(document,'pointerup',160,100,1,'touch');
 assert.ok(camera.position.distanceTo(beforePinch)<1e-10);
 assert.ok(Math.abs(controls.getDistance()-distance)<1e-10);
});

test('arrow keys rotate at a fixed distance and zoom keys are ignored',t=>{
 const {camera,controls}=viewer(t),before=camera.position.clone(),distance=controls.getDistance();
 controls.minPolarAngle=.2;controls.maxPolarAngle=1.5;
 for(let i=0;i<20;i++)assert.equal(rotateModelWithKey(camera,controls,'ArrowUp'),true);
 assert.ok(camera.position.distanceTo(before)>1);
 assert.ok(Math.abs(controls.getDistance()-distance)<1e-10);
 assert.ok(controls.getPolarAngle()>=.2-1e-10);
 const rotated=camera.position.clone();
 for(const key of ['+','=','-'])assert.equal(rotateModelWithKey(camera,controls,key),false);
 assert.ok(camera.position.distanceTo(rotated)<1e-10);
});
