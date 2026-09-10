// Fixed educational XY samples, independent of the hardware simulation.
const base=[[.3,0],[-.3,0],[0,.3],[0,-.3],[.2,.2],[.2,-.2],[-.2,.2],[-.2,-.2]];
const examples={
 scattered:{label:'Scattered',copy:'The readings average to the reference, but individual measurements spread outside the 1 cm target.',scale:8,offset:[0,0]},
 aligned:{label:'Tight & aligned',copy:'Repeated readings stay close to each other and to the known reference. All eight are within 1 cm.',scale:1,offset:[0,0]},
 offset:{label:'Tight & offset',copy:'The same tight cluster shifts 3 cm in X and 2 cm in Y. Repeatability stays the same, while every reading misses the 1 cm target.',scale:1,offset:[3,2]}
};
export function precisionExample(id){
 const config=examples[id];if(!config)throw Error('Unknown precision example');
 const points=base.map(([x,y])=>[x*config.scale+config.offset[0],y*config.scale+config.offset[1]]);
 const mean=points.reduce((a,p)=>[a[0]+p[0]/points.length,a[1]+p[1]/points.length],[0,0]);
 const spread=Math.sqrt(points.reduce((sum,[x,y])=>sum+(x-mean[0])**2+(y-mean[1])**2,0)/points.length);
 const rms=Math.sqrt(points.reduce((sum,[x,y])=>sum+x*x+y*y,0)/points.length);
 return{...config,id,points,mean,spread,rms,bias:Math.hypot(...mean),within:points.filter(([x,y])=>Math.hypot(x,y)<=1).length};
}
function plot(example){
 const p=([x,y])=>[180+x*26,172-y*26];
 const [mx,my]=p(example.mean),ticks=[-5,-2.5,0,2.5,5];
 return `<svg viewBox="0 0 360 360" role="img" aria-labelledby="precision-plot-title precision-plot-desc"><title id="precision-plot-title">${example.label}: eight illustrative XY measurements</title><desc id="precision-plot-desc">Both axes show minus five to plus five centimeters of position error. The reference is at zero. The green circle has a one centimeter radius. ${example.within} of eight samples are within it. RMS position error is ${example.rms.toFixed(2)} centimeters. Mean offset is ${example.bias.toFixed(2)} centimeters.</desc><rect width="360" height="360" rx="8" fill="#091525"/>
 ${ticks.map(t=>{const[x,y]=p([t,t]);return `<path d="M${x} 42V302M50 ${y}H310" stroke="${t===0?'#577487':'#21394c'}" stroke-width="${t===0?1.3:.7}"/><text x="${x}" y="324" text-anchor="middle">${t}</text><text x="38" y="${y+5}" text-anchor="end">${t}</text>`;}).join('')}
 <circle cx="180" cy="172" r="26" fill="#83f2d214" stroke="#83f2d2" stroke-width="1.5"/>
 ${example.bias>0?`<path d="M180 172L${mx} ${my}" stroke="#efbd7d" stroke-width="1.2" stroke-dasharray="4 5"/>`:''}
 <path d="M172 172H188M180 164V180" stroke="white" stroke-width="2"/>
 ${example.points.map(point=>{const[x,y]=p(point);return `<circle cx="${x}" cy="${y}" r="3.7" fill="#92b9ff" stroke="#091525" stroke-width=".8"/>`;}).join('')}
 <path d="M${mx} ${my-9}L${mx+9} ${my}L${mx} ${my+9}L${mx-9} ${my}Z" fill="none" stroke="#efbd7d" stroke-width="1.5"/>
 <text x="50" y="24">Y ERROR / cm</text><text x="180" y="348" text-anchor="middle">X ERROR / cm</text></svg>`;
}
export function precisionExampleContent(){
 const example=precisionExample('aligned');
 return `<section class="radar-precision-example" aria-labelledby="precision-example-title"><div class="radar-precision-visual"><div data-precision-plot>${plot(example)}</div><div class="radar-precision-legend"><span><i class="sample"></i>Measurement</span><span><b>＋</b>Reference</span><span><b class="mean">◇</b>Mean</span><span><i class="tolerance"></i>1 cm radius</span></div></div><div class="radar-precision-copy"><span class="radar-kicker">ILLUSTRATIVE XY EXAMPLE</span><h3 id="precision-example-title">A tight cluster can still miss.</h3><p>Eight readings of one fixed reference. The green ring marks a 1 cm distance; each example uses the same ±5 cm axes.</p><div class="radar-precision-choices" role="group" aria-label="Precision example">${Object.entries(examples).map(([id,e])=>`<button type="button" data-precision-mode="${id}" aria-pressed="${id==='aligned'}">${e.label}</button>`).join('')}</div><p data-precision-copy aria-live="polite">${example.copy}</p><dl class="radar-precision-metrics"><div><dt>Repeatability spread</dt><dd data-precision-spread>${example.spread.toFixed(2)} cm</dd></div><div><dt>Mean offset</dt><dd data-precision-bias>${example.bias.toFixed(2)} cm</dd></div><div><dt>RMS position error</dt><dd data-precision-rms>${example.rms.toFixed(2)} cm</dd></div><div><dt>Within 1 cm</dt><dd data-precision-within>${example.within} / 8</dd></div></dl><p class="radar-precision-note">Constructed points explain repeatability and accuracy. They are not hardware measurements or a prediction of any preset’s performance. Spread is the RMS distance from the sample mean; position error is measured from the known reference.</p></div></section>`;
}
export function bindPrecisionExample(container,signal){
 const q=s=>container.querySelector(s),buttons=[...container.querySelectorAll('[data-precision-mode]')];
 for(const button of buttons)button.addEventListener('click',()=>{
  const example=precisionExample(button.dataset.precisionMode);
  for(const b of buttons)b.setAttribute('aria-pressed',String(b===button));
  q('[data-precision-plot]').innerHTML=plot(example);q('[data-precision-copy]').textContent=example.copy;
  for(const key of ['spread','bias','rms'])q('[data-precision-'+key+']').textContent=example[key].toFixed(2)+' cm';
  q('[data-precision-within]').textContent=example.within+' / '+example.points.length;
 },{signal});
}
