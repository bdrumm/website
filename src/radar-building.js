import {RadarSimulation,walker,clamp} from './radar-simulation.js';
import {makeRig,observeTarget,fuseObservations} from './radar-fusion.js';
import {hardwarePreset} from './radar-hardware.js';

export const STOREY_PITCH=3.3;
export const CLEAR_HEIGHT=3;
export const STAIR={x0:4.3,x1:5.3,y0:2.4,y1:3.6};
export const BUILDING_SCENARIOS=['distributed','stairs','walk','levels','still','empty','blind','outage','manual'];
export const inStair=p=>p.x>=STAIR.x0&&p.x<=STAIR.x1&&p.y>=STAIR.y0&&p.y<=STAIR.y1;
export const makeLevels=count=>Array.from({length:count},(_,i)=>({id:i,name:i===0?'Ground floor':'Level '+i,short:i===0?'G':'L'+i,baseZ:i*STOREY_PITCH,clearHeight:CLEAR_HEIGHT}));
// Conservative visibility model: slabs block every modality except through the
// explicit shaft. Both slab faces must intersect the opening, including its depth.
export function blockedBySlabs(a,b,levels){
 const dz=b.z-a.z;if(Math.abs(dz)<1e-9)return false;
 for(const level of levels.slice(0,-1)){
  const low=level.baseZ+level.clearHeight,high=level.baseZ+STOREY_PITCH;
  const t0=(low-a.z)/dz,t1=(high-a.z)/dz,enter=Math.max(0,Math.min(t0,t1)),leave=Math.min(1,Math.max(t0,t1));
  if(enter>leave||leave<=0||enter>=1)continue;
  for(const t of [enter,leave])if(!inStair({x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)}))return true;
 }
 return false;
}
export function classifyLevel(point,sigma,levels){
 if(!point)return{level:null,candidates:[],reason:'No measured height'};
 const spread=2*(sigma?.z??Infinity),lo=point.z-spread,hi=point.z+spread;
 const candidates=levels.filter(l=>hi>=l.baseZ&&lo<=l.baseZ+l.clearHeight).map(l=>l.id);
 const resolved=levels.find(l=>lo>=l.baseZ&&hi<l.baseZ+l.clearHeight);
 return{level:resolved?.id??null,candidates,reason:resolved?'Height supports '+resolved.name:inStair(point)?'Stairwell / level transition':'Height spans a floor boundary'};
}
export function stairWalker(time,count){
 // Continuous route: walk to the shaft, rise, visit the upper landing, descend.
 const top=(count-1)*STOREY_PITCH,cycle=24+top*4,t=((time%cycle)+cycle)%cycle;
 if(t<8){const f=t/8;return{x:2.5+2.3*f,y:4.2-1.2*f,z:1.2};}
 if(t<8+top*2)return{x:4.8,y:3,z:1.2+(t-8)/2};
 if(t<16+top*2){const f=(t-8-top*2)/8;return{x:4.8-.8*Math.sin(f*Math.PI),y:3,z:1.2+top};}
 if(t<16+top*4)return{x:4.8,y:3,z:1.2+top-(t-16-top*2)/2};
 const f=(t-16-top*4)/8;return{x:4.8-2.3*f,y:3+1.2*f,z:1.2};
}
const emptyObs=()=>({cameras:[],ranges:[],points:[]});
const unresolved=(reason='No qualified XYZ fix on this floor')=>({estimate:null,observable:false,sigma:null,cameras:0,ranges:0,points:0,reason});
const localPoint=(p,baseZ)=>({...p,z:p.z-baseZ});
const countObs=obs=>obs.cameras.length+obs.ranges.length+obs.points.length;

export class BuildingSimulation{
 constructor(){this.reset();}
 reset(){this.levelCount=3;this.viewedLevel=0;this.time=0;this.scenario='distributed';this.targetLevel=0;this.manualTargets=new Map();this.freeze=[];this.levels=[];this.buildLevels();return this.update(0);}
 buildLevels(){
  const old=this.levels,template=old[0]?.engine;
  this.levels=makeLevels(this.levelCount).map(meta=>{
   if(old[meta.id])return{...old[meta.id],...meta};
   const engine=new RadarSimulation();engine.configure(template?Object.fromEntries(['count','lambda','alpha','threshold','wallAttenuation','cameras','radar','mountLayout','hardware','condition'].map(k=>[k,template[k]])):{hardware:'depth'});engine.lastSeen=[-Infinity,-Infinity];
   return{...meta,engine,enabled:true,savedOffline:new Set()};
  });
  this.freeze=this.freeze.filter(a=>a.z<this.levelCount*STOREY_PITCH-.3);for(const id of this.manualTargets.keys())if(id>=this.levelCount)this.manualTargets.delete(id);
  this.viewedLevel=Math.min(this.viewedLevel,this.levelCount-1);this.targetLevel=Math.min(this.targetLevel,this.levelCount-1);
 }
 get engine(){return this.levels[this.viewedLevel].engine;}
 get geometry(){return this.engine.geometry;}
 get target(){return this.snapshot?.target??this.engine.target;}
 get snapshot(){return this.levels[this.viewedLevel].snapshot;}
 setViewedLevel(id){if(!Number.isInteger(id)||!this.levels[id])throw Error('Unknown level');this.viewedLevel=id;return this.snapshot;}
 captureManual(){this.manualTargets=new Map();for(const a of this.actors||[]){const floor=this.levels.find(l=>a.z>=l.baseZ&&a.z<l.baseZ+CLEAR_HEIGHT);if(floor)this.manualTargets.set(floor.id,localPoint(a,floor.baseZ));}}
 setScenario(id){
  if(!BUILDING_SCENARIOS.includes(id))throw Error('Unknown building scenario');
  if(id==='manual')this.captureManual();
  this.freeze=(this.actors||[]).map(a=>({...a}));this.targetLevel=this.viewedLevel;
  const previous=this.time;this.time=0;for(const l of this.levels){l.engine.lastSeen=l.engine.lastSeen.map(t=>t-previous);l.engine.cameras=id!=='blind';}
  this.scenario=id;
  if(id==='outage')for(const node of ['A','B'])this.levels[this.targetLevel].engine.offline.add(node);
  if(id==='outage')this.levels[this.targetLevel].engine.rebuild();
  return this.update(0);
 }
 configure(p={}){
  const {levelCount,...settings}=p;
  if(levelCount!==undefined&&![2,3,4].includes(levelCount))throw Error('Building supports 2, 3 or 4 floors');
  if(Object.keys(settings).length)for(const l of this.levels){const held=l.engine.lastSeen.slice(),hardwareChange=settings.hardware!==undefined&&settings.hardware!==l.engine.hardware;l.engine.scenario=this.scenario;l.engine.configure(settings);l.engine.lastSeen=hardwareChange?[-Infinity,-Infinity]:held;}
  if(levelCount!==undefined&&levelCount!==this.levelCount){this.levelCount=levelCount;this.buildLevels();}
  for(const l of this.levels)if(!l.enabled){l.engine.offline=new Set(l.engine.geometry.nodes.map(n=>n.id));l.engine.rebuild();}
  return this.update(0);
 }
 move(x,y,z=this.target.z){
  if(![x,y,z].every(Number.isFinite))throw Error('Finite coordinates required');
  if(this.scenario!=='manual')this.captureManual();this.scenario='manual';
  this.manualTargets.set(this.viewedLevel,{x:clamp(x,.1,9.9),y:clamp(y,.1,5.9),z:clamp(z,.2,2.7)});return this.update(0);
 }
 clearTarget(id=this.viewedLevel){if(!this.levels[id])throw Error('Unknown level');if(this.scenario!=='manual')this.captureManual();this.scenario='manual';this.manualTargets.delete(id);return this.update(0);}
 toggleNode(id){const l=this.levels[this.viewedLevel];if(!l.enabled)throw Error('Restore floor sensors first');const held=l.engine.lastSeen.slice();l.engine.toggleNode(id);l.engine.lastSeen=held;return this.update(0);}
 toggleLevel(id=this.viewedLevel){const l=this.levels[id];if(!l)throw Error('Unknown level');l.enabled=!l.enabled;if(!l.enabled){l.savedOffline=new Set(l.engine.offline);l.engine.offline=new Set(l.engine.geometry.nodes.map(n=>n.id));}else l.engine.offline=new Set(l.savedOffline);l.engine.rebuild();return this.update(0);}
 getActors(){
  if(this.scenario==='empty')return[];
  if(this.scenario==='manual')return[...this.manualTargets].filter(([id])=>this.levels[id]).map(([id,p])=>({...p,z:p.z+this.levels[id].baseZ,id:'T'+id}));
  if(this.scenario==='still')return this.freeze;
  if(this.scenario==='stairs')return[{...stairWalker(this.time,this.levelCount),id:'T0'}];
  if(['walk','levels'].includes(this.scenario)){const p=walker(this.time);return[{...p,z:this.levels[this.targetLevel].baseZ+(this.scenario==='levels'?1.45+1.1*Math.sin(this.time*Math.PI/16):1.2),id:'T'+this.targetLevel}];}
  return this.levels.map((l,i)=>({...walker(this.time+i*19),z:l.baseZ+1.2+.2*Math.sin(this.time/9+i),id:'T'+i}));
 }
 makeWorldRig(){
  const rig={cameras:[],ranges:[],points:[],profile:hardwarePreset(this.hardware),visibility:(s,t)=>!blockedBySlabs(s,t,this.levels)};this.sensorMap=new Map();
  for(const l of this.levels){l.worldRig={cameras:[],ranges:[],points:[]};for(const key of ['cameras','ranges','points'])for(const s of l.engine.rig[key]){
   const world={...s,z:s.z+l.baseZ,localId:s.id,id:s.id[0]+(l.id*100+Number(s.id.slice(1))),level:l.id,enabled:l.enabled};
   l.worldRig[key].push(world);this.sensorMap.set(world.id,world);if(l.enabled)rig[key].push(world);
  }}
  return rig;
 }
 observationsOnLevel(obs,id){
  const base=this.levels[id].baseZ,result=emptyObs();for(const key of ['cameras','ranges','points'])for(const ob of obs[key]){const sensor=this.sensorMap.get(ob.id);if(sensor.level!==id)continue;const value={...ob,id:sensor.localId,origin:ob.origin.map((v,i)=>v-(i===2?base:0))};if(ob.point)value.point=ob.point.map((v,i)=>v-(i===2?base:0));result[key].push(value);}return result;
 }
 update(dt){
  if(!Number.isFinite(dt)||dt<0)throw Error('Expected a nonnegative time step');this.time+=dt;this.actors=this.getActors();
  const rig=this.makeWorldRig(),motion=this.scenario==='still'?clamp(1-this.time/2):1;
  // Observation correspondence is assumed, as in each single-floor preset.
  // Truth produces measurements and error comparisons; level labels use fits.
  this.tracks=this.actors.map(actor=>{
   const observations=observeTarget(actor,this.time,rig,{cameras:this.cameras,radar:this.radar,cameraMotion:motion,condition:this.condition});
   const fusion=fuseObservations(observations,null,{zMax:this.levelCount*STOREY_PITCH-.3});
   const classification=classifyLevel(fusion.estimate,fusion.sigma,this.levels);
   return{id:actor.id,observations,fusion,classification,stair:!!fusion.estimate&&inStair(fusion.estimate),error3d:fusion.estimate?Math.hypot(fusion.estimate.x-actor.x,fusion.estimate.y-actor.y,fusion.estimate.z-actor.z):null};
  });
  for(const l of this.levels){
   const actor=this.actors.find(a=>a.z>=l.baseZ&&a.z<l.baseZ+CLEAR_HEIGHT),track=this.tracks.find(t=>t.classification.level===l.id),local=actor?localPoint(actor,l.baseZ):{x:2.5,y:4.2,z:1.2};
   const observations=track?this.observationsOnLevel(track.observations,l.id):emptyObs(),fusion=track?{...track.fusion,estimate:localPoint(track.fusion.estimate,l.baseZ)}:unresolved();
   l.engine.scenario=this.scenario;
   const snap=l.engine.update(0,{time:this.time,target:local,present:!!actor,motion:l.enabled&&actor?motion:0,observations,fusion});
   const raw=emptyObs();for(const t of this.tracks){const ob=this.observationsOnLevel(t.observations,l.id);for(const key of ['cameras','ranges','points'])raw[key].push(...ob[key]);}
   l.snapshot={...snap,rawObservations:raw,rawObservationCount:countObs(raw),levelId:l.id,levelName:l.name,baseZ:l.baseZ,worldEstimate:track?.fusion.estimate??null,worldError:track?.error3d??null,enabled:l.enabled};
   l.fresh=snap.zones.some(z=>z.level>=l.engine.threshold&&z.hasCoverage);l.holding=!l.fresh&&snap.zones.some(z=>z.occupied);l.covered=l.enabled&&(snap.links.length>0||[...l.worldRig.cameras,...l.worldRig.ranges,...l.worldRig.points].some(s=>s.kind==='camera'||s.family==='optical'?this.cameras:this.radar));
   l.state=l.fresh?'PRESENT':l.holding?'HOLDING':l.covered?'QUIET':'UNOBSERVED';
  }
  const stairTracks=this.tracks.filter(t=>t.stair),observedTracks=this.tracks.filter(t=>t.fusion.observable);
  this.building={time:this.time,levels:this.levels,actors:this.actors,tracks:this.tracks,observedTracks,stairTracks,unresolved:this.tracks.filter(t=>!t.fusion.observable).length,stairState:stairTracks.length?'PRESENCE OBSERVED':'NO FRESH STAIR FIX',sensorCount:[...this.sensorMap.values()].length,onlineSensors:[...this.sensorMap.values()].filter(s=>s.enabled&&(s.kind==='camera'||s.family==='optical'?this.cameras:this.radar)).length,totalNodes:this.levels.reduce((s,l)=>s+l.engine.count,0)};
  return this.snapshot;
 }
}
for(const key of ['count','lambda','alpha','threshold','wallAttenuation','cameras','radar','mountLayout','hardware','condition'])Object.defineProperty(BuildingSimulation.prototype,key,{get(){return this.levels[0].engine[key];}});
