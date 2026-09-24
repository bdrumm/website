// Boom Boom project overview: interactive kit model, design details, parts, plates and print files.
const asset=path=>new URL('../assets/boom-boom/'+path,import.meta.url).href;
const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node;};
const link=(text,href,className)=>{const a=make('a',className,text);a.href=href;return a;};
const intro=(label,title,copy)=>{const box=make('div','boom-section-intro');box.append(make('span','section-number',label),make('h2','',title));if(copy)box.append(make('p','',copy));return box;};

const palette=[['Vermilion orange','#E45526'],['Warm ivory roof','#E6DFCB'],['Slate glass','#858991'],['Charcoal chassis','#23282A'],['Satin gray trim','#91958A'],['Ivory eyes and lamp','#FFFDF1'],['Amber nose','#EFB43D']];

const glance=[['28','Printed parts'],['3','Print plates'],['7','Filament colors'],['18','M3 screws hold the underframe'],['4','Rolling wheelsets'],['≈220','mm coach length']];

const features=[
 {title:'A modular underframe',copy:'The gray sill base, both trucks and the tank module are separate prints. Eighteen M3 screws drive up into 2.5\u00a0mm pilots in the body, and paired round and D-shaped pegs mean nothing goes on backwards.',photos:[
  ['undercarriage-mounts','Module mounts','Both trucks and the tank module lowered away from the base, showing their locating pegs and screw bores.'],
  ['lower-base-mounts','Base to body','The gray base separated below the orange body, showing its screw recesses and the body’s locating pegs.'],
  ['underside','Underside','The assembled train from below, with both trucks, the wheelsets and the tank module in place.'],
  ['undercarriage-print-layout','Print orientation','The base, trucks and tank module laid out upside down in their print orientation.']]},
 {title:'Wheelsets that roll',copy:'Wheels glue onto four axles, and each 4\u00a0mm journal clips into dry truck bearings with 0.3\u00a0mm of running clearance. Integral collars limit sideways play to 0.6\u00a0mm, so the wheels turn freely without wandering.',photos:[
  ['wheel-assembly','Axle in its clips','A truck from below with one axle seated in its clips and the retaining collars just inside them.']]},
 {title:'A face that keys in',copy:'The eyes, smile and amber nose print as separate multicolor inserts. Hidden D-shaped keys behind the eyes and nose sit at different offsets, fixing position and rotation so the eyes can’t be swapped.',photos:[
  ['face-alignment','Keyed inserts','The eye and front-light inserts pulled forward from their recesses, with dashed lines to the matching keys on the face.'],
  ['front-side-junction','Front corner','Close-up of the cab corner where the cream windshield surround meets the orange face and side.']]},
 {title:'Two roofs, one socket',copy:'Choose the square roof light or the twin horns; both share one keyed roof socket. The black vent tray and its three equipment covers print flat and locate on round and D-shaped pegs.',photos:[
  ['assembled-light','Roof light','The assembled train with the square cream roof light.'],
  ['assembled-horns','Twin horns','The assembled train with the alternative twin horns in the same roof socket.'],
  ['roof-vents','Vents','Close-up of the black louvered roof tray and one equipment cover on the cream roof.']]},
 {title:'A coupling that clicks',copy:'A mushroom kingpin on the rear clip meets a latching receiver pressed down from above; spread the release ears to lift it off. Clearance is checked digitally through ±35° of turn and ±6° of tilt.',photos:[
  ['coupler-test','Coupling','The receiver lowering onto the rounded kingpin at the rear of the base, with arrows for turning.'],
  ['coupler-grasp','Receiver jaws','The receiver seen from below, showing its two rounded gripping jaws.'],
  ['connector-mount','Mounting recess','The recess and screw pilots in the base where the rear coupling clip mounts.']]},
 {title:'Cab and rear details',copy:'Seventeen windows sit 1.2\u00a0mm recessed with rounded corners. The door handles, drip rails and rear gangway door are part of the body, so the details add no loose parts.',photos:[
  ['cab-detail','Cab door','Close-up of the cab door with its recessed handle, trapezoidal side window and large grab handle.'],
  ['rear-door','Rear door','The flat rear end with its centered door, dark buffer surround and gray fittings.']]}
];

const kit=[['Orange body with integral cream roof','1','Pegs locate the base and the roof vents'],['Black roof vents and equipment covers','1','Round and D-shaped locators, glued'],['Gray sill and chassis base','1','Six M3 screws into the body'],['Front and rear trucks with axle clips','2','Four M3 screws each, through the base'],['Tank and electronics module','1','Four M3 screws, through the base'],['Axles','4','Clip into dry truck bearings'],['Wheels','8','Glued onto the axle ends'],['Eyes, smile and amber front light','4','Keyed inserts, glued'],['Cab grab handles','2','Two pegs each, glued'],['Square roof light and twin horns','2','Share one keyed roof socket'],['Rear coupling clip','1','Two M3 screws into the base'],['Matching receiver','1','Test module for the coupling']];

const plates=[['Plate 1','Body and top','The orange body with its integral cream roof, and the separate black roof vents.','2 objects'],['Plate 2','Bottom and wheels','The lower base, both trucks, the tank module, four axles, eight wheels, the rear coupling and its receiver.','18 objects'],['Plate 3','Decorations','Both eyes, the smile, the amber front light, two grab handles, the roof light and the alternative horns.','8 objects']];

const notes=['Start with a 0.4\u00a0mm nozzle and 0.16\u00a0mm layers. Use at least three walls for the body, and five walls with solid infill for the axles, wheels and coupling.','The base, trucks and tank module print upside down with their clips facing up. Support the body’s underside recess, the axle journals and the receiver’s raised beams.','Keep support out of the bearing slots, locating sockets, screw pilots and clip release gaps.','Print the coupling test and fit coupons first to check the screw pilots, bearing catch and latch in your filament.','Don’t scale the files. Clearances are modeled at full size.','Hardware: six M3×10 and twelve M3×16 screws for the underframe, plus two M3×10 for the coupling clip and two M3×12 for the receiver test block. Use screws made for plastic, or tap the 2.5\u00a0mm pilots.'];

const files=[['Boom_Boom_v16_multicolor.3mf','Bambu Studio project','All three plates with the seven-color palette assigned.','4.5\u00a0MB'],['Boom_Boom_plate_1_colors.3mf','Plate 1 · Body and top','Profile-free color job for other slicers.','1.4\u00a0MB'],['Boom_Boom_plate_2_colors.3mf','Plate 2 · Bottom and wheels','Profile-free color job for other slicers.','2.5\u00a0MB'],['Boom_Boom_plate_3_colors.3mf','Plate 3 · Decorations','Profile-free color job for other slicers.','0.6\u00a0MB'],['Boom_Boom_coupler_test.3mf','Coupling test','Clip, receiver and two mounting blocks.','0.3\u00a0MB'],['Boom_Boom_fit_test.3mf','Fit coupons','Bearing, axle, hub, socket and peg test pieces.','0.1\u00a0MB']];

// A little farther back than the site default, so the exploded parts stay in frame on every stage shape.
function buildHero(content,project){
 const viewer=make('section','model-viewer');viewer.setAttribute('aria-label',project.title+' interactive 3D print model');viewer.append(make('span','section-number',project.category));content.append(viewer);
 import('../assets/model-viewer.js?v=2cc094c4d2').then(({mountModelViewer})=>mountModelViewer(viewer,project.modelUrl,project.title,project.action,{cameraPosition:matchMedia('(max-width:760px)').matches?[-.1,2.8,18]:[-.1,2.4,15.5]})).catch(()=>viewer.append(make('p','','The 3D viewer is unavailable. Try reloading, or explore the renders below.')));
 const info=make('div','boom-hero-copy');info.append(make('h2','','Built to come apart.'));
 for(const paragraph of project.description||[])info.append(make('p','',paragraph));
 const swatches=make('ul','boom-palette');swatches.setAttribute('aria-label','The seven filament colors');
 for(const [name,color] of palette){const item=make('li');const chip=make('span','boom-swatch');chip.style.setProperty('--swatch',color);chip.setAttribute('aria-hidden','true');item.append(chip,make('span','',name));swatches.append(item);}
 const download=link('Download print project · 3MF ↗',asset('files/'+files[0][0]),'secondary-button');download.setAttribute('download','');
 info.append(swatches,download,link('All print files ↓','#boom-files','secondary-button'),link('Enquire about this project →','mailto:info@parametric.space?subject='+encodeURIComponent(project.title+' enquiry'),'secondary-button'),make('p','muted','Not currently available to purchase.'));
 content.append(info);
}

function buildGlance(){
 const section=make('section','boom-glance');section.setAttribute('aria-label','The kit at a glance');
 const list=make('dl');for(const [value,label] of glance){const row=make('div');row.append(make('dt','',label),make('dd','',value));list.append(row);}
 section.append(list);return section;
}

function buildFeatures(){
 const section=make('section','boom-features');section.setAttribute('aria-label','Boom Boom design details');
 section.append(intro('DESIGN DETAILS','The details, up close.','Each feature alongside the kit’s studio renders.'));
 features.forEach((feature,index)=>{
  const row=make('article','boom-feature-row');const copy=make('div','boom-feature-copy');
  copy.append(make('span','section-number',String(index+1).padStart(2,'0')),make('h3','',feature.title),make('p','',feature.copy));
  const photos=make('div','boom-feature-photos');const figures=[];
  for(const [key,label,alt] of feature.photos){
   const figure=make('figure');figure.id='boom-photo-'+key;figure.hidden=figures.length>0;
   const img=make('img');img.src=asset(key+'.jpg');img.alt=alt;img.width=1600;img.height=1160;img.loading='lazy';img.decoding='async';
   figure.append(img,make('figcaption','',label));photos.append(figure);figures.push(figure);
  }
  if(figures.length>1){
   const choices=make('div','boom-photo-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label',feature.title+' views');
   figures.forEach((figure,i)=>{const button=make('button','',feature.photos[i][1]);button.type='button';button.setAttribute('aria-pressed',String(i===0));button.setAttribute('aria-controls',figure.id);
    button.addEventListener('click',()=>{figures.forEach(item=>{item.hidden=item!==figure;});for(const sibling of choices.children)sibling.setAttribute('aria-pressed',String(sibling===button));});choices.append(button);});
   photos.append(choices);
  }
  row.append(copy,photos);section.append(row);
 });
 return section;
}

function buildKit(){
 const section=make('section','boom-kit');section.setAttribute('aria-labelledby','boom-kit-title');
 const heading=intro('IN THE BOX','Twenty-eight printed parts.','Twenty-six go on the train at once. The twin horns swap in for the roof light, and the receiver tests the coupling or joins a second train.');heading.querySelector('h2').id='boom-kit-title';
 const figure=make('figure','boom-kit-figure');const img=make('img');img.src=asset('exploded.jpg');img.alt='Exploded studio render of the kit: roof vents, light and horns above the body; face inserts and handles in front; base, trucks, axles and wheels below.';img.width=1600;img.height=1160;img.loading='lazy';img.decoding='async';figure.append(img);
 const table=make('table','boom-parts');table.append(make('caption','','Printed parts and how they attach'));
 const head=make('thead');const headRow=make('tr');for(const label of ['Part','Qty','Connection']){const th=make('th','',label);th.scope='col';headRow.append(th);}head.append(headRow);
 const body=make('tbody');for(const [name,count,connection] of kit){const row=make('tr');const th=make('th','',name);th.scope='row';row.append(th,make('td','',count),make('td','',connection));body.append(row);}
 const foot=make('tfoot');const total=make('tr');const label=make('th','','Total');label.scope='row';total.append(label,make('td','','28'),make('td','','Plus 18 screws for the underframe and 2 for the coupling'));foot.append(total);
 table.append(head,body,foot);
 const layout=make('div','boom-kit-layout');layout.append(figure,table);section.append(heading,layout);return section;
}

function buildPrinting(){
 const section=make('section','boom-printing');section.setAttribute('aria-labelledby','boom-plates-title');
 const heading=intro('PRINTING','Three plates, ready to slice.','Every part is already in its print orientation, with at least 3\u00a0mm between parts on a 256\u00a0mm bed.');heading.querySelector('h2').id='boom-plates-title';
 const grid=make('div','boom-plates');for(const [number,title,copy,count] of plates){const card=make('article');card.append(make('span','section-number',number),make('h3','',title),make('p','',copy),make('strong','',count));grid.append(card);}
 const tips=make('div','boom-notes');tips.append(make('h3','','Before you print'));const list=make('ul');for(const note of notes)list.append(make('li','',note));tips.append(list);
 section.append(heading,grid,tips);return section;
}

function buildFiles(project){
 const section=make('section','boom-files');section.id='boom-files';section.setAttribute('aria-labelledby','boom-files-title');
 const heading=intro('PRINT FILES','Make it yours.','Select your own printer, process and filament presets before slicing. The Bambu project needs its flushing volumes recalculated for your filaments.');heading.querySelector('h2').id='boom-files-title';
 const list=make('ul','boom-downloads');
 for(const [file,title,copy,size] of files){const item=make('li');const a=link(title,asset('files/'+file));a.setAttribute('download','');item.append(a,make('span','',copy),make('small','',file+' · '+size));list.append(item);}
 const model=make('li');const glb=link('Display model',project.modelUrl);glb.setAttribute('download','boom-boom.glb');model.append(glb,make('span','','The assembled train in the kit palette, for viewing.'),make('small','','boom-boom.glb · 5.1\u00a0MB'));list.append(model);
 const note=make('p','boom-note','An independent fan reconstruction of Boom-Boom from Titipo Titipo, with original manufacturing geometry. The character belongs to its rights holders. Fits, clearances and the coupling are checked digitally; printed fit, glue strength and clip life are not yet tested.');
 section.append(heading,list,note);return section;
}

export function buildBoomBoomProject(root,content,project){
 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('../boom-boom.css?v=281a8d581a',import.meta.url).href;document.head.append(sheet);
 document.querySelector('meta[name="description"]')?.setAttribute('content',project.summary);
 buildHero(content,project);
 root.append(buildGlance(),buildFeatures(),buildKit(),buildPrinting(),buildFiles(project));
}
