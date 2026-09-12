const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};

export const STATION_USE_CASES=[
 {id:'coming-home',label:'01 / COMING HOME',title:'Back home. Settle in.',copy:'Put down your keys and bring the room to life. A light, a scene, a small request—Station keeps the everyday controls close.',alt:'Generated concept of a hand placing the small silver Station display on an entry table beside keys, in warm evening light.'},
 {id:'docked',label:'02 / ON ITS DOCK',title:'A place on the desk.',copy:'A compact angled dock keeps the display in view. Glance at the time and weather while you work, read or pause for a moment.',alt:'Generated concept of the round silver Station display resting on a small angled desk dock, showing the time and weather.'},
 {id:'city',label:'03 / OUT IN THE CITY',title:'Catch the next one.',copy:'Check the next train before heading underground. A pocket-sized display brings the commute into a single glance.',alt:'Generated concept of a hand holding the small round Station display with transit arrivals on a New York sidewalk.'},
 {id:'bedtime',label:'04 / GOING TO BED',title:'Let the day go quiet.',copy:'Settle into the evening with a dim clock by the bed. Less light in the room, with the time still within reach.',alt:'Generated concept of Station on a bedside table beside a book and lamp, showing a dim night clock.'},
 {id:'waking-up',label:'05 / WAKING UP',title:'Meet the morning.',copy:'The hour and the weather, ready for the first glance. A quiet starting point before the day picks up.',alt:'Generated concept of the small silver Station display beside a bed in morning sunlight, showing the time and weather.'}
];

export function buildStationUseCases(){
 const section=element('section',undefined,'station-use-cases');section.id='station-use-cases';section.setAttribute('aria-labelledby','station-use-cases-title');
 const intro=element('div',undefined,'station-details-heading');const heading=element('h2','A small part of the day.');heading.id='station-use-cases-title';
 intro.append(element('span','STATION / EVERYDAY MOMENTS','station-details-label'),heading,element('p','From the front door to the bedside, a few ways Station can fit into everyday life.'));section.append(intro);
 const grid=element('div',undefined,'station-use-case-grid');
 for(const scene of STATION_USE_CASES){
  const card=element('article',undefined,'station-use-case'+(scene.id==='coming-home'?' station-use-case-lead':''));
  const figure=element('figure');const image=element('img');
  image.src=new URL(`../assets/station-use-cases/${scene.id}.jpg`,import.meta.url).href;
  image.srcset=`${new URL(`../assets/station-use-cases/${scene.id}-768.jpg`,import.meta.url).href} 768w, ${image.src} 1536w`;
  image.sizes=scene.id==='coming-home'?'(max-width: 760px) calc(100vw - 32px), (max-width: 1440px) 60vw, 850px':'(max-width: 760px) calc(100vw - 32px), (max-width: 1440px) 48vw, 650px';
  image.alt=scene.alt;image.width=1536;image.height=1024;image.loading='lazy';image.decoding='async';figure.append(image);
  const copy=element('div',undefined,'station-use-case-copy');copy.append(element('span',scene.label,'station-details-label'),element('h3',scene.title),element('p',scene.copy));
  card.append(figure,copy);grid.append(card);
 }
 section.append(grid,element('p','AI-generated use-case concepts based on the Waveshare round display. The dock is a concept accessory.','station-use-case-note'));
 return section;
}
