// All dimensions are millimetres in the published CAD coordinate system.
// Eye-slot centers were checked against the actual base meshes, not image silhouettes.
export const STRAP_EYES=[[-271.5,-3.5,54],[271.5,-3.5,54]];
export const LIFESTYLE_SCENES={
 purse:{center:[.52,.70],width:.62,rotation:[-Math.PI/2,.06,-.17],key:[-600,800,650],keyColor:'#fff0db',exposure:1.01,strapTops:[[.64,.045],[.66,.045]]},
 essentials:{center:[.5,.44],width:.73,rotation:[.72,.10,-.06],angle:100,key:[-650,900,650],keyColor:'#fff0d4',exposure:1.04,ground:true},
 carry:{center:[.521,.558],width:.65,rotation:[-Math.PI/2,.055,-.235],key:[-500,650,800],keyColor:'#fff1df',exposure:1.05,strapTops:[[.368,-.07],[.64,-.07]]},
 rain:{center:[.512,.565],width:.595,rotation:[-Math.PI/2,.035,-.235],key:[-650,950,500],keyColor:'#e4ecf5',exposure:.91,wet:true,strapTops:[[.321,.265],[.658,.11]],occlusion:'polygon(59% 0%,72% 0%,74% 12%,70% 18%,63% 19%,60% 12%)'},
 picnic:{center:[.501,.488],width:.825,rotation:[.51,.18,-.22],angle:100,key:[-650,900,650],keyColor:'#fff0d4',exposure:1.04,ground:true},
 travel:{center:[.516,.544],width:.82,rotation:[.43,.16,-.15],key:[-700,750,-100],keyColor:'#fff2dd',exposure:1.04,ground:true},
 backpacking:{center:[.604,.704],width:.458,rotation:[-Math.PI/2,.16,-.28],key:[-700,1000,500],keyColor:'#ebf2df',exposure:.94,strapTops:[[.596,.139],[.624,.144]],occlusion:'polygon(63% 14%,68% 21%,72% 41%,77% 59%,73% 63%,67% 44%,62% 28%)'}
};

// Cameras use the same geometry and hinge as the working manufacturing review.
export const DETAIL_SCENES={
 closed:{target:[0,0,-20],camera:[120,180,680],width:350},
 open:{target:[0,0,-25],camera:[120,350,680],width:365,angle:100},
 hinge:{target:[150,0,-41],camera:[190,150,10],width:32,angle:100},
 rear:{target:[0,0,-39],camera:[90,140,-680],width:350},
 'hinge-mid':{target:[150,0,-41],camera:[190,150,10],width:32,angle:50},
 'hinge-closed':{target:[150,0,-41],camera:[190,150,10],width:32},
 'hinge-section':{target:[150,0,-41],camera:[50,2,-44],width:15,section:'hinge',angle:100},
 latch:{target:[134,-3,43],camera:[154,-135,200],width:40},
 'latch-under':{target:[134,-3,43],camera:[144,-180,80],width:40},
 // The isolated unloaded tongue and sliced layers remain their source CAD images.
 catch:{target:[150,-4,42],camera:[245,5,45],width:18,clip:'catch'},
 joint:{target:[-4,10,0],camera:[-85,150,220],width:85,angle:100,explode:24},
 'joint-section':{target:[1.5,39.8,0],camera:[1.5,39.8,100],width:22,section:'joint'},
 strap:{target:[271.5,-3.5,50],camera:[320,-50,160],width:40},
 'strap-tail':{target:[271.5,-3.5,48],camera:[280,12,180],width:43}
};
