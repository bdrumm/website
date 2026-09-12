import {mountReview} from '../reviews/baguette-v3/viewer.js';
import {configureRotationControls,rotateModelWithKey} from './model-rotation-controls.js';

// Use the reviewed model controls directly, with the main site's scroll behavior.
export function mountBaguetteViewer(root,buffer){
 return mountReview(root,buffer,{configureControls(camera,controls){
  configureRotationControls(controls);
  const canvas=controls.domElement;canvas.tabIndex=0;
  canvas.setAttribute('aria-label','Baguette printable assembly. Drag or use arrow keys to rotate. Scroll to move the page.');
  canvas.addEventListener('keydown',event=>{if(rotateModelWithKey(camera,controls,event.key))event.preventDefault();});
 }});
}
