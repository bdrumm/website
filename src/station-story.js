export const STATION_CHAPTERS=[
 ['home','06:40 / BEDSIDE','Wake to the day.','The hour, the weather and your next train—together on the home screen.'],
 ['weather0','07:10 / GETTING READY','Know what’s outside.','Check the forecast before stepping out. Station keeps the useful details close.'],
 ['subway','08:12 / BY THE DOOR','Your next train, at a glance.','Arrival countdowns for the lines you take, with a stable place for each train.'],
 ['timer','12:30 / KITCHEN','Keep your hands in the dough.','A focused countdown stays visible while you get on with the task.'],
 ['voice','16:20 / A SMALL REQUEST','Say it. See it happen.','Follow the voice journey from listening to thinking, speaking and confirmation.'],
 ['lights','19:45 / LIVING ROOM','Set the room’s mood.','A light changes to 40%. The screen confirms what changed.'],
 ['scene','22:30 / WINDING DOWN','One scene. A quieter home.','Bring a familiar routine together in a single request.'],
 ['night','23:10 / NIGHT','Goes quiet when you do.','A dim clock closes the day. Scroll back to revisit any moment.']
];
export function buildStationStory(content,viewer){
 const story=document.createElement('div');story.className='station-story';viewer.classList.add('station-story-viewer');const chapters=document.createElement('div');chapters.className='station-chapters';
 for(const [id,kicker,title,copy] of STATION_CHAPTERS){const section=document.createElement('section');section.className='station-chapter';section.id='station-'+id;section.dataset.state=id;const label=document.createElement('span');label.className='section-number';label.textContent=kicker;const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=copy;section.append(label,h,p);chapters.append(section);}
 const panel=document.createElement('div');panel.className='station-view-panel';
 const copyPanel=document.createElement('section');copyPanel.className='station-view-copy';copyPanel.setAttribute('aria-label','Current scenario');
 const copyLabel=document.createElement('span');copyLabel.className='section-number';const copyTitle=document.createElement('h2');const copyText=document.createElement('p');copyPanel.append(copyLabel,copyTitle,copyText);
 function showCopy(id){const chapter=STATION_CHAPTERS.find(c=>c[0]===id);if(!chapter)return;copyLabel.textContent=chapter[1];copyTitle.textContent=chapter[2];copyText.textContent=chapter[3];panel.dataset.scenario=id;}
 function syncCopy(event){showCopy(event.detail);if(!matchMedia('(prefers-reduced-motion: reduce)').matches){copyPanel.getAnimations().forEach(a=>a.cancel());copyPanel.animate([{opacity:.2,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});}}
 viewer.addEventListener('station-display-change',syncCopy);
 showCopy('home');chapters.setAttribute('aria-hidden','true');panel.append(copyPanel,viewer);story.append(chapters,panel);content.append(story);let current='',raf=0,settle=0,navigation=null;
 function commit(id){if(!id||id===current)return;current=id;viewer.dataset.storyState=id;viewer.dispatchEvent(new CustomEvent('station-state',{detail:id}));}
 function closestSection(){const center=innerHeight*(innerWidth<=760?.76:.5);let closest=null,distance=Infinity;for(const section of chapters.children){const rect=section.getBoundingClientRect(),d=Math.abs(rect.top+rect.height/2-center);if(d<distance){closest=section;distance=d;}}return closest;}
 function update(){raf=0;const closest=closestSection();for(const section of chapters.children)section.classList.toggle('is-active',section===(navigation?document.getElementById('station-'+navigation):closest));clearTimeout(settle);settle=setTimeout(()=>{const destination=navigation||closestSection()?.dataset.state;navigation=null;commit(destination);},180);}
 function schedule(){if(!raf)raf=requestAnimationFrame(update);}
 function navigate(event){navigation=event.detail;commit(navigation);document.getElementById('station-'+navigation)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});schedule();}
 function interrupt(){navigation=null;schedule();}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('wheel',interrupt,{passive:true});addEventListener('touchstart',interrupt,{passive:true});viewer.addEventListener('station-navigate',navigate);viewer.addEventListener('station-ready',schedule);schedule();
 addEventListener('pagehide',()=>{viewer.removeEventListener('station-display-change',syncCopy);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);removeEventListener('wheel',interrupt);removeEventListener('touchstart',interrupt);viewer.removeEventListener('station-navigate',navigate);cancelAnimationFrame(raf);clearTimeout(settle);},{once:true});
}
