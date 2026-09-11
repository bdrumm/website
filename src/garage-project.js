import {GARAGE_DEFAULT_VIEW, parseGarageView, garageViewHash} from './garage-review-state.js?v=6a18e4bd82';
import {buildGaragePrintReview} from './garage-print-review.js?v=9a175888eb';
const layouts = [
  { id: 'garage', name: 'Single garage', number: '01', modules: '1 module', image: 'revision-garage.jpg', thumbnail: 'revision-garage.jpg', copy: 'A rolling door, a folding roof, and a fully equipped workshop.' },
  { id: 'row', name: 'Side by side', number: '02', modules: '3 modules', image: 'revision-row.jpg', thumbnail: 'revision-row.jpg', copy: 'Garage, kitchen, and dining arranged along one street.' },
  { id: 'stack', name: 'Stacked', number: '03', modules: '3 modules', image: 'revision-stack.jpg', thumbnail: 'revision-stack.jpg', copy: 'The same three modules arranged on a smaller footprint.' },
];
const presets = {
  closed: { door: 0, roof: 0, explode: 0 },
  door: { door: 100, roof: 0, explode: 0 },
  roof: { door: 100, roof: 100, explode: 0 },
  exploded: { door: 0, roof: 0, explode: 100 },
};

export function buildGarageProject(container, project) {
  const experience = document.createElement('section');
  experience.className = 'garage-experience';
  experience.setAttribute('aria-label', 'Modular garage configurations and animation');
  experience.innerHTML = `
    <div class="garage-workbench">
      <section class="garage-stage" aria-label="Garage model viewer">
        <div class="garage-canvas"></div><div class="garage-print-canvas" hidden></div>
        <img class="garage-poster" src="assets/garage/revision-row.jpg" width="1600" height="1100" alt="Garage, kitchen, and dining modules arranged side by side in a studio render.">
        <div class="garage-stage-top"><span class="section-number" data-view-label>INTERACTIVE 3D</span><div class="garage-view-mode" role="group" aria-label="Viewing mode"><button type="button" data-view="3d" aria-pressed="true">3D view</button><button type="button" data-view="studio" aria-pressed="false">Studio</button><button type="button" data-view="print" aria-pressed="false">Print layout</button></div></div>
        <p class="garage-load-status" role="status" aria-live="polite">Preparing interactive model…</p>
        <div class="garage-stage-bottom"><div class="garage-caption"><span class="section-number" data-figure>FIG. 02</span><strong data-layout-name>Side by side</strong><span data-view-hint>Drag to orbit · + / − to zoom</span></div><div class="garage-camera-controls" role="group" aria-label="Camera controls"><button type="button" data-zoom="0.8" aria-label="Zoom in" title="Zoom in" disabled>+</button><button type="button" data-zoom="1.25" aria-label="Zoom out" title="Zoom out" disabled>−</button><button type="button" data-reset-camera aria-label="Reset camera" title="Reset camera">↺</button><button type="button" data-fullscreen aria-label="Expand viewer" title="Expand viewer">⛶</button></div></div>
      </section>
      <aside class="garage-controls" aria-label="Garage controls">
        <div data-assembly-controls><div class="garage-controls-title"><h2>Make it yours</h2><span class="section-number">01—03</span></div>
        <fieldset class="garage-control-section garage-layouts"><legend><span>01</span> Configuration</legend>
          ${layouts.map(l => `<label class="garage-layout-option"><input type="radio" name="garage-layout" value="${l.id}"${l.id === 'row' ? ' checked' : ''}><span class="garage-layout-number">${l.number}</span><span><strong>${l.name}</strong><small>${l.modules}</small></span></label>`).join('')}
        </fieldset>
        <fieldset class="garage-control-section"><legend><span>02</span> In motion</legend>
          <div class="garage-presets" role="group" aria-label="Model state"><button type="button" data-preset="closed" aria-pressed="false" disabled>Closed</button><button type="button" data-preset="door" aria-pressed="false" disabled>Door open</button><button type="button" data-preset="roof" aria-pressed="false" disabled>Roof open</button><button type="button" data-preset="exploded" aria-pressed="false" disabled>Exploded</button></div>
          <div class="garage-range"><div><label for="garage-door">Rolling door</label><output for="garage-door" data-door-value>45%</output></div><input id="garage-door" type="range" min="0" max="100" step="0.1" value="45" disabled><div class="garage-range-ends"><span>Closed</span><span>Open</span></div></div>
          <div class="garage-range"><div><label for="garage-roof">Folding roof</label><output for="garage-roof" data-roof-value>0%</output></div><input id="garage-roof" type="range" min="0" max="100" step="0.1" value="0" disabled></div>
          <div class="garage-roof-presets" role="group" aria-label="Roof position"><button type="button" data-roof-pose="0">Covered</button><button type="button" data-roof-pose="49.3670886076">Half open</button><button type="button" data-roof-pose="100">Folded back</button></div>
          <div class="garage-range"><div><label for="garage-explode">Separate removable parts</label><output for="garage-explode" data-explode-value>0%</output></div><input id="garage-explode" type="range" min="0" max="100" step="0.1" value="0" disabled></div>
          <p class="garage-stack-note" hidden>Lower roofs are detached in the stacked view.</p>
          <button type="button" class="garage-play" aria-pressed="false" disabled><span data-play-label>▶ Play the sequence</span><small>24 s</small></button>
        </fieldset>
        <div class="garage-control-section garage-camera-section"><label for="garage-camera">Camera view</label><select id="garage-camera"><option value="overview">Overview</option><option value="front">Front</option><option value="rear">Rear</option><option value="top">Top</option><option value="hinge">Rear hinge detail</option></select></div>
        <div class="garage-control-section garage-control-footer"><label class="garage-orbit"><span>Orbit automatically</span><input type="checkbox" data-orbit disabled></label><button type="button" class="garage-reset" data-reset-all>↺ Reset all</button></div>
        </div><div data-print-controls hidden></div>
      </aside>
    </div>
    <div class="garage-review-actions"><button type="button" data-save-image disabled>Save image</button><button type="button" data-share-view>Copy view link</button><a href="assets/garage/garage-standard-brick.3mf" download>Download print project · 3MF</a></div><p class="garage-feedback" role="status" aria-live="polite" hidden></p><input class="garage-share-fallback" aria-label="View link" readonly hidden>
    <section class="garage-configurations" aria-labelledby="garage-config-title"><div class="garage-section-heading"><div><span class="section-number">THE MODULAR SYSTEM</span><h2 id="garage-config-title">Build out. Stack up.</h2></div><p>The garage, kitchen, and dining modules share a common footprint. Explore how the original parts come together.</p></div><div class="garage-config-grid">
      ${layouts.map(l => `<button type="button" class="garage-config-card" data-configuration="${l.id}" aria-pressed="${l.id === 'row'}"><div class="garage-card-visual"><img src="assets/garage/${l.thumbnail}" width="720" height="540" alt="${l.name} configuration, rendered from the original model." loading="lazy"><span class="garage-card-number">${l.number}</span><span class="garage-card-arrow" aria-hidden="true">↗</span></div><div class="garage-card-copy"><h3>${l.name}</h3><p>${l.copy}</p></div></button>`).join('')}
    </div></section>
    <section class="garage-about" aria-labelledby="garage-about-title"><div><span class="section-number">PRINT STUDY / 003</span><h2 id="garage-about-title">A garage with room to grow.</h2><div data-project-description></div></div><div class="garage-source-note"><h3>Latest model revision</h3><p>September 11 revision: matching brick exteriors, flat-backed removable fronts, simpler roller-door hinges and improved print orientations. Each structural shell is approximately 200 × 244.4 × 130 mm.</p><p>Stacking uses the source’s 128 mm pitch, with the two lower roofs detached. The scene preserves the source’s geometry and motion; physical fit still requires test prints.</p><a class="secondary-button" data-model-download>Download display model ↗</a><p class="muted">Display geometry in GLB format. Not a sliced print file.</p></div></section>
  `;
  container.append(experience);
  const q = selector => experience.querySelector(selector);
  const qa = selector => [...experience.querySelectorAll(selector)];
  for (const paragraph of project.description || []) {
    const text = document.createElement('p'); text.textContent = paragraph; q('[data-project-description]').append(text);
  }
  q('[data-model-download]').href = project.modelUrl;
  const stage=q('.garage-stage'),canvas=q('.garage-canvas'),printCanvas=q('.garage-print-canvas'),poster=q('.garage-poster'),status=q('.garage-load-status');
  const doorInput=q('#garage-door'),roofInput=q('#garage-roof'),explodeInput=q('#garage-explode'),cameraInput=q('#garage-camera'),playButton=q('.garage-play'),orbit=q('[data-orbit]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const initial=()=>({...GARAGE_DEFAULT_VIEW,rotate:false,reset:0,visible:true});
  let state={...initial(),...parseGarageView(location.hash)},mode='3d',activePreset='',ready=false,failed=false,playing=false,configuring=false;
  let disposed=false,scene,printReview,tourFrame=0,tourTime=0,lastTime=0,inView=true;
  const intersection=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;});intersection.observe(stage);
  function message(text){const output=q('.garage-feedback');output.textContent=text;output.hidden=!text;}
  function sync(){
    const layout=layouts.find(item=>item.id===state.layout),stacked=state.layout==='stack',printing=mode==='print';
    state.visible=mode==='3d';stage.dataset.printing=String(printing);
    if(printing&&!printReview)printReview=buildGaragePrintReview(printCanvas,q('[data-print-controls]'),sync);
    printReview?.setVisible(printing);
    printCanvas.hidden=!printing;
    q('[data-assembly-controls]').hidden=printing;q('[data-print-controls]').hidden=!printing;
    const showPoster=printing?!printReview?.ready:mode==='studio'||!ready||failed;
    poster.hidden=!showPoster;canvas.classList.toggle('garage-canvas-hidden',mode!=='3d'||!ready||failed);
    const source=printing?printReview.still:`assets/garage/${layout.image}`;
    if(poster.getAttribute('src')!==source)poster.src=source;
    poster.alt=printing?'Numbered parts in their supplied print orientations on individual display tiles.':`${layout.name} configuration, rendered from the latest Blender model.`;
    q('[data-layout-name]').textContent=printing?printReview.title:layout.name;
    q('label[for="garage-door"]').textContent=state.layout==='garage'?'Rolling door':'Rolling + entry doors';
    q('[data-figure]').textContent=printing?'43 PRINTABLE PARTS':`FIG. ${layout.number}`;
    q('[data-view-label]').textContent=printing?'PRINT POSITIONS':mode==='studio'||failed?'STUDIO RENDER':'INTERACTIVE 3D';
    q('[data-view-hint]').textContent=printing?'Drag to orbit · select a part to inspect':mode==='studio'?'Cycles render · fixed studio pose':'Drag to orbit · + / − to zoom';
    qa('[data-view]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.view===mode));button.disabled=failed&&button.dataset.view==='3d';});
    qa('[name="garage-layout"]').forEach(input=>{input.checked=input.value===state.layout;});
    qa('[data-configuration]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.configuration===state.layout)));
    qa('[data-preset]').forEach(button=>{button.disabled=!ready||failed||configuring||(stacked&&button.dataset.preset==='exploded');button.setAttribute('aria-pressed',String(button.dataset.preset===activePreset));});
    qa('[data-roof-pose]').forEach(button=>{button.disabled=!ready||failed||configuring;button.setAttribute('aria-pressed',String(Math.abs(state.roof-Number(button.dataset.roofPose))<.05&&!state.explode));});
    doorInput.disabled=!ready||failed||configuring;roofInput.disabled=!ready||failed||configuring;explodeInput.disabled=!ready||failed||stacked||configuring;
    playButton.disabled=!ready||failed||configuring;playButton.setAttribute('aria-pressed',String(playing));
    q('[data-play-label]').textContent=playing?'Ⅱ Pause animation':'▶ Play the sequence';
    orbit.disabled=!ready||failed||configuring||mode!=='3d';orbit.checked=state.rotate;
    cameraInput.disabled=!ready||failed;cameraInput.value=state.camera;
    q('.garage-stack-note').hidden=!stacked;
    const cameraReady=printing?printReview?.ready:ready&&!failed&&mode==='3d';
    qa('[data-zoom], [data-reset-camera], [data-save-image]').forEach(button=>{button.disabled=!cameraReady;});
    q('[data-share-view]').hidden=printing;
    status.textContent=printing?(printReview.error?'Some print-view content could not load. Available part notes and rendered views remain below.':!printReview.ready?'Loading print positions…':''):failed?'3D is unavailable. Explore the studio renders or print layout.':!ready?'Preparing interactive model…':'';
    status.hidden=!status.textContent;
    syncRanges();
  }
  function syncRanges(){for(const [input,key] of [[doorInput,'door'],[roofInput,'roof'],[explodeInput,'explode']]){input.value=String(state[key]);q(`[data-${key}-value]`).textContent=`${Number(state[key].toFixed(1))}%`;}}
  function stopTour(){playing=false;cancelAnimationFrame(tourFrame);}
  function chooseLayout(layout){
    if(!layouts.some(item=>item.id===layout))return;
    if(state.layout!==layout){stopTour();state.door=state.roof=state.explode=0;activePreset='closed';configuring=ready&&!failed;}
    state.layout=layout;state.camera='overview';state.reset++;mode=failed?'studio':'3d';sync();
  }
  function tour(now){
    if(!playing||disposed)return;
    if(!document.hidden&&inView)tourTime+=Math.min((now-lastTime)/1000,.06);
    lastTime=now;const phase=(tourTime/1.5)%16;
    const ease=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
    state.door=100*(phase<10?ease(phase/3):1-ease((phase-12)/3));
    state.roof=100*(phase<8?ease((phase-4)/3):1-ease((phase-8)/3));state.explode=0;
    syncRanges();tourFrame=requestAnimationFrame(tour);
  }
  qa('[name="garage-layout"]').forEach(input=>input.addEventListener('change',()=>chooseLayout(input.value)));
  qa('[data-configuration]').forEach(button=>button.addEventListener('click',()=>{chooseLayout(button.dataset.configuration);stage.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}));
  qa('[data-view]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.view;if(mode!=='3d')stopTour();sync();}));
  qa('[data-preset]').forEach(button=>button.addEventListener('click',()=>{
    const preset=presets[button.dataset.preset];if(!ready||failed||configuring||!preset||(state.layout==='stack'&&preset.explode))return;
    stopTour();mode='3d';activePreset=button.dataset.preset;Object.assign(state,preset);sync();
  }));
  qa('[data-roof-pose]').forEach(button=>button.addEventListener('click',()=>{stopTour();mode='3d';activePreset='';state.explode=0;state.roof=Number(button.dataset.roofPose);sync();}));
  for(const [input,key] of [[doorInput,'door'],[roofInput,'roof'],[explodeInput,'explode']])input.addEventListener('input',()=>{
    stopTour();mode='3d';activePreset='';state[key]=Number(input.value);
    if(key==='explode'&&state.explode>0)state.door=state.roof=0;else if(key!=='explode')state.explode=0;
    sync();
  });
  cameraInput.addEventListener('change',()=>{stopTour();state.camera=cameraInput.value;if(state.camera==='hinge')state.roof=state.explode=0;state.reset++;state.rotate=false;mode='3d';sync();});
  playButton.addEventListener('click',()=>{if(!ready||failed||configuring)return;if(playing)stopTour();else{playing=true;activePreset='';mode='3d';tourTime=0;lastTime=performance.now();tourFrame=requestAnimationFrame(tour);}sync();});
  orbit.addEventListener('change',()=>{state.rotate=orbit.checked;});
  qa('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{if(mode==='print'){printReview?.zoom(Number(button.dataset.zoom));return;}if(!ready||failed||mode!=='3d')return;state.rotate=false;scene.zoom(Number(button.dataset.zoom));sync();}));
  q('[data-reset-camera]').addEventListener('click',()=>{if(mode==='print'){printReview?.reset();return;}state.camera='overview';state.reset++;state.rotate=false;sync();});
  q('[data-reset-all]').addEventListener('click',()=>{stopTour();const reset=state.reset+1;state=initial();state.reset=reset;activePreset='';mode=failed?'studio':'3d';sync();});
  q('[data-fullscreen]').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen();}catch{message('Fullscreen is unavailable in this browser.');}});
  q('[data-save-image]').addEventListener('click',async()=>{
    try{const blob=await(mode==='print'?printReview.capture():scene.capture());if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=mode==='print'?'garage-print-positions.png':`garage-${state.layout}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);message('Image saved.');}catch{message('The image could not be saved. Please try again.');}
  });
  q('[data-share-view]').addEventListener('click',async()=>{
    const url=new URL('/modular-garage/',location.origin);url.hash=garageViewHash({...state,cameraPose:scene?.getCameraView()});const fallback=q('.garage-share-fallback');
    try{await navigator.clipboard.writeText(url.href);fallback.hidden=true;message('View link copied.');}catch{fallback.value=url.href;fallback.hidden=false;fallback.focus();fallback.select();message('Copy the selected view link.');}
  });
  sync();
  import('../assets/garage-viewer.js?v=39c9af0819').then(async({createGarageScene})=>{
    if(disposed)return;const result=await createGarageScene(canvas,()=>state,project.modelUrl,active=>{configuring=active;sync();});
    if(disposed){result.dispose();return;}scene=result;ready=true;sync();
  }).catch(()=>{if(disposed)return;failed=true;if(mode==='3d')mode='studio';sync();});
  window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;stopTour();scene?.dispose();printReview?.dispose();intersection.disconnect();},{once:true});
  return experience;
}
