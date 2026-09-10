import * as THREE from 'three';
export function installAction(model,kind){
 if(kind==='open'){
  const hinge=model.getObjectByName('LidHinge');if(!hinge)throw Error('Missing lid hinge');let progress=0;
  return {update(dt,active,reduced){const target=active?1:0;progress=reduced?target:THREE.MathUtils.damp(progress,target,5,dt);if(Math.abs(target-progress)<.001)progress=target;hinge.rotation.x=-Math.PI*progress;}};
 }
 if(kind==='swim'){
  const time={value:0},strength={value:0};
  let minX=Infinity,maxX=-Infinity;model.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();minX=Math.min(minX,o.geometry.boundingBox.min.x);maxX=Math.max(maxX,o.geometry.boundingBox.max.x);}});
  const length=maxX-minX;

  const declarations=`uniform float swimTime; uniform float swimStrength;
  float swimU(float x){return clamp((x-(${minX.toFixed(8)}))/${length.toFixed(8)},0.0,1.0);}
  float swimOffset(float x){float u=swimU(x);return swimStrength*(${(length*.0015).toFixed(8)}+${(length*.09).toFixed(8)}*u*u*u)*sin(6.2831853*(1.1*u-0.9*swimTime));}
  float swimSlope(float x){float u=swimU(x);float phase=6.2831853*(1.1*u-0.9*swimTime);return swimStrength*(${(length*.27).toFixed(8)}*u*u*sin(phase)+(${(length*.0015).toFixed(8)}+${(length*.09).toFixed(8)}*u*u*u)*6.9115038*cos(phase))/${length.toFixed(8)};}`;
  const patched=new Set();model.traverse(mesh=>{if(!mesh.isMesh)return;mesh.frustumCulled=false;for(const mat of Array.isArray(mesh.material)?mesh.material:[mesh.material]){if(patched.has(mat))continue;patched.add(mat);mat.onBeforeCompile=shader=>{shader.uniforms.swimTime=time;shader.uniforms.swimStrength=strength;shader.vertexShader=declarations+'\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal.x -= swimSlope(position.x)*objectNormal.z;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += swimOffset(position.x);');};mat.customProgramCacheKey=()=> 'fish-swim-v2';mat.needsUpdate=true;}});
  return {update(dt,active){time.value+=dt;strength.value=THREE.MathUtils.damp(strength.value,active?1:0,4,dt);}};
 }
 return {update(){}};
}
