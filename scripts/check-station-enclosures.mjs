// Validate the hosted bundle and exercise the section's async DOM construction.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildStationEnclosures} from '../src/station-enclosures.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'station/enclosures/catalog.json')));
const release=JSON.parse(fs.readFileSync(path.join(root,'station/enclosures/release.json')));
const proof=JSON.parse(fs.readFileSync(path.join(root,'docs/station-enclosures-publication.json')));
for(const [name,meta] of Object.entries(proof.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex'),meta.sha256,name);
assert.deepEqual(release.variants.map(v=>v.id),['n43','o43']);
assert.equal(data.variants.length,20);assert.equal(data.variants.filter(v=>!v.archive).length,2);
for(const v of data.variants){
 for(const url of [...Object.values(v.parts),v.guide,...v.downloads.map(f=>f.url),...(v.evidence||[]).map(f=>f.url)].filter(Boolean))assert.ok(fs.existsSync(path.join(root,'station/enclosures',url)),url);
 if(!v.archive){assert.deepEqual(v.hardware.battery_casing_mm,[65,36,10]);assert.deepEqual(v.hardware.speaker_mm,[26,26,5]);assert.ok(v.parts.bezel);assert.equal(v.parameters.usb_boot_height,10);}
}
class Node {constructor(tag){this.tag=tag;this.children=[];}append(...n){this.children.push(...n);}setAttribute(k,v){this[k]=v;}}
globalThis.document={createElement:tag=>new Node(tag)};
globalThis.fetch=async()=>({ok:true,json:async()=>release});
const sectionRoot=new Node('main');buildStationEnclosures(sectionRoot);await new Promise(resolve=>setImmediate(resolve));
const flatten=n=>[n,...n.children.flatMap(flatten)],nodes=flatten(sectionRoot);
assert.ok(nodes.some(n=>n.id==='station-enclosures'));
assert.equal(nodes.filter(n=>n.tag==='article').length,2);
for(const a of nodes.filter(n=>n.tag==='a')){const url=a.href.split(/[?#]/)[0];assert.ok(fs.existsSync(path.join(root,url)),a.href);}
assert.equal(nodes.filter(n=>n.tag==='a'&&n.download==='').length,2);
assert.ok(nodes.some(n=>n.textContent==='Station, on the wall.'));
assert.equal(fs.readFileSync(path.join(root,'CNAME'),'utf8').trim(),'parametric.space');assert.ok(fs.existsSync(path.join(root,'.nojekyll')));
console.log(`Station section: 2 variants, ${Object.keys(proof.files).length} bundle hashes and all catalog links passed.`);
