// Port of stonkfly/lab/environment.py: LabEnvironment. Neural execution is absent.
const copy=x=>structuredClone(x), rad=x=>x*Math.PI/180;
const mod=(x,m)=>((x%m)+m)%m;
function crosses(ox,oy,nx,ny,item,padding=0){const dx=nx-ox,dy=ny-oy,t=dx||dy?Math.max(0,Math.min(1,((item.x-ox)*dx+(item.y-oy)*dy)/(dx*dx+dy*dy))):0;return Math.hypot(ox+t*dx-item.x,oy+t*dy-item.y)<=item.radius+padding;}
export class Arena {
 constructor(config){this.config=copy(config);this.scene=copy(config.scene);this.maxSteps=config.max_steps;this.reset();}
 reset(){const w=this.scene;[this.x,this.y]=w.start;this.heading=rad(w.start[2]);this.steps=this.collected=this.collisions=this.total_reward=0;this.done=false;this.hazardHits=new Set();this.explored=new Set([this.cell()]);this.reward_terms={};this.trail=[[this.x,this.y]];this.last_action='rest';w.foods.forEach(f=>f.collected=false);}
 cell(){return [Math.floor(Number((this.x/10).toFixed(8))),Math.floor(Number((this.y/10).toFixed(8)))].join(',');}
 snapshot(){return {scene:copy(this.scene),fly:{x:this.x,y:this.y,heading:this.heading,action:this.last_action},trail:copy(this.trail.slice(-3000)),steps:this.steps,collected:this.collected,collisions:this.collisions,total_reward:this.total_reward,reward_terms:copy(this.reward_terms),explored:this.explored.size,done:this.done};}
 step(action){
  if(this.done)throw Error('Episode has ended. Reset the demo to continue.');
  if(!['forward','reverse','turn_left','turn_right','rest'].includes(action))throw Error('Unknown arena action');
  const w=this.scene,rates=w.reward,target=w.foods.filter(f=>!f.collected).sort((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)-Math.hypot(b.x-this.x,b.y-this.y))[0],before=Math.hypot(target.x-this.x,target.y-this.y);
  if(action.startsWith('turn_'))this.heading+=rad(w.turn_degrees)*(action==='turn_right'?1:-1);
  this.heading=mod(this.heading+Math.PI,2*Math.PI)-Math.PI;
  const travel=w.move_distance*(action==='forward'?1:action==='reverse'?-1:action.startsWith('turn_')?w.turn_move:0),pieces=Math.max(1,Math.ceil(Math.abs(travel)/(w.fly_radius*.4))),dx=Math.cos(this.heading)*travel/pieces,dy=Math.sin(this.heading)*travel/pieces;
  let collision=false,picked=0,hazards=0,distance=0;
  for(let i=0;i<pieces;i++){
   const nx=this.x+dx,ny=this.y+dy,r=w.fly_radius;
   if(nx<r||nx>w.size-r||ny<r||ny>w.size-r||w.obstacles.some(o=>crosses(this.x,this.y,nx,ny,o,r))){collision=true;break;}
   const ox=this.x,oy=this.y;this.x=nx;this.y=ny;distance+=Math.hypot(dx,dy);
   w.hazards.forEach((h,i)=>{if(!this.hazardHits.has(i)&&crosses(ox,oy,nx,ny,h,r)){this.hazardHits.add(i);hazards++;}});
   w.foods.forEach(f=>{if(!f.collected&&crosses(ox,oy,nx,ny,f,r)){f.collected=true;picked++;}});
   if(w.foods.every(f=>f.collected))break;
  }
  this.collected+=picked;this.collisions+=Number(collision);this.steps++;this.last_action=action;
  const after=Math.hypot(target.x-this.x,target.y-this.y),cell=this.cell(),novel=distance>0&&!this.explored.has(cell);this.explored.add(cell);
  this.reward_terms={food:picked*rates.food,exploration:novel?rates.exploration:0,progress:(before-after)*rates.progress,collision:Number(collision)*rates.collision,hazard:hazards*rates.hazard,step:rates.step};
  const reward=Object.values(this.reward_terms).reduce((a,b)=>a+b,0);this.total_reward+=reward;this.done=this.collected===w.foods.length||this.steps>=this.maxSteps;this.trail.push([this.x,this.y]);return reward;
 }
 pixels(width=160,height=90){
  const rgb=new Uint8ClampedArray(width*height*4),depth=new Float64Array(width*height).fill(Infinity),horizon=Math.floor(height/2),focal=width/(2*Math.tan(rad(70)));
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){let col=y<horizon?[20,29,42]:[30+Math.floor((y-horizon)*.5),43+Math.floor((y-horizon)*.6),48+Math.floor((y-horizon)*.5)];rgb.set([...col,255],(y*width+x)*4);}
  for(let x=0;x<width;x++){
   const relative=-rad(70)+2*rad(70)*x/(width-1),angle=this.heading+relative,vx=Math.cos(angle),vy=Math.sin(angle),correction=Math.cos(relative),size=this.scene.size;
   const draw=(distance,h,color)=>{if(!Number.isFinite(distance))return;const d=Math.max(distance*correction,.1),top=horizon-(h-2.2)*focal/d,bottom=horizon+2.2*focal/d,shade=Math.max(.3,Math.min(1,1-d/180));for(let y=Math.max(0,Math.ceil(top));y<=Math.min(height-1,Math.floor(bottom));y++){const i=y*width+x;if(d<depth[i]){depth[i]=d;rgb.set([...color.map(c=>Math.floor(c*shade)),255],i*4);}}};
   const tx=Math.abs(vx)<1e-12?Infinity:(vx>0?size-this.x:-this.x)/vx,ty=Math.abs(vy)<1e-12?Infinity:(vy>0?size-this.y:-this.y)/vy;draw(Math.min(tx,ty),7,[92,120,145]);
   for(const [group,color,h] of [['obstacles',[114,137,160],9],['hazards',[255,81,103],.25],['foods',[94,239,170],3.5]])for(const o of this.scene[group]){if(o.collected)continue;const ox=o.x-this.x,oy=o.y-this.y,projection=ox*vx+oy*vy,disc=o.radius**2-(ox*ox+oy*oy-projection**2);if(disc>=0&&projection>0)draw(Math.max(projection-Math.sqrt(Math.max(disc,0)),.1),h,color);}
   for(let y=horizon+1;y<height;y++){const d=1.95*focal/Math.max(y-horizon,1),length=d/correction,gx=this.x+length*vx,gy=this.y+length*vy,i=y*width+x;for(const o of this.scene.hazards)if((gx-o.x)**2+(gy-o.y)**2<=o.radius**2&&d<depth[i])rgb.set([190,65,86,255],i*4);}
  }return rgb;
 }
 frame(){const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;canvas.getContext('2d').putImageData(new ImageData(this.pixels(),160,90),0,0);return canvas.toDataURL('image/png');}
}
