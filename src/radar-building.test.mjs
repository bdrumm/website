import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildingSimulation,makeLevels,blockedBySlabs,classifyLevel,stairWalker,STOREY_PITCH,CLEAR_HEIGHT,STAIR} from './radar-building.js';
import {makeRig,observeTarget,fuseObservations} from './radar-fusion.js';
import {HARDWARE_PRESETS,hardwarePreset} from './radar-hardware.js';

const xyz=p=>[p.x,p.y,p.z],dist=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
const levels=makeLevels(3);
function compact(b){return JSON.stringify({time:b.time,actors:b.actors,tracks:b.tracks,levels:b.levels.map(l=>({state:l.state,enabled:l.enabled,lastSeen:l.engine.lastSeen,offline:[...l.engine.offline],rf:[...l.snapshot.rf],fusion:l.snapshot.fusion}))});}
function onlyGround(b){b.setScenario('empty');b.update(7);b.setViewedLevel(0);b.move(2.5,4.2,1.2);}
test('Slabs block vertically aligned targets outside stair opening',()=>{
 assert.equal(blockedBySlabs({x:2,y:2,z:1.2},{x:2,y:2,z:4.5},levels),true);
 assert.equal(blockedBySlabs({x:2,y:2,z:4.5},{x:2,y:2,z:1.2},levels),true);
});
test('Clear vertical stair shaft allows inter-floor sightline both directions',()=>{
 assert.equal(blockedBySlabs({x:4.8,y:3,z:1.2},{x:4.8,y:3,z:7.8},levels),false);
 assert.equal(blockedBySlabs({x:4.8,y:3,z:7.8},{x:4.8,y:3,z:1.2},levels),false);
});
test('Diagonal ray must pass through both faces of slab opening',()=>{
 assert.equal(blockedBySlabs({x:4.25,y:3,z:2.9},{x:5.7,y:3,z:3.4},levels),true);
 assert.equal(blockedBySlabs({x:4.6,y:3,z:2.9},{x:4.9,y:3,z:3.4},levels),false);
});
test('A same-floor clear segment is not blocked by a different storey slab',()=>assert.equal(blockedBySlabs({x:1,y:1,z:4.0},{x:3,y:5,z:5.5},levels),false));
test('Global point solver is translation invariant across three floors',()=>{
 const base={cameras:[],ranges:[],points:[{id:'D1',origin:[1,1,2],point:[2.7,3.7,1.2],sigma:[.03,.03,.03],family:'optical'}]};const first=fuseObservations(base,null,{zMax:9.6});assert.ok(first.observable);
 for(const zShift of [STOREY_PITCH,2*STOREY_PITCH]){const obs={...base,points:base.points.map(p=>({...p,origin:p.origin.map((v,i)=>v+(i===2?zShift:0)),point:p.point.map((v,i)=>v+(i===2?zShift:0))}))};const next=fuseObservations(obs,null,{zMax:9.6});assert.ok(next.observable);assert.ok(dist(xyz(next.estimate),xyz(first.estimate).map((v,i)=>v+(i===2?zShift:0)))<1e-8);assert.deepEqual(next.sigma,first.sigma);}
});
test('Global range-only solver works on upper storey without floor metadata',()=>{
 const p={x:2.6,y:3.7,z:2*STOREY_PITCH+1.2},origins=[[.6,.6,.45],[5,.6,2.55],[5,5.4,.95],[.6,5.4,1.4]].map(v=>v.map((x,i)=>x+(i===2?2*STOREY_PITCH:0))),obs={ranges:origins.map((origin,i)=>({id:'U'+i,origin,range:dist(origin,xyz(p)),sigma:.1}))};const fix=fuseObservations(obs,null,{zMax:9.6});assert.ok(fix.observable,fix.reason);assert.ok(dist(xyz(fix.estimate),xyz(p))<1e-5);
});
test('Level classification is independent of any target-level hint',()=>{
 const p={x:2,y:3,z:4.5},a=classifyLevel(p,{z:.04},levels),b=classifyLevel({...p,level:0,targetLevel:0},{z:.04},levels);assert.deepEqual(a,b);assert.equal(a.level,1);
});
test('Boundary uncertainty yields candidates without a false floor fix',()=>{const c=classifyLevel({x:4.8,y:3,z:3.15},{z:.2},levels);assert.equal(c.level,null);assert.deepEqual(c.candidates,[0,1]);});
test('Viewing another floor changes no physical state',()=>{const b=new BuildingSimulation();b.update(1);const before=compact(b);b.setViewedLevel(2);assert.equal(compact(b),before);b.update(0);assert.equal(compact(b),before);});
test('Offline node is isolated to viewed floor',()=>{const b=new BuildingSimulation();b.setViewedLevel(1);b.toggleNode('A');assert.ok(b.levels[1].engine.offline.has('A'));assert.ok(!b.levels[0].engine.offline.has('A'));assert.ok(!b.levels[2].engine.offline.has('A'));});
test('Offline floor removes its observations and becomes unobserved away from shaft',()=>{const b=new BuildingSimulation();b.setViewedLevel(1);b.toggleLevel();assert.equal(b.levels[1].snapshot.links.length,0);assert.equal(b.levels[1].state,'UNOBSERVED');for(const t of b.tracks)for(const obs of [...t.observations.cameras,...t.observations.ranges,...t.observations.points])assert.notEqual(b.sensorMap.get(obs.id).level,1);});
test('Floor restore preserves the prior individually offline nodes',()=>{const b=new BuildingSimulation();b.setViewedLevel(1);b.toggleNode('A');b.toggleLevel();b.toggleLevel();assert.deepEqual([...b.levels[1].engine.offline],['A']);});
test('One building tick advances each floor clock exactly once',()=>{const b=new BuildingSimulation();b.update(1.25);assert.ok(b.levels.every(l=>l.engine.time===1.25));});
test('Empty scene expires all occupancy holds after six seconds',()=>{const b=new BuildingSimulation();b.update(2);b.setScenario('empty');b.update(6.1);assert.ok(b.levels.every(l=>l.state==='QUIET'));assert.ok(b.levels.every(l=>l.engine.lastSeen.every(t=>t<=0)));assert.equal(b.tracks.length,0);});
test('Manually placing a ground-floor target does not create upstairs truth',()=>{const b=new BuildingSimulation();onlyGround(b);assert.equal(b.actors.length,1);assert.ok(b.actors[0].z<CLEAR_HEIGHT);assert.ok(b.levels.slice(1).every(l=>l.state==='QUIET'));});
test('Hardware change does not seed ghost holds on empty floors',()=>{const b=new BuildingSimulation();onlyGround(b);b.configure({hardware:'optical'});assert.ok(b.levels.slice(1).every(l=>l.state==='QUIET'),JSON.stringify(b.levels.map(l=>({id:l.id,state:l.state,lastSeen:l.engine.lastSeen}))));});
test('Reducing floor count while still removes frozen actors beyond roof',()=>{const b=new BuildingSimulation();b.setScenario('still');b.configure({levelCount:2});assert.ok(b.actors.every(p=>p.z<2*STOREY_PITCH),JSON.stringify(b.actors));});
test('Every floor-qualified sensor ID is unique and yields finite numeric seeds',()=>{const b=new BuildingSimulation();b.configure({hardware:'optical',levelCount:4});const ids=[...b.sensorMap.keys()];assert.equal(ids.length,64);assert.equal(new Set(ids).size,ids.length);assert.ok(ids.every(id=>Number.isFinite(Number(id.slice(1)))));});
const coverage=[];
test('All six presets run at 2/3/4 storeys with finite fields and observations',()=>{
 for(const profile of HARDWARE_PRESETS)for(const levelCount of [2,3,4]){const b=new BuildingSimulation();b.configure({hardware:profile.id,levelCount});b.update(.5);for(const l of b.levels)for(const key of ['rf','vision','hybrid','agreement'])assert.ok([...l.snapshot[key]].every(v=>Number.isFinite(v)&&v>=0&&v<=1));for(const t of b.tracks){for(const ob of [...t.observations.cameras,...t.observations.ranges,...t.observations.points])assert.ok(ob.origin.every(Number.isFinite));if(t.fusion.observable)assert.ok(xyz(t.fusion.estimate).every(Number.isFinite));}coverage.push({profile:profile.id,levelCount,actors:b.actors.length,observed:b.building.observedTracks.length,states:b.levels.map(l=>l.state)});}return coverage;
});
test('Raw observations remain inspectable when precision geometry is insufficient',()=>{const b=new BuildingSimulation();b.configure({hardware:'uwb',mountLayout:'flat'});assert.ok(b.tracks.some(t=>t.observations.ranges.length>0));assert.ok(b.levels.some(l=>l.snapshot.rawObservations.ranges.length>0));});
test('Stair track remains continuous through internal segment boundaries',()=>{
 for(const count of [2,3,4]){const top=(count-1)*STOREY_PITCH;for(const t of [8,8+top*2,16+top*2])assert.ok(dist(xyz(stairWalker(t-.001,count)),xyz(stairWalker(t+.001,count)))<.01);}
});
test('Stair route can generate finite global fixes without floor snapping',()=>{
 const b=new BuildingSimulation();b.configure({hardware:'optical'});b.setScenario('stairs');let seen=0;for(const t of [8,9,11,13,15,17,19,21]){b.update(t-b.time);const track=b.tracks[0];if(track.fusion.observable){seen++;assert.ok(Math.abs(track.fusion.estimate.z-b.actors[0].z)<.1);assert.ok(track.stair);}}assert.ok(seen>=3);return seen;
});


test('Stair route closes continuously at the full-cycle boundary',()=>{for(const count of [2,3,4]){const period=24+(count-1)*STOREY_PITCH*4;assert.ok(dist(xyz(stairWalker(period-.001,count)),xyz(stairWalker(.001,count)))<.01);}});
test('Clear target preserves references on other floors',()=>{const b=new BuildingSimulation();b.setViewedLevel(1);b.clearTarget();b.update(6.1);assert.equal(b.actors.length,2);assert.equal(b.levels[1].state,'QUIET');assert.ok(b.levels[0].snapshot.present&&b.levels[2].snapshot.present);});
test('CSI-only building never claims a measured height',()=>{const b=new BuildingSimulation();b.configure({hardware:'csi'});assert.ok(b.tracks.every(t=>!t.fusion.observable));assert.ok(b.levels.every(l=>l.snapshot.worldEstimate===null));});
test('Normal ground-floor target creates no upstairs precision observations',()=>{const b=new BuildingSimulation();onlyGround(b);for(const l of b.levels.slice(1))assert.equal(l.snapshot.rawObservationCount,0);});
test('Invalid floor count and view selection cannot mutate building state',()=>{const b=new BuildingSimulation(),before=compact(b);assert.throws(()=>b.configure({levelCount:9}));assert.throws(()=>b.setViewedLevel(3));assert.equal(compact(b),before);});
