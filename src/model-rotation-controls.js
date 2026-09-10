import {MathUtils,Spherical,Vector3} from 'three';

export function configureRotationControls(controls){
 controls.enableZoom=false;
 controls.enablePan=false;
 controls.touches.TWO=null;
 // OrbitControls sets touch-action:none; allow the page to scroll over models.
 controls.domElement.style.touchAction='pan-y pinch-zoom';
}

export function rotateModelWithKey(camera,controls,key){
 const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[key];
 if(!delta)return false;
 const offset=new Vector3().copy(camera.position).sub(controls.target);
 const pose=new Spherical().setFromVector3(offset);
 pose.theta=MathUtils.clamp(pose.theta+delta[0]*.14,controls.minAzimuthAngle,controls.maxAzimuthAngle);
 pose.phi=MathUtils.clamp(pose.phi+delta[1]*.12,Math.max(.01,controls.minPolarAngle),Math.min(Math.PI-.01,controls.maxPolarAngle));
 camera.position.copy(controls.target).add(offset.setFromSpherical(pose));
 controls.update();
 return true;
}
