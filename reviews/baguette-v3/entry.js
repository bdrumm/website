import {mountReview} from './viewer.js';
const root=document.getElementById('baguette-v3-web');
try {const response=await fetch('./baguette-v3.glb?v=3.13-strap');if(!response.ok)throw new Error('Model unavailable');await mountReview(root,await response.arrayBuffer());}
catch(error){root.querySelector('[data-status]').textContent='The interactive model could not load. Use the rendered views below and try reloading.';}
