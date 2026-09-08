export const MAX_QUANTITY = 10;
export function normalizeCart(input, projects) {
  if(!Array.isArray(input)) return [];
  const valid=new Map(projects.filter(p=>p.available===true).map(p=>[p.id,p]));
  const quantities=new Map();
  for(const item of input){
    if(!item || !valid.has(item.id) || !Number.isInteger(item.quantity) || item.quantity<1)continue;
    quantities.set(item.id,Math.min(MAX_QUANTITY,(quantities.get(item.id)||0)+item.quantity));
  }
  return [...quantities].map(([id,quantity])=>({id,quantity}));
}
export function cartTotal(cart,projects){
 const byId=new Map(projects.map(p=>[p.id,p]));
 const currencies=new Set(cart.map(item=>byId.get(item.id)?.currency));
 if(currencies.size>1)throw Error('Items use different currencies. Please order them separately.');
 let amount=0;for(const item of cart){const price=byId.get(item.id)?.unitAmount;if(!Number.isSafeInteger(price)||price<0)throw Error('This item is not available for checkout.');amount+=price*item.quantity;}
 if(!Number.isSafeInteger(amount))throw Error('Invalid total');
 return {amount,currency:[...currencies][0]||'USD'};
}
export function money(amount,currency){return new Intl.NumberFormat('en-US',{style:'currency',currency}).format(amount/100);}
