import {makeRig,observeTarget,fuseObservations,blockedByWall} from './radar-fusion.js';
import {hardwarePreset} from './radar-hardware.js';
// Browser educational model. Synthetic calibrated scores -> source-equivalent RTI.
// Source: csi-presence/host/{rti.py,zones.py,tools/simulate.py}. No native I/O.
export const FLOOR={w:10,h:6,wallX:5.6,door:[2.4,3.6]};
export const GRID={nx:67,ny:40};
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function ringNodes(n){
 return Array.from({length:n},(_,i)=>{const d=(i+.5)*32/n;return{id:String.fromCharCode(65+i),x:d<10?d:d<16?9.8:d<26?26-d:.2,y:d<10?.2:d<16?d-10:d<26?5.8:32-d,online:true};});
}
export function crossesWall(a,b){
 if((a.x<FLOOR.wallX)===(b.x<FLOOR.wallX))return false;
 const y=a.y+(FLOOR.wallX-a.x)/(b.x-a.x)*(b.y-a.y);
 return y<FLOOR.door[0]||y>FLOOR.door[1];
}
export function linkResponse(p,a,b,lambda=.6,wallAttenuation=.45){
 const e=distance(a,p)+distance(b,p)-distance(a,b);
 return Math.max(0,1-e/lambda)*(crossesWall(a,b)?wallAttenuation:1);
}
export function inverse(matrix){
 const n=matrix.length;const a=matrix.map((r,i)=>Float64Array.from([...r,...Array.from({length:n},(_,j)=>+(i===j))]));
 for(let c=0;c<n;c++){
  let pivot=c;for(let r=c+1;r<n;r++)if(Math.abs(a[r][c])>Math.abs(a[pivot][c]))pivot=r;
  [a[c],a[pivot]]=[a[pivot],a[c]];const d=a[c][c];if(Math.abs(d)<1e-12)throw Error('Degenerate geometry');
  for(let k=0;k<2*n;k++)a[c][k]/=d;
  for(let r=0;r<n;r++){if(r===c)continue;const f=a[r][c];for(let k=0;k<2*n;k++)a[r][k]-=f*a[c][k];}
 }
 return a.map(r=>r.slice(n));
}
export function makeGeometry(nodes,lambda=.6,alpha=5,grid=GRID){
 const cells=Array.from({length:grid.nx*grid.ny},(_,i)=>({x:(i%grid.nx+.5)*10/grid.nx,y:(Math.floor(i/grid.nx)+.5)*6/grid.ny}));
 const links=[];
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  const a=nodes[i],b=nodes[j],d=distance(a,b);if(!a.online||!b.online||d<.3)continue;
  const weights=Float64Array.from(cells,p=>{const e=distance(p,a)+distance(p,b)-d;return e<=lambda?(1-e/lambda)/Math.sqrt(d):0;});
  links.push({a,b,id:a.id+'–'+b.id,weights,wall:crossesWall(a,b),score:0});
 }
 const W=links.map(l=>l.weights),L=W.length,V=cells.length;
 const gram=Array.from({length:L},()=>new Float64Array(L));
 for(let i=0;i<L;i++)for(let j=0;j<=i;j++){let sum=0;for(let v=0;v<V;v++)sum+=W[i][v]*W[j][v];gram[i][j]=gram[j][i]=sum+(i===j?alpha:0);}
 const inv=L?inverse(gram):[];
 const solver=Array.from({length:V},()=>new Float64Array(L));
 for(let v=0;v<V;v++)for(let i=0;i<L;i++){let s=0;for(let j=0;j<L;j++)s+=W[j][v]*inv[j][i];solver[v][i]=s;}
 const zones=[{name:'Studio',x0:0,x1:5.6},{name:'Workshop',x0:5.6,x1:10}].map(z=>({...z,indices:cells.flatMap((p,i)=>p.x>=z.x0&&p.x<z.x1?[i]:[])}));
 for(const z of zones)z.coverage=links.filter(l=>z.indices.some(i=>l.weights[i]>0)).length;
 return{nodes,links,cells,solver,zones,grid};
}
export function solve(geometry,scores){
 const out=Float64Array.from(geometry.solver,r=>Math.max(0,r.reduce((s,v,i)=>s+v*scores[i],0)));
 const peak=out.reduce((m,v)=>Math.max(m,v),0),max=scores.reduce((m,v)=>Math.max(m,v),0);
 if(peak>1e-9)for(let i=0;i<out.length;i++)out[i]=out[i]/peak*clamp(max);
 return out;
}
export function percentile(values,q=.98){if(!values.length)return 0;const a=Array.from(values).sort((x,y)=>x-y);const k=(a.length-1)*q,i=Math.floor(k);return a[i]+(a[Math.min(i+1,a.length-1)]-a[i])*(k-i);}
const waypoints=[{x:2.5,y:4.2},{x:4.7,y:3},{x:6.5,y:3},{x:8.2,y:1.6},{x:8.2,y:4.4},{x:6.5,y:3},{x:4.7,y:3},{x:2.2,y:1.8},{x:2.5,y:4.2}];
export function walker(t){const v=((t%64)+64)%64/8,i=Math.floor(v),f=v-i;return{x:waypoints[i].x+(waypoints[i+1].x-waypoints[i].x)*f,y:waypoints[i].y+(waypoints[i+1].y-waypoints[i].y)*f};}
export const CAMERAS=makeRig().cameras;
export function inCone(p,camera){const d=distance(p,camera),angle=Math.atan2(p.y-camera.y,p.x-camera.x)*180/Math.PI;let delta=((angle-camera.heading+540)%360)-180;return d>.15&&d<=camera.range&&Math.abs(delta)<camera.fov/2;}
export class RadarSimulation{
 constructor(){this.reset();}
 reset(){this.count=8;this.lambda=.6;this.alpha=5;this.threshold=.7;this.wallAttenuation=.45;this.time=0;this.scenario='walk';this.cameras=true;this.radar=true;this.offline=new Set();this.target={x:2.5,y:4.2,z:1.2};this.mountLayout='multi';this.hardware='hybrid';this.condition='surveyed';this.rig=makeRig(this.mountLayout,hardwarePreset(this.hardware));this.lastSeen=[-Infinity,-Infinity];this.rebuild();return this.update(0);}
 rebuild(){const nodes=ringNodes(this.count);nodes.forEach(n=>n.online=!this.offline.has(n.id));this.geometry=makeGeometry(nodes,this.lambda,this.alpha);}
 setScenario(id){if(!['walk','levels','still','empty','blind','outage','manual'].includes(id))throw Error('Unknown scenario');this.scenario=id;this.lastSeen=this.lastSeen.map(t=>t-this.time);this.time=0;if(id==='blind'){this.cameras=false;this.target={x:7.8,y:4.4,z:this.target.z};}else this.cameras=true;
  this.offline=id==='outage'?new Set(['A','B']):new Set();this.rebuild();return this.update(0);}
 configure(p={}){for(const key of Object.keys(p))if(!['count','lambda','alpha','threshold','wallAttenuation','cameras','radar','mountLayout','hardware','condition'].includes(key))throw Error('Unknown parameter');
  if(p.count!==undefined&&![4,6,8,10,12].includes(p.count))throw Error('Node count must be 4, 6, 8, 10, or 12');
  for(const[key,min,max]of[['lambda',.2,1.5],['alpha',.5,20],['threshold',.2,.95],['wallAttenuation',0,1]])if(p[key]!==undefined&&(!Number.isFinite(p[key])||p[key]<min||p[key]>max))throw Error('Parameter outside allowed range');
  for(const key of ['cameras','radar'])if(p[key]!==undefined&&typeof p[key]!=='boolean')throw Error('Expected boolean');
  if(p.mountLayout!==undefined&&!['multi','flat'].includes(p.mountLayout))throw Error('Unknown sensor layout');
  if(p.hardware!==undefined)hardwarePreset(p.hardware);
  if(p.condition!==undefined&&!['surveyed','drift','occluded'].includes(p.condition))throw Error('Unknown measurement condition');
  const hardwareChange=p.hardware!==undefined&&p.hardware!==this.hardware;
  const rebuild=['count','lambda','alpha'].some(k=>p[k]!==undefined&&p[k]!==this[k]);Object.assign(this,p);if(hardwareChange){this.cameras=p.cameras??this.scenario!=='blind';this.radar=p.radar??true;this.lastSeen=[-Infinity,-Infinity];}this.rig=makeRig(this.mountLayout,hardwarePreset(this.hardware));if(rebuild)this.rebuild();return this.update(0);
 }
 move(x,y,z=this.target.z){if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(z))throw Error('Finite coordinates required');this.scenario='manual';this.target={x:clamp(x,.1,9.9),y:clamp(y,.1,5.9),z:clamp(z,.2,2.7)};return this.update(0);}
 toggleNode(id){if(!this.geometry.nodes.some(n=>n.id===id))throw Error('Unknown node');this.offline.has(id)?this.offline.delete(id):this.offline.add(id);this.rebuild();return this.update(0);}
 update(dt,frame=null){if(frame){this.time=frame.time;this.target={...frame.target};}else{this.time+=Math.max(0,dt);if(['walk','outage','levels'].includes(this.scenario))this.target={...walker(this.time),z:this.scenario==='levels'?1.45+1.1*Math.sin(this.time*Math.PI/16):this.target.z};}
  // Educational stillness scenario: motion window drains over 2 s. Manual is
  // a persistent test disturbance at visitor coordinates, not a tracked person.
  const present=frame?.present??this.scenario!=='empty';
  const motion=frame?.motion??(this.scenario==='empty'?0:this.scenario==='still'?clamp(1-this.time/2):1);
  const g=this.geometry,p=this.target;
  const scores=g.links.map(l=>clamp(linkResponse(p,l.a,l.b,this.lambda,this.wallAttenuation)*motion*(present?1:0)));g.links.forEach((l,i)=>l.score=scores[i]);
  const rf=solve(g,scores),vision=new Float64Array(rf.length),hybrid=new Float64Array(rf.length),agreement=new Float64Array(rf.length);
  let peak=-1;for(let i=0;i<rf.length;i++)if(peak<0||rf[i]>rf[peak])peak=i;
  const estimate=peak>=0&&rf[peak]>.12?g.cells[peak]:null;
  const observations=frame?.observations??observeTarget(p,this.time,this.rig,{cameras:this.cameras,radar:this.radar,present:this.scenario!=='empty',cameraMotion:motion,condition:this.condition});
  const fusion=frame?.fusion??fuseObservations(observations,estimate),fix=fusion.estimate;
  const opticalPoints=observations.points.filter(p=>p.family==='optical').length,radarPoints=observations.points.filter(p=>p.family==='radar').length;
  if(fix&&this.hardware==='uwb')fusion.reason='UWB tag ranges at surveyed heights';
  // Floor-projected camera evidence comes from measured, noisy bearing rays.
  // The 3D estimate consumes observations, never the ground-truth target.
  for(let i=0;i<rf.length;i++){
   const cell=g.cells[i];let optical=0;
   for(const c of observations.cameras){const sensor=this.rig.cameras.find(s=>s.id===c.id);if(blockedByWall(sensor,cell)||!inCone(cell,sensor))continue;const dx=cell.x-c.origin[0],dy=cell.y-c.origin[1],along=dx*Math.cos(c.azimuth)+dy*Math.sin(c.azimuth),cross=dx*Math.sin(c.azimuth)-dy*Math.cos(c.azimuth);
    if(along>0)optical+=.5*c.strength*Math.exp(-cross*cross/(2*.45*.45));
   }
   for(const m of observations.points.filter(p=>p.family==='optical')){const sensor=this.rig.points.find(s=>s.id===m.id);if(blockedByWall(sensor,cell)||!inCone(cell,sensor))continue;optical+=.9*Math.exp(-((cell.x-m.point[0])**2+(cell.y-m.point[1])**2)/(2*.25**2));}
   vision[i]=clamp(optical);agreement[i]=Math.sqrt(rf[i]*vision[i]);
   if(fix){const sx=Math.max(.18,2*fusion.sigma.x),sy=Math.max(.18,2*fusion.sigma.y),density=Math.exp(-.5*((cell.x-fix.x)**2/sx**2+(cell.y-fix.y)**2/sy**2));hybrid[i]=Math.max(.15*rf[i],.98*density);}
   else hybrid[i]=rf[i];
  }
  const zones=g.zones.map((z,j)=>{
   const precisionFix=!!fix&&fix.x>=z.x0&&fix.x<z.x1;
   // A qualified 3D fix can support a room after motion-based CSI has drained.
   // This intentionally extends the host's percentile-only room evidence.
   const level=Math.max(percentile(z.indices.map(i=>hybrid[i])),precisionFix?.95:0),hasCoverage=z.coverage>0||precisionFix;
   if(hasCoverage&&level>=this.threshold)this.lastSeen[j]=this.time;
   const hold=Math.max(0,6-(this.time-this.lastSeen[j])),rfLevel=percentile(z.indices.map(i=>rf[i])),visionLevel=percentile(z.indices.map(i=>vision[i]));
   return{...z,level,hold,hasCoverage,precisionFix,occupied:hasCoverage&&hold>0,rfLevel,visionLevel,evidence:precisionFix?(fusion.points?(opticalPoints&&radarPoints?'DEPTH + RADAR 3D':opticalPoints?'DEPTH 3D':'RADAR 3D'):this.hardware==='uwb'?'UWB TAG 3D':fusion.cameras&&fusion.ranges?'CAMERA + RADAR':fusion.cameras?'CAMERA 3D':'RADAR 3D'):rfLevel>=this.threshold?(this.cameras?'RF ONLY':'RF / UNSEEN'):'QUIET'};
  });
  const firstRange=observations.ranges[0],fusionError=fix?Math.hypot(fix.x-p.x,fix.y-p.y):null,zError=fix?Math.abs(fix.z-p.z):null;
  return this.snapshot={time:this.time,present,scenario:this.scenario,target:{...p},motion,rf,vision,hybrid,agreement,zones,estimate,error:estimate?distance(estimate,p):null,links:g.links,nodes:g.nodes,radar:{detected:observations.ranges.length+radarPoints>0,range:firstRange?.range??null,stationary:this.scenario==='still'&&this.time>2},cameraCount:observations.cameras.length+opticalPoints,peak:Math.max(0,...scores),rig:this.rig,hardware:this.hardware,condition:this.condition,observations,fusion,fusionError,zError,error3d:fix?Math.hypot(fusionError,zError):null};

 }
}
