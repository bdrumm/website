import {BAGUETTE_SIZES,describeOptions} from './baguette-options.js?v=options-1';

const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node;};

export function buildBaguetteConfigurator(options,finishes){
 const panel=make('section','baguette-configurator');panel.setAttribute('aria-label','Sizes and add-ons');
 const sizes=make('fieldset','baguette-sizes');sizes.append(make('legend','','Choose your size'));
 const grid=make('div','baguette-size-grid'),inputs=[];
 for(const size of BAGUETTE_SIZES){
  const card=make('label','baguette-size-option'),radio=make('input');radio.type='radio';radio.name='baguette-size';radio.value=size.id;radio.setAttribute('aria-label',size.name);
  const heading=make('span','baguette-option-heading');heading.append(make('strong','',size.name),make('span','baguette-option-status',size.current?'Current prototype':'Size concept'));
  const illustration=make('span','baguette-size-illustration');illustration.setAttribute('aria-hidden','true');illustration.style.setProperty('--size-length',`${size.scale*100}%`);illustration.append(make('span','baguette-size-shell'));
  card.append(radio,heading,illustration,make('span','baguette-option-label',size.label),make('span','baguette-option-description',size.description));
  radio.addEventListener('change',()=>{if(radio.checked)options.set({size:size.id});});inputs.push(radio);grid.append(card);
 }
 sizes.append(grid);
 const addons=make('fieldset','baguette-addons');const legend=make('legend','','Add a little more');legend.append(make('span','baguette-option-status','Accessory concepts'));addons.append(legend);
 const addonGrid=make('div','baguette-addon-grid');
 const expansion=make('label','baguette-addon-option'),expansionIcon=make('span','baguette-addon-icon baguette-icon-expansion');expansionIcon.setAttribute('aria-hidden','true');
 const expansionCopy=make('span','baguette-addon-copy');expansionCopy.append(make('strong','','Expansions'),make('span','','Modular sections for a little more room.'));
 const select=make('select');select.setAttribute('aria-label','Expansion modules');
 for(const [value,label] of [[0,'No expansion'],[1,'1 expansion'],[2,'2 expansions']]){const option=make('option','',label);option.value=String(value);select.append(option);}
 select.addEventListener('change',()=>options.set({expansions:Number(select.value)}));expansion.append(expansionIcon,expansionCopy,select);addonGrid.append(expansion);
 const addonInputs=[];
 for(const addon of [{id:'cards',name:'Credit card holder',copy:'A dedicated pocket to keep cards together.',icon:'card'},{id:'bottle',name:'Bottle holder',copy:'An external holder for a drink on the go.',icon:'bottle'}]){
  const label=make('label','baguette-addon-option'),input=make('input');input.type='checkbox';input.setAttribute('aria-label',addon.name);input.dataset.addon=addon.id;
  const icon=make('span','baguette-addon-icon baguette-icon-'+addon.icon);icon.setAttribute('aria-hidden','true');const copy=make('span','baguette-addon-copy');copy.append(make('strong','',addon.name),make('span','',addon.copy));
  input.addEventListener('change',()=>options.set({[addon.id]:input.checked}));label.append(input,icon,copy);addonGrid.append(label);addonInputs.push(input);
 }
 addons.append(addonGrid);
 const summary=make('div','baguette-configuration-summary'),selection=make('p','baguette-selected-options');selection.setAttribute('role','status');selection.setAttribute('aria-live','polite');
 const note=make('p','baguette-configuration-note','Size illustrations show relative proportions. Pro, Mini and add-ons are concepts; final dimensions and attachments are in development.');
 summary.append(selection,note);panel.append(sizes,addons,summary);
 options.subscribe(value=>{for(const input of inputs)input.checked=input.value===value.size;select.value=String(value.expansions);expansion.classList.toggle('is-selected',value.expansions>0);for(const input of addonInputs)input.checked=value[input.dataset.addon];selection.textContent='Your setup · '+describeOptions(value);});
 finishes.subscribe(finish=>panel.style.setProperty('--case-finish',finish.color));
 return panel;
}
