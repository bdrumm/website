import test from 'node:test';
import assert from 'node:assert/strict';
import {HARDWARE_PRESETS,hardwarePreset} from './radar-hardware.js';
import {makeRig,observeTarget,fuseObservations,sensorSees,blockedByWall} from './radar-fusion.js';
import {RadarSimulation} from './radar-simulation.js';
const xyz=p=>[p.x,p.y,p.z],distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
const target={x:2.7,y:3.5,z:1.1};
const settings=()=>HARDWARE_PRESETS.flatMap(profile=>['multi','flat'].flatMap(layout=>['surveyed','drift','occluded'].map(condition=>({profile,layout,condition}))));
function stats(values){const a=values.sort((a,b)=>a-b);return{median:a[Math.floor(a.length*.5)]??null,p90:a[Math.floor(a.length*.9)]??null,max:a.at(-1)??null};}
const summaries=[];
test('All profile/layout/condition combinations generate finite observations and fixes',()=>{
 for(const {profile,layout,condition} of settings()){
  const rig=makeRig(layout,profile),errors=[],zErrors=[];let total=0,found=0,observationsCount=0,maxInput=0;
  const ids=[...rig.cameras,...rig.ranges,...rig.points].map(s=>s.id);assert.equal(ids.length,new Set(ids).size);
  for(const x of [1.3,2.7,4.5,6.5,7.8,8.8])for(const y of [1.3,3,4.7])for(const z of [.3,1.3,2.5])for(const t of [0,13]){
   const p={x,y,z},obs=observeTarget(p,t,rig,{condition}),inputs=[...obs.cameras,...obs.ranges,...obs.points],fix=fuseObservations(obs);total++;observationsCount+=inputs.length;maxInput=Math.max(maxInput,inputs.length);
   assert.ok(inputs.every(s=>s.origin.every(Number.isFinite)));
   if(fix.observable){assert.ok(fix.estimate&&fix.sigma);assert.ok(xyz(fix.estimate).every(Number.isFinite));assert.ok(xyz(fix.sigma).every(v=>Number.isFinite(v)&&v>=0));found++;errors.push(distance(xyz(p),xyz(fix.estimate)));zErrors.push(Math.abs(p.z-fix.estimate.z));}
  }
  summaries.push({profile:profile.id,layout,condition,total,found,coverage:found/total,meanInputs:observationsCount/total,maxInput,error:stats(errors),zError:stats(zErrors)});
 }
 return summaries.length+' configurations';
});
test('Surveyed/offset conditions preserve observation availability',()=>{
 for(const profile of HARDWARE_PRESETS){const rig=makeRig('multi',profile),a=observeTarget(target,0,rig),b=observeTarget(target,0,rig,{condition:'drift'});for(const key of ['cameras','ranges','points'])assert.deepEqual(a[key].map(s=>s.id),b[key].map(s=>s.id));}
});
test('Common offset moves optical reference by declared frame offset',()=>{
 const rig=makeRig('multi',hardwarePreset('optical')),a=fuseObservations(observeTarget(target,0,rig)),b=fuseObservations(observeTarget(target,0,rig,{condition:'drift'}));assert.ok(a.observable&&b.observable);const d=xyz(b.estimate).map((v,i)=>v-xyz(a.estimate)[i]);assert.ok(distance(d,[.03,-.02,.025])<1e-6,JSON.stringify({a,b,d}));return d;
});
test('Occluded observations are a proper subset of surveyed observations',()=>{
 for(const profile of HARDWARE_PRESETS){const rig=makeRig('multi',profile),a=observeTarget(target,0,rig),b=observeTarget(target,0,rig,{condition:'occluded'});for(const key of ['cameras','ranges','points'])for(const s of b[key]){assert.ok(a[key].some(k=>k.id===s.id));assert.equal(Number(s.id.slice(1))%2,0);}}
});
test('Empty scenes never retain precision observations',()=>{
 for(const profile of HARDWARE_PRESETS){const rig=makeRig('multi',profile),obs=observeTarget(target,0,rig,{present:false});assert.equal(obs.cameras.length+obs.ranges.length+obs.points.length,0);assert.equal(fuseObservations(obs).estimate,null);}
});
test('Optical reference remains detectable after motion drains',()=>{
 const rig=makeRig('multi',hardwarePreset('optical')),obs=observeTarget(target,0,rig,{cameraMotion:0});assert.ok(obs.cameras.length>=2);assert.ok(fuseObservations(obs).observable);
});
test('Profile toggles remove their respective camera/range/point families',()=>{
 for(const profile of HARDWARE_PRESETS){const rig=makeRig('multi',profile);for(const [cameras,radar] of [[false,true],[true,false],[false,false]]){const obs=observeTarget(target,0,rig,{cameras,radar});if(!cameras){assert.equal(obs.cameras.length,0);assert.ok(!obs.points.some(s=>s.family==='optical'));}if(!radar){assert.equal(obs.ranges.length,0);assert.ok(!obs.points.some(s=>s.family!=='optical'));}}}
});
test('Single registered 3D point gives XYZ without artificial anchor gating',()=>{
 const obs={points:[{id:'D1',origin:[.5,.5,2],point:[2,3,1],sigma:[.05,.05,.05],family:'optical'}]};const fix=fuseObservations(obs);assert.ok(fix.observable);assert.ok(distance(xyz(fix.estimate),[2,3,1])<1e-6);
});
test('Changing registered observations shifts fix without target input',()=>{
 const a={points:[{id:'D1',origin:[.5,.5,2],point:[2,3,1],sigma:[.05,.05,.05],family:'optical'}]},b={points:[{...a.points[0],point:[2,3,2]}]};assert.ok(fuseObservations(b).estimate.z-fuseObservations(a).estimate.z>.99);
});
test('CSI-only preset never claims a height fix',()=>{assert.ok(summaries.filter(s=>s.profile==='csi').every(s=>s.found===0));});
test('Flat UWB-only presets never claim uniquely observed height',()=>{assert.ok(summaries.filter(s=>s.profile==='uwb'&&s.layout==='flat').every(s=>s.found===0));});
test('Engine runs all profiles/layouts/conditions with finite fields',()=>{
 const sim=new RadarSimulation();let n=0;for(const {profile,layout,condition} of settings()){sim.configure({hardware:profile.id,mountLayout:layout,condition});sim.setScenario('levels');for(const dt of [0,.1,3]){const s=sim.update(dt);for(const field of ['rf','vision','agreement','hybrid'])assert.ok([...s[field]].every(v=>Number.isFinite(v)&&v>=0&&v<=1));n++;}}return n;
});
test('Explicit false channel setting survives a hardware change',()=>{const sim=new RadarSimulation();sim.configure({hardware:'optical',cameras:false,radar:false});assert.equal(sim.cameras,false);assert.equal(sim.radar,false);assert.equal(sim.snapshot.observations.cameras.length,0);});
test('Switching hardware preserves camera-unavailable scenario semantics',()=>{const sim=new RadarSimulation();sim.setScenario('blind');sim.configure({hardware:'optical'});assert.ok(sim.scenario!=='blind'||!sim.cameras);});


import {surveyHardware} from './radar-survey.js';
test('Survey compares the same 144 samples and reports unresolved CSI',()=>{const r=surveyHardware('csi');assert.equal(r.total,144);assert.equal(r.resolved,0);assert.equal(r.median,null);assert.equal(r.within1cm,0);});
test('Optical simulated 1 cm target fails under shared survey drift',()=>{const a=surveyHardware('optical'),b=surveyHardware('optical','multi','drift');assert.equal(a.total,b.total);assert.ok(a.within1cm/a.total>.95);assert.equal(b.within1cm,0);assert.ok(b.p95>.035);});
test('Depth near-field cutoff excludes unsupported ranges',()=>{const rig=makeRig('multi',hardwarePreset('depth')),s=rig.points.find(p=>p.family==='optical'),p={x:s.x+.3*Math.cos(s.azimuth),y:s.y+.3*Math.sin(s.azimuth),z:s.z};assert.equal(sensorSees(s,p),false);});
test('Radar point detections appear in snapshot metadata',()=>{const sim=new RadarSimulation();sim.configure({hardware:'radar'});assert.ok(sim.snapshot.radar.detected);assert.ok(sim.snapshot.zones.some(z=>z.evidence==='RADAR 3D'));});
test('Depth-only observations have optical metadata and accurate room labels',()=>{const sim=new RadarSimulation();sim.configure({hardware:'depth',radar:false});sim.move(2.7,3.5,1.3);assert.ok(sim.snapshot.cameraCount>0);assert.equal(sim.snapshot.radar.detected,false);assert.ok(sim.snapshot.zones.some(z=>z.evidence==='DEPTH 3D'));});
test('Camera field stops at the room partition',()=>{const sim=new RadarSimulation();sim.configure({hardware:'optical'});sim.move(1,1,1.2);const g=sim.geometry,s=sim.snapshot;for(let i=0;i<g.cells.length;i++){const p=g.cells[i];if(p.x>5.6&&p.y<2.4)assert.equal(s.vision[i],0);}});
