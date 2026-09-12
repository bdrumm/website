import test from 'node:test';
import assert from 'node:assert/strict';
import {createOptionsStore,readOptions,writeOptions,describeOptions} from './baguette-options.js';

test('a shared size and add-on setup survives a URL round trip without losing model/color parameters',()=>{
 const params=new URLSearchParams('id=baguette-holder&finish=forest&view=hinge&angle=100');
 const chosen={size:'mini',expansions:2,cards:true,bottle:true};
 writeOptions(params,chosen);assert.deepEqual(readOptions(params),chosen);
 assert.equal(params.get('id'),'baguette-holder');assert.equal(params.get('finish'),'forest');assert.equal(params.get('view'),'hinge');assert.equal(params.get('angle'),'100');
});

test('explicit shared choices override device preferences and invalid inputs cannot introduce options',()=>{
 const saved={size:'pro',expansions:1,cards:true,bottle:true};
 assert.deepEqual(readOptions(new URLSearchParams('size=mini&expand=0&cards=0&bottle=0'),saved),{size:'mini',expansions:0,cards:false,bottle:false});
 assert.deepEqual(readOptions(new URLSearchParams('size=huge&expand=-3&cards=unexpected&bottle=yes'),saved),{size:'pro-max',expansions:0,cards:false,bottle:false});
 assert.deepEqual(readOptions(new URLSearchParams(),null),{size:'pro-max',expansions:0,cards:false,bottle:false});
});

test('selecting a different size preserves add-ons; the shared link explicitly disables removed add-ons',()=>{
 const options=createOptionsStore({size:'pro-max',expansions:1,cards:true,bottle:false});let last;const unsubscribe=options.subscribe(value=>last=describeOptions(value));
 options.set({size:'pro'});assert.deepEqual(options.value,{size:'pro',expansions:1,cards:true,bottle:false});assert.equal(last,'Pro · 1 expansion · Credit card holder');
 options.set({expansions:0,cards:false});const params=writeOptions(new URLSearchParams('expand=1&cards=1'),options.value);assert.equal(params.get('expand'),'0');assert.equal(params.get('cards'),'0');assert.equal(params.get('bottle'),'0');assert.deepEqual(readOptions(params,{cards:true,bottle:true,expansions:2}),options.value);
 unsubscribe();options.set({bottle:true});assert.equal(last,'Pro');
});
