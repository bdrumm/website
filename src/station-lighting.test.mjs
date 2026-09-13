import test from 'node:test';
import assert from 'node:assert/strict';
import {createLightingState,currentRoom,allLightsOff,applyLightingAction} from './station-lighting-state.js';
import {StationAppUI,APP_TOURS} from './station-app-ui.js';

test('individual dimming changes one light; MAIN changes only the current room',()=>{
 const state=createLightingState();applyLightingAction(state,{type:'open-light',index:1});applyLightingAction(state,{type:'brightness',level:25});
 assert.deepEqual(currentRoom(state).lights.map(l=>l.level),[100,25,40]);
 applyLightingAction(state,{type:'open-light',index:-1});applyLightingAction(state,{type:'brightness',level:40});
 assert.deepEqual(currentRoom(state).lights.map(l=>l.level),[40,40,40]);assert.deepEqual(state.rooms[1].lights.map(l=>l.level),[80,60,0]);
 applyLightingAction(state,{type:'brightness',level:250});assert.ok(currentRoom(state).lights.every(l=>l.level===100));
 applyLightingAction(state,{type:'brightness',level:NaN});assert.ok(currentRoom(state).lights.every(l=>l.level===100));
});
test('room All off is scoped; routine All off covers every room',()=>{
 const state=createLightingState();applyLightingAction(state,{type:'room-off'});assert.ok(currentRoom(state).lights.every(l=>l.level===0));assert.equal(allLightsOff(state),false);
 applyLightingAction(state,{type:'next-room'});assert.equal(currentRoom(state).name,'Kitchen');assert.equal(state.detail,null);
 applyLightingAction(state,{type:'all-off'});assert.equal(allLightsOff(state),true);
 applyLightingAction(state,{type:'next-room'});assert.equal(currentRoom(state).name,'Living room');
});
function drawing(){const texts=[],fills=[];return {texts,fills,ctx:new Proxy({globalAlpha:1,fillText(text,x,y){texts.push({text,x,y,color:this.fillStyle});},fillRect(){fills.push(this.fillStyle);},measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}})};}
test('room tiles open usable dimmers with presets and no slider',()=>{
 const state=createLightingState(),{ctx,texts}=drawing(),ui=new StationAppUI(ctx,state),frame={id:'overview',elapsed:4};
 ui.render('rooms',frame,0,0,true);assert.equal(ui.controls.length,6);assert.ok(texts.some(t=>t.text==='MAIN'));assert.ok(texts.some(t=>t.text==='Floor lamp'));
 applyLightingAction(state,ui.controls[2].action);ui.render('rooms',frame,0,0,true);
 assert.equal(state.detail,1);assert.ok(texts.some(t=>t.text==='65%'));assert.deepEqual(ui.controls.slice(0,4).map(c=>c.action.level),[0,25,50,100]);
 applyLightingAction(state,ui.controls[1].action);ui.render('rooms',frame,0,0,true);assert.ok(texts.some(t=>t.text==='25%'));
 applyLightingAction(state,ui.controls[4].action);assert.equal(state.detail,null);
});
test('routines replace Display with an actionable All off, and dark UI uses light text',()=>{
 const state=createLightingState(),{ctx,texts,fills}=drawing(),ui=new StationAppUI(ctx,state);
 ui.render('scene',{id:'choose',elapsed:3},0,0,true);assert.equal(fills[0],'#030812');assert.ok(!texts.some(t=>t.text==='Display'));assert.equal(ui.controls.length,1);
 applyLightingAction(state,ui.controls[0].action);ui.render('scene',{id:'choose',elapsed:3},0,0,true);assert.ok(texts.some(t=>t.text==='All lights are off.'));assert.ok(texts.some(t=>t.text==='Good night'&&t.color==='#f3f8ff'));
 const luminance=hex=>{const rgb=hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 for(const color of ['#f3f8ff','#a4b7cd','#83f2d0','#89c6ff','#c5b2ff','#ffcf91'])assert.ok((luminance(color)+.05)/(luminance('#030812')+.05)>=4.5,color+' on dark');
 assert.ok((luminance('#83f2d0')+.05)/(luminance('#10212a')+.05)>=7,'active light control contrast');
 assert.equal(Object.keys(APP_TOURS).length,9);
});

test('device taps, keyboard controls and automatic playback work on the angled screen',async()=>{
 const T=await import('three'),{installStation}=await import('./station-experience.js');
 const originalDocument=globalThis.document,originalMatchMedia=globalThis.matchMedia;
 const canvases=[];
 class Node extends EventTarget{
  constructor(tag){super();this.tag=tag;this.children=[];this.dataset={};this.className='';this.attributes={};this.style={};this.classList={contains:n=>this.className.split(' ').includes(n),toggle:()=>{}};}
  append(...children){this.children.push(...children);}replaceChildren(){this.children=[];}remove(){}setAttribute(k,v){this.attributes[k]=v;}contains(n){return this===n||this.children.some(c=>c.contains(n));}focus(){globalThis.document.activeElement=this;}
  getBoundingClientRect(){return {left:0,top:0,width:800,height:600};}
  getContext(){if(!this.ctx){this.ctx=drawing().ctx;this.ctx.texts=[];this.ctx.fillText=function(text){this.texts.push(text);};this.ctx.fillRect=function(x,y,w,h){if(w===512&&h===512)this.texts=[];};}return this.ctx;}
 }
 globalThis.document={activeElement:null,createElement:tag=>{const node=new Node(tag);if(tag==='canvas')canvases.push(node);return node;}};globalThis.matchMedia=()=>({matches:false});
 try{
  const model=new T.Group(),screen=new T.Mesh(new T.CircleGeometry(2.2,64),new T.MeshBasicMaterial());screen.name='StationScreen';model.add(screen);model.rotation.set(.08,-.12,0);
  const host=new Node('section');host.className='station-story-viewer';const status=new Node('p'),canvas=new Node('canvas'),camera=new T.PerspectiveCamera(36,800/600,.1,100);camera.position.set(-3,2,8);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  let advances=0;host.addEventListener('station-auto-next',()=>advances++);
  const experience=await installStation(model,()=>{},status,()=>{},host,{canvas,camera});const touch=host.children[0],texts=()=>canvases[1].ctx.texts;
  assert.equal(host.children.length,1);assert.equal(touch.className,'station-touch-controls');
  experience.update(15);assert.equal(advances,1);experience.toggleMotion();experience.update(30);assert.equal(advances,1);experience.toggleMotion();
  host.dispatchEvent(new CustomEvent('station-state',{detail:'rooms'}));experience.update(1);
  function pointer(type,x,y){const e=new Event(type);Object.assign(e,{button:0,isPrimary:true,pointerId:1,clientX:x,clientY:y});canvas.dispatchEvent(e);}
  function tap(x,y,drag=false){model.updateWorldMatrix(true,true);const point=screen.localToWorld(new T.Vector3((x/512*2-1)*2.2,(1-y/512*2)*2.2,0)).project(camera),px=(point.x+1)*400,py=(1-point.y)*300;pointer('pointerdown',px,py);if(drag)pointer('pointermove',px+20,py);pointer('pointerup',px,py);}
  tap(170,337,true);assert.ok(texts().includes('MAIN'),'drag must not open a tile');
  tap(170,337);assert.ok(texts().includes('65%'),'raycast opens the floor lamp dimmer');
  touch.children.find(b=>b.textContent==='Set brightness to 25%').dispatchEvent(new Event('click'));assert.ok(texts().includes('25%'));
  experience.update(10);assert.ok(texts().includes('25%'),'manual control holds autoplay');
  touch.children.find(b=>b.textContent==='Back to room').dispatchEvent(new Event('click'));assert.ok(texts().includes('Floor lamp'));
  host.dispatchEvent(new CustomEvent('station-state',{detail:'scene'}));experience.update(1);touch.children[0].dispatchEvent(new Event('click'));assert.ok(texts().includes('All lights are off.'));
  host.dispatchEvent(new CustomEvent('station-state',{detail:'rooms'}));experience.update(1);assert.ok(texts().includes('0 OF 3 LIGHTS ON'),'manual All off survives app navigation');
  touch.children.find(b=>b.textContent==='Next room').dispatchEvent(new Event('click'));assert.ok(texts().includes('Kitchen'));assert.ok(texts().includes('0 OF 3 LIGHTS ON'));
  experience.dispose();screen.geometry.dispose();screen.material.dispose();
  globalThis.matchMedia=()=>({matches:true});const reducedHost=new Node('section');reducedHost.className='station-story-viewer';let reducedAdvances=0;reducedHost.addEventListener('station-auto-next',()=>reducedAdvances++);
  const still=await installStation(model,()=>{},status,()=>{},reducedHost);still.update(60);assert.equal(reducedAdvances,0);still.dispose();
 }finally{globalThis.document=originalDocument;globalThis.matchMedia=originalMatchMedia;}
});
