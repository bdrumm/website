export const STATION_CHAPTERS=[
 ['home','06:40 / BEDSIDE','Wake to the day.','The hour, the weather and your next train—together on the home screen.'],
 ['weather0','07:10 / GETTING READY','Know what’s outside.','Check the forecast before stepping out. Station keeps the useful details close.'],
 ['subway','08:12 / BY THE DOOR','Your next train, at a glance.','Arrival countdowns for the lines you take, with a stable place for each train.'],
 ['timer','12:30 / KITCHEN','Keep your hands in the dough.','A focused countdown stays visible while you get on with the task.'],
 ['voice','16:20 / A SMALL REQUEST','Say it. See it happen.','Follow the voice journey from listening to thinking, speaking and confirmation.'],
 ['lights','19:45 / LIVING ROOM','Set the room’s mood.','A light changes to 40%. The screen confirms what changed.'],
 ['rooms','20:15 / AROUND THE ROOM','Every light, in one place.','Tap a light to adjust it, use MAIN to dim the whole room, or turn them all off.'],
 ['scene','22:30 / WINDING DOWN','One scene. A quieter home.','A familiar good-night routine, with an All off control for the last lights.'],
 ['night','23:10 / NIGHT','Goes quiet when you do.','A dim clock closes the day. Choose an app to revisit any moment.']
];
const APP_NAMES={home:'Home',weather0:'Weather',subway:'Transit',timer:'Timer',voice:'Voice',lights:'Lights',rooms:'Rooms',scene:'Routines',night:'Night'};

export function buildStationStory(content,viewer){
 const make=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
 const story=make('div',undefined,'station-story');viewer.classList.add('station-story-viewer');
 const panel=make('div',undefined,'station-view-panel');
 const copyPanel=make('section',undefined,'station-view-copy');copyPanel.setAttribute('aria-label','Current scenario');
 const top=make('div',undefined,'station-scenario-top');const copyLabel=make('span',undefined,'section-number'),counter=make('span',undefined,'station-scenario-count');top.append(copyLabel,counter);
 const copyTitle=make('h2'),copyText=make('p');copyTitle.id='station-scenario-title';copyPanel.append(top,copyTitle,copyText);
 const appNav=make('div',undefined,'station-app-switcher');appNav.setAttribute('role','group');appNav.setAttribute('aria-label','Choose an app to preview');
 let current='home';const appButtons=new Map();
 function showCopy(id){const index=STATION_CHAPTERS.findIndex(chapter=>chapter[0]===id);if(index<0)return;const chapter=STATION_CHAPTERS[index];current=id;copyLabel.textContent=chapter[1];copyTitle.textContent=chapter[2];copyText.textContent=chapter[3];counter.textContent=String(index+1).padStart(2,'0')+' / '+String(STATION_CHAPTERS.length).padStart(2,'0');panel.dataset.scenario=id;for(const [key,button] of appButtons)button.setAttribute('aria-pressed',String(key===id));}
 function select(id){if(!APP_NAMES[id])return;showCopy(id);if(viewer.dataset.storyState===id)return;viewer.dataset.storyState=id;viewer.dispatchEvent(new CustomEvent('station-state',{detail:id}));}
 for(const [id] of STATION_CHAPTERS){const button=make('button',APP_NAMES[id]);button.type='button';button.dataset.stationApp=id;button.setAttribute('aria-controls','station-device');button.addEventListener('click',()=>select(id));appButtons.set(id,button);appNav.append(button);}
 copyPanel.append(appNav);panel.append(copyPanel,viewer);story.append(panel);content.append(story);viewer.id='station-device';
 function autoNext(){const index=STATION_CHAPTERS.findIndex(c=>c[0]===current);select(STATION_CHAPTERS[(index+1)%STATION_CHAPTERS.length][0]);}
 viewer.addEventListener('station-auto-next',autoNext);
 function navigate(event){if(!APP_NAMES[event.detail])return;select(event.detail);const rect=story.getBoundingClientRect();if(rect.top<0||rect.top>innerHeight*.35)story.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
 function fromHash(){const id=location.hash.slice(1).replace(/^station-/,'');if(APP_NAMES[id])navigate({detail:id});}
 function syncCopy(event){showCopy(event.detail);}
 viewer.addEventListener('station-display-change',syncCopy);viewer.addEventListener('station-navigate',navigate);addEventListener('hashchange',fromHash);
 select('home');fromHash();
 addEventListener('pagehide',()=>{viewer.removeEventListener('station-auto-next',autoNext);viewer.removeEventListener('station-display-change',syncCopy);viewer.removeEventListener('station-navigate',navigate);removeEventListener('hashchange',fromHash);},{once:true});
}
