import test from 'node:test';import assert from 'node:assert/strict';import {normalizeCart,cartTotal} from './shop-core.mjs';
const products=[{id:'a',available:true,unitAmount:2500,currency:'USD'},{id:'b',available:false,unitAmount:500,currency:'USD'}];
test('cart merges items, clamps quantity, and removes unavailable or corrupt entries',()=>{assert.deepEqual(normalizeCart([{id:'a',quantity:7},{id:'a',quantity:7},{id:'b',quantity:2},{id:'x',quantity:1},{id:'a',quantity:-1}],products),[{id:'a',quantity:10}]);});
test('totals use catalog values and integer cents',()=>{assert.deepEqual(cartTotal([{id:'a',quantity:2,unitAmount:1}],products),{amount:5000,currency:'USD'});});
test('mixed currencies cannot be combined',()=>{assert.throws(()=>cartTotal([{id:'a',quantity:1},{id:'c',quantity:1}],[...products,{id:'c',unitAmount:100,currency:'EUR'}]));});
