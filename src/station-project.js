import {buildStationNavigation,buildStationAppDetails,buildStationCode} from './station-details.js?v=649abe7bd3';
import {buildStationStory} from './station-story.js';
import {mountModelViewer} from '../assets/station-viewer.js?v=faeb2d8871';

const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const link=(label,url)=>{const node=element('a',label,'secondary-button');node.href=url;return node;};

export function buildStationProject(root,content,project){
 content.classList.add('has-model');
 buildStationNavigation(root,content);
 const viewer=element('section',undefined,'model-viewer');
 viewer.setAttribute('aria-label','Station interactive 3D device');viewer.tabIndex=-1;
 viewer.append(element('span',project.category,'section-number'));
 buildStationStory(content,viewer);
 const detailsLink=element('a','Explore the apps ↓','station-details-jump');detailsLink.href='#station-apps';content.querySelector('.station-view-copy').append(detailsLink);
 const info=element('div');info.append(element('h2','Station OS, within reach.'));
 for(const paragraph of project.description)info.append(element('p',paragraph));
 info.append(element('p','Not currently available to purchase.','muted'),link('Download device model ↗',project.modelUrl),link('Enquire about this project →','mailto:info@parametric.space?subject=Station%20enquiry'));
 content.append(info);
 buildStationAppDetails(root,viewer);
 const specs=element('section',undefined,'hardware-specs station-details-hardware');specs.id='station-hardware';specs.setAttribute('aria-labelledby','station-hardware-title');
 const hardwareTitle=element('h2','Inside Station');hardwareTitle.id='station-hardware-title';
 specs.append(element('span','03 / HARDWARE','station-details-label'),hardwareTitle,element('p','Built around the Waveshare ESP32-S3-Touch-AMOLED-1.75C: a round touch display, wireless connectivity and an audio path in a compact aluminum enclosure.'));
 const list=element('dl');for(const [name,value] of project.specs){const row=element('div');row.append(element('dt',name),element('dd',value));list.append(row);}specs.append(list);root.append(specs);
 buildStationCode(root);
 document.querySelector('meta[name="description"]')?.setAttribute('content','Explore Station’s eight app demos, touch and voice interactions, ESP32-S3 hardware, firmware architecture and preview source code.');
 mountModelViewer(viewer,project.modelUrl,project.title,'station').catch(()=>viewer.append(element('p','The 3D viewer is unavailable. Try reloading, or download the model below.')));
}
