import { Arena } from './arena.js';
import { bodySnapshot } from './body.js';
const clone=x=>structuredClone(x), $=id=>document.getElementById(id);
let presets,initial,previews,anatomy,bodies,state,arena,ready=false,mode='demo';
try{mode=sessionStorage.getItem('fly-lab-runtime')==='compute'?'compute':'demo';}catch{}
export const isDemo=()=>mode==='demo';
export function pendingDraft(){try{return JSON.parse(sessionStorage.getItem('fly-lab-transfer-draft')||'null');}catch{return null;}}
export function clearDraft(){try{sessionStorage.removeItem('fly-lab-transfer-draft');}catch{}}
export async function prepareRuntime(){
 [presets,initial,previews,anatomy,bodies]=await Promise.all(['presets','initial-state','task-previews','anatomy','body-presets'].map(async n=>{const r=await fetch(`/fly-lab/${n}.json`);if(!r.ok)throw Error('The lab assets could not load. Reload to try again.');return r.json();}));
 state=clone(initial);state.runtime='browser-demo';state.message='Browser environment ready. Start the demo, then use W / A / D or the action buttons.';ready=true;
}
async function remote(path,body){const base=globalThis.FLY_LAB_COMPUTE_BASE;if(!base)throw Error('Compute is not configured on this public demo yet. You can edit scenarios, export them, and run the manual arena.');const endpoint=new URL(base);if(endpoint.protocol!=='https:')throw Error('Compute requires an HTTPS gateway.');const response=await fetch(endpoint.href.replace(/\/$/,'')+'/'+path.replace(/^\/api\//,''),body===undefined?{credentials:'include'}:{credentials:'include',method:'POST',headers:{'Content-Type':'application/json','X-Fly-Lab':'1'},body:JSON.stringify(body)});let result;try{result=await response.json();}catch{throw Error('Compute returned an invalid response.');}if(!response.ok)throw Error(result.error||`Compute request failed (${response.status})`);return result;}
export function validateConfig(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Scenario must be a JSON object.');
 for(const k of Object.keys(input))if(!Object.hasOwn(presets[0],k))throw Error(`Unknown scenario setting: ${k}`);
 const c={...clone(presets[0]),...clone(input)};
 for(const k of ['scene','neural','decoder','restraint','training','motor_view','internal'])if(!c[k]||typeof c[k]!=='object'||Array.isArray(c[k]))throw Error(`Invalid ${k} settings.`);
 c.scene={...clone(presets[0].scene),...c.scene};const s=c.scene;
 const number=(v,name,lo,hi,integer=false)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi||(integer&&!Number.isInteger(v)))throw Error(`${name} must be ${integer?'an integer ':' '}between ${lo} and ${hi}.`);};
 if(typeof s.name!=='string'||!s.name.trim()||s.name.length>80)throw Error('Name must contain 1–80 characters.');
 for(const [k,lo,hi] of [['size',30,200],['move_distance',.1,10],['turn_degrees',1,90],['turn_move',0,1],['fly_radius',.5,12]])number(s[k],k,lo,hi);
 if(!Array.isArray(s.start)||s.start.length!==3)throw Error('Start must be [x, y, heading].');
 s.start.forEach((v,i)=>number(v,'Start position',i===2?-360:s.fly_radius,i===2?360:s.size-s.fly_radius));
 for(const group of ['foods','obstacles','hazards']){if(!Array.isArray(s[group])||s[group].length>40)throw Error(`Use at most 40 ${group}.`);for(const item of s[group]){if(!item||typeof item!=='object')throw Error(`Invalid ${group} object.`);number(item.radius,'Radius',1,s.size/5);number(item.x,'X',item.radius,s.size-item.radius);number(item.y,'Y',item.radius,s.size-item.radius);}}
 if(!s.foods.length)throw Error('Add at least one food target.');
 const touch=(a,b,p=0)=>Math.hypot(a.x-b.x,a.y-b.y)<=a.radius+b.radius+p;
 if([...s.foods,...s.obstacles].some(o=>touch({x:s.start[0],y:s.start[1],radius:s.fly_radius},o)))throw Error('Start must be clear of obstacles and food targets.');
 if(s.foods.some(f=>s.obstacles.some(o=>touch(f,o,s.fly_radius))))throw Error('Food targets must be clear of obstacles.');
 s.reward={...presets[0].scene.reward,...s.reward};for(const [k,v]of Object.entries(s.reward))number(v,`Reward ${k}`,-100,100);
 for(const [k,lo,hi]of [['episodes',1,1000],['max_steps',1,10000],['seed',0,4294967295],['pace_ms',0,5000]])number(c[k],k,lo,hi,true);
 if(!['arena','bus','arcade','website','super'].includes(c.task))throw Error('Unknown task mode.');
 if(typeof s.randomize_food!=='boolean'||typeof c.neural.learning!=='boolean')throw Error('Randomization and learning must be boolean values.');
 if(!Array.isArray(c.decoder.actions)||!c.decoder.actions.length||c.decoder.actions.some(a=>!a.name||!a.neurons))throw Error('Each decoder action needs a name and neuron selector.');
 number(c.neural.neural_ms,'Neural window',1,2000);number(c.neural.pulse_ms,'Pulse duration',0,c.neural.neural_ms);number(c.neural.pulse_current,'Pulse current',0,100);number(c.deadband,'Reward deadband',.000001,100);
 if(['bus','super'].includes(c.task)&&s.size<80)throw Error('Bus scenarios need an arena size of at least 80.');
 if(!['practice','curriculum','rotation','evaluate'].includes(c.training.mode))throw Error('Unknown training mode.');
 if(!Array.isArray(c.training.tasks)||!c.training.tasks.length||c.training.tasks.some(t=>!['arena','bus','arcade','website'].includes(t)))throw Error('Select valid training tasks.');
 if(c.restraint.joint_limit!==undefined)number(c.restraint.joint_limit,'Joint range',0,60);
 if(c.restraint.allowed_legs!==undefined&&(!Array.isArray(c.restraint.allowed_legs)||c.restraint.allowed_legs.some(l=>!['L1','R1','L2','R2','L3','R3'].includes(l))||new Set(c.restraint.allowed_legs).size!==c.restraint.allowed_legs.length))throw Error('Unknown or repeated leg.');
 if(!Object.hasOwn(bodies.preset_definitions,c.restraint.preset||'auto'))throw Error('Unknown restraint preset.');
 return c;
}
function bodyFor(c){
 return bodySnapshot(c,bodies.preset_definitions);
}
function previewConfig(input){
 const c=validateConfig(input);let world,frame;
 if(c.task==='arena'){
  const e=new Arena(c);world=e.snapshot();frame=e.frame();
 }else{
  const p=previews.find(p=>p.config.task===c.task)||previews.find(p=>p.config.task==='bus');world=clone(p.world);frame=p.frame;
 }
 world.embodiment=bodyFor(c);return {config:c,world,frame};
}
function saved(){try{return JSON.parse(localStorage.getItem('fly-lab-scenarios')||'[]');}catch{return [];}}
function drive(action){
 if(!state.active)throw Error('Start the demo before sending an action.');
 const b=bodySnapshot(state.config,bodies.preset_definitions,action,true),blocked=b.blocked;
 const reward=arena.step(b.effective_action);state.world=arena.snapshot();state.world.embodiment=b;state.tick=arena.steps;state.frame=arena.frame();state.frame_tick=arena.steps;state.frame_kind='demo';
 state.history.push({tick:arena.steps-1,reward,spikes:null,efficacy:null,source:'manual-browser-input'});
 state.demo_action=action;state.message=blocked?b.reason:'Manual browser input. No neural activity or learning is generated.';
 if(arena.done){state.active=false;state.status='completed';state.message='Demo episode complete. Export its summary or start again.';state.episodes.push({episode:1,task:'arena',phase:'browser demo',seed:state.config.seed,steps:arena.steps,reward:arena.total_reward,food:arena.collected,success:arena.collected===arena.scene.foods.length});}
 return clone(state);
}
export async function labApi(path,body){
 if(!ready)throw Error('Lab is still loading.');
 if(!isDemo())return remote(path,body);
 const name=path.split('?')[0];
 if(name==='/api/presets')return clone(presets);
 if(name==='/api/state'||name==='/api/export')return clone(state);
 if(name==='/api/anatomy')return clone(anatomy);
 if(name==='/api/runs')return [];
 if(name==='/api/journey')return {run_id:null,journey:[],journey_count:0};
 if(name==='/api/neuron')throw Error('Full neuron connectivity inspection requires compute. The visible somata and display connections are real, static anatomy.');
 if(name==='/api/preview')return previewConfig(body);
 if(name==='/api/scenarios'){
  if(body===undefined)return saved();const config=validateConfig(body),items=saved(),entry={id:crypto.randomUUID(),config};items.push(entry);try{localStorage.setItem('fly-lab-scenarios',JSON.stringify(items));}catch{throw Error('Browser storage is unavailable. Use Export configuration instead.');}return entry;
 }
 if(name==='/api/start'){
  const p=previewConfig(body.config),c=p.config;
  if(c.task!=='arena')throw Error('This task has a static preview. Running bus, game, website, or multi-task sessions requires compute.');
  if(c.scene.randomize_food)throw Error('Seeded food randomization runs in the Python engine. Turn off randomization for the browser demo.');
  arena=new Arena(c);state={...clone(initial),runtime:'browser-demo',status:body.single_step?'paused':'running',active:true,config:c,episode:1,run_id:'browser-demo-'+Date.now(),world:p.world,frame:p.frame,frame_kind:'demo',frame_tick:0,message:'Manual browser demo. Each W / A / D press or action button advances one decision.',demo_action:'rest'};
  if(body.single_step)return drive('rest');return clone(state);
 }
 if(name==='/api/demo-action'){if(state.status!=='running')throw Error('Resume the demo before sending manual actions.');return drive(body.action);}
 if(name==='/api/control'){
  if(body.command==='step'){if(state.status!=='paused')throw Error('Pause the demo before single-stepping.');return drive('rest');}
  if(body.command==='pause'){state.status='paused';state.message='Paused. Step once or resume manual controls.';}
  else if(body.command==='resume'){state.status='running';state.message='Manual controls resumed.';}
  else if(body.command==='stop'){state.status='stopped';state.active=false;state.message='Browser demo stopped. No brain checkpoint was created.';}
  else throw Error('Reinforcement, continuous training, and brain checkpoints require the real compute engine.');
  return clone(state);
 }
 throw Error('This operation requires the real compute engine.');
}
export function decorateRuntime(s){
 const demo=isDemo();$('runtime-connect').textContent=demo?'Connect compute':'Return to browser demo';$('browser-demo-controls').hidden=!demo;
 if(!demo){$('runtime-message').textContent='Compute connected · actions and measurements come from the configured engine.';return;}
 const arenaTask=s.config?.task==='arena';
 $('connection-label').textContent='Browser demo';$('connection-dot').style.background='#d6fb78';$('mode-label').textContent='ENVIRONMENT ONLY';$('activity-state').textContent='STATIC ANATOMY';
 $('start').textContent='▶ Start demo';$('start').disabled=s.active||!arenaTask;
 $('start').title=arenaTask?'Run one manual arena episode':'This task runs on compute; configuration and its default scene can be previewed here.';
 $('step').disabled=!arenaTask||!!(s.active&&s.status!=='paused');
 for(const id of ['run-assay','save-brain','give-reward','give-aversive','continuous-training']){$(id).disabled=true;$(id).title='Requires the real neural engine';}
 $('continuous-summary').textContent='Continuous sessions and saved brain memory require compute.';
 $('runtime-message').textContent=arenaTask?'Browser demo · manual arena physics; neural training and measurements require compute.':'Task preview · default stage geometry. All settings export to the real lab; execution requires compute.';
 $('decoder-reason').textContent='Browser input bypasses the neural readout. Connect compute for real neural decisions.';
 $('action-label').textContent=!s.previewing&&s.demo_action?s.demo_action.replaceAll('_',' '):'No neural decision';$('metric-time').textContent='—';$('frame-tick').textContent=!s.previewing&&s.frame_kind==='demo'?`DEMO ${s.tick}`:'PREVIEW';
 $('training-progress-summary').textContent='Training configuration is preserved. No training is running in this browser.';
 $('training-memory').textContent='No neural checkpoint is created in demo mode.';
 document.querySelectorAll('[data-demo-action]').forEach(b=>b.disabled=!s.active||s.status!=='running');
 document.querySelectorAll('[data-chart]').forEach(b=>{if(b.dataset.chart!=='reward'){b.disabled=true;b.title='Requires measured neural output';}});
}
export function installRuntimeControls(readConfig,render,act,toast){
 $('runtime-connect').onclick=()=>act(async()=>{
  if(!isDemo()){
   let s;try{s=await remote('/api/state');}catch{}if(s?.active)throw Error('Stop the compute session before leaving it.');
   try{sessionStorage.removeItem('fly-lab-runtime');}catch{}location.reload();return;
  }
  const button=$('runtime-connect');button.disabled=true;button.textContent='Connecting…';
  try{const draft=readConfig();const s=await remote('/api/state');if(!s.config||!s.world||typeof s.status!=='string')throw Error('Compute did not return a compatible Fly Lab state.');try{sessionStorage.setItem('fly-lab-transfer-draft',JSON.stringify(draft));sessionStorage.setItem('fly-lab-runtime','compute');}catch{throw Error('Session storage is needed to keep the compute connection.');}location.reload();}finally{button.disabled=false;button.textContent='Connect compute';}
 });
 const send=action=>act(async()=>{if(!isDemo())return;render(await labApi('/api/demo-action',{action}));});
 document.querySelectorAll('[data-demo-action]').forEach(b=>b.onclick=()=>send(b.dataset.demoAction));
 addEventListener('keydown',e=>{if(!isDemo()||!state.active||state.status!=='running'||e.ctrlKey||e.metaKey||e.altKey||/input|select|textarea/i.test(e.target.tagName)||e.target.isContentEditable)return;const action={w:'forward',ArrowUp:'forward',a:'turn_left',ArrowLeft:'turn_left',d:'turn_right',ArrowRight:'turn_right',s:'rest',ArrowDown:'rest'}[e.key];if(action){e.preventDefault();send(action);}});
}
