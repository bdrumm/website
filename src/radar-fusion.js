// Educational 3D extension. Sensor observations are generated separately from
// estimation: fuseObservations never receives simulated ground truth.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const norm=a=>Math.hypot(...a);
const xyz=p=>[p.x,p.y,p.z];
const rad=d=>d*Math.PI/180;
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export const NOISE={range:.08,azimuth:rad(.7),elevation:rad(.9)};
export function makeRig(layout='multi',profile=null){
 if(!['multi','flat'].includes(layout))throw Error('Unknown sensor layout');
 const cameras=[[.35,.35,2.55],[5.1,5.6,1.85],[6,.35,2.45],[9.65,5.6,1.75]].map((p,i)=>({id:'C'+(i+1),kind:'camera',x:p[0],y:p[1],z:layout==='flat'?1.3:p[2],room:i<2?0:1,range:8,hfov:110,vfov:90}));
 const ranges=[[.6,.6,.45],[5,.6,2.55],[5,5.4,.95],[.6,5.4,1.4],[6,.6,.5],[9.4,.6,2.6],[9.4,5.4,1.05],[6,5.4,1.55]].map((p,i)=>({id:'R'+(i+1),kind:'range',x:p[0],y:p[1],z:layout==='flat'?1.3:p[2],room:i<4?0:1,range:6,hfov:140,vfov:140}));
 for(const s of [...cameras,...ranges]){const center={x:s.room?7.8:2.8,y:3,z:1.2};s.azimuth=Math.atan2(center.y-s.y,center.x-s.x);s.elevation=Math.atan2(center.z-s.z,Math.hypot(center.x-s.x,center.y-s.y));s.heading=s.azimuth*180/Math.PI;s.fov=s.hfov;}
 const rig={cameras,ranges,points:[],layout,profile};
 return profile?.buildRig?profile.buildRig(rig,layout):rig;
}
export function blockedByWall(a,b){
 if((a.x<5.6)===(b.x<5.6))return false;
 const y=a.y+(5.6-a.x)/(b.x-a.x)*(b.y-a.y);return y<2.4||y>3.6;
}
export function sensorSees(sensor,target){
 const dx=target.x-sensor.x,dy=target.y-sensor.y,dz=target.z-sensor.z,d=Math.hypot(dx,dy,dz);
 return d>(sensor.minRange??.15)&&d<=sensor.range&&!blockedByWall(sensor,target)&&Math.abs(wrap(Math.atan2(dy,dx)-sensor.azimuth))<=rad(sensor.hfov/2)&&Math.abs(Math.atan2(dz,Math.hypot(dx,dy))-sensor.elevation)<=rad(sensor.vfov/2);
}
function noise(t,id,k){const seed=Number(id.slice(1))+({C:11,R:37,U:101,D:61,M:83}[id[0]]??37);return .9*Math.sin(t*.73+seed*2.31+k)+.35*Math.sin(t*1.37+seed*.91+k*2);}
export function observeTarget(target,time,rig,{cameras=true,radar=true,present=true,cameraMotion=1,condition='surveyed'}={}){
 const observations={cameras:[],ranges:[],points:[]};if(!present)return observations;
 const model=rig.profile?.noise||NOISE,quantum=rig.profile?.quantum??.01;
 const origin=s=>xyz(s).map((v,i)=>v+(condition==='drift'?[.03,-.02,.025][i]:0));
 const available=s=>condition!=='occluded'||Number(s.id.slice(1))%2===0;
 if(cameras&&(rig.profile?.persistentOptical||cameraMotion>.02))for(const s of rig.cameras){if(!sensorSees(s,target)||!available(s)||(rig.visibility&&!rig.visibility(s,target)))continue;
  const dx=target.x-s.x,dy=target.y-s.y,dz=target.z-s.z;
  const azimuth=Math.atan2(dy,dx)+model.azimuth*noise(time,s.id,0),elevation=Math.atan2(dz,Math.hypot(dx,dy))+model.elevation*noise(time,s.id,1);
  observations.cameras.push({id:s.id,origin:origin(s),direction:[Math.cos(elevation)*Math.cos(azimuth),Math.cos(elevation)*Math.sin(azimuth),Math.sin(elevation)],azimuth,elevation,sigmaAngle:Math.max(model.azimuth,model.elevation),sigmaFloor:rig.profile?.sigmaFloor??.04,strength:rig.profile?.persistentOptical?1:cameraMotion});
 }
 if(radar)for(const s of rig.ranges){if(!sensorSees(s,target)||!available(s)||(rig.visibility&&!rig.visibility(s,target)))continue;const range=Math.max(.1,Math.round((norm(sub(xyz(target),xyz(s)))+model.range*noise(time,s.id,2))/quantum)*quantum);observations.ranges.push({id:s.id,origin:origin(s),range,sigma:model.range});}
 for(const s of rig.points||[]){if(!(s.family==='optical'?cameras:radar)||!sensorSees(s,target)||!available(s)||(rig.visibility&&!rig.visibility(s,target)))continue;
  const distance=norm(sub(xyz(target),xyz(s))),sigma=s.family==='optical'?.01+.004*distance*distance:.12;
  // Already-associated 3D keypoint/track, a simplified SDK-output model.
  // Point extraction, correspondence, and body-centroid bias are not simulated.
  const point=xyz(target).map((v,i)=>v+sigma*noise(time,s.id,i)+(condition==='drift'?[.03,-.02,.025][i]:0));
  observations.points.push({id:s.id,origin:origin(s),point,sigma:[sigma,sigma,sigma],family:s.family});
 }
 return observations;
}
function determinant(a){return a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);}
function invert(a){const d=determinant(a);if(Math.abs(d)<1e-10)return null;const r=Array.from({length:3},()=>[0,0,0]);for(let i=0;i<3;i++)for(let j=0;j<3;j++){const rows=[0,1,2].filter(k=>k!==j),cols=[0,1,2].filter(k=>k!==i);r[i][j]=((i+j)%2?-1:1)*(a[rows[0]][cols[0]]*a[rows[1]][cols[1]]-a[rows[0]][cols[1]]*a[rows[1]][cols[0]])/d;}return r;}
export function noncoplanarRanges(ranges){
 if(ranges.length<4)return false;
 for(let i=0;i<ranges.length-3;i++)for(let j=i+1;j<ranges.length-2;j++)for(let k=j+1;k<ranges.length-1;k++)for(let l=k+1;l<ranges.length;l++){
  const a=ranges[i].origin,m=[sub(ranges[j].origin,a),sub(ranges[k].origin,a),sub(ranges[l].origin,a)];if(Math.abs(determinant(m))>.15)return true;
 }return false;
}
function closestRays(a,b){const w=sub(a.origin,b.origin),d=dot(a.direction,b.direction),den=1-d*d;if(den<1e-7)return null;const da=dot(a.direction,w),db=dot(b.direction,w),ta=(d*db-da)/den,tb=(db-d*da)/den;if(ta<.2||tb<.2)return null;const p=a.origin.map((v,i)=>v+ta*a.direction[i]),q=b.origin.map((v,i)=>v+tb*b.direction[i]);return{point:p.map((v,i)=>(v+q[i])/2),miss:norm(sub(p,q))};}
function validCameraPair(a,b,p){const aa=sub(a.origin,p),bb=sub(b.origin,p),den=Math.hypot(aa[0],aa[1])*Math.hypot(bb[0],bb[1]);if(den<1e-8)return false;const angle=Math.acos(clamp((aa[0]*bb[0]+aa[1]*bb[1])/den,-1,1))*180/Math.PI;const rays=closestRays(a,b);return angle>=20&&angle<=160&&rays&&rays.miss<=.9;}
function system(p,observations,rf,prior=true){
 const H=[[0,0,0],[0,0,0],[0,0,0]],g=[0,0,0];let cost=0,count=0;
 function add(r,j){const a=Math.abs(r),weight=a<=2.5?1:2.5/a;cost+=a<=2.5?r*r:5*a-6.25;count++;for(let x=0;x<3;x++){g[x]+=weight*j[x]*r;for(let y=0;y<3;y++)H[x][y]+=weight*j[x]*j[y];}}
 for(const c of observations.cameras){const delta=sub(p,c.origin),along=dot(delta,c.direction),sigma=Math.max(c.sigmaFloor??.04,Math.abs(along)*c.sigmaAngle);for(let i=0;i<3;i++)add((delta[i]-along*c.direction[i])/sigma,c.direction.map((v,k)=>((i===k?1:0)-c.direction[i]*v)/sigma));}
 for(const r of observations.ranges){const delta=sub(p,r.origin),d=Math.max(norm(delta),1e-6);add((d-r.range)/r.sigma,delta.map(v=>v/d/r.sigma));}
 for(const m of observations.points||[])for(let i=0;i<3;i++)add((p[i]-m.point[i])/m.sigma[i],[0,1,2].map(k=>k===i?1/m.sigma[i]:0));
 if(prior&&rf){add((p[0]-rf.x)/1.8,[1/1.8,0,0]);add((p[1]-rf.y)/1.8,[0,1/1.8,0]);}
 return{H,g,cost,count};
}
function refine(seed,obs,rf,zMax=3){let p=seed.map((v,i)=>clamp(v,.05,i===0?9.95:i===1?5.95:zMax-.05));for(let k=0;k<30;k++){const s=system(p,obs,rf);const H=s.H.map((r,i)=>r.map((v,j)=>v+(i===j?.0001:0))),inv=invert(H);if(!inv)break;let step=inv.map(r=>-dot(r,s.g));const length=norm(step);if(length>1)step=step.map(v=>v/length);let accepted=false;for(const scale of [1,.5,.2,.05]){const q=p.map((v,i)=>clamp(v+step[i]*scale,.05,i===0?9.95:i===1?5.95:zMax-.05));if(system(q,obs,rf).cost<=s.cost+1e-9){p=q;accepted=true;break;}}if(!accepted||length<1e-6)break;}return{point:p,...system(p,obs,rf)};}
export function fuseObservations(observations,rfEstimate=null,{zMax=3}={}){
 if(!Number.isFinite(zMax)||zMax<3||zMax>20)throw Error('Unsupported height bounds');
 const obs={cameras:observations.cameras||[],ranges:observations.ranges||[],points:observations.points||[]};const base={estimate:null,observable:false,sigma:null,cameras:obs.cameras.length,ranges:obs.ranges.length,points:obs.points.length,reason:'Height unresolved — insufficient independent measurements'};
 if(!obs.cameras.length&&!obs.ranges.length&&!obs.points.length)return{...base,reason:'No spatial observations — height unresolved'};
 const origins=[...obs.cameras,...obs.ranges,...obs.points].map(s=>s.origin),center=[0,1,2].map(i=>origins.reduce((s,p)=>s+p[i],0)/origins.length),seeds=[center];
 for(const point of obs.points)seeds.push(point.point);
 for(const z of (zMax===3?[.3,1.3,2.7]:Array.from({length:Math.max(3,Math.ceil(zMax))},(_,i)=>.3+i*(zMax-.6)/(Math.max(3,Math.ceil(zMax))-1)))){seeds.push([center[0],center[1],z]);if(rfEstimate)seeds.push([rfEstimate.x,rfEstimate.y,z]);}
 for(let i=0;i<obs.cameras.length;i++)for(let j=i+1;j<obs.cameras.length;j++){const pair=closestRays(obs.cameras[i],obs.cameras[j]);if(pair&&pair.miss<.9)seeds.push(pair.point);}
 const solutions=seeds.map(seed=>refine(seed,obs,rfEstimate,zMax)).sort((a,b)=>a.cost-b.cost),best=solutions[0],p=best.point;
 if(obs.cameras.some(c=>dot(sub(p,c.origin),c.direction)<=.2))return{...base,reason:'Height unresolved — inconsistent camera directions'};
 const cameraGeometry=obs.cameras.some((a,i)=>obs.cameras.slice(i+1).some(b=>validCameraPair(a,b,p)));
 if(!cameraGeometry&&!noncoplanarRanges(obs.ranges)&&!obs.points.length)return base;
 if(solutions.some(s=>s.cost<best.cost+.5&&norm(sub(s.point,p))>.5))return{...base,reason:'Height unresolved — ambiguous measurement geometry'};
 const measurement=system(p,obs,null,false),cov=invert(measurement.H);
 if(!cov)return{...base,reason:'Height unresolved — singular sensor geometry'};
 const sigma={x:Math.sqrt(Math.max(0,cov[0][0])),y:Math.sqrt(Math.max(0,cov[1][1])),z:Math.sqrt(Math.max(0,cov[2][2]))};
 if(Math.max(sigma.x,sigma.y,sigma.z)>.65||measurement.cost/Math.max(1,measurement.count-3)>6)return{...base,reason:'Height unresolved — weak or inconsistent observations'};
 return{estimate:{x:p[0],y:p[1],z:p[2]},observable:true,sigma,cameras:obs.cameras.length,ranges:obs.ranges.length,points:obs.points.length,reason:obs.points.length?'Registered 3D observations':obs.cameras.length&&obs.ranges.length?'Camera bearings + radar ranges':obs.cameras.length?'Camera triangulation':'Multi-height radar ranges'};
}
