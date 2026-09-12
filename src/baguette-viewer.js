import {mountReview} from '../reviews/baguette-v3/viewer.js';
import {configureRotationControls,rotateModelWithKey} from './model-rotation-controls.js';

// Use the reviewed model controls directly, with the main site's scroll behavior.
export async function mountBaguetteViewer(root,buffer,finishes){
 const viewer=await mountReview(root,buffer,{lighting:{environment:.55,ambient:.65,key:1.9},initialColor:finishes?.value.color,configureMaterial(material){material.metalness=0;material.roughness=.43;if(material.isMeshPhysicalMaterial){material.clearcoat=.12;material.clearcoatRoughness=.38;}},configureControls(camera,controls){
  configureRotationControls(controls);
  const canvas=controls.domElement;canvas.tabIndex=0;
  canvas.setAttribute('aria-label','Baguette printable assembly. Drag or use arrow keys to rotate. Scroll to move the page.');
  canvas.addEventListener('keydown',event=>{if(rotateModelWithKey(camera,controls,event.key))event.preventDefault();});
 }});
 const unsubscribe=finishes?.subscribe(finish=>viewer?.setColor(finish.color));
 window.addEventListener('pagehide',()=>unsubscribe?.(),{once:true});
 return viewer;
}

export {mountBaguetteComposites} from './baguette-composites.js';
