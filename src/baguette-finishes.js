export const BAGUETTE_FINISHES=Object.freeze([
 {id:'ivory',name:'Ivory',color:'#ded5c3'},
 {id:'graphite',name:'Graphite',color:'#353a40'},
 {id:'forest',name:'Forest',color:'#526952'},
 {id:'clay',name:'Clay',color:'#b96d50'},
 {id:'cobalt',name:'Cobalt',color:'#375ca4'}
]);

export function createFinishStore(initial='ivory'){
 let finish=BAGUETTE_FINISHES.find(item=>item.id===initial)||BAGUETTE_FINISHES[0];
 const listeners=new Set();
 return {get value(){return finish;},set(id){const next=BAGUETTE_FINISHES.find(item=>item.id===id);if(!next||next===finish)return;finish=next;for(const listener of listeners)listener(finish);},subscribe(listener){listeners.add(listener);listener(finish);return()=>listeners.delete(listener);}};
}
