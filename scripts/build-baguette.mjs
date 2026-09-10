import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {readFile,writeFile} from 'node:fs/promises';
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();});}};
const data=JSON.parse(await readFile(process.argv[2],'utf8'));
const model=new THREE.Group();model.name='Baguette holder — hinged assembly';
const pivot=new THREE.Group();pivot.name='LidHinge';pivot.position.fromArray(data.axis);model.add(pivot);
const material=new THREE.MeshPhysicalMaterial({vertexColors:true,metalness:.38,roughness:.31,clearcoat:.3,clearcoatRoughness:.4,iridescence:.22,iridescenceIOR:1.32});
for(const part of data.parts){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(part.vertices.flat(),3));geometry.setIndex(part.triangles.flat());geometry.computeVertexNormals();
 const colors=[];const base=new THREE.Color('#dfb569');for(const [x] of part.vertices){const c=base.clone().multiplyScalar(.97+.03*Math.cos(x*2*Math.PI/.12));colors.push(c.r,c.g,c.b);}geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 const mesh=new THREE.Mesh(geometry,material);mesh.name=part.name;
 if(part.name==='lid'){mesh.position.fromArray(data.axis).negate();pivot.add(mesh);}else model.add(mesh);
}
model.userData={source:'baguette_v2.3mf and matching baguette_case_v2.py',description:'Assembled print with lid rotating around its original longitudinal hinge axis.',units:'millimetres'};
// Viewer drives this same pivot reversibly; export geometry and pivot for reuse.
const result=await new GLTFExporter().parseAsync(model,{binary:true});await writeFile('assets/models/baguette-holder.glb',Buffer.from(result));console.log('Exported hinged model',result.byteLength,'bytes');
