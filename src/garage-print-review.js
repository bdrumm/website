const groups=[['all','All parts'],['bodies','Bodies'],['roofs_fronts','Roofs & fronts'],['doors','Doors'],['furniture','Furniture'],['accessories','Rails & clips'],['calibration','Test pieces']];
export function buildGaragePrintReview(host,panel,onChange) {
  panel.innerHTML=`<div class="garage-controls-title"><h2>Print positions</h2><span class="section-number">43 PARTS</span></div>
    <div class="garage-control-section garage-print-filter"><label for="garage-print-category">Part category</label><select id="garage-print-category">${groups.map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select>
    <label for="garage-print-search">Find a part</label><input type="search" id="garage-print-search" placeholder="Name or part number…"></div>
    <div class="garage-control-section garage-print-options"><label><input type="checkbox" data-steep disabled> Highlight steep undersides</label><label><input type="checkbox" data-tiles checked disabled> Show display tiles</label><p data-steep-note hidden>Red marks undersides steeper than 45°, including short bridges and functional joints. Hide the tiles to inspect from below.</p></div>
    <div class="garage-print-list" aria-label="Printable parts"></div><div class="garage-print-detail" aria-live="polite"><p>Select a part for its dimensions, orientation and support notes.</p></div>
    <div class="garage-control-section"><a class="secondary-button" href="assets/garage/garage-standard-brick.3mf" download>Download print project · 3MF</a><p class="garage-print-note">Each numbered tile is a separate illustration, not one build plate. Category colours help identify parts. Test the joint samples before printing full assemblies.</p></div>`;
  const q=s=>panel.querySelector(s),controller=new AbortController();
  let scene,parts=[],group='all',selected=null,ready=false,error=false,disposed=false,shown=true,search='';
  const title=()=>parts.find(p=>p.id===selected)?.label || groups.find(([id])=>id===group)[1];
  function pick(id){selected=id;scene?.focus(id);renderList();onChange();}
  function renderList(){
    const list=q('.garage-print-list');list.replaceChildren();
    for(const part of parts.filter(p=>(group==='all'||p.group===group)&&(`${p.label} ${p.id} ${p.number}`).toLowerCase().includes(search.toLowerCase()))){
      const button=document.createElement('button');button.type='button';button.textContent=`${String(part.number).padStart(2,'0')} · ${part.label}`;button.setAttribute('aria-pressed',String(part.id===selected));button.addEventListener('click',()=>pick(part.id));list.append(button);
    }
    if(parts.length&&!list.children.length){const p=document.createElement('p');p.textContent='No matching parts.';list.append(p);}
    const detail=q('.garage-print-detail'),part=parts.find(p=>p.id===selected);detail.replaceChildren();
    if(part){for(const [tag,text] of [['strong',part.label],['span',part.dimensions_mm.map(n=>n.toFixed(1)).join(' × ')+' mm'],['p',part.orientation_note]]){const el=document.createElement(tag);el.textContent=text;detail.append(el);}}
    else {const p=document.createElement('p');p.textContent='Select a part for its dimensions, orientation and support notes.';detail.append(p);}
  }
  q('select').addEventListener('change',event=>{group=event.target.value;selected=null;search='';q('input[type="search"]').value='';scene?.group(group);renderList();onChange();});
  q('input[type="search"]').addEventListener('input',event=>{search=event.target.value;renderList();});
  for(const field of ['[data-steep]','[data-tiles]'])q(field).addEventListener('change',()=>{scene?.options(q('[data-steep]').checked,q('[data-tiles]').checked);q('[data-steep-note]').hidden=!q('[data-steep]').checked;});
  const manifestPromise=fetch('assets/garage/print-positions/numbered_manifest.json?v=20260911',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Part list unavailable');return r.json();}).then(value=>{
    if(!Array.isArray(value.parts)||value.parts.length!==value.count||value.parts.some(p=>typeof p.id!=='string'||typeof p.label!=='string'||typeof p.orientation_note!=='string'||!Array.isArray(p.dimensions_mm)||p.dimensions_mm.length!==3||!p.dimensions_mm.every(Number.isFinite)))throw Error('Invalid part list');
    if(disposed)return;parts=value.parts;renderList();onChange();
  });
  const scenePromise=import('../assets/garage-print-viewer.js?v=35a09d1a5b').then(({createPrintScene})=>disposed?null:createPrintScene(host,pick,controller.signal)).then(result=>{
    if(!result)return;if(disposed){result.dispose();return;}scene=result;scene.visible(shown);scene.group(group);if(selected)scene.focus(selected);ready=true;q('[data-steep]').disabled=q('[data-tiles]').disabled=false;onChange();
  });
  Promise.allSettled([manifestPromise,scenePromise]).then(results=>{if(disposed)return;if(results.some(r=>r.status==='rejected')){error=true;onChange();}});
  return {
    get ready(){return ready;},get error(){return error;},get title(){return title();},
    get still(){return `assets/garage/print-positions/${group==='all'?'overview':group}.jpg`;},
    setVisible(value){shown=value;scene?.visible(value);},zoom(factor){scene?.zoom(factor);},
    reset(){selected=null;scene?.group(group);renderList();onChange();},capture(){return scene?.capture();},
    dispose(){disposed=true;controller.abort();scene?.dispose();}
  };
}
