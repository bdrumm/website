import {BAGUETTE_SIZES} from './baguette-options.js';
import {Vector3} from 'three';

export function sizePresentation(id){return BAGUETTE_SIZES.find(size=>size.id===id)||BAGUETTE_SIZES[0];}

// Scale the complete assembly uniformly; printable geometry remains unchanged.
export function applyPresentationScale(group,scale,anchor='center',floorY=-43.47){
 group.scale.setScalar(scale);group.position.set(0,0,0);
 if(anchor==='ground')group.position.y=floorY*(1-scale);
 if(anchor==='hanging'){group.position.y=-3.5*(1-scale);group.position.z=54*(1-scale);}
 group.updateMatrixWorld(true);
}

export function setOpening(model,degrees){
 model.getObjectByName('LidHinge').rotation.x=-degrees*Math.PI/180;
 model.traverse(mesh=>{if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[0]=degrees>0?1:0;});
}

export const PHOTO_LAYER_TRANSFORM='translate(var(--scene-x),var(--scene-y)) scale(1.018)';

// Match a photograph coordinate at any depth in a calibrated perspective view.
export function photoAnchor(width,height,distance,x,y,z){
 const depth=(distance-z)/distance;
 return new Vector3((x-.5)*width*depth,(.5-y)*height*depth,z);
}
