import {buildStationUseCases} from './station-use-cases.js?v=ed97e2700f';
import {buildStationNavigation,buildStationAppDetails,buildStationCode} from './station-details.js?v=1135bb0e40';
import {buildStationStory} from './station-story.js?v=752bc22185';
import {mountModelViewer} from '../assets/station-viewer.js?v=9228089a67';

const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const link=(label,url)=>{const node=element('a',label,'secondary-button');node.href=url;return node;};

export function buildStationProject(root,content,project){
 content.classList.add('has-model');
 const connectNavigation=buildStationNavigation(root,content);
 const viewer=element('section',undefined,'model-viewer');
 viewer.setAttribute('aria-label','Station interactive 3D device');viewer.tabIndex=-1;
 const heading=document.querySelector('.shop-heading');heading.classList.add('station-hero');heading.querySelector('.section-number').textContent='PARAMETRIC SPACE / STATION';
 const intro=document.getElementById('page-intro');intro.replaceChildren(element('strong','The useful things, within reach.'),element('span','Time, weather, your next train and a quieter home. One small companion for the moment you’re in.'));
 const facts=element('dl',undefined,'station-hero-facts');for(const [value,label] of [['1.75″','AMOLED display'],['55 mm','Aluminum body'],['Touch + voice','Everyday interaction']]){const fact=element('div');fact.append(element('dt',value),element('dd',label));facts.append(fact);}heading.append(facts);
 buildStationStory(content,viewer);
 const detailsLink=element('a','See Station in use ↓','station-details-jump');detailsLink.href='#station-use-cases';content.querySelector('.station-view-copy').append(detailsLink);
 content.append(buildStationUseCases(viewer));
 buildStationAppDetails(root,viewer);
 const specs=element('section',undefined,'hardware-specs station-details-hardware');specs.id='station-hardware';specs.setAttribute('aria-labelledby','station-hardware-title');
 const hardwareTitle=element('h2','Inside Station');hardwareTitle.id='station-hardware-title';
 specs.append(element('span','03 / HARDWARE','station-details-label'),hardwareTitle,element('p','Built around the Waveshare ESP32-S3-Touch-AMOLED-1.75C: a round touch display, wireless connectivity and an audio path in a compact aluminum enclosure.'));
 const list=element('dl');for(const [name,value] of project.specs){const row=element('div');row.append(element('dt',name),element('dd',value));list.append(row);}specs.append(list);
 const dimensionSource=element('a','Waveshare product dimensions ↗','secondary-button');dimensionSource.href='https://www.waveshare.com/img/devkit/ESP32-S3-Touch-AMOLED-1.75C/ESP32-S3-Touch-AMOLED-1.75C-details-size.jpg';specs.append(dimensionSource);root.append(specs);
 buildStationCode(root);
 const info=element('section',undefined,'station-project-end');const copy=element('div');copy.append(element('span','A WORK IN PROGRESS','station-details-label'),element('h2','Small object. Plenty to explore.'),element('p','Station is a hardware and interface prototype, built around the Waveshare ESP32-S3. Explore the model or get in touch about the project. It is not currently available to purchase.'));const actions=element('div',undefined,'station-project-actions');actions.append(link('Download device model ↗',project.modelUrl),link('Enquire about Station →','mailto:info@parametric.space?subject=Station%20enquiry'));info.append(copy,actions);root.append(info);connectNavigation();
 document.querySelector('meta[name="description"]')?.setAttribute('content','Explore Station’s nine app demos, touch and voice interactions, ESP32-S3 hardware, firmware architecture and preview source code.');
 mountModelViewer(viewer,project.modelUrl,project.title,'station').catch(()=>viewer.append(element('p','The 3D viewer is unavailable. Try reloading, or download the model below.')));
}
