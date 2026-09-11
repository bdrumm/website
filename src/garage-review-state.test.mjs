import test from 'node:test';
import assert from 'node:assert/strict';
import {parseGarageView,garageViewHash,GARAGE_DEFAULT_VIEW} from './garage-review-state.js';
test('view links preserve the actual camera and independent roof/door poses',()=>{
 const view={layout:'row',door:36.4,roof:49.3670886076,explode:0,camera:'overview',cameraPose:{position:[4.2,3.1,5.8],target:[0,.75,0]}};
 assert.deepEqual(parseGarageView(garageViewHash(view)),view);
});
test('stack keeps its upper roof operable while disabling separation',()=>{
 const view=parseGarageView(garageViewHash({layout:'stack',door:100,roof:100,explode:100,camera:'rear'}));
 assert.equal(view.roof,100);assert.equal(view.door,100);assert.equal(view.explode,0);
});
test('malformed or invalid shared state falls back safely',()=>{
 assert.deepEqual(parseGarageView('#view=not-json'),GARAGE_DEFAULT_VIEW);
 const view=parseGarageView('#view='+encodeURIComponent(JSON.stringify({layout:'invalid',door:-12,roof:999,cameraPose:{position:[0,0,0],target:[0,0,0]}})));
 assert.equal(view.layout,'row');assert.equal(view.door,0);assert.equal(view.roof,100);assert.equal(view.cameraPose,undefined);
});
