// Enclosure-specific data is generated from the verified CAD release catalog.
const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
const link=(label,url,download=false)=>{const a=el('a',label,'station-text-action');a.href=url;if(download)a.download='';return a;};
export function buildStationEnclosures(root){
 const section=el('section',undefined,'station-details-section station-enclosures');section.id='station-enclosures';section.setAttribute('aria-labelledby','station-enclosures-title');
 const heading=el('div',undefined,'station-details-heading');const title=el('h2','Pebbl, on the wall.');title.id='station-enclosures-title';
 heading.append(el('span','04 / PRINTABLE ENCLOSURES','station-details-label'),title,el('p','A separate 4.3-inch wall-display branch of Pebbl, built around the Waveshare ESP32-P4-WIFI6-Touch-LCD-4.3. Two compact printed cases have an integral screen lip and concealed wall mounts. Each device case is one printed piece.'));
 const figure=el('figure',undefined,'station-enclosure-preview');const image=el('img');image.src='station/enclosures/preview.png?v=p43-q43';image.alt='Actual CAD exports of the battery and batteryless cases, each with an integral front lip and matching wall holder.';image.width=2400;image.height=1200;image.loading='lazy';figure.append(image,el('figcaption','Actual print geometry · one-piece device case and matching wall holder.'));
 const actions=el('div',undefined,'station-project-actions');actions.append(link('Explore assembly, wiring & files →','station/enclosures/?v=p43-q43#p43'));
 const note=el('p','Measured prototypes. The print packages have CAD and reference slicer checks; physical fit, clip durability and cable fit still need a trial print. Start with the included fit coupons.','station-preview-note');
 const grid=el('div',undefined,'station-enclosure-grid');grid.setAttribute('aria-live','polite');
 section.append(heading,buildSwitchPreview(),figure,actions,note,grid);root.append(section);
 fetch('station/enclosures/release.json?v=p43-q43').then(r=>{if(!r.ok)throw Error('Release unavailable');return r.json();}).then(data=>{
  for(const v of data.variants){
   const card=el('article');card.append(el('span',v.id.toUpperCase(),'station-details-label'),el('h3',v.title),el('p',v.description));
   const specs=el('dl');for(const [label,value] of [['One-piece case',v.size.join(' × ')+' mm'],['Mounted depth',v.depth+' mm'],['Speaker',data.speaker.join(' × ')+' mm'],['Battery',v.battery?data.battery.join(' × ')+' mm, casing included':'Omitted']]){const row=el('div');row.append(el('dt',label),el('dd',value));specs.append(row);}card.append(specs);
   const files=el('div',undefined,'station-enclosure-links');files.append(link('Open '+v.id.toUpperCase()+' preview →','station/enclosures/?v=p43-q43#'+v.id),link('Download 3MF ↓','station/enclosures/'+v.download,true));card.append(files);grid.append(card);
  }
 }).catch(()=>grid.append(el('p','Open Case studio above for the current variants and print downloads.')));
}

function buildSwitchPreview(){
 const preview=el('div',undefined,'station-wall-ui');
 const copy=el('div',undefined,'station-wall-ui-copy');
 copy.append(el('span','SWITCH MODE','station-details-label'),el('h3','The room, at your fingertips.'),el('p','The wall display brings the Switch interface from our rotary-display project into view. Large dimmers, clear on/off states and a quieter monochrome palette make the controls easy to read.'));
 const features=el('ul');
 for(const [title,text] of [['A whole-home shortcut','Bright, Dimmed or Off across the home.'],['A room at a glance','Living Room and Kitchen dimmers show brightness and how many lights are on.'],['Each light, within reach','Open a room for individual dimmers and power controls.']]){const item=el('li');item.append(el('strong',title),el('span',text));features.append(item);}
 copy.append(features,link('See Switch on the 3D wall display →','station/enclosures/?v=pebbl-switch#q43'));
 const screens=el('div',undefined,'station-wall-ui-screens');
 for(const [id,title,alt] of [['main','Main · rooms together','Pebbl Switch Main screen: Bright, Dimmed and Off shortcuts, with Living Room and Kitchen brightness dimmers and ON buttons.'],['room','Room · individual lights','Pebbl Switch Living Room screen: individual Ceiling, Floor Lamp, TV Bias and Shelf dimmers with separate ON and OFF buttons.']]){
  const figure=el('figure');const full=el('a',undefined,'station-wall-screen');full.href='assets/pebbl-switch/'+id+'.png';full.target='_blank';full.rel='noopener';full.setAttribute('aria-label','Open full-size Switch '+id+' screen');
  const image=el('img');image.src=full.href;image.width=480;image.height=800;image.loading='lazy';image.decoding='async';image.alt=alt;full.append(image);figure.append(full,el('figcaption',title));screens.append(figure);
 }
 const note=el('p','Actual interface captures from the desktop simulator · sample lights and brightness values.','station-wall-ui-note');
 preview.append(copy,screens,note);return preview;
}
