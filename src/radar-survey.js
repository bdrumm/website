import {makeRig,observeTarget,fuseObservations} from './radar-fusion.js';
import {hardwarePreset} from './radar-hardware.js';
export function surveyHardware(id,layout='multi',condition='surveyed'){
 const profile=hardwarePreset(id),rig=makeRig(layout,profile),errors=[],axes=[[],[],[]];let total=0,within1cm=0;
 for(const x of [1,2.2,3.5,4.7,6.3,7.3,8.4,9.2])for(const y of [1,3,5])for(const z of [.4,1.4,2.4])for(const time of [0,7]){
  total++;const truth={x,y,z},obs=observeTarget(truth,time,rig,{condition}),fix=fuseObservations(obs).estimate;
  if(!fix)continue;const delta=[fix.x-x,fix.y-y,fix.z-z],error=Math.hypot(...delta);errors.push(error);delta.forEach((e,i)=>axes[i].push(e));if(error<=.01)within1cm++;
 }
 errors.sort((a,b)=>a-b);const quantile=q=>{if(!errors.length)return null;const n=(errors.length-1)*q,i=Math.floor(n);return errors[i]+(errors[Math.min(i+1,errors.length-1)]-errors[i])*(n-i);};
 return{id,version:profile.version,name:profile.name,trackedObject:profile.target,layout,condition,simulation:true,assumptions:profile.model,total,resolved:errors.length,median:quantile(.5),p95:quantile(.95),max:errors.length?errors.at(-1):null,within1cm,bias:axes.map(v=>v.length?v.reduce((a,b)=>a+b,0)/v.length:null)};
}
