import {buildGarageProject} from './src/garage-project.js?v=c657ac64c0';
import {buildStationStory} from './src/station-story.js?v=seamless-1';
import {normalizeCart,cartTotal,money,MAX_QUANTITY} from './shop-core.mjs';
const {projects=[],checkoutEndpoint=''}=window.PARAMETRIC_SHOP||{};
const KEY='parametric-space-cart-v1';
let cart=[];try{cart=normalizeCart(JSON.parse(localStorage.getItem(KEY)||'[]'),projects);}catch{}
const root=document.getElementById('shop-content');
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function link(text,href,cls){const a=el('a',text,cls);a.href=href;return a;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart));}catch{}updateCount();}
function updateCount(){document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=cart.reduce((n,i)=>n+i.quantity,0));}
function image(p){if(!p.image)return null;const i=el('img');i.src=p.image;i.alt=p.imageAlt||p.title;i.className='project-image';return i;}
function shopLink(p){if(!p.shopUrl)return null;try{const u=new URL(p.shopUrl);if(u.protocol!=='https:')return null;return link('Visit shop ↗',u.href,'secondary-button');}catch{return null;}}
function projectHref(id){return 'project.html?id='+encodeURIComponent(id);}
function empty(title,copy){const box=el('div',undefined,'empty-state');box.append(el('h2',title),el('p',copy));root.append(box);}
function add(p){cart=normalizeCart([...cart,{id:p.id,quantity:1}],projects);save();document.getElementById('shop-status').textContent=`${p.title} added to your cart.`;}
function catalogue(){
 if(!projects.length){empty('Projects are on their way.','Get in touch to discuss a project.');root.append(link('Get in touch →','index.html#contact-title','secondary-button'));return;}
 const grid=el('div',undefined,'project-grid');
 for(const [index,p] of projects.entries()){
  const card=el('article',undefined,'project-card');card.dataset.projectId=p.id;
  if(p.modelUrl){
   const preview=el('div',undefined,'catalogue-model');card.append(preview);
   const isGarage=p.experience==='garage';
   const modelUrl=p.previewModelUrl||p.modelUrl;
   const options=isGarage?{cameraPosition:[8,5,12]}:{};
   import('./assets/model-viewer.js?v=25ddd9c98a')
    .then(({mountModelViewer})=>mountModelViewer(preview,modelUrl,p.title,isGarage?'':p.action,options))
    .catch(()=>preview.append(el('p','Open the project to explore the model.')));
  }else{const visual=image(p);if(visual)card.append(visual);}
  card.append(el('span','PROJECT / '+String(index+1).padStart(2,'0'),'section-number'),el('h2',p.title),el('p',p.summary));
  card.append(link('Explore project →',projectHref(p.id),'secondary-button'));grid.append(card);
 }
 root.append(grid);
}
function detail(){const p=projects.find(p=>p.id===({arowana:'trout'}[new URLSearchParams(location.search).get('id')]||new URLSearchParams(location.search).get('id')));if(!p){empty('Project not found.','Choose a project from the project list.');root.append(link('All projects →','projects.html','secondary-button'));return;}
 document.title=p.title+' — Parametric Space';document.getElementById('page-heading').textContent=p.title;document.getElementById('page-intro').textContent=p.summary||'';
 root.append(link('← All projects','projects.html','secondary-button category-back'));
 const content=el('div',undefined,'project-detail');const visual=image(p);
 if(p.id==='station'){root.append(content);import('./src/station-project.js?v=ba39a3a338').then(({buildStationProject})=>buildStationProject(root,content,p)).catch(()=>content.append(el('p','The Station viewer is unavailable. Please reload to try again.')));return;}
 if(p.experience==='radar'){document.documentElement.classList.add('radar-project-page');import('./src/radar-project.js?v=csi-schematics-1').then(({buildRadarProject})=>buildRadarProject(content,p)).catch(()=>{content.textContent='The simulation could not load. Please reload the page.';});root.append(content);document.querySelector('meta[name="description"]')?.setAttribute('content',p.summary);return;}
 if(p.experience==='garage'){content.classList.add('has-model','garage-detail');buildGarageProject(content,p);root.append(content);document.querySelector('meta[name="description"]')?.setAttribute('content',p.summary);return;}
 if(p.modelUrl){
  content.classList.add('has-model');
  const viewer=el('section',undefined,'model-viewer');viewer.setAttribute('aria-label',p.title+' interactive 3D print model');viewer.append(el('span',p.category||'3D PRINT','section-number'));if(p.id==='station')buildStationStory(content,viewer);else content.append(viewer);
  import('./assets/model-viewer.js?v=25ddd9c98a').then(({mountModelViewer})=>mountModelViewer(viewer,p.modelUrl,p.title,p.action)).catch(()=>viewer.append(el('p','The 3D viewer is unavailable. Try reloading, or download the model below.')));
 }else if(visual)content.append(visual);
 const info=el('div');for(const paragraph of p.description||[])info.append(el('p',paragraph));
 if(p.available){info.append(el('p',money(p.unitAmount,p.currency),'project-price'));const button=el('button','Add to cart →','send-button');button.type='button';button.addEventListener('click',()=>add(p));info.append(button,link('View cart','cart.html','secondary-button'));}else info.append(el('p','Not currently available to purchase.','muted'));
 if(p.modelUrl){info.prepend(el('h2',p.section==='hardware'?'Station OS, within reach.':'The finished form'));info.append(link(p.section==='hardware'?'Download device model ↗':'Download colored model ↗',p.modelUrl,'secondary-button'),link('Enquire about this project →','mailto:info@parametric.space?subject='+encodeURIComponent(p.title+' enquiry'),'secondary-button'));}
 const shop=shopLink(p);if(shop)info.append(shop);content.append(info);root.append(content);
 if(p.features&&p.id!=='station'){const features=el('section',undefined,'hardware-features');features.setAttribute('aria-label','Station features');for(const [title,copy] of p.features){const card=el('article');card.append(el('h2',title),el('p',copy));features.append(card);}root.append(features);}
 if(p.specs){const specs=el('section',undefined,'hardware-specs');specs.append(el('h2','Inside Station'));const list=el('dl');for(const [name,value] of p.specs){const row=el('div');row.append(el('dt',name),el('dd',value));list.append(row);}specs.append(list);root.append(specs);}

}
function renderCart(){root.replaceChildren();if(!cart.length){empty('Your cart is empty.','Explore the projects to find something you like.');root.append(link('Explore projects →','projects.html','secondary-button'));return;}
 const list=el('div',undefined,'cart-list');
 for(const item of cart){const p=projects.find(p=>p.id===item.id);const row=el('article',undefined,'cart-row');const info=el('div');info.append(link(p.title,projectHref(p.id)),el('p',money(p.unitAmount,p.currency)+' each','muted'));
 const controls=el('div',undefined,'quantity-controls');const label=el('label','Quantity');const input=el('input');input.type='number';input.min='1';input.max=String(MAX_QUANTITY);input.step='1';input.value=item.quantity;input.setAttribute('aria-label',`Quantity for ${p.title}`);input.addEventListener('change',()=>{const n=Number(input.value);if(!Number.isInteger(n)||n<1||n>MAX_QUANTITY){input.value=item.quantity;return;}item.quantity=n;save();renderCart();});label.append(input);
 const remove=el('button','Remove','text-button');remove.type='button';remove.setAttribute('aria-label',`Remove ${p.title}`);remove.addEventListener('click',()=>{cart=cart.filter(i=>i.id!==item.id);save();renderCart();});controls.append(label,remove);row.append(info,controls,el('strong',money(p.unitAmount*item.quantity,p.currency)));list.append(row);}root.append(list);
 try{const total=cartTotal(cart,projects);const summary=el('div',undefined,'cart-summary');summary.append(el('span','Subtotal'),el('strong',money(total.amount,total.currency)));root.append(summary);}catch(e){root.append(el('p',e.message));return;}
 root.append(el('p','Final total is shown at checkout.','muted'));
 const button=el('button',checkoutEndpoint?'Continue to Stripe →':'Checkout coming soon','send-button checkout-button');button.disabled=!checkoutEndpoint;button.addEventListener('click',async()=>{
  button.disabled=true;button.textContent='Opening secure checkout…';const status=document.getElementById('shop-status');status.textContent='';
  try{const u=new URL(checkoutEndpoint);if(u.protocol!=='https:')throw Error('Checkout is unavailable.');const body={items:cart,requestId:crypto.randomUUID()};
   const r=await fetch(u.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});const result=await r.json();if(!r.ok)throw Error(result.error||'Could not start checkout.');const dest=new URL(result.url);if(dest.protocol!=='https:'||dest.hostname!=='checkout.stripe.com')throw Error('Checkout is unavailable.');try{sessionStorage.setItem('parametric-space-checkout',JSON.stringify({sessionId:result.sessionId,items:cart}));}catch{}window.location.assign(dest.href);
  }catch(e){status.textContent=e.message||'Could not start checkout. Please try again.';button.disabled=false;button.textContent='Continue to Stripe →';}
 });root.append(button,link('Continue browsing','projects.html','secondary-button'));
 if(new URLSearchParams(location.search).has('cancelled'))document.getElementById('shop-status').textContent='Checkout was cancelled. Your cart is still here.';
}
async function result(){const id=new URLSearchParams(location.search).get('session_id');if(!id||!checkoutEndpoint){empty('Payment could not be verified.','Please check your Stripe receipt or contact info@parametric.space.');return;}
 empty('Checking your payment…','Please keep this page open.');
 try{const u=new URL(checkoutEndpoint);u.pathname='/session';u.search='?session_id='+encodeURIComponent(id);const r=await fetch(u,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const d=await r.json();root.replaceChildren();if(d.paymentStatus==='paid'||d.paymentStatus==='no_payment_required'){try{const previous=JSON.parse(sessionStorage.getItem('parametric-space-checkout')||'null');if(previous?.sessionId===id){cart=normalizeCart(cart.map(item=>({id:item.id,quantity:item.quantity-(previous.items.find(p=>p.id===item.id)?.quantity||0)})),projects);save();sessionStorage.removeItem('parametric-space-checkout');}}catch{}empty(d.testMode?'Test checkout completed.':'Payment received.','Keep your receipt for your records. For project questions, contact info@parametric.space.');}else empty('Payment is not confirmed yet.','Check your Stripe receipt before trying another payment.');root.append(link('Back to projects →','projects.html','secondary-button'));}catch{root.replaceChildren();empty('Payment could not be verified.','Check your Stripe receipt or contact info@parametric.space before trying again.');}
}
updateCount();document.getElementById('year').textContent=new Date().getFullYear();
const page=document.body.dataset.page;if(page==='projects')catalogue();else if(page==='project')detail();else if(page==='cart')renderCart();else if(page==='result')result();
