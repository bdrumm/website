import {buildStationStory} from './station-story.js';
import {mountModelViewer} from '../assets/station-viewer.js?v=9f96005905';

const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const link=(label,url)=>{const node=element('a',label,'secondary-button');node.href=url;return node;};

export function buildStationProject(root,content,project){
 content.classList.add('has-model');
 const viewer=element('section',undefined,'model-viewer');
 viewer.setAttribute('aria-label','Station interactive 3D device');
 viewer.append(element('span',project.category,'section-number'));
 buildStationStory(content,viewer);
 const info=element('div');info.append(element('h2','Station OS, within reach.'));
 for(const paragraph of project.description)info.append(element('p',paragraph));
 info.append(element('p','Not currently available to purchase.','muted'),link('Download device model ↗',project.modelUrl),link('Enquire about this project →','mailto:info@parametric.space?subject=Station%20enquiry'));
 content.append(info);
 const specs=element('section',undefined,'hardware-specs');specs.append(element('h2','Inside Station'));
 const list=element('dl');for(const [name,value] of project.specs){const row=element('div');row.append(element('dt',name),element('dd',value));list.append(row);}specs.append(list);root.append(specs);
 document.querySelector('meta[name="description"]')?.setAttribute('content',project.summary);
 mountModelViewer(viewer,project.modelUrl,project.title,'station').catch(()=>viewer.append(element('p','The 3D viewer is unavailable. Try reloading, or download the model below.')));
}
