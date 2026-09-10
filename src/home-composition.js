// Fractions of the visible half-width/height, leaving the center open to objects.
const layouts={
  trout:{desktop:[-.35,.37],mobile:[-.50,.45],size:4.5},
  'baguette-holder':{desktop:[-.24,-.36],mobile:[-.50,-.45],size:4.45},
  'modular-garage':{desktop:[.34,-.44],mobile:[.50,-.45],size:3.55},
  station:{desktop:[.24,.43],mobile:[.50,.45],size:3.5}
};
export function homePlacement(id,mobile,index=0){
  const item=layouts[id]||{desktop:[index%2?.34:-.34,index<2?.37:-.35],mobile:[index%2?.5:-.5,index<2?.45:-.45],size:3.8};
  return {position:item[mobile?'mobile':'desktop'],size:item.size};
}
export function stationRotation(time){
  return [.16+Math.sin(time*.42)*.20,-.32+time*Math.PI/12,-.10+Math.sin(time*.31)*.12];
}
