import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
import {createConfigurationMotion, planConfiguration, sampleModuleMove, CONFIGURATION_TIMING as timing, rowExplosionOffset, explodedRowView} from './garage-configuration.js';

const names = ['garage', 'row', 'stack'];
const makeUnits = () => Array.from({length:3}, () => ({position:new Vector3(),visible:true}));
const snapshot = units => units.map(unit => ({position:unit.position.toArray(),visible:unit.visible}));
const complete = motion => { for(let i=0;i<1000 && motion.active;i++) motion.update(i%2 ? .041 : .013); assert(!motion.active); };
function assertLayout(units, layout) {
  assert.deepEqual(units[0].position.toArray(),[0,0,0]);
  for (let i=1;i<3;i++) {
    assert.equal(units[i].visible,layout!=='garage');
    if(layout==='row')assert.deepEqual(units[i].position.toArray(),[i*200,0,0]);
    if(layout==='stack')assert.deepEqual(units[i].position.toArray(),[0,i*128,0]);
  }
}

test('all six configuration changes reach exact poses without moving the base garage',()=>{
  for(const from of names)for(const to of names){
    if(from===to)continue;
    const units=makeUnits(),motion=createConfigurationMotion(units);motion.setLayout(from);motion.setLayout(to);
    for(let i=0;i<1000&&motion.active;i++){motion.update(.016);assert.deepEqual(units[0].position.toArray(),[0,0,0]);}
    assert(!motion.active);assertLayout(units,to);
  }
});

test('lift and landing are vertical, transit is horizontal, bounce never penetrates the resting height',()=>{
  const units=makeUnits(),motion=createConfigurationMotion(units);motion.setLayout('row');
  const plan=planConfiguration(snapshot(units),'stack');
  for(const move of plan.moves){
    let previous;
    for(let time=move.start;time<move.start+move.duration;time+=.002){
      const sample=sampleModuleMove(move,time);
      if(previous?.phase===sample.phase){
        if(['lift','drop','bounce'].includes(sample.phase))assert.equal(sample.position[0],previous.position[0]);
        if(sample.phase==='across')assert.equal(sample.position[1],previous.position[1]);
        assert.equal(sample.position[2],previous.position[2]);
      }
      if(sample.phase==='bounce')assert(sample.position[1]>=move.to[1]);
      previous=sample;
    }
    assert.deepEqual(sampleModuleMove(move,move.start+move.duration+1).position,move.to);
  }
});

test('unstacking clears the top module before moving the lower module',()=>{
  const units=makeUnits(),motion=createConfigurationMotion(units);motion.setLayout('stack');
  for(const layout of ['row','garage']){
    const plan=planConfiguration(snapshot(units),layout);
    assert.deepEqual(plan.moves.map(move=>move.index),[2,1]);
    assert(plan.moves[1].start>=plan.moves[0].start+plan.moves[0].duration);
    assert(plan.moves[0].start>=timing.prepare);
  }
});

test('interruptions preserve the rendered pose and repeated selections do not restart a move',()=>{
  for(const time of [.1,.6,1.05,1.45,2.1]){
    const units=makeUnits(),motion=createConfigurationMotion(units);motion.setLayout('row');motion.setLayout('stack');motion.update(time);
    const before=snapshot(units);motion.setLayout('garage');motion.update(0);assert.deepEqual(snapshot(units),before);
    motion.setLayout('row');motion.update(.8);const mid=snapshot(units);motion.setLayout('row');motion.update(0);assert.deepEqual(snapshot(units),mid);
    complete(motion);assertLayout(units,'row');
  }
});

test('reduced motion snaps to the selected layout including an already active destination',()=>{
  const units=makeUnits(),motion=createConfigurationMotion(units);motion.setLayout('row');motion.setLayout('stack');motion.update(.8);
  motion.setLayout('stack',true);assert(!motion.active);assertLayout(units,'stack');
  for(const layout of names){motion.setLayout(layout,true);assert(!motion.active);assertLayout(units,layout);}
});


test('layout changes finish in under two seconds while preserving all phases',()=>{
  for(const from of names)for(const to of names){
    if(from===to)continue;
    const units=makeUnits(),motion=createConfigurationMotion(units);motion.setLayout(from);
    const plan=planConfiguration(snapshot(units),to);
    assert(plan.duration<2, `${from} → ${to}: ${plan.duration}s`);
    assert(plan.moves.every(move=>move.duration>.6));
  }
});

test('exploded row leaves clearance between the measured 330 mm assemblies',()=>{
  for(const amount of [0,.25,.5,.75,1]){
    const roots=[0,200,400].map((x,i)=>x+rowExplosionOffset(i,amount));
    const width=200+130*amount;
    assert.equal((roots[0]+roots[1]+roots[2])/3,200);
    for(let i=1;i<3;i++)assert(roots[i]-roots[i-1]-width>=70*amount-1e-8);
  }
  const narrow=explodedRowView(.6),wide=explodedRowView(1.6);
  assert(narrow.camera[2]>wide.camera[2]);
  assert.deepEqual(narrow.target,wide.target);
});

test('page entrance brings all three modules into the row one by one',()=>{
  const units=makeUnits(),events=[],motion=createConfigurationMotion(units,{animateEntrance:true,onChange:active=>events.push(active)});
  motion.setLayout('row');
  assert(motion.active);
  assert(units.every(unit=>!unit.visible&&unit.position.x>600));
  const waiting=snapshot(units);
  motion.update(0);assert.deepEqual(snapshot(units),waiting);
  const arrivals=[],lifted=new Set();
  for(let frame=0;frame<200&&motion.active;frame++){
    motion.update(.016);
    units.forEach((unit,index)=>{
      if(unit.visible&&!arrivals.includes(index))arrivals.push(index);
      if(unit.visible&&unit.position.y>1)lifted.add(index);
    });
  }
  assert.deepEqual(arrivals,[0,1,2]);
  assert.equal(lifted.size,3);
  assert(!motion.active);assertLayout(units,'row');
  assert.deepEqual(events,[true,false]);
});

test('entrance can be reselected or interrupted without snapping the moving garage',()=>{
  for(const time of [.1,.35,.6,1.1,1.8])for(const destination of names){
    const units=makeUnits(),motion=createConfigurationMotion(units,{animateEntrance:true});
    motion.setLayout('row');motion.update(time);
    const before=snapshot(units);
    motion.setLayout(destination);motion.update(0);
    assert.deepEqual(snapshot(units),before);
    complete(motion);assertLayout(units,destination);
  }
});

test('reduced motion bypasses the page entrance and can settle an entrance already underway',()=>{
  for(const halfway of [false,true]){
    const units=makeUnits(),motion=createConfigurationMotion(units,{animateEntrance:true});
    if(halfway){motion.setLayout('row');motion.update(.5);}
    motion.setLayout('row',true);
    assert(!motion.active);assertLayout(units,'row');
  }
});
