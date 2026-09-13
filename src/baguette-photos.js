import {BAGUETTE_FINISHES} from './baguette-finishes.js?v=colors-2';

export const LIFESTYLE_PHOTO_SCENES=Object.freeze(['carry','purse','essentials','rain','picnic','travel','backpacking']);

// Finished photographs, with the product already rendered into the scene.
// Size concepts stay in the separate CAD viewer; these images show Pro Max.
export function lifestylePhotoURL(scene,finish){
 if(!LIFESTYLE_PHOTO_SCENES.includes(scene))throw new RangeError('Unknown product scene');
 const color=BAGUETTE_FINISHES.find(item=>item.id===finish)?.id||'ivory';
 return new URL(`../assets/baguette-use-cases/photos-v1/${scene}-${color}.jpg`,import.meta.url).href;
}
