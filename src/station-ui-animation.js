// Regions follow the actual Station OS captures. Each component fades/slides in
// independently; the last frame is the unmodified source screen.
export const UI_REGIONS={
 home:[[0,0,512,100],[0,100,512,135],[0,235,512,40],[0,275,256,110],[256,275,256,110],[0,385,512,127]],
 night:[[0,0,512,100],[0,100,512,135],[0,235,512,40],[0,275,256,110],[256,275,256,110],[0,385,512,127]],
 weather0:[[0,0,512,120],[0,120,512,80],[0,200,512,100],[0,300,512,100],[0,400,512,112]],
 subway:[[0,0,512,112],[0,112,512,105],[0,217,512,105],[0,322,512,105],[0,427,512,85]],
 timer:[[0,0,512,90],[0,90,512,205],[0,295,512,90],[0,385,512,127]],
 lights:[[0,0,512,140],[0,140,512,100],[0,240,512,70],[0,310,512,100],[0,410,512,102]],
 scene:[[0,0,512,150],[0,150,512,140],[0,290,512,115],[0,405,512,107]],
 listen:[[0,0,512,180],[0,180,512,120],[0,300,512,95],[0,395,512,117]],
 think:[[0,0,512,180],[0,180,512,120],[0,300,512,95],[0,395,512,117]],
 speak:[[0,0,512,160],[0,160,512,160],[0,320,512,95],[0,415,512,97]]
};
export function regionProgress(time,index){const t=Math.max(0,Math.min(1,(time-.12-index*.14)/.48));return 1-Math.pow(1-t,3);}
export function screenDuration(id){return .12+(UI_REGIONS[id].length-1)*.14+.48;}
export function drawScreenEntry(ctx,image,id,time,reduced=false){
 const regions=UI_REGIONS[id]||UI_REGIONS.home;
 ctx.globalAlpha=1;ctx.filter='none';
 if(reduced||time>=screenDuration(id)){ctx.drawImage(image,0,0,512,512);return true;}
 ctx.fillStyle='#04141e';ctx.fillRect(0,0,512,512);
 // A soft hint of the screen's own ambient color appears before content.
 ctx.save();ctx.globalAlpha=.18;ctx.filter='blur(24px)';ctx.drawImage(image,0,0,512,512);ctx.restore();
 for(let i=0;i<regions.length;i++){const p=regionProgress(time,i);if(p===0)continue;const [x,y,w,h]=regions[i];ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.globalAlpha=p;ctx.drawImage(image,x,y,w,h,x,y+10*(1-p),w,h);ctx.restore();}
 ctx.globalAlpha=1;return false;
}
