import {VoiceField} from './station-voice-field.js';

export const APP_TOURS={
 home:[['glance','At a glance',4],['commute','Your next train',4],['weather','Weather update',4]],
 weather0:[['now','Current conditions',4],['hourly','Next few hours',4],['week','Weekly forecast',4]],
 subway:[['manhattan','Manhattan bound',4],['arriving','Train arriving',4],['brooklyn','Brooklyn bound',4]],
 timer:[['set','Set five minutes',3],['running','Countdown running',5],['done','Timer complete',3]],
 lights:[['ready','Living room · 100%',3],['dimming','Dimming to 40%',4],['confirmed','Change confirmed',3]],
 scene:[['choose','Choose a scene',3],['running','Good night routine',4],['done','Good night',3]],
 voice:[['listen','Listening to your request',4],['think','Thinking',2.5],['speak','Speaking the response',4],['result','Light change confirmed',3.5]],
 night:[['evening','Evening clock',4],['dim','Dimmed display',4],['wake','Motion wakes Station',4]]
};
export function tourFrame(app,time){const steps=APP_TOURS[app];let start=0;for(let i=0;i<steps.length;i++){if(time<start+steps[i][2])return {index:i,id:steps[i][0],title:steps[i][1],elapsed:time-start,done:false};start+=steps[i][2];}const last=steps.at(-1);return {index:steps.length-1,id:last[0],title:last[1],elapsed:last[2],done:true};}
export function stepStart(app,index){return APP_TOURS[app].slice(0,index).reduce((s,v)=>s+v[2],0);}
const TAU=Math.PI*2;
const ease=t=>1-(1-Math.max(0,Math.min(1,t)))**3;
const INK='#f3f8ff',MUTED='#94abc3',MINT='#83f2d0',BLUE='#89c6ff',LILAC='#c5b2ff',AMBER='#ffcf91';
const THEMES={home:[MINT,BLUE],weather0:[BLUE,LILAC],subway:[MINT,BLUE],timer:[MINT,BLUE],lights:[AMBER,'#e0a1cf'],scene:[LILAC,AMBER],voice:[MINT,LILAC],night:[LILAC,BLUE]};
const alpha=(hex,a)=>hex+Math.round(Math.max(0,Math.min(1,a))*255).toString(16).padStart(2,'0');

// A 512-unit layout drawn into a supersampled texture. Content stays inside the
// round display's safe area; the outer 22 units belong to ambient light only.
export class StationAppUI{
 constructor(ctx){this.ctx=ctx;this.field=new VoiceField();}
 text(s,x,y,size=22,color=INK,align='center',weight=400){const c=this.ctx;c.fillStyle=color;c.font=`${weight} ${size}px "Geist",sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);}
 label(s,x,y,color=MUTED,align='center',size=13){const c=this.ctx;c.fillStyle=color;c.font=`500 ${size}px "Geist Mono",monospace`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);}
 part(time,delay,fn,reduced){const c=this.ctx,p=reduced?1:ease((time-delay)/.55);c.save();c.globalAlpha*=p;c.translate(0,10*(1-p));fn();c.restore();}
 pill(x,y,w,h,color='#142738'){const c=this.ctx;c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,h/2);c.fill();}
 circle(x,y,r,color){const c=this.ctx;c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
 line(x1,y1,x2,y2,color,width=1){const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
 arc(x,y,r,start,end,color,width=1){const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.arc(x,y,r,start,end);c.stroke();}
 glow(x,y,r,color,opacity=.22){const c=this.ctx,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,alpha(color,opacity));g.addColorStop(.42,alpha(color,opacity*.4));g.addColorStop(1,alpha(color,0));this.circle(x,y,r,g);}
 card(x,y,w,h,accent=BLUE){const c=this.ctx,g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,alpha(accent,.13));g.addColorStop(1,'#0b162799');c.fillStyle=g;c.beginPath();c.roundRect(x,y,w,h,22);c.fill();c.strokeStyle=alpha(accent,.19);c.lineWidth=1;c.stroke();const edge=c.createLinearGradient(x,y,x+w,y);edge.addColorStop(0,alpha(accent,0));edge.addColorStop(.4,alpha(accent,.46));edge.addColorStop(1,alpha(accent,0));this.line(x+22,y+.5,x+w-22,y+.5,edge);}
 icon(name,x,y,size=24,color=INK){const c=this.ctx;c.save();c.translate(x,y);c.scale(size/24,size/24);c.strokeStyle=color;c.fillStyle=color;c.lineWidth=1.65;c.lineCap='round';c.lineJoin='round';
  if(name==='sun'){this.arc(0,0,5,0,TAU,color,1.65);for(let i=0;i<8;i++){const a=i*TAU/8;this.line(Math.cos(a)*8,Math.sin(a)*8,Math.cos(a)*11,Math.sin(a)*11,color,1.65);}}
  if(name==='moon'){c.beginPath();c.moveTo(4,-10);c.bezierCurveTo(-11,-12,-14,9,-1,11);c.bezierCurveTo(6,13,12,7,11,2);c.bezierCurveTo(2,7,-4,-3,4,-10);c.closePath();c.stroke();}
  if(name==='rain'||name==='cloud'){c.beginPath();c.moveTo(-7,4);c.bezierCurveTo(-15,3,-12,-6,-6,-5);c.bezierCurveTo(-4,-14,9,-12,9,-4);c.bezierCurveTo(16,-3,14,4,9,4);c.closePath();c.stroke();if(name==='rain')for(let i=0;i<3;i++)this.line(-6+i*6,8,-8+i*6,12,color,1.7);}
  if(name==='check'){c.beginPath();c.moveTo(-7,0);c.lineTo(-2,5);c.lineTo(8,-6);c.stroke();}
  if(name==='bulb'){c.beginPath();c.moveTo(-4,5);c.lineTo(-4,3);c.bezierCurveTo(-13,-6,-4,-15,3,-10);c.bezierCurveTo(11,-6,7,1,4,3);c.lineTo(4,5);c.closePath();c.stroke();this.line(-3,9,3,9,color,1.7);this.line(-1,12,1,12,color,1.7);}
  if(name==='mic'){c.beginPath();c.roundRect(-3.5,-10,7,13,3.5);c.stroke();this.arc(0,1,7,0,Math.PI,color,1.7);this.line(0,8,0,12,color,1.7);this.line(-3,12,3,12,color,1.7);}
  if(name==='arrow'){this.line(-7,0,7,0,color,1.7);this.line(3,-4,7,0,color,1.7);this.line(3,4,7,0,color,1.7);}
  if(name==='lock'){c.beginPath();c.roundRect(-7,-1,14,12,3);c.stroke();this.arc(0,-1,4.5,Math.PI,TAU,color,1.7);this.circle(0,5,1,color);}
  c.restore();
 }
 background(app,clock){const c=this.ctx,[a,b]=THEMES[app];c.fillStyle='#030812';c.fillRect(0,0,512,512);this.glow(110+Math.sin(clock*.16)*24,154,300,a,app==='night'?.08:.13);this.glow(402,344+Math.cos(clock*.2)*20,264,b,.13);this.arc(256,256,238,0,TAU,'#b9dfff13',.8);
  const sweep=c.createConicGradient(clock*.09-Math.PI/2,256,256);sweep.addColorStop(0,alpha(a,0));sweep.addColorStop(.15,alpha(a,.12));sweep.addColorStop(.28,alpha(a,.65));sweep.addColorStop(.38,alpha(a,.04));sweep.addColorStop(.65,alpha(b,.02));sweep.addColorStop(.82,alpha(b,.42));sweep.addColorStop(1,alpha(a,0));this.arc(256,256,239,0,TAU,sweep,1.5);
 }
 header(name,color=MINT){this.circle(199,67,2.5,color);this.label(name,263,67,color);}
 words(text,y,t,reduced,size=24){const c=this.ctx,words=text.split(' ');c.font=`400 ${size}px "Geist",sans-serif`;const widths=words.map(w=>c.measureText(w+' ').width);let x=256-(widths.reduce((a,b)=>a+b,0)-c.measureText(' ').width)/2;words.forEach((word,i)=>{c.save();c.globalAlpha*=reduced?1:ease((t-i*.18)/.38);this.text(word,x,y,size,INK,'left');c.restore();x+=widths[i];});}
 render(app,frame,clock,dt,reduced){const c=this.ctx,t=frame.elapsed,id=frame.id;clock=reduced?0:clock;c.save();c.globalAlpha=1;this.background(app,clock);const part=(delay,fn)=>this.part(t,delay,fn,reduced);
  if(app==='home')this.home(id,clock,part);
  if(app==='weather0')this.weather(id,clock,part);
  if(app==='subway')this.transit(id,clock,part);
  if(app==='timer')this.timer(id,t,clock,part);
  if(app==='lights')this.lightCard(id==='ready'?100:id==='dimming'?Math.round(100-60*ease(t/2)):40,id==='confirmed',clock,part);
  if(app==='voice')this.voice(id,t,clock,dt,reduced,part);
  if(app==='scene')this.scene(id,t,clock,part);
  if(app==='night')this.night(id,t,clock,part);
  c.restore();
 }
 home(id,clock,part){const c=this.ctx;
  part(0,()=>{c.strokeStyle='#94abc366';c.lineWidth=1;c.beginPath();c.roundRect(244,61,21,11,3);c.stroke();this.pill(247,64,15,5,MINT);this.line(268,65,268,68,MUTED,2);});
  part(.08,()=>this.text('Good morning',256,112,18,MUTED));
  part(.14,()=>{this.glow(256,190,135,BLUE,.07);this.text('06:40',256,185,104,INK,'center',300);});
  part(.22,()=>this.label('WEDNESDAY, SEP 9',256,251,MUTED,undefined,14));
  part(.34,()=>{const rain=id==='weather';this.card(80,282,171,111,BLUE);this.glow(115,314,48,rain?BLUE:AMBER,.2);this.icon(rain?'rain':'sun',115,316,27,rain?BLUE:AMBER);this.text(rain?'76°':'79°',174,317,36);this.text(rain?'Rain in an hour':'Clear skies',98,355,15,BLUE,'left');this.label('H 83°  L 68°',98,377,MUTED,'left',12);});
  part(.43,()=>{this.card(261,282,171,111,MINT);this.label('NEXT TRAIN',279,305,MUTED,'left',12);this.circle(294,338,17,'#f27a36');this.text('F',294,339,19,INK,'center',600);this.text(id==='commute'?'4':'6',331,339,35,INK,'center',400);this.label('MIN',358,343,MINT,'left',13);this.label('G 2 MIN · A 4 MIN',279,377,MUTED,'left',11);this.line(281,392,281+Math.min(130,30+(clock*7)%100),392,alpha(MINT,.55),1.5);});
 }
 weather(id,clock,part){const c=this.ctx;part(0,()=>this.header('WEATHER',BLUE));
  part(.08,()=>{['Now','Hourly','Week'].forEach((s,i)=>{const active=i===['now','hourly','week'].indexOf(id);if(active)this.pill(147+i*76,91,70,29,'#89c6ff22');this.text(s,182+i*76,106,13,active?INK:MUTED);});});
  part(.15,()=>this.label('NEW YORK',256,146,MUTED));
  if(id==='now'){
   // Rain lives at the sides, leaving the temperature and forecast legible.
   for(let i=0;i<28;i++){const x=46+(i*47)%422;if(x>138&&x<382)continue;const y=122+(i*37+clock*(43+i%4*9))%276;this.line(x,y,x-4,y+14,alpha(BLUE,.12+(i%3)*.035),1);}
   part(.24,()=>{this.glow(256,221,140,BLUE,.16);this.icon('rain',171,221,52,BLUE);this.text('66°',295,222,94,INK,'center',300);this.text('A little rain. A slower morning.',256,289,16,'#b8d2e9');});
   part(.38,()=>{this.label('RAIN EASING IN 40 MIN',256,326,BLUE,undefined,12);for(let i=0;i<25;i++){const h=9+30*(1-i/27)*(.68+.32*Math.sin(i*.7+clock*.65));this.pill(111+i*12,383-h,5,h,alpha(BLUE,.8-i*.018));}this.label('NOW',111,399,MUTED,'left',10);this.label('+30 MIN',256,399,MUTED,undefined,10);this.label('+60',404,399,MUTED,'right',10);});
  }else{
   const rows=id==='hourly'?[['NOW','66°','Rain','rain'],['10 AM','68°','Showers','rain'],['12 PM','70°','Clearing','sun']]:[['THU','74°','Clear','sun'],['FRI','72°','Cloudy','cloud'],['SAT','76°','Clear','sun']];
   rows.forEach(([label,temp,condition,icon],i)=>part(.24+i*.1,()=>{const y=177+i*75;this.card(91,y,330,65,BLUE);this.label(label,112,y+31,MUTED,'left',14);this.icon(icon,230,y+31,24,icon==='sun'?AMBER:BLUE);this.text(temp,280,y+32,28);this.text(condition,404,y+32,13,BLUE,'right');}));
  }
 }
 transit(id,clock,part){const due=id==='arriving',brooklyn=id==='brooklyn';part(0,()=>this.header('TRANSIT',MINT));part(.1,()=>{this.text('4 Av – 9 St',256,111,28,INK,'center',500);this.label(brooklyn?'BROOKLYN BOUND':'MANHATTAN BOUND',256,147,MUTED,undefined,12);});
  [['F','#f47c38','10 · 15 min'],['G','#7dc874','8 · 12 min'],['A/C','#659eee','11 · 18 min']].forEach(([line,color,next],i)=>part(.22+i*.1,()=>{const y=176+i*76;this.card(83,y,346,66,i===0&&due?MINT:color);this.circle(115,y+32,21,color);this.text(line,115,y+33,line==='A/C'?14:25,'#07111b','center',600);this.text(i===0&&due?'Arriving now':i===0?'Coney Island / F':i===1?'Crosstown':'8 Avenue express',149,y+22,14,i===0&&due?MINT:INK,'left');this.label('THEN '+next,149,y+45,MUTED,'left',11);this.text(i===0&&due?'DUE':String((brooklyn?[6,3,8]:[4,2,4])[i]),392,y+24,i===0&&due?22:31,i===0&&due?MINT:INK);this.label(i===0&&due?'':'MIN',392,y+48,MUTED,undefined,10);if(i===0&&due){this.glow(393,y+27,38,MINT,.14+.05*Math.sin(clock*2));this.line(105,y+65,105+302*(.7+.3*Math.sin(clock*.8)),y+65,alpha(MINT,.6),1.5);}}));
 }
 timer(id,t,clock,part){const c=this.ctx,done=id==='done',left=id==='set'?300:done?0:Math.max(0,300-Math.floor(t)),progress=done?1:left/300;part(0,()=>this.header('TIMER',MINT));
  part(.1,()=>{this.glow(256,235,150,MINT,done?.19:.10);for(let i=0;i<60;i++){const a=i*TAU/60-Math.PI/2,r=i%5===0?133:138;this.line(256+Math.cos(a)*r,236+Math.sin(a)*r,256+Math.cos(a)*144,236+Math.sin(a)*144,'#9edfd338',i%5===0?2:1);}
   this.arc(256,236,119,0,TAU,'#a2e5df12',7);const ring=c.createLinearGradient(146,123,368,340);ring.addColorStop(0,MINT);ring.addColorStop(.5,BLUE);ring.addColorStop(1,'#e3fbff');c.save();c.shadowColor=alpha(MINT,.6);c.shadowBlur=14;this.arc(256,236,119,-Math.PI/2,-Math.PI/2+TAU*progress,ring,5);c.restore();
   if(!done){const a=-Math.PI/2+TAU*progress;this.circle(256+Math.cos(a)*119,236+Math.sin(a)*119,5,INK);this.text(`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`,256,234,73,INK,'center',300);this.label(id==='set'?'READY WHEN YOU ARE':'TIME REMAINING',256,286,MUTED,undefined,12);}else{this.circle(256,204,26,'#83f2d019');this.icon('check',256,204,26,MINT);this.text('All done',256,264,40);this.label('A MOMENT WELL SPENT',256,306,MUTED,undefined,11);}
  });
  part(.3,()=>this.text(done?'Your timer is complete':id==='set'?'A little time to focus.':'We’ll keep an eye on the time.',256,394,16,MUTED));
 }
 lightCard(pct,confirmed,clock,part){const color=AMBER;part(0,()=>this.header('LIGHTS',color));part(.1,()=>this.text('Living room',256,110,28,INK,'center',500));
  part(.18,()=>{this.glow(256,219,158,color,.12+pct*.002);this.arc(256,217,81,Math.PI*.77,Math.PI*2.23,'#ffcf9122',8);this.arc(256,217,81,Math.PI*.77,Math.PI*.77+Math.PI*1.46*pct/100,color,8);this.circle(256,205,42,'#ffcf9110');this.icon('bulb',256,204,47,color);this.text(pct+'%',256,307,52,INK,'center',300);this.label('WARM WHITE',256,351,color,undefined,12);});
 }
 voice(id,t,clock,dt,reduced,part){const c=this.ctx;
  if(id==='result'){this.lightCard(40,true,clock,part);return;}
  const mode=id==='think'?'think':id==='speak'?'speak':'listen',color=mode==='think'?LILAC:MINT;
  const level=reduced?0:Math.max(0,Math.sin(clock*13)*Math.sin(clock*4.1))*.6;
  this.field.tick(reduced?0:dt,mode,mode==='think'?0:level,false,false);c.save();c.globalAlpha=.7;this.field.render(c);c.restore();
  this.header('VOICE',color);
  part(.22,()=>this.label(id==='listen'?'LISTENING':id==='think'?'CONNECTING THE DOTS':'STATION',256,256,color,undefined,13));
  if(id==='listen'){this.words('Dim the living room',383,t-.3,reduced,23);}
  if(id==='think'){part(.25,()=>this.text('Finding just the right light.',256,383,21));}
  if(id==='speak'){this.words('Living room dimmed to 40%.',383,t,reduced,21);}
 }
 scene(id,t,clock,part){const done=id==='done',running=id==='running';part(0,()=>this.header('SCENES',LILAC));part(.1,()=>{this.glow(256,155,135,LILAC,.21);this.glow(279,158,63,AMBER,.12);this.icon('moon',256,155,52,AMBER);this.text('Good night',256,225,40,INK,'center',300);this.text(done?'Everything is taken care of.':running?'A softer landing for the day.':'Let the day wind down.',256,267,16,MUTED);});
  [['bulb','Lights','Dimmed'],['lock','Doors','Locked'],['moon','Display','Quiet']].forEach(([icon,title,result],i)=>part(.25+i*.1,()=>{const active=done||(running&&t>.5+i*.7),x=112+i*98;this.card(x,302,92,95,active?MINT:LILAC);this.icon(active?'check':icon,x+46,328,22,active?MINT:LILAC);this.text(title,x+46,357,13,INK);this.label(active?result:'Ready',x+46,378,active?MINT:MUTED,undefined,10);}));
 }
 night(id,t,clock,part){const c=this.ctx,brightness=id==='dim'?.3:id==='wake'?.3+.7*ease(t/1.1):1;
  c.save();c.globalAlpha=brightness;
  part(0,()=>{this.header('NIGHT',LILAC);this.icon('moon',256,126,27,LILAC);});
  part(.12,()=>{this.glow(256,231,130,LILAC,.07);this.text('23:10',256,223,99,'#d9d9fa','center',300);this.label('WEDNESDAY, SEP 9',256,291,'#858eaf',undefined,13);});
  part(.3,()=>{this.line(204,329,308,329,'#c5b2ff25');this.icon('sun',183,366,20,'#ac9fc6');this.text('Tomorrow, 6:40',270,366,17,'#ac9fc6');});
  c.restore();
 }
}
