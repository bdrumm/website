export const BAGUETTE_SIZES=Object.freeze([
 {id:'pro-max',name:'Pro Max',label:'Full-length carry',description:'The original long case. From a full baguette to a picnic kit.',scale:1,current:true},
 {id:'pro',name:'Pro',label:'Everyday carry',description:'A shorter size concept for daily essentials and smaller loaves.',scale:.72},
 {id:'mini',name:'Mini',label:'Just the essentials',description:'A compact purse concept for keys, cards and little necessities.',scale:.44}
]);

export function normalizeOptions(value={}){
 return Object.freeze({size:BAGUETTE_SIZES.some(size=>size.id===value?.size)?value.size:'pro-max',expansions:[0,1,2].includes(Number(value?.expansions))?Number(value.expansions):0,cards:value?.cards===true||value?.cards==='1',bottle:value?.bottle===true||value?.bottle==='1'});
}

export function readOptions(params,saved={}){
 const read=(key,fallback)=>params.has(key)?params.get(key):fallback;
 return normalizeOptions({size:read('size',saved?.size),expansions:read('expand',saved?.expansions),cards:read('cards',saved?.cards),bottle:read('bottle',saved?.bottle)});
}

export function writeOptions(params,options){
 params.set('size',options.size);
 for(const [key,value] of [['expand',options.expansions],['cards',options.cards?1:0],['bottle',options.bottle?1:0]])params.set(key,String(value));
 return params;
}

export function describeOptions(options){
 const size=BAGUETTE_SIZES.find(size=>size.id===options.size)||BAGUETTE_SIZES[0];
 return [size.name,options.expansions?`${options.expansions} expansion${options.expansions===1?'':'s'}`:null,options.cards?'Credit card holder':null,options.bottle?'Bottle holder':null].filter(Boolean).join(' · ');
}

export function createOptionsStore(initial){
 let value=normalizeOptions(initial);const listeners=new Set();
 return {get value(){return value;},set(patch){const next=normalizeOptions({...value,...patch});if(Object.keys(next).every(key=>next[key]===value[key]))return;value=next;for(const listener of listeners)listener(value);},subscribe(listener){listeners.add(listener);listener(value);return()=>listeners.delete(listener);}};
}
