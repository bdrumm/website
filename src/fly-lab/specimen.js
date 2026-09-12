import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadFlyAnatomy } from './fly-model.js';
import { makeLegs } from './embodiment.js';
const label=document.getElementById('status');
try {
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;document.body.prepend(renderer.domElement);
 const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(38,1,.1,300),fly=new THREE.Group();scene.add(fly);
 scene.add(new THREE.HemisphereLight(0xe8ffe5,0x353d31,2));const light=new THREE.DirectionalLight(0xffecd5,4);light.position.set(10,20,12);scene.add(light);const rim=new THREE.DirectionalLight(0xb7d99c,2);rim.position.set(-15,5,-10);scene.add(rim);
 const controls=new OrbitControls(camera,renderer.domElement);camera.position.set(17,12,20);controls.target.set(0,1,0);controls.enableDamping=true;controls.minDistance=8;controls.maxDistance=45;controls.autoRotate=false;controls.enablePan=false;
 const legs=makeLegs(fly),wings=[];await loadFlyAnatomy(fly,legs,wings,[]);fly.rotation.y=-.5;label.textContent='';
 const grid=new THREE.GridHelper(50,25,0x485440,0x303a30);grid.position.y=-1.4;scene.add(grid);
 const resize=()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};addEventListener('resize',resize);resize();
 document.getElementById('reset').onclick=()=>{camera.position.set(17,12,20);controls.target.set(0,1,0)};
 const draw=()=>{requestAnimationFrame(draw);if(document.hidden)return;controls.update();renderer.render(scene,camera)};draw();
}catch(e){label.textContent='The 3D specimen needs WebGL. You can still explore the project and scenario controls.';}
