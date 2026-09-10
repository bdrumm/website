// Package the verified Blender browser export for the site's existing module layout.
// Usage: node scripts/build-garage-snapshot.mjs /path/to/garage-preview-assets
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {Matrix4,Vector3,Quaternion} from 'three';
const input=process.argv[2];
if(!input)throw new Error('Supply the folder containing garage-preview.glb and garage-preview.json.');
const root=new URL('../',import.meta.url);
const source=await readFile(resolve(input,'garage-preview.glb'));
const metadata=JSON.parse(await readFile(resolve(input,'garage-preview.json'),'utf8'));
const jsonSize=source.readUInt32LE(12);
const original=JSON.parse(source.subarray(20,20+jsonSize));
const binary=source.subarray(28+jsonSize);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const provenance={source:'Garage_Simplified_Structure.blend',sourceRevision:metadata.sourceRevision,sourceBlendSha256:metadata.sourceBlendSha256,sourceGlbSha256:digest(source)};
const groups=['garage','kitchen','dining'];
const label=name=>name[0].toUpperCase()+name.slice(1);
const transform=values=>{
 const position=new Vector3(),rotation=new Quaternion(),scale=new Vector3();
 new Matrix4().fromArray(values).decompose(position,rotation,scale);
 return {translation:position.toArray(),rotation:rotation.toArray(),scale:scale.toArray()};
};
function glb(document,bin){
 document.buffers=[{byteLength:bin.length}];
 const json=Buffer.from(JSON.stringify(document));
 const padded=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(padded);
 const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+padded.length+bin.length,8);header.writeUInt32LE(padded.length,12);header.writeUInt32LE(0x4e4f534a,16);
 const chunk=Buffer.alloc(8);chunk.writeUInt32LE(bin.length);chunk.writeUInt32LE(0x004e4942,4);
 return Buffer.concat([header,padded,chunk,bin]);
}
const full=structuredClone(original),parts=[binary];let byteLength=binary.length;
function accessor(values,type){
 const array=new Float32Array(values),bytes=Buffer.from(array.buffer);
 const view=full.bufferViews.push({buffer:0,byteOffset:byteLength,byteLength:bytes.length})-1;
 parts.push(bytes);byteLength+=bytes.length;
 const item={bufferView:view,componentType:5126,count:values.length/({SCALAR:1,VEC3:3,VEC4:4}[type]),type};
 if(type==='SCALAR'){item.min=[Math.min(...values)];item.max=[Math.max(...values)];}
 return full.accessors.push(item)-1;
}
const times=accessor(metadata.frames.map(frame=>frame/24),'SCALAR');
full.animations=[];
for(const [index,node] of full.nodes.entries()){
 const info=metadata.objects[node.extras?.sourceName];
 if(!info)throw new Error('Missing source identity: '+node.name);
 if(!info.animated)continue;
 const poses=info.deltaMatrices.map(transform);
 const paths=['translation','rotation','scale'];
 full.animations.push({name:node.name,samplers:paths.map(path=>({input:times,output:accessor(poses.flatMap(p=>p[path]),path==='rotation'?'VEC4':'VEC3'),interpolation:'LINEAR'})),channels:paths.map((path,sampler)=>({sampler,target:{node:index,path}}))});
}
const sourceCount=full.nodes.length;
const roots=[];
for(const [i,module] of groups.entries()){
 const members=full.nodes.slice(0,sourceCount).flatMap((n,index)=>n.extras.module===module?[index]:[]);
 // Meshes and animation remain in source meters. Unit translations remain in
 // millimeters for the existing configuration planner; the two cancel in a row.
 const content=full.nodes.push({name:label(module)+'_Source_Meters',translation:[-i*200,0,0],scale:[1000,1000,1000],children:members})-1;
 roots.push(full.nodes.push({name:'UNIT_'+label(module),translation:[i*200,0,0],children:[content],extras:{module_width_mm:200,module_depth_mm:240,stack_pitch_mm:128}})-1);
}
const connectors=full.nodes.slice(0,sourceCount).flatMap((n,index)=>n.extras.module===''?[index]:[]);
roots.push(full.nodes.push({name:'Module_Connectors',scale:[1000,1000,1000],children:connectors})-1);
const system=full.nodes.push({name:'SYSTEM_ROOT',scale:[.01,.01,.01],translation:[-3,.08,1.2],children:roots,extras:provenance})-1;
full.scenes=[{name:'Latest modular garage',nodes:[system],extras:provenance}];full.scene=0;
const fullBytes=glb(full,Buffer.concat(parts));
await writeFile(new URL('assets/models/garage-simplified-structure.glb',root),fullBytes);

// The home/catalogue preview contains only the individual garage. Retain its
// full mesh detail and bake the same half-open pose as the current studio render.
const preview=structuredClone(original);
preview.nodes=preview.nodes.filter(n=>n.extras.module==='garage');
for(const node of preview.nodes){
 const info=metadata.objects[node.extras.sourceName];
 if(info.animated)Object.assign(node,transform(info.deltaMatrices[39]));
}
const meshes=[...new Set(preview.nodes.map(n=>n.mesh))];
preview.meshes=meshes.map(i=>preview.meshes[i]);
preview.nodes.forEach(n=>{n.mesh=meshes.indexOf(n.mesh);});
const accessors=[...new Set(preview.meshes.flatMap(m=>m.primitives.flatMap(p=>[...Object.values(p.attributes),...(p.indices===undefined?[]:[p.indices])])) )];
preview.accessors=accessors.map(i=>preview.accessors[i]);
for(const mesh of preview.meshes)for(const primitive of mesh.primitives){
 for(const attribute of Object.keys(primitive.attributes))primitive.attributes[attribute]=accessors.indexOf(primitive.attributes[attribute]);
 if(primitive.indices!==undefined)primitive.indices=accessors.indexOf(primitive.indices);
}
const views=[...new Set(preview.accessors.map(a=>a.bufferView))];
let length=0;const chunks=[];
preview.bufferViews=views.map(index=>{
 const view=original.bufferViews[index],bytes=binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
 const padded=Buffer.alloc(Math.ceil(bytes.length/4)*4);bytes.copy(padded);chunks.push(padded);
 const result={...view,buffer:0,byteOffset:length};length+=padded.length;return result;
});
preview.accessors.forEach(a=>{a.bufferView=views.indexOf(a.bufferView);});
const previewRoot=preview.nodes.push({name:'UNIT_Garage',children:preview.nodes.map((_,i)=>i),extras:{...provenance,poseFrame:40}})-1;
preview.scenes=[{name:'Individual garage',nodes:[previewRoot],extras:provenance}];preview.scene=0;
const previewBytes=glb(preview,Buffer.concat(chunks));
await writeFile(new URL('assets/models/home/modular-garage-simplified.glb',root),previewBytes);
await writeFile(new URL('assets/models/garage-simplified-structure.json',root),JSON.stringify(metadata));
await writeFile(new URL('assets/models/garage-simplified-structure-audit.json',root),JSON.stringify({...provenance,sourceNodes:sourceCount,animatedObjects:full.animations.length,sourceFrames:80,fullModelSha256:digest(fullBytes),previewSha256:digest(previewBytes),fullBytes:fullBytes.length,previewBytes:previewBytes.length},null,2)+'\n');
console.log('Packaged latest garage:',fullBytes.length,'bytes; individual preview:',previewBytes.length,'bytes.');
