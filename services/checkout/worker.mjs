const APP='parametric-space';
const MAX_QUANTITY=10;
export function validateItems(items,catalog){
 if(!Array.isArray(items)||!items.length||items.length>20)throw Error('Choose between 1 and 20 items.');
 const found=new Set();
 return items.map(item=>{
  if(!item||typeof item.id!=='string'||!Object.hasOwn(catalog,item.id)||found.has(item.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>MAX_QUANTITY)throw Error('An item or quantity is invalid.');
  found.add(item.id);const p=catalog[item.id];
  if(p.available!==true||!/^price_[A-Za-z0-9]+$/.test(p.stripePriceId)||!Number.isSafeInteger(p.unitAmount)||p.unitAmount<0||!/^[a-z]{3}$/.test(p.currency))throw Error('An item is unavailable.');
  return {id:item.id,quantity:item.quantity,...p};
 });
}
async function readBody(request){
 const reader=request.body?.getReader();if(!reader)throw Error('Missing request');let bytes=0;const parts=[];
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>12000){await reader.cancel();throw Error('Request too large');}parts.push(value);}
 const data=new Uint8Array(bytes);let offset=0;for(const p of parts){data.set(p,offset);offset+=p.length;}return JSON.parse(new TextDecoder().decode(data));
}
export async function handle(request,env,transport=fetch){
 const url=new URL(request.url),origin=request.headers.get('Origin');const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim());
 const headers={'Cache-Control':'no-store','Vary':'Origin'};if(origin&&allowed.includes(origin))headers['Access-Control-Allow-Origin']=origin;
 const reply=(data,status=200)=>Response.json(data,{status,headers});
 if(!origin||!allowed.includes(origin))return reply({error:'Origin not allowed'},403);
 if(!['/checkout','/session'].includes(url.pathname))return reply({error:'Not found'},404);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, GET','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'}});
 if((url.pathname==='/checkout'&&request.method!=='POST')||(url.pathname==='/session'&&request.method!=='GET'))return reply({error:'Method not allowed'},405);
 if(!env.STRIPE_SECRET_KEY||!env.CHECKOUT_RATE_LIMITER)return reply({error:'Checkout is not available yet.'},503);
 const live=env.STRIPE_SECRET_KEY.startsWith('sk_live_')||env.STRIPE_SECRET_KEY.startsWith('rk_live_');
 if(live&&env.LIVE_CHECKOUT_ENABLED!=='true')return reply({error:'Live checkout is not enabled.'},503);
 try{
  const ip=request.headers.get('CF-Connecting-IP');if(!ip)return reply({error:'Unable to verify request'},400);
  if(!(await env.CHECKOUT_RATE_LIMITER.limit({key:ip})).success)return reply({error:'Too many requests. Please try again shortly.'},429);
  const site=new URL(env.SITE_URL);if(site.protocol!=='https:'||!allowed.includes(site.origin))return reply({error:'Checkout is not available yet.'},503);
  async function stripe(path,options={}){const r=await transport('https://api.stripe.com/v1/'+path,{...options,headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY,...options.headers},signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Stripe request failed');return r.json();}
  if(url.pathname==='/session'){
   const id=url.searchParams.get('session_id');if(!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(id||''))return reply({error:'Invalid session'},400);
   const session=await stripe('checkout/sessions/'+encodeURIComponent(id));if(session.metadata?.site!==APP)return reply({error:'Session not found'},404);
   return reply({paymentStatus:session.payment_status,testMode:!session.livemode});
  }
  if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return reply({error:'Expected JSON'},415);
  let data,items;const catalog=JSON.parse(env.PRICE_CATALOG_JSON||'{}');
  if(!Object.keys(catalog).length)return reply({error:'The shop is not open yet.'},503);
  try{data=await readBody(request);if(!data||typeof data!=='object'||!/^[-a-f0-9]{36}$/i.test(data.requestId||''))throw Error('Invalid request');items=validateItems(data.items,catalog);}catch(e){return reply({error:e.message},400);}
  const currencies=new Set(items.map(i=>i.currency));if(currencies.size!==1)return reply({error:'Please order different currencies separately.'},400);
  // Stripe is the authoritative price source. A stale catalogue fails closed.
  for(const item of items){const price=await stripe('prices/'+item.stripePriceId);if(!price.active||price.type!=='one_time'||price.unit_amount!==item.unitAmount||price.currency!==item.currency||Boolean(price.livemode)!==live)return reply({error:'A price has changed or is unavailable. Please contact us.'},409);}
  const body=new URLSearchParams({mode:'payment',success_url:new URL('/checkout-result.html?session_id={CHECKOUT_SESSION_ID}',site).href.replace('%7B','{').replace('%7D','}'),cancel_url:new URL('/cart.html?cancelled=1',site).href,'metadata[site]':APP,'payment_intent_data[metadata][site]':APP});
  items.forEach((item,i)=>{body.set(`line_items[${i}][price]`,item.stripePriceId);body.set(`line_items[${i}][quantity]`,String(item.quantity));});
  if(env.SHIPPING_COUNTRIES){const countries=JSON.parse(env.SHIPPING_COUNTRIES);if(!Array.isArray(countries)||!countries.length||countries.some(c=>!/^[A-Z]{2}$/.test(c)))throw Error('Shipping configuration invalid');countries.forEach((c,i)=>body.set(`shipping_address_collection[allowed_countries][${i}]`,c));}
  const result=await stripe('checkout/sessions',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':APP+'/'+data.requestId},body});
  const dest=new URL(result.url);if(dest.protocol!=='https:'||dest.hostname!=='checkout.stripe.com')throw Error('Invalid checkout URL');
  return reply({url:result.url,sessionId:result.id});
 }catch{return reply({error:'Checkout could not be started. Please try again.'},502);}
}
export default {fetch(request,env){return handle(request,env);}};
