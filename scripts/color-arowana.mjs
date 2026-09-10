import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {readFile,writeFile} from 'node:fs/promises';
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.();});}};
const parts=JSON.parse(await readFile(process.argv[2],'utf8'));
const group=new THREE.Group();group.name='Arowana — original print geometry';
const silk=new THREE.MeshPhysicalMaterial({vertexColors:true,metalness:.38,roughness:.31,clearcoat:.3,clearcoatRoughness:.4,iridescence:.22,iridescenceIOR:1.32});
const black=new THREE.MeshPhysicalMaterial({color:0x101424,roughness:.28});
const white=new THREE.MeshPhysicalMaterial({color:0xe0eff3,roughness:.32});
const mint=new THREE.Color('#a8ecad'),coral=new THREE.Color('#f47498'),violet=new THREE.Color('#ae75e5'),peach=new THREE.Color('#f79878');
const smooth=THREE.MathUtils.smoothstep;
for(const p of parts){
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p.vertices.flat(),3));
 const index=[],colors=[];let last=-1,start=0;
 p.triangles.forEach((t,i)=>{const mat=p.eye?2:p.paint[i]==='4'?1:p.paint[i]==='0C'?2:0;if(mat!==last){if(last!==-1)g.addGroup(start,index.length-start,last);start=index.length;last=mat;}index.push(t[0],t[2],t[1]);});g.addGroup(start,index.length-start,last);g.setIndex(index);g.computeVertexNormals();
 for(const [x,y,z] of p.vertices){
  const c=mint.clone();c.lerp(coral,smooth(y,-2,23));c.lerp(peach,(1-smooth(x,-103,-65))*.65);c.lerp(violet,smooth(x,58,106)*.95);c.lerp(violet,smooth(y,25,40)*.6);
  // Very subtle horizontal filament bands, retaining the source mesh's detail.
  c.multiplyScalar(.975+.025*Math.cos(y*Math.PI*2/.12));colors.push(c.r,c.g,c.b);
 }
 g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const m=new THREE.Mesh(g,[silk,black,white]);m.name=p.name;group.add(m);
}
group.userData={source:'ArowanaFixedEyes.3mf',designer:'HappyFish',description:'Original print geometry assembled from two halves. Silk PLA colors estimated from the supplied print photo.'};
// Keep original millimetre dimensions in the downloadable asset.
group.updateMatrixWorld(true);
const out=await new GLTFExporter().parseAsync(group,{binary:true});await writeFile('assets/models/arowana-print.glb',Buffer.from(out));console.log('Saved',out.byteLength,'bytes');
