const sourceRoot='https://github.com/bdrumm/website/blob/main/';
const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const link=(text,href,className)=>{const node=element('a',text,className);node.href=href;return node;};

export const STATION_APPS=[
 {id:'home',name:'Home',category:'The everyday glance',summary:'The time, the weather and the next train share one quiet starting point. Useful context stays visible without opening a separate app.',features:['Clock and date','Weather summary','Commute at a glance'],detail:'The walkthrough moves between the clock, a train arrival and a weather update.'},
 {id:'weather0',name:'Weather',category:'Before you step outside',summary:'Move from current conditions to the next few hours and the week ahead. Temperature, rain and the shape of the day fit on the round display.',features:['Current conditions','Hourly outlook','Seven-day forecast'],detail:'The firmware connects to Open-Meteo and OpenWeatherMap, with additional radar and air-quality views.'},
 {id:'subway',name:'Transit',category:'Time the departure',summary:'Read the next arrivals by line and direction. Stable rows make it easy to compare trains as the countdowns change.',features:['Arrival countdowns','Manhattan / Brooklyn','Line-by-line status'],detail:'The firmware reads MTA realtime feeds: F/G at 4 Av–9 St, plus A/C at nearby Jay St–MetroTech.'},
 {id:'timer',name:'Timer',category:'A little focus',summary:'A large countdown sits inside a meter that follows the edge of the display. The remaining time stays readable from across a desk or kitchen counter.',features:['Set a duration','Perimeter countdown','Completion state'],detail:'The preview compresses a five-minute timer into a short set, run and finish sequence.'},
 {id:'voice',name:'Voice',category:'Ask, then see the result',summary:'A soft gradient follows listening, thinking and speaking. A result screen confirms the request, such as changing a light.',features:['Listening feedback','Spoken response','Visual confirmation'],detail:'The firmware streams microphone audio through a voice relay, with transcripts and app-specific results. This browser demo uses a scripted request.'},
 {id:'lights',name:'Lights',category:'Set the room',summary:'Bring a room down from bright to comfortable. A thick arc makes the brightness change easy to follow, ending with a clear confirmation.',features:['Room selection','Light controls','Brightness feedback'],detail:'The Home Assistant integration supports individual and room dimming, plus warm-to-cool white control on compatible lights.'},
 {id:'scene',name:'Scenes',category:'A familiar routine',summary:'Gather a few everyday actions into a scene. The Good night preview shows the request, its progress and the final settled state.',features:['Choose a scene','Follow its progress','Confirm completion'],detail:'The firmware has Morning, Day, Evening and Good night presets for light and room actions. The preview illustrates a broader routine.'},
 {id:'night',name:'Night',category:'A quieter presence',summary:'The clock dims as the day winds down, keeping the time available with less light in the room. A wake transition brings the display back.',features:['Dim clock','Quiet hours','Wake transition'],detail:'The firmware provides scheduled night settings, brightness preferences and a screensaver timeout.'}
];

const CAPABILITIES=[
 ['Touch & navigation','A small interface with a shared foundation.','LVGL handles the on-device screens, touch input and transitions. Each app has its own screen and start/stop callbacks, so the system can release its widgets when the app closes.'],
 ['Data & connected rooms','Useful information, close to the source.','Weather services, MTA arrival feeds and Home Assistant supply the device’s data. The firmware keeps network work separate from drawing the interface, and tracks the age of transit data when an update fails.'],
 ['Audio & voice','From a spoken request to a visible result.','Dual microphones feed the audio input; a separate codec handles playback. The voice relay connects to OpenAI Realtime and streams audio and text back to the device. Listening, thinking, speaking and result states each have a place in the UI.'],
 ['Setup & daily use','Configuration that stays with the device.','A browser companion provides Bluetooth Wi-Fi setup and local-network firmware updates. Preferences persist on the device, including brightness, screensaver and quiet-hour settings. Setup and connected features depend on the configured services.']
];

const SOURCE_FILES=[
 ['src/station-app-ui.js','App screens & states','Canvas drawing, sample data and the timing of each walkthrough.'],
 ['src/station-experience.js','The running preview','Screen textures, play/pause, app transitions and ambient movement.'],
 ['src/station-voice-field.js','Voice gradient','The evolving color field used during the voice interaction.'],
 ['src/station-model.js','Device appearance','Display surface and the model’s materials and exterior details.'],
 ['src/station-preview-controls.js','Camera interaction','Small, bounded 3D shifts and a consistent resting angle.'],
 ['src/station-story.js','The page walkthrough','Scroll chapters, app selection and the accompanying scenario text.']
];

function section(id,number,title,copy){
 const node=element('section',undefined,'station-details-section');node.id=id;node.setAttribute('aria-labelledby',id+'-title');
 const heading=element('div',undefined,'station-details-heading');
 const titleNode=element('h2',title);titleNode.id=id+'-title';
 heading.append(element('span',number,'station-details-label'),titleNode,element('p',copy));node.append(heading);return node;
}

export function buildStationNavigation(root,content){
 content.id='station-demo';
 const nav=element('nav',undefined,'station-details-nav');nav.setAttribute('aria-label','Station page sections');
 nav.append(element('span','Explore Station','station-details-label'));
 for(const [label,id] of [['Demo','demo'],['Use cases','use-cases'],['Apps','apps'],['Capabilities','capabilities'],['Hardware','hardware'],['Code','code']])nav.append(link(label+' ↗','#station-'+id));
 root.insertBefore(nav,content);
}

export function buildStationAppDetails(root,viewer){
 const apps=section('station-apps','01 / THE APPS','Eight ways to use Station.','From the first glance in the morning to the last light at night. Select an app to return to its interactive walkthrough.');
 apps.append(element('p','The web preview uses sample data and scripted interactions. The firmware capabilities described below come from the device prototype; this page does not connect to your microphone, transit feeds or home.','station-preview-note'));
 const grid=element('div',undefined,'station-app-grid');
 STATION_APPS.forEach((app,index)=>{
  const card=element('article',undefined,'station-app-card');card.dataset.app=app.id;
  const header=element('div',undefined,'station-app-heading');header.append(element('span',String(index+1).padStart(2,'0'),'station-app-number'),element('span',app.category,'station-details-label'));
  card.append(header,element('h3',app.name),element('p',app.summary,'station-app-summary'));
  const features=element('ul',undefined,'station-app-features');for(const feature of app.features)features.append(element('li',feature));
  card.append(features,element('p',app.detail,'station-app-detail'));
  const demo=element('button','View '+app.name.toLowerCase()+' demo ↗','station-text-action');demo.type='button';demo.dataset.demo=app.id;
  demo.addEventListener('click',()=>{viewer.dispatchEvent(new CustomEvent('station-navigate',{detail:app.id}));viewer.focus({preventScroll:true});});card.append(demo);grid.append(card);
 });
 apps.append(grid);root.append(apps);
 const capabilities=section('station-capabilities','02 / UNDERLYING CAPABILITY','Small device. Connected system.','The display is the visible part of a system that brings together touch, network data, audio and room controls.');
 const flow=element('ol',undefined,'station-system-flow');
 for(const [title,copy] of [['Input','Touch · microphones · network data'],['Station OS','App state · preferences · service callbacks'],['Response','AMOLED display · audio · room actions']]){const item=element('li');item.append(element('strong',title),element('span',copy));flow.append(item);}
 capabilities.append(flow);
 const rows=element('div',undefined,'station-capability-list');
 for(const [title,lead,copy] of CAPABILITIES){const row=element('article');row.append(element('h3',title));const body=element('div');body.append(element('p',lead,'station-capability-lead'),element('p',copy));row.append(body);rows.append(row);}
 capabilities.append(rows);root.append(capabilities);
}

export function buildStationCode(root){
 const code=section('station-code','04 / THE CODE','How Station is built.','The embedded interface and the web showcase use different rendering systems. The device runs C/C++ and LVGL; this page uses JavaScript, Canvas and Three.js.');
 const runtimes=element('div',undefined,'station-code-runtimes');
 const device=element('article');device.append(element('span','ON THE DEVICE','station-details-label'),element('h3','Firmware + desktop simulator'),element('p','Station’s Arduino ESP32 firmware drives the display, touch, networking and audio. Shared LVGL UI libraries also run in an SDL2 desktop simulator, so screens can be developed before flashing the board.'));
 const modules=element('dl',undefined,'station-module-list');
 for(const [name,description] of [['sysui','App registration, navigation and screen lifecycle'],['stationui / stationsubway','Weather views and transit data presentation'],['homeui / voiceui','Room controls, scenes and voice interaction'],['firmware','Board drivers, service connections and saved settings']]){const row=element('div');row.append(element('dt',name),element('dd',description));modules.append(row);}device.append(modules);
 const browser=element('article');browser.append(element('span','IN THIS BROWSER','station-details-label'),element('h3','A live texture on a 3D object'),element('p','Each app is drawn on a 1,024 × 1,024 canvas and mapped onto the round screen. A shared timeline advances the demo states, while Three.js renders the enclosure, lighting and subtle movement.'),element('p','Walkthroughs can be paused, replayed or opened at a specific step. Reduced-motion preferences simplify transitions. The timer sequence below runs in seconds so its full interaction is easy to explore.'));
 const example=element('figure',undefined,'station-code-example');example.append(element('figcaption','Timer walkthrough · from station-app-ui.js'));
 const pre=element('pre');pre.setAttribute('tabindex','0');pre.setAttribute('aria-label','Timer walkthrough JavaScript');pre.append(element('code',`timer: [
  ['set', 'Set five minutes', 3],
  ['running', 'Countdown running', 5],
  ['done', 'Timer complete', 3]
]`));example.append(pre);browser.append(example);runtimes.append(device,browser);code.append(runtimes);
 const sources=element('div',undefined,'station-source-section');sources.append(element('h3','Explore the preview source'),element('p','These files are the public code behind this page’s interactive device.'));
 const sourceList=element('ul',undefined,'station-source-list');
 for(const [path,title,copy] of SOURCE_FILES){const item=element('li'),anchor=link(undefined,sourceRoot+path);anchor.append(element('strong',title+' ↗'),element('span',copy),element('code',path));item.append(anchor);sourceList.append(item);}sources.append(sourceList);code.append(sources,link('Back to the device ↑','#station-demo','station-text-action'));root.append(code);
}
