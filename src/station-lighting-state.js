// Sample rooms only. The browser demo never sends commands to a real home.
export function createLightingState(){return {roomIndex:0,detail:null,rooms:[
 {name:'Living room',lights:[{name:'Ceiling',level:100},{name:'Floor lamp',level:65},{name:'Wall light',level:40}]},
 {name:'Kitchen',lights:[{name:'Pendant',level:80},{name:'Counter',level:60},{name:'Ceiling',level:0}]}
]};}
export function currentRoom(state){return state.rooms[state.roomIndex];}
export function allLightsOff(state){return state.rooms.every(room=>room.lights.every(light=>light.level===0));}
export function applyLightingAction(state,action){
 const room=currentRoom(state);
 if(action.type==='all-off'){for(const r of state.rooms)for(const light of r.lights)light.level=0;state.detail=null;return 'All lights are off.';}
 if(action.type==='room-off'){for(const light of room.lights)light.level=0;state.detail=null;return `${room.name}: all lights off.`;}
 if(action.type==='next-room'){state.roomIndex=(state.roomIndex+1)%state.rooms.length;state.detail=null;return currentRoom(state).name;}
 if(action.type==='open-light'){if(action.index!==-1&&!room.lights[action.index])return '';state.detail=action.index;return action.index===-1?`${room.name}: all lights.`:room.lights[action.index].name;}
 if(action.type==='back'){state.detail=null;return room.name;}
 if(action.type==='brightness'){
  if(state.detail===null||!Number.isFinite(action.level))return '';
  const level=Math.max(0,Math.min(100,Math.round(action.level)));
  const lights=state.detail===-1?room.lights:[room.lights[state.detail]];
  for(const light of lights)light.level=level;
  return `${state.detail===-1?room.name:lights[0].name}: ${level===0?'off':level+'% brightness'}.`;
 }
 return '';
}
export function applyLightingDemo(state,app,id){
 state.detail=null;
 if(app==='rooms'){
  state.roomIndex=0;
  currentRoom(state).lights.forEach((light,i)=>{light.level=id==='off'?0:id==='dimmed'?40:[100,65,40][i];});
 }
 if(app==='scene'){
  if(id==='done')applyLightingAction(state,{type:'all-off'});
  else for(const room of state.rooms)for(const light of room.lights)light.level=id==='running'?30:75;
 }
}
