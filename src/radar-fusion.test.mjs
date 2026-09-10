import assert from 'node:assert/strict';
import test from 'node:test';
import {makeRig,observeTarget,fuseObservations,noncoplanarRanges,NOISE} from './radar-fusion.js';
const xyz=p=>[p.x,p.y,p.z];
const dist=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
const target={x:2.6,y:3.7,z:.9};
const defaultOrigins=makeRig().ranges.slice(0,4).map(xyz);
function rangesAt(p,origins=defaultOrigins){return origins.map((origin,i)=>({id:'R'+i,origin,range:dist(xyz(p),origin),sigma:.08}));}
function camerasAt(p,origins=[[.35,.35,2.55],[5.1,.35,1.85]]){return origins.map((origin,i)=>{const delta=xyz(p).map((x,j)=>x-origin[j]),d=Math.hypot(...delta);return{id:'C'+i,origin,direction:delta.map(x=>x/d),sigmaAngle:Math.PI/180,strength:1};});}
function exact(p,options={}){return{cameras:options.cameras===false?[]:camerasAt(p,options.cameraOrigins),ranges:options.ranges===false?[]:rangesAt(p,options.rangeOrigins)};}
function fixNear(obs,p,tolerance=1e-4){const fix=fuseObservations(obs);assert.equal(fix.observable,true,fix.reason);assert.ok(dist(xyz(fix.estimate),xyz(p))<tolerance,JSON.stringify(fix));return fix;}
function unresolved(obs,prior=null){const fix=fuseObservations(obs,prior);assert.equal(fix.observable,false,JSON.stringify(fix));assert.equal(fix.estimate,null);assert.equal(fix.sigma,null);return fix;}
test('Noiseless hybrid recovers XYZ',()=>fixNear(exact(target),target));
test('Noiseless noncoplanar ranges recover XYZ',()=>fixNear(exact(target,{cameras:false}),target));
test('Noiseless cameras alone recover XYZ',()=>fixNear(exact(target,{ranges:false}),target));
test('Same-height cameras still resolve target height',()=>fixNear(exact(target,{ranges:false,cameraOrigins:[[.35,.35,1.3],[5.1,.35,1.3]]}),target));
test('Changing only target elevation changes recovered Z',()=>{for(const z of [.3,1,2])fixNear(exact({...target,z},{cameras:false}),{...target,z});});
test('Flat anchors expose exact mirrored-height ambiguity',()=>{const origins=defaultOrigins.map(p=>[p[0],p[1],1.2]);const lower={...target,z:.6},upper={...target,z:1.8},a=rangesAt(lower,origins),b=rangesAt(upper,origins);for(let i=0;i<a.length;i++)assert.ok(Math.abs(a[i].range-b[i].range)<1e-12);assert.equal(noncoplanarRanges(a),false);unresolved({ranges:a,cameras:[]},{x:target.x,y:target.y});});
test('Tilted coplanar anchors rejected despite height spread',()=>{const origins=[[.3,.3],[5.2,.3],[5.2,5.7],[.3,5.7]].map(([x,y])=>[x,y,.2+.2*x]);assert.ok(Math.max(...origins.map(p=>p[2]))-Math.min(...origins.map(p=>p[2]))>.9);const ranges=rangesAt(target,origins);assert.equal(noncoplanarRanges(ranges),false);unresolved({ranges});});
test('Vertical stack cannot resolve XY',()=>{const ranges=rangesAt(target,[.3,1,1.8,2.7].map(z=>[1,1,z]));unresolved({ranges},{x:target.x,y:target.y});});
test('Three range anchors remain ambiguous',()=>unresolved({ranges:rangesAt(target).slice(0,3)}));
test('One camera plus one range does not invent a unique fix',()=>unresolved({cameras:camerasAt(target).slice(0,1),ranges:rangesAt(target).slice(0,1)}));
test('Opposing source-degenerate cameras rejected',()=>unresolved({cameras:camerasAt({x:2.75,y:3,z:.9},[[.3,3,2.2],[5.2,3,2.2]])}));
test('Behind-camera pair alone rejected',()=>{const cameras=camerasAt(target).map(c=>({...c,direction:c.direction.map(x=>-x)}));unresolved({cameras});});
test('No observations returns no XYZ despite perfect RF XY',()=>unresolved({cameras:[],ranges:[]},{x:target.x,y:target.y}));
test('Empty scene emits no precision observations',()=>{const obs=observeTarget(target,3,makeRig(),{present:false});assert.equal(obs.cameras.length+obs.ranges.length,0);unresolved(obs);});
test('Still scene drops motion camera detections but keeps radar ranges',()=>{const obs=observeTarget(target,3,makeRig(),{cameraMotion:0});assert.equal(obs.cameras.length,0);assert.ok(obs.ranges.length>=4);assert.equal(fuseObservations(obs).observable,true);});
test('Camera and radar toggles remove their respective evidence',()=>{const rig=makeRig();for(const [cameras,radar] of [[false,true],[true,false],[false,false]]){const obs=observeTarget(target,1,rig,{cameras,radar});if(!cameras)assert.equal(obs.cameras.length,0);if(!radar)assert.equal(obs.ranges.length,0);}});
test('Repeatable observations at identical time and pose',()=>assert.deepEqual(observeTarget(target,11,makeRig()),observeTarget(target,11,makeRig())));
test('Changed range observations change estimate without target input',()=>{const first=exact(target,{cameras:false}),second=exact({...target,z:1.6},{cameras:false});assert.ok(Math.abs(fuseObservations(first).estimate.z-fuseObservations(second).estimate.z)>.6);});
test('Strongly inconsistent ranges do not produce precise XYZ',()=>{const obs=exact(target,{cameras:false});obs.ranges[0].range+=3;unresolved(obs);});
test('One strong range outlier with good cameras is rejected or remains close',()=>{const obs=exact(target);obs.ranges[0].range+=3;const fix=fuseObservations(obs);assert.ok(!fix.observable||dist(xyz(fix.estimate),xyz(target))<.25,JSON.stringify(fix));return fix.reason;});
function stats(values){const a=[...values].sort((a,b)=>a-b);return{n:a.length,median:a[Math.floor(a.length*.5)]??null,p90:a[Math.floor(a.length*.9)]??null,max:a.at(-1)??null};}
const accuracy={};
for(const [name,options,layout] of [['hybrid',{cameras:true,radar:true},'multi'],['rangeOnly',{cameras:false,radar:true},'multi'],['cameraOnly',{cameras:true,radar:false},'multi'],['flatHybrid',{cameras:true,radar:true},'flat'],['flatRangeOnly',{cameras:false,radar:true},'flat']]){
 const errors=[],zErrors=[];let total=0,observable=0;
 for(const x of [1.3,2.6,4.5,6.5,7.8,8.8])for(const y of [1.2,2.4,3.7,4.8])for(const z of [.3,.9,1.7,2.5])for(const t of [0,8,20]){total++;const p={x,y,z},obs=observeTarget(p,t,makeRig(layout),options),fix=fuseObservations(obs);if(fix.observable){observable++;errors.push(dist(xyz(p),xyz(fix.estimate)));zErrors.push(Math.abs(z-fix.estimate.z));}}
 accuracy[name]={total,observable,coverage:observable/total,error3d:stats(errors),errorZ:stats(zErrors)};
}
test('Noisy hybrid survey has median < 0.15 m and p90 < 0.3 m',()=>{const s=accuracy.hybrid;assert.ok(s.error3d.median<.15,JSON.stringify(s));assert.ok(s.error3d.p90<.3,JSON.stringify(s));return s;});
test('Noisy multi-height radar avoids gross false-height fixes',()=>{const s=accuracy.rangeOnly;assert.ok(s.error3d.p90<.3,JSON.stringify(s));assert.ok(s.error3d.max<.65,JSON.stringify(s));return s;});
test('Flat radar-only survey never invents observable height',()=>assert.equal(accuracy.flatRangeOnly.observable,0));
