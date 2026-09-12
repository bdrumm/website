const reviewURL=new URL('../reviews/baguette-v3/index.html',import.meta.url);
const assetURL=path=>new URL(path,reviewURL).href;

export async function buildBaguetteProject(container,project){
 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('../baguette.css?v=features-1',import.meta.url).href;document.head.append(sheet);
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
  const galleryHeading=document.createElement('h2');galleryHeading.className='baguette-gallery-heading';galleryHeading.textContent='The details, up close.';
  experience.replaceChildren(heading,viewer,info,galleryHeading,gallery);
  document.querySelector('meta[name="description"]')?.setAttribute('content',project.description?.[0]||project.summary);
  const revisionQuery=new URL(review.querySelector('script[src*="review.js"]').getAttribute('src'),reviewURL).search;
  const modelURL=assetURL('baguette-v3.glb'+revisionQuery);
  const [model,{mountBaguetteViewer}]=await Promise.all([fetch(modelURL,{cache:'no-cache'}),import('../assets/baguette-viewer.js?v=6c97fd3f5c')]);
  if(!model.ok)throw Error('Model unavailable');
  await mountBaguetteViewer(viewer,await model.arrayBuffer());
 }catch{
  const status=experience.querySelector('[data-status]')||loading;status.textContent='The interactive preview could not load. Open the working preview, or explore the rendered views below.';
  const link=document.createElement('a');link.className='secondary-button';link.href=reviewURL.href;link.textContent='Open the working preview →';experience.append(link);
 }
}
