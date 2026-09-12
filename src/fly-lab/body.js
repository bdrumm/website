const LEGS=['L1','R1','L2','R2','L3','R3'],ROOTS={1:[1.6876,1.6384,.5852],2:[.3968,1.21,.6748],3:[-.2556,1.2744,.5376]},clone=structuredClone;
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),norm=a=>Math.hypot(...a),clip=(v,a,b)=>Math.max(a,Math.min(b,v));
function inverse(root,target,side){let delta=sub(target,root),distance=norm(delta);if(distance<1e-8){delta=[0,-1,side];distance=norm(delta);}const unit=delta.map(v=>v/distance);distance=clip(distance,.101,3.699);const foot=root.map((v,i)=>v+unit[i]*distance),along=(1.8**2-1.9**2+distance**2)/(2*distance);let pole=[0,1,side];const d=dot(pole,unit);pole=pole.map((v,i)=>v-unit[i]*d);if(norm(pole)<1e-8)pole=[0,unit[2],-unit[1]];const pn=norm(pole);pole=pole.map(v=>v/pn);const joint=root.map((v,i)=>v+unit[i]*along+pole[i]*Math.sqrt(Math.max(0,1.8**2-along**2)));return {root,joint,foot,upper_length:1.8,lower_length:1.9,target_error:norm(sub(foot,target))};}
function pose(c,task,action){
 if(task==='website')action=({forward:'click',reverse:'back',focus_previous:'turn_left',focus_next:'turn_right'})[action]||action;
 const seated=['bus','arcade','website'].includes(task)||c.torso_locked,angle=(action==='turn_right'?20:action==='turn_left'?-20:0)*Math.PI/180,joints={};
 for(const name of LEGS){const side=name[0]==='L'?1:-1,index=Number(name[1])-1,[x,y,z]=ROOTS[name[1]],root=[x,y,side*z];let target=[x-.4,.12,side*2.7];
  if(seated&&index===0)target=task==='bus'?[4.5,2.5+side*1.55*Math.sin(angle),side*1.55*Math.cos(angle)]:[3.8,action===(side===1?'turn_left':'turn_right')?1.2:1.7,side*1.55];
  if(seated&&task==='bus'&&name==='L2')target=[1.9,action==='reverse'?.9:1.4,2.3];
  if(seated&&task==='website'&&name==='L2')target=[1.9,action==='back'?.9:1.4,2.3];
  if(seated&&task==='website'&&['L3','R3'].includes(name))target=[.5,action===(name==='L3'?'scroll_up':'scroll_down')?.12:.65,side*2.7];
  if(seated&&name==='R2')target=[2.4,['forward','reverse','click'].includes(action)||(task==='bus'&&action.startsWith('turn_'))?.12:.65,-2.3];
  if(!seated&&action!=='rest')target=[(side===1)===(action==='turn_left')?x+.3:x-.7,.2,side*2.7];
  if(!c.allowed_legs.includes(name))target=[x-.4,.12,side*2.7];
  joints[name]={...inverse(root,target,side),enabled:c.allowed_legs.includes(name)};
 }return {seated,joints,steering_degrees:task==='bus'?angle*180/Math.PI:0,gear:action==='reverse'?'reverse':action==='rest'?'neutral':'forward',pedal:['forward','reverse','click'].includes(action)||(task==='bus'&&action.startsWith('turn_')),panel_button:['turn_left','turn_right','back','scroll_up','scroll_down','click'].includes(action)?action:null};
}
export function bodySnapshot(config,definitions,action='rest',apply=false){
 const task=config.task==='super'?'bus':config.task,r=config.restraint,preset=r.preset||'auto',resolved=preset==='auto'?(task==='bus'?'bus_harness':['arcade','website'].includes(task)?'operator_chair':'free'):preset;
 if(!definitions[resolved])throw Error('Unknown body restraint preset.');
 const c={...clone(definitions[resolved]),...clone(r),preset,resolved_preset:resolved};let required=[],reason=null;
 if(task==='arena')required=action==='rest'?[]:LEGS;
 else if(task==='website')required=({turn_left:['L1'],focus_previous:['L1'],turn_right:['R1'],focus_next:['R1'],forward:['R2'],click:['R2'],reverse:['L2'],back:['L2'],scroll_up:['L3'],scroll_down:['R3'],rest:[]})[action]||[];
 else required=({turn_left:task==='bus'?['L1','R1','R2']:['L1'],turn_right:task==='bus'?['L1','R1','R2']:['R1'],forward:['R2'],reverse:task==='bus'?['L2','R2']:[],rest:[]})[action]||[];
 if(required.some(leg=>!c.allowed_legs.includes(leg)))reason='Required leg is restrained';
 if(action==='reverse'&&!['bus','website'].includes(task))reason='Reverse gear is only available in the bus scenario; website stages use it for Back';
 if(['click','back','focus_previous','focus_next','scroll_up','scroll_down'].includes(action)&&task!=='website')reason='This browser control is only available in website scenarios';
 if(task==='arena'&&c.torso_locked&&action!=='rest')reason='Torso is fixed; walking cannot displace the body';
 let effective=reason?'rest':action,p=pose(c,task,effective),neutral=pose(c,task,'rest'),excursion=0;
 if(apply){const angle=(a,b)=>Math.acos(clip(dot(a,b)/norm(a)/norm(b),-1,1))*180/Math.PI;
  for(const leg of required){const j=p.joints[leg],n=neutral.joints[leg],u=sub(j.joint,j.root),l=sub(j.foot,j.joint),nu=sub(n.joint,n.root),nl=sub(n.foot,n.joint),hip=angle(u,nu),knee=Math.abs(angle(u.map(v=>-v),l)-angle(nu.map(v=>-v),nl));j.hip_excursion_degrees=hip;j.knee_excursion_degrees=knee;excursion=Math.max(excursion,hip,knee);}
  if(excursion>c.joint_limit+1e-6&&!reason){reason='Joint excursion exceeds the preset limit';effective='rest';p=neutral;}
  p.requested_excursion_degrees=excursion;
  if(required.some(leg=>p.joints[leg].target_error>.08)&&!reason){reason="Control is outside the leg's reachable workspace";effective='rest';p=pose(c,task,'rest');}
 }
 return {constraints:c,task,requested_action:action,effective_action:effective,blocked:!!reason,reason,pose:p,motor_response:{enabled:false,legs:{},wings:{}}};
}
