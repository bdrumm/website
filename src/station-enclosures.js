// Enclosure-specific data is generated from the verified CAD release catalog.
const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
const link=(label,url,download=false)=>{const a=el('a',label,'station-text-action');a.href=url;if(download)a.download='';return a;};
export function buildStationEnclosures(root){
 const section=el('section',undefined,'station-details-section station-enclosures');section.id='station-enclosures';section.setAttribute('aria-labelledby','station-enclosures-title');
 const heading=el('div',undefined,'station-details-heading');const title=el('h2','Station, on the wall.');title.id='station-enclosures-title';
 heading.append(el('span','04 / PRINTABLE ENCLOSURES','station-details-label'),title,el('p','A separate 4.3-inch wall-display branch of Station, built around the Waveshare ESP32-P4-WIFI6-Touch-LCD-4.3. Two compact printed cases share a removable screen rim and concealed wall mounts.'));
 const figure=el('figure',undefined,'station-enclosure-preview');const image=el('img');image.src='station/enclosures/preview.png?v=n43-o43';image.alt='Actual CAD exports of the battery and batteryless cases, each with a separate front rim and wall holder.';image.width=2400;image.height=1200;image.loading='lazy';figure.append(image,el('figcaption','Actual print geometry · cup, removable front rim and matching wall holder.'));
 const actions=el('div',undefined,'station-project-actions');actions.append(link('Explore assembly, wiring & files →','station/enclosures/#n43'));
 const note=el('p','Measured prototypes. The print packages have CAD and reference slicer checks; physical fit, clip durability and cable fit still need a trial print. Start with the included fit coupons.','station-preview-note');
 const grid=el('div',undefined,'station-enclosure-grid');grid.setAttribute('aria-live','polite');
 section.append(heading,figure,actions,note,grid);root.append(section);
 fetch('station/enclosures/release.json?v=n43-o43').then(r=>{if(!r.ok)throw Error('Release unavailable');return r.json();}).then(data=>{
  for(const v of data.variants){
   const card=el('article');card.append(el('span',v.id.toUpperCase(),'station-details-label'),el('h3',v.title),el('p',v.description));
   const specs=el('dl');for(const [label,value] of [['Case + rim',v.size.join(' × ')+' mm'],['Mounted depth',v.depth+' mm'],['Speaker',data.speaker.join(' × ')+' mm'],['Battery',v.battery?data.battery.join(' × ')+' mm, casing included':'Omitted']]){const row=el('div');row.append(el('dt',label),el('dd',value));specs.append(row);}card.append(specs);
   const files=el('div',undefined,'station-enclosure-links');files.append(link('Open '+v.id.toUpperCase()+' preview →','station/enclosures/#'+v.id),link('Download 3MF ↓','station/enclosures/'+v.download,true));card.append(files);grid.append(card);
  }
 }).catch(()=>grid.append(el('p','Open Case studio above for the current variants and print downloads.')));
}
