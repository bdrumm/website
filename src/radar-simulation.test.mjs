import test from 'node:test';
import assert from 'node:assert/strict';
import {RadarSimulation,ringNodes,makeGeometry,solve,percentile,walker} from './radar-simulation.js';

test('configured meshes have expected undirected link counts',()=>{
  for(const n of [4,6,8,10,12]) {
    const g=makeGeometry(ringNodes(n));
    assert.equal(g.links.length,n*(n-1)/2);
    assert.equal(g.cells.length,2680);
  }
});

test('RTI agrees with a source crossing-links localization case',()=>{
  const nodes=[{id:'A',x:1,y:1,online:true},{id:'B',x:9,y:1,online:true},{id:'C',x:9,y:5,online:true},{id:'D',x:1,y:5,online:true}];
  const g=makeGeometry(nodes);
  const scores=g.links.map(l=>l.id==='A–C'?.9:l.id==='B–D'?.85:0);
  const result=solve(g,scores);
  const max=Math.max(...result),index=result.indexOf(max),p=g.cells[index];
  assert.ok(Math.hypot(p.x-5,p.y-3)<.3);
  assert.ok(Math.abs(max-.9)<1e-12);
});

test('complete sensor outage produces quiet RF and no room coverage',()=>{
  const s=new RadarSimulation();s.configure({cameras:false,radar:false});
  for(const n of [...s.snapshot.nodes])s.toggleNode(n.id);
  assert.equal(s.snapshot.links.length,0);
  assert.ok(s.snapshot.rf.every(x=>x===0));
  assert.ok(s.snapshot.zones.every(z=>z.coverage===0&&!z.occupied));
});

test('reset repeats the same synthetic calibrated scores',()=>{
  const s=new RadarSimulation(),initial=Array.from(s.snapshot.rf);
  s.update(7);s.reset();assert.deepEqual(Array.from(s.snapshot.rf),initial);
});

test('invalid public parameters are rejected before state changes',()=>{
  const s=new RadarSimulation();
  for(const bad of [{count:7},{lambda:0},{alpha:NaN},{threshold:2},{wallAttenuation:-1},{cameras:'true'},{unexpected:true}])assert.throws(()=>s.configure(bad));
  assert.equal(s.count,8);assert.equal(s.lambda,.6);
});

test('linear percentile matches the source numpy convention',()=>{
  assert.equal(percentile([0,1,2,3],.98),2.94);
});

test('walker is continuous across its shared-clock cycle',()=>{
  const a=walker(64-.00001),b=walker(64),c=walker(64+.00001);
  assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.0001);
  assert.ok(Math.hypot(c.x-b.x,c.y-b.y)<.0001);
});

test('empty scenario preserves an already active six-second room hold',()=>{
  const s=new RadarSimulation();
  s.configure({cameras:false});s.move(5,3);
  assert.equal(s.snapshot.zones[0].occupied,true,'precondition: Studio was active');
  s.setScenario('empty');
  assert.equal(s.snapshot.zones[0].occupied,true,'switching to empty should retain occupancy hold');
  s.update(5.9);assert.equal(s.snapshot.zones[0].occupied,true);
  s.update(.2);assert.equal(s.snapshot.zones[0].occupied,false);
});

test('educational stillness drains RF while radar can retain a stationary return',()=>{
  const s=new RadarSimulation();
  s.move(2.5,3);s.setScenario('still');s.configure({cameras:false});
  s.update(2.1);
  assert.equal(s.snapshot.motion,0);assert.equal(s.snapshot.peak,0);
  assert.equal(s.snapshot.radar.detected,true);assert.equal(s.snapshot.radar.stationary,true);
  s.update(6);assert.ok(s.snapshot.zones.some(z=>z.occupied&&z.precisionFix));
  s.configure({radar:false});s.update(6.1);assert.ok(s.snapshot.zones.every(z=>!z.occupied));
});


test('precision sensors keep resolving height when all Wi-Fi nodes fail',()=>{
 const s=new RadarSimulation();for(const n of [...s.snapshot.nodes])s.toggleNode(n.id);
 assert.equal(s.snapshot.links.length,0);assert.equal(s.snapshot.fusion.observable,true);
 assert.ok(s.snapshot.zones.some(z=>z.precisionFix&&z.occupied));
});

test('multi-level sweep changes the sensed Z and solves all three axes',()=>{
 const s=new RadarSimulation();s.setScenario('levels');const low=s.update(24);
 assert.ok(low.target.z<.5);assert.ok(low.zError<.2);
 const high=s.update(16);assert.ok(high.target.z>2.4);assert.ok(high.zError<.2);
});

test('hybrid improves median XY error across a full synthetic walk',()=>{
 const s=new RadarSimulation(),rf=[],hy=[];
 for(let i=0;i<128;i++){const f=s.update(.5);if(f.fusionError!==null&&f.error!==null){rf.push(f.error);hy.push(f.fusionError);}}
 assert.ok(hy.length>115,'Resolve at least 90% of the route');
 rf.sort((a,b)=>a-b);hy.sort((a,b)=>a-b);
 assert.ok(hy[Math.floor(hy.length/2)]<rf[Math.floor(rf.length/2)]*.5);
});
