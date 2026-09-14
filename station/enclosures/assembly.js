// Motion is an exploded assembly illustration, not flex/strain or cable simulation.
export const STEP_SECONDS=3.5;
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const basic={bezel:0,display:0,battery:0,insulator:0,speaker:0,camera:0,holder:0,device:0,lift:0,tilt:0,usb:0,screws:0,holderVisible:true,usbVisible:true,screwsVisible:false,release:false};
export function makeSequence(v,kind='assembly'){
  const wall=!!v.parts.holder,battery=!!v.parts.battery,camera=!!v.parts.camera,rear=['rear','surface'].includes(v.mode),legacy=v.release==='top';
  let pose={...basic,holderVisible:wall},steps=[];
  const add=(title,text,change={})=>{pose={...pose,...change};steps.push({title,text,pose:{...pose}});};
  if(kind==='removal'){
    add('Support the device',rear?'Support the display. Keep the rear USB service loop free; do not hang the device from the cable.':'Support the device and disconnect external USB before releasing it.',{usbVisible:rear});
    if(wall){
      add('Release the '+v.release+' catch',legacy?'Press the exposed upper release about 1.2 mm toward the wall. The animation marks the operation; it does not simulate spring deformation.':'Reach the recessed '+v.release+' paddle. Press about 2 mm toward the wall and hold it released. The animation does not simulate the spring.',{release:true});
      if(legacy){add('Tilt the top outward','Keep the lower ears supported while tilting the top away by about 8°.',{tilt:8*Math.PI/180});add('Lift out of the lower hooks','Lift approximately 3 mm, then withdraw the device.',{lift:3});}
      else add('Lift 4 mm','Keep the catch released and lift until the three hook heads line up with the wide entries.',{lift:4});
      add('Pull forward','Withdraw from the holder while supporting the device. Preserve slack in any connected rear USB cable.',{device:-60,release:false});
    }
    if(v.parts.bezel)add('Remove the front rim','Disconnect USB. Start at the blind seam notch using a plastic pick, then pull the bezel evenly forward. Release its four cam tongues gently; never lever on the glass.',{bezel:-85,usbVisible:false});
    add('Disconnect and open',battery?'Disconnect USB, remove the four rear screws and lift the intact display only as far as the leads allow. Disconnect BAT as soon as accessible.':'Disconnect USB, remove the four rear screws and lift the intact display only as far as the speaker lead allows.',{usbVisible:false,screwsVisible:true,screws:28});
    add('Service the interior','Support the screen separately, unplug internal connections, then open fully. The wide visual separation is for identification and is not available wire slack.',{display:-55});
    return {kind,steps,duration:steps.length*STEP_SECONDS,initial:steps[0].pose};
  }
  const initial={...basic,bezel:v.parts.bezel?-85:0,display:-68,battery:-32,insulator:-32,speaker:-28,camera:-28,holder:48,holderVisible:wall,usbVisible:false,screwsVisible:false,screws:30};pose={...initial};
  add('Prepare and dry-fit','Print and clean the fit coupons first. Check the glass, screw posts, speaker clips and real USB plugs. Keep the screen and PCB together; leave power disconnected.');
  if(battery)add('Seat the battery','Place the '+(v.hardware?.battery_casing_mm||v.parameters.battery).join(' × ')+' mm cased pack in its cradle. Use thin removable adhesive and board-facing insulating film; leave a pull tab. Route the lead internally and leave BAT unplugged.',{battery:0,insulator:0});
  if(camera)add('Seat the rear camera','Lift the lens module on its flex and seat its rigid section against the rear support. Aim the lens out of the rear aperture. Keep the ribbon relaxed and the lens unloaded.',{camera:0});
  add('Capture the speaker',v.archive&&['A','B','C'].includes(v.revision[0])?'Historical speaker seat: these revisions predate the confirmed 4 mm speaker correction. Inspect only; use a revised clip for the real speaker.':'Aim the sound outlet toward the grille. Slip the rigid housing under the fixed lips, then ease the opposite rim past both catches. Keep the leaf slots clear. Check the specified housing thickness and '+(v.hardware?.speaker_lead_mm||50)+' mm lead reach.',{speaker:0});
  add('Connect near the open case','Support the intact display close to the cup. Connect SPK'+(camera?' and CAMERA':'')+'. Rehearse the lead path and lowering. '+(battery?'Verify pack compatibility and polarity, then connect the main BAT header last.':'No battery or camera is installed in this wall configuration.'),{display:-12});
  add('Seat the intact display','Lower the screen and its attached PCB through the front. Align both USB sockets with the bottom openings. All four factory posts must rest on their seats without force.',{display:0});
  add('Fasten from the rear','Fit four M2.5 screws '+(v.board?.measured?'with 7 mm OD metal washers ':'')+'through the rear wells into the factory posts ('+(v.board?.pattern||[112,57]).join(' × ')+' mm pattern). Choose length from the usable thread depth; tighten gently in a diagonal order. The screws shown are references.',{screws:0,screwsVisible:true});
  if(v.parts.bezel)add('Fit the front rim','Check that the glass is seated and the rear screws are fitted. Align all four tongues with their grooves and press the bezel evenly until its cams seat. It overlaps the black glass border with 0.4 mm face clearance; do not clamp or glue the glass.',{bezel:0});
  if(wall){
    if(rear){add('Plug USB through the rear','With the device off the holder, insert the right-angle lead into USB-to-UART. '+(['i-s3','h-s2','l43','o43'].includes(v.id)?'Use a side-exit elbow; do not twist a USB plug inside its socket. ':'')+'The orange geometry is an unmeasured cable envelope.',{usbVisible:true,usb:0});}
    add('Fasten the wall holder',rear?'Route the source end '+(v.mode==='surface'?'through the rear opening or bottom exit':'through the center opening to the covered USB source')+'. Support the connected device beside the holder. Leave slack for the screws, docking and later release.':'Fasten the matching holder with the device removed. Check screw spacing, head clearance and free latch movement. Keep any electrical installation properly enclosed and covered.',{device:-70,holder:0,screwsVisible:false});
    if(legacy){
      add('Engage the lower ears','Hold the top tilted away about 8°. Place the lower ears in the old external hooks. This historical interface differs from the concealed slide mounts.',{device:0,tilt:8*Math.PI/180});
      add('Pivot into the upper catch','Pivot the device toward the holder until the upper catch engages. Check retention before releasing your support.',{tilt:0});
    }else{
      add('Align 4 mm high','Hold the case parallel to the holder, 4 mm above its final position. Align all three keyhole entries with the hook heads.',{device:-18,lift:4});
      add('Engage the three hooks','Push toward the wall so all heads enter their wide openings together. Keep any cable clear of the support pads and latch.',{device:0});
      add('Slide down to lock','Lower the device 4 mm until the '+v.release+' catch returns. Check that all hooks are captured and the latch is seated.',{lift:0});
    }
  }
  if(!rear)add('Connect bottom USB','Insert the supply into the exposed USB-to-UART port underneath. Support the case and leave strain relief slack. The second USB opening provides OTG access; it is not a second required power feed.',{usbVisible:true,usb:0});
  add('Check the assembled device','Confirm full USB seating, touch, audio and restart access. Check mount retention with a dummy load first, then monitor the actual assembly in use. CAD clearance is not physical fit, thermal or strength approval.',{screwsVisible:false});
  return {kind,steps,duration:steps.length*STEP_SECONDS,initial};
}
export function sampleSequence(sequence,time){
  const t=Math.max(0,Math.min(time,sequence.duration));const index=Math.min(sequence.steps.length-1,Math.floor(t/STEP_SECONDS));const f=t===sequence.duration?1:(t-index*STEP_SECONDS)/STEP_SECONDS;const to=sequence.steps[index].pose,from=index?sequence.steps[index-1].pose:sequence.initial;const pose={};
  for(const key of Object.keys(to))pose[key]=typeof to[key]==='number'?lerp(from[key],to[key],smooth(f)):to[key];
  return {index,progress:f,pose,step:sequence.steps[index]};
}
