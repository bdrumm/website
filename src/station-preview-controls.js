import {MathUtils,Spherical,Vector3} from 'three';

// View from below and to the right, bringing the bottom-right rim forward.
export function configureStationPreview(camera,controls){
 const azimuth=MathUtils.degToRad(18),polar=MathUtils.degToRad(106);
 controls.target.set(0,0,0);
 controls.autoRotate=false;
 controls.enableZoom=false;
 controls.enablePan=false;
 controls.enableDamping=true;
 controls.dampingFactor=.08;
 controls.rotateSpeed=.22;
 controls.minAzimuthAngle=azimuth-MathUtils.degToRad(6);
 controls.maxAzimuthAngle=azimuth+MathUtils.degToRad(6);
 controls.minPolarAngle=polar-MathUtils.degToRad(5);
 controls.maxPolarAngle=polar+MathUtils.degToRad(5);
 // OrbitControls defaults to touch-action:none. Let vertical gestures scroll
 // the page and browser pinch gestures zoom the page, not the device.
 controls.domElement.style.touchAction='pan-y pinch-zoom';
 controls.cursorStyle='grab';
 camera.position.setFromSpherical(new Spherical(11.8,polar,azimuth)).add(controls.target);
 controls.update();
}

export function tiltStationWithKey(camera,controls,key){
 const delta={ArrowLeft:[1,0],ArrowRight:[-1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[key];
 if(!delta)return false;
 const offset=new Vector3().copy(camera.position).sub(controls.target);
 const pose=new Spherical().setFromVector3(offset),step=MathUtils.degToRad(2);
 pose.theta=MathUtils.clamp(pose.theta+delta[0]*step,controls.minAzimuthAngle,controls.maxAzimuthAngle);
 pose.phi=MathUtils.clamp(pose.phi+delta[1]*step,controls.minPolarAngle,controls.maxPolarAngle);
 camera.position.setFromSpherical(pose).add(controls.target);
 controls.update();
 return true;
}
