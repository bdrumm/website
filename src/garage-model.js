import {AnimationMixer,LoopOnce,Vector3} from 'three';

export function createGarageModelMotion(model,clips){
 const mixer=new AnimationMixer(model);
 const actions=clips.map(clip=>{
  const action=mixer.clipAction(clip);action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();action.paused=true;
  return {action,kind:clip.name.includes('_roof_')?'roof':'door'};
 });
 const animated=new Set(clips.map(clip=>clip.name)),roofs=[],connectors=[],separation=[];
 model.traverse(object=>{
  const name=object.userData.sourceName;
  if(!name)return;
  let offset;
  if(/_roof_(front|rear)$/.test(name)){
   roofs.push(object);offset=new Vector3(0,.11,0);
  }else if(/removable_storefront|shop_removable_front|Removable_Front_Frame|snap_in_door|^PIP_Door_Slat_|^Garage_Door_Bottom_Handle|^DISPLAY ONLY /.test(name)){
   offset=new Vector3(0,.01,.065);
  }
  if(name.startsWith('Universal_side_clip'))connectors.push(object);
  if(offset)separation.push({object,offset,original:object.position.clone(),animated:animated.has(object.name),applied:new Vector3()});
 });
 return {
  update({door=0,roof=0,explode=0,detachLowerRoofs=false,showConnectors=true}={}){
   // Remove the previous display offset before PropertyMixer samples source motion.
   for(const item of separation)if(item.animated)item.object.position.sub(item.applied);
   for(const {action,kind} of actions)action.time=(1+(kind==='door'?39*door:79*roof)/100)/24;
   mixer.update(0);
   for(const item of separation){
    if(!item.animated)item.object.position.copy(item.original);
    item.applied.copy(item.offset).multiplyScalar(explode/100);
    item.object.position.add(item.applied);
   }
   for(const object of roofs)object.visible=!detachLowerRoofs||object.userData.module==='dining';
   for(const object of connectors)object.visible=showConnectors;
  },
  dispose(){mixer.stopAllAction();mixer.uncacheRoot(model);}
 };
}
