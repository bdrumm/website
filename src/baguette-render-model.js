import * as T from 'three';

export function clonePrintModel(source,{angle=0,explode=0,section,clip}={}){
 const model=source.clone(true),materials=[];
 const hinge=model.getObjectByName('LidHinge');
 hinge.rotation.x=-T.MathUtils.degToRad(angle);
 model.traverse(mesh=>{
  if(!mesh.isMesh)return;
  // Share the original vertex/index buffers. Never smooth, remesh, scale individual
  // parts or change shell geometry to match a photograph.
  mesh.material=mesh.material.clone();
  mesh.visible=section?mesh.userData.reviewSection&&mesh.userData.sectionType===section:!mesh.userData.reviewSection;
  mesh.castShadow=mesh.receiveShadow=true;
  if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[0]=angle>0?1:0;
  if(mesh.name.endsWith('_A'))mesh.position.x-=explode;
  if(mesh.name.endsWith('_B'))mesh.position.x+=explode;
  if(clip==='catch')mesh.material.clippingPlanes=[new T.Plane(new T.Vector3(-1,0,0),150),new T.Plane(new T.Vector3(1,0,0),-136),new T.Plane(new T.Vector3(0,0,1),-30)];
  if(section||clip){mesh.material.color.set(mesh.name.startsWith('base')||mesh.name.endsWith('_B')?'#638c9a':'#d8b57b');mesh.userData.annotationColor=true;}
  materials.push(mesh.material);
 });
 return {model,materials};
}

export function applyPrintFinish(model,color,{wet=false,texture}={}){
 model.traverse(mesh=>{
  if(!mesh.isMesh||mesh.userData.annotationColor)return;
  mesh.material.color.set(color);mesh.material.metalness=0;
  mesh.material.roughness=wet?.24:.43;
  if(mesh.material.isMeshPhysicalMaterial){mesh.material.clearcoat=wet?.48:.12;mesh.material.clearcoatRoughness=wet?.16:.38;}
  if(texture){mesh.material.normalMap=texture;mesh.material.normalScale.set(.07,.07);}
 });
}
