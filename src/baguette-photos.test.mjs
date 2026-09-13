import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BAGUETTE_FINISHES} from './baguette-finishes.js';
import {LIFESTYLE_PHOTO_SCENES,lifestylePhotoURL} from './baguette-photos.js';

function jpegSize(data){
 assert.equal(data.readUInt16BE(0),0xffd8,'Asset must be a JPEG');
 let offset=2;
 while(offset<data.length){
  assert.equal(data[offset++],0xff);
  const marker=data[offset++],length=data.readUInt16BE(offset);
  if([0xc0,0xc1,0xc2].includes(marker))return [data.readUInt16BE(offset+5),data.readUInt16BE(offset+3)];
  offset+=length;
 }
 throw new Error('JPEG dimensions missing');
}

test('every scene and finish resolves to a distinct, full-resolution finished photograph',async()=>{
 const urls=new Set();
 for(const scene of LIFESTYLE_PHOTO_SCENES)for(const finish of BAGUETTE_FINISHES){
  const url=lifestylePhotoURL(scene,finish.id);
  assert.ok(!urls.has(url),'Color variants must not share an image');urls.add(url);
  const data=await readFile(new URL(url));
  assert.deepEqual(jpegSize(data),[1536,1024],url);
  assert.ok(data.length<800_000,'Keep each lazy-loaded image under 800 KB');
 }
 assert.equal(urls.size,49);
});

test('unknown finishes fall back to Ivory and unknown scenes cannot create arbitrary asset paths',()=>{
 assert.equal(lifestylePhotoURL('carry','invalid'),lifestylePhotoURL('carry','ivory'));
 assert.throws(()=>lifestylePhotoURL('../other','clay'),RangeError);
});
