import * as T from 'three';
import {StationAppUI,APP_TOURS,tourFrame} from './station-app-ui.js';
import {createLightingState,applyLightingAction,applyLightingDemo} from './station-lighting-state.js';
export const STATION_STATES=[['home','Home'],['weather0','Weather'],['subway','Transit'],['timer','Timer'],['voice','Voice'],['lights','Lights'],['rooms','Rooms'],['scene','Routines'],['night','Night']];
export async function installStation(model,button,status,onSelect,host,view){
 const screen=model.getObjectByName('StationScreen');if(!screen)throw Error('Pebbl screen missing');
 const size=512,resolution=1024;
 function surface(){const canvas=document.createElement('canvas');canvas.width=canvas.height=resolution;const context=canvas.getContext('2d');context.scale(resolution/size,resolution/size);return [canvas,context];}
 const [canvas,ctx]=surface(),[incoming,incomingContext]=surface(),[outgoing,outgoingContext]=surface();
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;
 const lighting=createLightingState(),ui=new StationAppUI(incomingContext,lighting);screen.material.map=texture;screen.material.toneMapped=false;screen.material.needsUpdate=true;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,restPosition=model.position.clone();
 let motionTime=0,enabled=!reduced,interacting=false,transition=1,selected='home',app='home',time=0,clock=0,lastStep=-1,manualHold=0,controlsKey='';
 const buttons=[],touchControls=document.createElement('div');touchControls.className='station-touch-controls';touchControls.setAttribute('role','group');touchControls.setAttribute('aria-label','Device touch controls');host?.append(touchControls);
 function execute(action){
  const message=applyLightingAction(lighting,action);if(!message)return;
  // Give a visitor time to explore; automatic playback resumes after inactivity.
  manualHold=20;status.textContent=message+' Demo controls only.';render(0);
 }
 function syncControls(){
  const key=JSON.stringify(ui.controls);if(key===controlsKey)return;controlsKey=key;
  const focused=Array.from(touchControls.children).indexOf(document.activeElement);touchControls.replaceChildren();
  for(const target of ui.controls){const b=document.createElement('button');b.type='button';b.textContent=target.label;b.addEventListener('click',()=>execute(target.action));touchControls.append(b);}
  if(focused>=0)touchControls.children[Math.min(focused,touchControls.children.length-1)]?.focus({preventScroll:true});
 }
 function render(dt){const frame=tourFrame(app,time);
  if(frame.index!==lastStep){lastStep=frame.index;if(manualHold===0)applyLightingDemo(lighting,app,frame.id);}
  // Manual controls remain fully drawn while the automatic sequence is held.
  ui.render(app,manualHold>0?{...frame,elapsed:10}:frame,clock,dt,reduced);syncControls();
  ctx.clearRect(0,0,size,size);ctx.drawImage(incoming,0,0,size,size);
  if(transition<1){const blend=transition*transition*(3-2*transition);ctx.save();ctx.globalAlpha=1-blend;ctx.drawImage(outgoing,0,0,size,size);ctx.restore();}
  texture.needsUpdate=true;
 }
 function select(id){
  host?.setAttribute('data-display-app',id);app=id;time=reduced?APP_TOURS[id][0][2]-.01:0;lastStep=-1;lighting.detail=null;if(!['rooms','scene'].includes(id))manualHold=0;
  buttons.forEach(([key,b])=>b.setAttribute('aria-pressed',String(key===id)));onSelect();
  status.textContent=id==='rooms'?'Tap a light or MAIN to dim. All off turns off the room.':id==='scene'?'Tap All off to turn off every light.':'Scenes play automatically. Choose an app to explore. Sample data.';
  render(0);host?.dispatchEvent(new CustomEvent('station-display-change',{detail:id}));
 }
 function requestState(id){if(!APP_TOURS[id]||id===selected)return;selected=id;outgoingContext.clearRect(0,0,size,size);outgoingContext.drawImage(canvas,0,0,size,size);transition=reduced?1:0;select(id);}
 function onState(event){requestState(event.detail);}host?.addEventListener('station-state',onState);
 if(!host?.classList.contains('station-story-viewer'))for(const [id,name] of STATION_STATES){const b=button(name,()=>requestState(id));b.setAttribute('aria-pressed','false');buttons.push([id,b]);}
 // Raycast taps onto the actual angled screen. Dragging and scrolling keep their
 // existing behavior; no wheel handler or touch capture is added here.
 const raycaster=new T.Raycaster(),pointer=new T.Vector2();let down=null;
 function pointerDown(e){if(e.button===0&&e.isPrimary!==false)down={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};}
 function pointerMove(e){if(down&&e.pointerId===down.id&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)down.moved=true;}
 function pointerCancel(){down=null;}
 function pointerUp(e){const start=down;down=null;if(!start||e.pointerId!==start.id||start.moved||transition<1||!view)return;
  const rect=view.canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);model.updateWorldMatrix(true,true);view.camera.updateMatrixWorld();raycaster.setFromCamera(pointer,view.camera);
  const hit=raycaster.intersectObject(screen,false)[0];if(!hit?.uv)return;
  const x=hit.uv.x*size,y=(1-hit.uv.y)*size,target=ui.controls.find(c=>x>=c.x&&x<=c.x+c.w&&y>=c.y&&y<=c.y+c.h);if(target)execute(target.action);
 }
 const pointerEvents={pointerdown:pointerDown,pointermove:pointerMove,pointerup:pointerUp,pointercancel:pointerCancel,pointerleave:pointerCancel};for(const [name,fn] of Object.entries(pointerEvents))view?.canvas.addEventListener(name,fn);
 select('home');if(host?.dataset.storyState&&host.dataset.storyState!=='home')requestState(host.dataset.storyState);host?.dispatchEvent(new Event('station-ready'));
 return {toggleMotion(){enabled=!enabled;host?.classList.toggle('motion-paused',!enabled);return enabled;},setInteracting(value){interacting=value;},update(dt){
  const focused=touchControls.contains(document.activeElement),live=enabled&&!interacting&&!focused;
  if(live){motionTime+=dt;const sway=Math.sin(motionTime*.55);model.rotation.set(Math.sin(motionTime*.37)*.012,sway*.065,Math.sin(motionTime*.23)*.006);model.position.x=restPosition.x+sway*.12;model.position.y=restPosition.y+Math.sin(motionTime*.8)*.025;clock+=dt;
   if(manualHold>0){manualHold=Math.max(0,manualHold-dt);if(manualHold===0){time=0;lastStep=-1;}}
   else{time+=dt;const duration=APP_TOURS[app].reduce((sum,step)=>sum+step[2],0);if(time>=duration+2){time=0;lastStep=-1;if(host?.classList.contains('station-story-viewer'))host.dispatchEvent(new Event('station-auto-next'));}}
  }
  if(transition<1)transition=Math.min(1,transition+dt/.85);render(live&&!reduced?dt:0);
 },dispose(){host?.removeEventListener('station-state',onState);for(const [name,fn] of Object.entries(pointerEvents))view?.canvas.removeEventListener(name,fn);texture.dispose();touchControls.remove();}};
}
