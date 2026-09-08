import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { writeFile } from 'node:fs/promises';
// Node adapter for GLTFExporter's binary Blob conversion; no image processing.
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.();});}};
const model=new THREE.Group();model.name='Arowana — photo-inspired concept';
const palette={coral:0xf88d9e,mint:0xa5efb5,violet:0xb080ea,peach:0xffb691};
function material(color,extra={}){return new THREE.MeshPhysicalMaterial({color,metalness:.18,roughness:.36,clearcoat:.5,clearcoatRoughness:.32,iridescence:.6,iridescenceIOR:1.3,iridescenceThicknessRange:[180,360],...extra});}
const coral=material(palette.coral),mint=material(palette.mint),purple=material(palette.violet),dark=material(0x3c294e,{metalness:0,iridescence:0}),white=material(0xd3ebed,{metalness:0,iridescence:0}),black=material(0x111523,{metalness:0,iridescence:0});
function mesh(geo,mat,pos,scale,name){const m=new THREE.Mesh(geo,mat);if(pos)m.position.set(...pos);if(scale)m.scale.set(...scale);m.name=name||'surface';model.add(m);return m;}
const sphere=new THREE.SphereGeometry(1,28,18);
const stations=[[-3.4,.14,.13],[-3.0,.45,.32],[-2.3,.69,.46],[-1.2,.78,.50],[0,.77,.47],[1.2,.60,.35],[2.3,.30,.19],[2.95,.13,.11],[3.15,.08,.07]];
function profile(x){for(let i=1;i<stations.length;i++){if(x<=stations[i][0]){const a=stations[i-1],b=stations[i];const t=THREE.MathUtils.clamp((x-a[0])/(b[0]-a[0]),0,1);return [THREE.MathUtils.lerp(a[1],b[1],t),THREE.MathUtils.lerp(a[2],b[2],t)];}}return stations.at(-1).slice(1);}
function shade(x,y){const color=new THREE.Color(palette.mint);const upper=THREE.MathUtils.smoothstep(y,-.05,.6);color.lerp(new THREE.Color(palette.coral),upper);const rear=THREE.MathUtils.smoothstep(x,1.8,3.2);return color.lerp(new THREE.Color(palette.violet),rear*.7);}
const positions=[],indices=[],colors=[];const nx=72,na=40;
for(let i=0;i<=nx;i++){const x=-3.4+i*6.55/nx;const [ry,rz]=profile(x);for(let j=0;j<=na;j++){const t=j/na*Math.PI*2;const y=Math.sin(t)*ry,z=Math.cos(t)*rz;positions.push(x,y,z);const c=shade(x,y);colors.push(c.r,c.g,c.b);if(i<nx&&j<na){const a=i*(na+1)+j,b=a+na+1;indices.push(a,b,a+1,b,b+1,a+1);}}}
const body=new THREE.BufferGeometry();body.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));body.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));body.setIndex(indices);body.computeVertexNormals();mesh(body,material(0xffffff,{vertexColors:true}),null,null,'Long tapered body');
mesh(sphere,coral,[-2.92,-.015,0],[.51,.47,.365],'Head');
// Raised overlapping scales follow the body on both sides, not an image plane.
const scaleGeo=new THREE.SphereGeometry(1,10,8),scaleMaterials=new Map();
for(let col=0;col<19;col++){const x=-2.23+col*.275;for(let row=0;row<14;row++){const angle=(row+(col%2)*.5)/14*Math.PI*2;const [ry,rz]=profile(x);const y=Math.sin(angle)*ry,z=Math.cos(angle)*rz;const c=shade(x,y);const key=c.getHex();if(!scaleMaterials.has(key))scaleMaterials.set(key,material(key));const scale=mesh(scaleGeo,scaleMaterials.get(key),[x,y,z],[.22*Math.max(.5,ry/.78),.165*Math.max(.5,ry/.78),.037],'Overlapping scale');scale.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(0,Math.sin(angle)/ry,Math.cos(angle)/rz).normalize());}}
function tube(points,r,mat,name){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,24,r,6,false),mat,null,null,name);}
for(const side of [-1,1]){
 mesh(sphere,white,[-3.04,.18,.318*side],[.157,.157,.075],'Eye rim');mesh(sphere,black,[-3.066,.18,.38*side],[.102,.108,.042],'Eye');mesh(sphere,white,[-3.10,.217,.411*side],[.03,.03,.009],'Eye highlight');
 tube([[-2.54,.36,.28*side],[-2.39,.12,.425*side],[-2.40,-.22,.41*side],[-2.56,-.38,.28*side]],.014,dark,'Gill seam');
 tube([[-3.28,-.15,.18*side],[-3.48,-.16,.17*side],[-3.7,-.10,.22*side],[-3.89,-.045,.27*side]],.024,coral,'Barbel');
}
tube([[-3.37,-.12,-.15],[-3.43,-.17,0],[-3.37,-.12,.15]],.018,dark,'Mouth');
function fin(points,mat,name,ribsFrom){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.012,bevelThickness:.012});const f=mesh(geo,mat,null,null,name);f.position.z=-.0175;if(ribsFrom){for(let i=1;i<points.length-1;i++){const p=points[i];tube([[ribsFrom[0],ribsFrom[1],.043],[(ribsFrom[0]+p[0])/2,(ribsFrom[1]+p[1])/2,.055],[p[0],p[1],.045]],.01,mat,name+' ray');}}return f;}
fin([[2.83,.05],[3.45,.60],[3.89,.88],[4.04,.65],[3.96,.38],[4.09,.12],[4.04,-.15],[3.98,-.40],[3.88,-.74],[3.41,-.57],[2.82,-.04]],purple,'Fan tail',[2.84,0]);
fin([[.62,.7],[1.04,1.10],[1.40,1.21],[1.72,1.13],[2.05,.97],[2.37,.68],[2.62,.29],[1.56,.49]],purple,'Dorsal fin',[1.80,.44]);
fin([[-.65,-.76],[-.26,-1.10],[.30,-1.18],[.90,-1.12],[1.53,-.87],[2.13,-.49],[2.36,-.25],[1.3,-.56]],coral,'Anal fin',[1.42,-.49]);
for(const side of [-1,1]){const finShape=new THREE.Shape();finShape.moveTo(0,0);finShape.quadraticCurveTo(.4,-.30,1.23,-.36);finShape.quadraticCurveTo(.83,.08,.20,.19);finShape.closePath();const f=mesh(new THREE.ExtrudeGeometry(finShape,{depth:.025,bevelEnabled:false}),mint,[-2.26,-.30,.30*side],null,'Pectoral fin');f.rotation.x=side*.65;f.rotation.y=-side*.38;}
model.userData={description:'Procedural 3D concept inspired by the supplied arowana photograph. Not a scan or manufacturing model.',source:'User reference photograph'};
model.updateMatrixWorld(true);
const buffer=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});
await writeFile('assets/models/arowana-concept.glb',Buffer.from(buffer));
console.log(`Exported ${buffer.byteLength} bytes, ${model.children.length} model parts.`);
