const reviewURL=new URL('../reviews/baguette-v3/index.html',import.meta.url);
const assetURL=path=>new URL(path,reviewURL).href;

const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node;};

// Match the current review's feature copy to its own CAD photos.
const featureViews=[
 {match:/shell/i,images:['closed','open'],labels:['Closed','Open'],view:'overall'},
 {match:/hinge/i,images:['hinge','rear','hinge-mid','hinge-closed','hinge-section'],labels:['Open','Rear edge','50°','Closed','Section'],view:'hinge'},
 {match:/latch/i,images:['latch','latch-under','latch-bevel','catch','slice-latches'],labels:['Grip','Underside','45° bevel','Section','Print layers'],view:'latch'},
 {match:/snap joint/i,images:['joint','joint-section'],labels:['Joint','Section'],view:'joint'},
 {match:/strap/i,images:['strap','strap-tail'],labels:['Attachment','Shell transition'],view:'strap'},
 {match:/socket/i,images:['slice-roofs','slice-walls'],labels:['Socket roofs','Wall sections'],view:'jointsection'}
];

function buildFeatures(info,gallery,viewer){
 const panel=make('section','baguette-features');panel.setAttribute('aria-label','Baguette holder features');
 const intro=make('div','baguette-section-intro');intro.append(make('span','section-number','DESIGN DETAILS'),make('h2','','The details, up close.'),make('p','','Explore each feature alongside the geometry that makes it work.'));
 panel.append(intro);
 const figures=[...gallery.querySelectorAll('figure')];
 const available=new Map(figures.map(figure=>[new URL(figure.querySelector('img').src).pathname.split('/').pop().replace(/\.jpg$/,''),figure]));
 const used=new Set();
 [...info.querySelectorAll('dl > div')].forEach((feature,index)=>{
  const title=feature.querySelector('dt')?.textContent;if(!title)return;
  const config=featureViews.find(item=>item.match.test(title));
  const row=make('article','baguette-feature-row');const copy=make('div','baguette-feature-copy');
  copy.append(make('span','section-number',String(index+1).padStart(2,'0')),make('h3','',title),make('p','',feature.querySelector('dd')?.textContent));
  if(config){
   const inspect=make('button','baguette-text-button','Inspect in 3D ↗');inspect.type='button';
   inspect.addEventListener('click',()=>{viewer.querySelector(`[data-view="${config.view}"]`)?.click();viewer.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});viewer.querySelector('canvas')?.focus({preventScroll:true});});copy.append(inspect);
  }
  const photos=make('div','baguette-feature-photos');photos.setAttribute('aria-label',title+' rendered views');
  const choices=make('div','baguette-photo-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label',title+' photos');
  const matches=(config?.images||[]).map((key,i)=>({key,figure:available.get(key),label:config.labels[i]})).filter(item=>item.figure);
  matches.forEach(({key,figure,label},i)=>{
   used.add(figure);figure.hidden=i!==0;figure.id=`baguette-photo-${key}`;
   figure.querySelector('img').decoding='async';photos.append(figure);
   const button=make('button','',label);button.type='button';button.setAttribute('aria-pressed',String(i===0));button.setAttribute('aria-controls',figure.id);
   button.addEventListener('click',()=>{for(const item of matches)item.figure.hidden=item.figure!==figure;for(const sibling of choices.children)sibling.setAttribute('aria-pressed',String(sibling===button));});choices.append(button);
  });
  if(matches.length>1)photos.append(choices);row.append(copy,photos);panel.append(row);
 });
 // Keep new review renders available even if a later revision adds a feature.
 const extras=figures.filter(figure=>!used.has(figure));
 if(extras.length){const more=make('details','baguette-more-renders');more.append(make('summary','','More CAD views'));const grid=make('div','renders');grid.append(...extras);more.append(grid);panel.append(more);}
 const downloads=info.querySelector('.downloads');if(downloads){const files=make('section','baguette-project-files');files.append(make('h3','','Make it yours.'),make('p','','Explore the printable parts, source CAD and technical notes.'),downloads);panel.append(files);}
 return panel;
}

const useCases=[
 {id:'carry',label:'01 / STRAP FUNCTIONALITY',title:'A strap. Two attachment points.',copy:'The shoulder strap pulls outward from the two projecting eyes. The case hangs beneath these tension points, with the strap clear of the shell.',alt:'Concept rendering of the ivory baguette case hanging below its two outward-projecting eyes, with taut shoulder straps clear of the shell.'},
 {id:'rain',label:'02 / RAIN',title:'For the walk home.',copy:'A closed-shell carry concept for a drizzly trip from the bakery. Weather resistance is still to be tested.',alt:'Model-based concept of the closed baguette holder on a shoulder strap during a rainy walk.'},
 {id:'picnic',label:'03 / PICNIC',title:'Unclip. Open. Share.',copy:'Set it down on the blanket and open the hinged lid. The smooth interior leaves room for one very good baguette.',alt:'Concept rendering of the open baguette case holding bread on a linen picnic blanket.'},
 {id:'travel',label:'04 / TRAVEL',title:'A little room for the journey.',copy:'From the bakery to the train, keep your baguette in its own contoured case. Unshoulder the strap when it is time to settle in.',alt:'Concept rendering of the closed baguette case and its loose carry strap on a train table.'},
 {id:'backpacking',label:'05 / BACKPACKING',title:'Bread beyond the city.',copy:'Wear the strap over your shoulder and let the case hang at your side. Both ends pull from the projecting eyes, leaving your backpack free for the rest.',alt:'Concept rendering of a hiker carrying the baguette case at their hip on a shoulder strap, suspended from its two outer eyes.'}
];

function buildUseCases(){
 const panel=make('section','baguette-use-cases');panel.setAttribute('aria-label','Baguette holder use cases');
 const intro=make('div','baguette-section-intro');intro.append(make('span','section-number','OUT IN THE WORLD'),make('h2','','Made to come along.'),make('p','','From the morning bakery run to a weekend outside.'));
 const note=make('p','baguette-concept-note','Model-based concept renderings · Carry straps shown as accessories.');intro.append(note);panel.append(intro);
 const grid=make('div','baguette-use-case-grid');
 for(const scene of useCases){
  const card=make('article','baguette-use-case'+(scene.id==='carry'?' baguette-use-case-lead':''));
  const figure=make('figure');const img=make('img');img.src=new URL(`../assets/baguette-use-cases/${scene.id}.jpg?v=shoulder-20260912`,import.meta.url).href;img.alt=scene.alt;img.width=1536;img.height=1024;img.loading=scene.id==='carry'?'eager':'lazy';img.decoding='async';figure.append(img);
  const copy=make('div','baguette-use-case-copy');copy.append(make('span','section-number',scene.label),make('h3','',scene.title),make('p','',scene.copy));
  card.append(figure,copy);grid.append(card);
 }
 panel.append(grid);return panel;
}

export async function buildBaguetteProject(container,project){
 document.documentElement.classList.add('baguette-project-page');
 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('../baguette.css?v=79ff1e0f93',import.meta.url).href;document.head.append(sheet);
 const experience=document.createElement('section');experience.className='baguette-experience';experience.setAttribute('aria-label','Baguette holder design and interactive preview');container.append(experience);
 const loading=document.createElement('p');loading.className='baguette-loading';loading.textContent='Preparing the working model…';loading.setAttribute('role','status');experience.append(loading);
 try{
  // Reuse the working preview's controls, review text, renders and download URLs.
  // Fetching its HTML keeps the project page aligned when that review is revised.
  const response=await fetch(reviewURL,{cache:'no-cache'});if(!response.ok)throw Error('Review unavailable');
  const review=new DOMParser().parseFromString(await response.text(),'text/html');
  const originalViewer=review.querySelector('#baguette-v3-web'),details=review.querySelector('.review-layout'),renders=review.querySelector('.renders');
  if(!originalViewer||!details||!renders)throw Error('Review content unavailable');
  const copy=original=>{
   const node=document.importNode(original,true);
   for(const element of node.querySelectorAll('[src],[href]'))for(const attribute of ['src','href'])if(element.hasAttribute(attribute))element.setAttribute(attribute,assetURL(element.getAttribute(attribute)));
   return node;
  };
  const heading=document.createElement('div');heading.className='baguette-review-heading';
  const revision=document.createElement('span');revision.className='section-number';revision.textContent=review.querySelector('.eyebrow')?.textContent||'WORKING DESIGN';
  const note=document.createElement('span');note.className='prototype';note.textContent=review.querySelector('.prototype')?.textContent||'Engineering prototype';heading.append(revision,note);
  const viewer=copy(originalViewer),info=copy(details),gallery=copy(renders);
  const hint=document.createElement('p');hint.className='baguette-gesture-hint';hint.textContent='Drag to rotate · Scroll to move the page';viewer.querySelector('[data-model-stage]').after(hint);
  experience.replaceChildren(heading,viewer,buildUseCases(),buildFeatures(info,gallery,viewer));
  document.querySelector('meta[name="description"]')?.setAttribute('content',project.description?.[0]||project.summary);
  const revisionQuery=new URL(review.querySelector('script[src*="review.js"]').getAttribute('src'),reviewURL).search;
  const modelURL=assetURL('baguette-v3.glb'+revisionQuery);
  const [model,{mountBaguetteViewer}]=await Promise.all([fetch(modelURL,{cache:'no-cache'}),import('../assets/baguette-viewer.js'+revisionQuery)]);
  if(!model.ok)throw Error('Model unavailable');
  await mountBaguetteViewer(viewer,await model.arrayBuffer());
 }catch{
  const status=experience.querySelector('[data-status]')||loading;status.textContent='The interactive preview could not load. Open the working preview, or explore the rendered views below.';
  const link=document.createElement('a');link.className='secondary-button';link.href=reviewURL.href;link.textContent='Open the working preview →';experience.append(link);
 }
}
