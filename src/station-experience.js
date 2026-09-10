import * as T from 'three';
import {StationAppUI,APP_TOURS,tourFrame,stepStart} from './station-app-ui.js';
export const STATION_STATES=[['home','Home'],['weather0','Weather'],['subway','Transit'],['timer','Timer'],['lights','Lights'],['scene','Scenes'],['voice','Voice'],['night','Night']];
export async function installStation(model,button,status,onSelect,host){
 const screen=model.getObjectByName('StationScreen');if(!screen)throw Error('Station screen missing');
 // Keep the circular layout in 512 logical units, with four times the pixels.
 const size=512,resolution=1024;
 function surface(){const canvas=document.createElement('canvas');canvas.width=canvas.height=resolution;const context=canvas.getContext('2d');context.scale(resolution/size,resolution/size);return [canvas,context];}
 const [canvas,ctx]=surface(),[incoming,incomingContext]=surface(),[outgoing,outgoingContext]=surface();
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;
 const ui=new StationAppUI(incomingContext);screen.material.map=texture;screen.material.toneMapped=false;screen.material.needsUpdate=true;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,restPosition=model.position.clone();let motionTime=0,motionEnabled=!reduced,interacting=false;
 let transition=1,selected='home',app='home',time=0,clock=0,playing=!reduced,lastStep=-1;
 const buttons=[];const panel=document.createElement('section');panel.className='app-walkthrough';panel.setAttribute('aria-label','App walkthrough');const heading=document.createElement('h3'),steps=document.createElement('div');steps.className='walkthrough-steps';const actions=document.createElement('div');actions.className='model-controls';panel.append(heading,steps,actions);host?.append(panel);
 function control(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',fn);actions.append(b);return b;}
 const play=control('Pause walkthrough',()=>{const done=tourFrame(app,time).done;if(done){time=0;lastStep=-1;}playing=done||!playing;refresh();});
 control('Replay',()=>{time=0;lastStep=-1;playing=true;refresh();});
 function refresh(){const frame=tourFrame(app,time);play.textContent=frame.done?'Play again':playing?'Pause walkthrough':'Play walkthrough';play.setAttribute('aria-pressed',String(playing&&!frame.done));Array.from(steps.children).forEach((b,i)=>b.setAttribute('aria-current',i===frame.index?'step':'false'));if(lastStep!==frame.index){lastStep=frame.index;status.textContent=`${STATION_STATES.find(s=>s[0]===app)[1]} walkthrough · ${frame.index+1}/${APP_TOURS[app].length} · ${frame.title}. Simulated data and interactions.`;}}
 function select(id){host?.setAttribute('data-display-app',id);app=id;time=0;lastStep=-1;playing=!reduced;heading.textContent=STATION_STATES.find(s=>s[0]===id)[1]+' walkthrough';steps.replaceChildren();APP_TOURS[id].forEach((step,i)=>{const b=document.createElement('button');b.type='button';b.textContent=`${i+1}. ${step[1]}`;b.addEventListener('click',()=>{time=stepStart(app,i)+1.2;lastStep=-1;playing=false;refresh();});steps.append(b);});buttons.forEach(([key,b])=>b.setAttribute('aria-pressed',String(key===id)));onSelect();refresh();ui.render(app,tourFrame(app,time),clock,0,reduced);host?.dispatchEvent(new CustomEvent('station-display-change',{detail:id}));if(transition>=1){ctx.drawImage(incoming,0,0,size,size);texture.needsUpdate=true;}}
 function requestState(id){if(!APP_TOURS[id]||id===selected)return;selected=id;
  // Retarget from the currently composited frame, including an unfinished dissolve.
  outgoingContext.clearRect(0,0,size,size);outgoingContext.drawImage(canvas,0,0,size,size);transition=reduced?1:0;select(id);
 }
 function onState(event){requestState(event.detail);}host?.addEventListener('station-state',onState);
 for(const state of STATION_STATES){const b=button(state[1],()=>{if(host?.classList.contains('station-story-viewer')){host.dispatchEvent(new CustomEvent('station-navigate',{detail:state[0]}));return;}requestState(state[0]);});b.setAttribute('aria-pressed','false');buttons.push([state[0],b]);}
 select('home');if(host?.dataset.storyState&&host.dataset.storyState!=='home')requestState(host.dataset.storyState);host?.dispatchEvent(new Event('station-ready'));
 return {toggleMotion(){motionEnabled=!motionEnabled;host?.classList.toggle('motion-paused',!motionEnabled);return motionEnabled;},setInteracting(value){interacting=value;},update(dt){
  if(motionEnabled&&!interacting){motionTime+=dt;const sway=Math.sin(motionTime*.55);model.rotation.set(Math.sin(motionTime*.37)*.012,sway*.065,Math.sin(motionTime*.23)*.006);model.position.x=restPosition.x+sway*.12;model.position.y=restPosition.y+Math.sin(motionTime*.8)*.025;}
  if(transition<1)transition=Math.min(1,transition+dt/.85);
  if(playing){time+=dt;if(tourFrame(app,time).done)playing=false;}
  // Ambient UI remains alive at completed states; a user pause freezes it.
  const live=tourFrame(app,time).done||playing;if(live&&!reduced)clock+=dt;
  ui.render(app,tourFrame(app,time),clock,live&&!reduced?dt:0,reduced);ctx.clearRect(0,0,size,size);ctx.drawImage(incoming,0,0,size,size);
  if(transition<1){const blend=transition*transition*(3-2*transition);ctx.save();ctx.globalAlpha=1-blend;ctx.filter=`blur(${blend*3}px)`;const inset=blend*6;ctx.drawImage(outgoing,-inset,-inset,size+inset*2,size+inset*2);ctx.restore();}
  texture.needsUpdate=true;refresh();
 },dispose(){host?.removeEventListener('station-state',onState);texture.dispose();panel.remove();}};
}
