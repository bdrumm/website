import * as THREE from 'three';
const std=(color,roughness,metalness)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const alu=std(0xc4c9ce,.38,.8),aluDark=std(0x8b939e,.4,.7),glassBlack=std(0x090b10,.18,.15),pcbMat=std(0x164537,.7,.1),chipMat=std(0x17191e,.8,.1),goldMat=std(0xc5a65f,.3,.8);
function screenMaterial(){return new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false});}
// Geometry adapted from Station's existing promotion site: centimetres.
function roundedBox(w,h,d,r){const s=new THREE.Shape();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:r*.4,bevelSize:r*.4,bevelSegments:3});g.translate(0,0,-d/2);return g;}

const R=2.55, T=1.21;
export function makeStation(opts){
  opts=opts||{}; const g=new THREE.Group(); const parts={};
  const prof=[[0,-T/2+.02],[1.75,-T/2+.02],[2.15,-T/2+.05],[2.38,-T/2+.14],[2.50,-T/2+.30],[R,-T/2+.5],[R,T/2-.40],[2.50,T/2-.16],[2.42,T/2-.05],[2.36,T/2-.02]].map(p=>new THREE.Vector2(p[0],p[1]));
  // Subdivide the sidewall so the pockets are actual recesses in the shell.
  const dense=[];for(let i=0;i<prof.length-1;i++){const steps=Math.max(1,Math.ceil(prof[i].distanceTo(prof[i+1])/(opts.shellStep??.025)));for(let j=0;j<steps;j++)dense.push(prof[i].clone().lerp(prof[i+1],j/steps));}dense.push(prof.at(-1));
  const shellGeometry=new THREE.LatheGeometry(dense,opts.shellSegments??720),positions=shellGeometry.attributes.position;
  const buttonAngles=[Math.PI/5.4,-Math.PI/5.4];
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i),height=positions.getY(i),radius=Math.hypot(x,z);if(radius<2.4)continue;const angle=Math.atan2(-z,x);let depth=0;
   for(const a of buttonAngles){const delta=Math.atan2(Math.sin(angle-a),Math.cos(angle-a));const tangent=R*delta;const dx=Math.max(Math.abs(tangent)-.255,0);const distance=Math.hypot(dx,height-.05)-.115;depth=Math.max(depth,.065*THREE.MathUtils.smoothstep(-distance,0,.025));}
   if(depth>0){positions.setX(i,x*(radius-depth)/radius);positions.setZ(i,z*(radius-depth)/radius);}
  }shellGeometry.computeVertexNormals();
  const shell=new THREE.Mesh(shellGeometry,alu); shell.rotation.x=Math.PI/2; shell.castShadow=true; shell.receiveShadow=true;
  parts.shell=new THREE.Group(); parts.shell.add(shell);
  const recess=new THREE.Mesh(new THREE.CylinderGeometry(1.75,1.75,.03,96),aluDark); recess.rotation.x=Math.PI/2; recess.position.z=-T/2+.02; parts.shell.add(recess);
  // Keep the inset keys; omit the left port and right grille from the preview.
  function insetKey(a,width,height,depth,radius,material,name){const geo=roundedBox(width,height,depth,Math.min(height*.4,.06));const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,p.getZ(i)-(R-Math.sqrt(R*R-x*x)));}geo.computeVertexNormals();
   const key=new THREE.Mesh(geo,material);key.name=name;key.position.set(Math.cos(a)*radius,Math.sin(a)*radius,.05);const basis=new THREE.Matrix4().makeBasis(new THREE.Vector3(-Math.sin(a),Math.cos(a),0),new THREE.Vector3(0,0,1),new THREE.Vector3(Math.cos(a),Math.sin(a),0));key.quaternion.setFromRotationMatrix(basis);parts.shell.add(key);return key;}
  for(const [i,a] of buttonAngles.entries()){
   insetKey(a,.70,.19,.008,R-.052,std(0x333a42,.6,.2),'Button pocket '+i);
   insetKey(a,.64,.14,.008,R-.038,aluDark,i===0?'Inset power button':'Inset boot button');
  }
  g.add(parts.shell);
  // bezel + glass
  parts.glass=new THREE.Group();
  const bezel=new THREE.Mesh(new THREE.RingGeometry(2.18,2.36,128),glassBlack); bezel.position.z=T/2-.02; parts.glass.add(bezel);
  const bezelWall=new THREE.Mesh(new THREE.CylinderGeometry(2.36,2.36,.07,128,1,true),glassBlack); bezelWall.rotation.x=Math.PI/2; bezelWall.position.z=T/2-.05; parts.glass.add(bezelWall);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(9.2,128,24,0,Math.PI*2,0,.258),new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.03,transparent:true,opacity:.035,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:.65,depthWrite:false}));
  dome.rotation.x=Math.PI/2; dome.position.z=T/2-.02-9.2+.3; parts.glass.add(dome);
  g.add(parts.glass);
  // screen
  parts.screen=new THREE.Group(); const smat=screenMaterial();
  const scr=new THREE.Mesh(new THREE.CircleGeometry(2.2,128),smat); scr.position.z=T/2-.012; scr.name="StationScreen";parts.screen.add(scr); parts.screen.mat=smat; g.add(parts.screen);
  // board
  parts.board=new THREE.Group();
  const pcb=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.3,.1,96),pcbMat); pcb.rotation.x=Math.PI/2; parts.board.add(pcb);
  for(const c of [[0.1,-.2,.9,.9,.12],[1.05,.55,.55,.55,.08],[-.9,.7,.5,.4,.08],[-.9,-.7,.6,.5,.08],[.9,-.85,.45,.45,.07],[0.2,1.3,.7,.35,.06]]){const m=new THREE.Mesh(new THREE.BoxGeometry(c[2],c[3],c[4]),chipMat);m.position.set(c[0],c[1],-.06-c[4]/2);parts.board.add(m);}
  const usb2=new THREE.Mesh(new THREE.BoxGeometry(.9,.32,.7),aluDark);usb2.position.set(-2.0,0,-.2);parts.board.add(usb2);
  for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.12,10),goldMat);p.rotation.x=Math.PI/2;p.position.set(-.5+i*.5,-1.95,-.12);parts.board.add(p);}
  const spk=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.3,32),std(0x2a2d33,.6,.3)); spk.rotation.x=Math.PI/2; spk.position.set(0,-.2,-.3); parts.board.add(spk);
  parts.board.visible=!!opts.exploded; g.add(parts.board);
  g.parts=parts; g.userData.solid=true; return g;
}
