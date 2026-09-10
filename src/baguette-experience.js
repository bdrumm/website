import * as T from 'three';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
// Damped Verlet ribbon: gravity, stretch constraints, shoulder supports and body collision.
export class FabricStrap{
 constructor(parent){this.n=64;this.points=[];this.previous=[];this.lengths=[];this.ready=false;this.geometry=new T.BufferGeometry();this.positions=new Float32Array((this.n+1)*6);this.geometry.setAttribute('position',new T.BufferAttribute(this.positions,3));const indices=[];for(let i=0;i<this.n;i++){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}this.geometry.setIndex(indices);this.mesh=new T.Mesh(this.geometry,new T.MeshStandardMaterial({color:0x514066,roughness:.95,side:T.DoubleSide}));this.mesh.frustumCulled=false;parent.add(this.mesh);}
 reset(a,b){const controls=[a,V(-1.65,6.3,1.12),V(-1.65,6.7,0),V(-1.65,6.3,-1.12),b];const path=new T.CatmullRomCurve3(controls);this.points=path.getPoints(this.n);this.previous=this.points.map(p=>p.clone());this.lengths=this.points.slice(1).map((p,i)=>p.distanceTo(this.points[i])*1.015);this.ready=true;}
 update(dt,a,b,time,still=false){if(!this.ready)this.reset(a,b);const pin=new Map([[0,a],[16,V(-1.65,6.3,1.12)],[32,V(-1.65,6.7,0)],[48,V(-1.65,6.3,-1.12)],[64,b]]);const step=Math.min(dt,1/30);for(let i=1;i<this.n;i++){if(pin.has(i))continue;const p=this.points[i],old=p.clone();p.add(p.clone().sub(this.previous[i]).multiplyScalar(still?0:.97));p.y-=9.8*step*step;p.z+=(still?0:Math.sin(time*1.3+i*.18)*.7)*step*step;this.previous[i].copy(old);}
 for(let pass=0;pass<20;pass++){for(const [i,p] of pin)this.points[i].copy(p);for(let i=0;i<this.n;i++){const a=this.points[i],b=this.points[i+1],delta=b.clone().sub(a);const length=delta.length();if(length<1e-7)continue;delta.multiplyScalar((length-this.lengths[i])/length);const ap=pin.has(i),bp=pin.has(i+1);if(!ap&&!bp){a.addScaledVector(delta,.5);b.addScaledVector(delta,-.5);}else if(!ap)a.add(delta);else if(!bp)b.sub(delta);}
 // An ellipsoidal torso keeps the ribbon outside the figure.
 for(let i=1;i<this.n;i++){if(pin.has(i))continue;const p=this.points[i];const q=V(p.x/2.35,(p.y-2.7)/3.7,p.z/1.2);const r=q.length();if(r<1&&r>.001){q.multiplyScalar(1/r);p.set(q.x*2.35,q.y*3.7+2.7,q.z*1.2);}}
 }
 for(const [i,p] of pin)this.points[i].copy(p);
 for(let i=0;i<=this.n;i++){const tangent=this.points[Math.min(i+1,this.n)].clone().sub(this.points[Math.max(i-1,0)]).normalize();let width=V(0,0,1).cross(tangent);if(width.lengthSq()<.01)width=V(1,0,0);width.normalize().multiplyScalar(.17);this.points[i].clone().add(width).toArray(this.positions,i*6);this.points[i].clone().sub(width).toArray(this.positions,i*6+3);}
 this.geometry.attributes.position.needsUpdate=true;this.geometry.computeVertexNormals();
 }
}
export function createBaguetteExperience(model){
 const parent=model.parent,rig=new T.Group(),holder=new T.Group();parent.add(rig);rig.add(holder);holder.add(model);
 const person=new T.Group();rig.add(person);person.visible=false;const hologramTime={value:0};
 const figureMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.FrontSide,uniforms:{hologramTime},
 vertexShader:`varying vec3 holoNormal; varying vec3 holoView; varying vec3 holoWorld;
 void main(){vec4 world=modelMatrix*vec4(position,1.0);vec4 view=modelViewMatrix*vec4(position,1.0);holoWorld=world.xyz;holoNormal=normalize(normalMatrix*normal);holoView=-view.xyz;gl_Position=projectionMatrix*view;}`,
 fragmentShader:`uniform float hologramTime; varying vec3 holoNormal; varying vec3 holoView; varying vec3 holoWorld;
 void main(){float rim=pow(1.0-abs(dot(normalize(holoNormal),normalize(holoView))),2.1);float lines=smoothstep(0.65,0.95,sin(holoWorld.y*125.0));float scan=pow(0.5+0.5*sin(holoWorld.y*1.5-hologramTime*0.65),16.0);vec3 cyan=vec3(0.08,0.72,0.85);vec3 violet=vec3(0.49,0.26,0.95);vec3 color=mix(cyan,violet,0.35+0.25*sin(holoWorld.y*0.8));color+=rim*0.3+scan*0.1;gl_FragColor=vec4(color,0.12+rim*0.5+lines*0.10+scan*0.05);}`});
 function form(geometry,position,scale){const mesh=new T.Mesh(geometry,figureMat);mesh.position.copy(position);if(scale)mesh.scale.copy(scale);person.add(mesh);return mesh;}
 form(new T.SphereGeometry(1,24,16),V(0,2.7,0),V(2.15,3.55,1));form(new T.SphereGeometry(1,24,16),V(0,-1.1,0),V(1.65,1.8,.95));form(new T.SphereGeometry(1,24,16),V(0,8,0),V(1.05,1.4,1));
 function limb(a,b,r){const m=form(new T.CapsuleGeometry(r,a.distanceTo(b)-r*2,6,12),a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(V(0,1,0),b.clone().sub(a).normalize());}
 limb(V(-1,-2,0),V(-1.25,-9,0),.64);limb(V(1,-2,0),V(1.25,-9,0),.64);limb(V(-2,5.2,0),V(-3,-1.4,.2),.5);limb(V(2,5.2,0),V(3.2,-1.2,-.25),.5);
 const bread=new T.Group();holder.add(bread);bread.visible=false;const crust=new T.MeshStandardMaterial({color:0xc88a43,roughness:.87});const loaf=new T.Mesh(new T.CapsuleGeometry(.365,6.55,8,32),crust);loaf.rotation.z=Math.PI/2;bread.add(loaf);
 const crumb=new T.MeshStandardMaterial({color:0xf3d49a,roughness:1});for(let i=0;i<7;i++){const score=new T.Mesh(new T.CapsuleGeometry(.055,.46,4,12),crumb);score.rotation.z=-.55;score.rotation.x=Math.PI/2;score.position.set(-2.8+i*.9,.34,.025);bread.add(score);}
 const strap=new FabricStrap(rig);strap.mesh.visible=false;
 const anchors=[V(-271.5,-3.5,40.9),V(271.5,-3.5,40.9)];const rings=[];
 // Metal clips pass through the two existing lug apertures.
 for(const anchor of anchors){const ring=new T.Mesh(new T.TorusGeometry(5.5,1.2,8,24),new T.MeshStandardMaterial({color:0xaca8b5,metalness:.85,roughness:.28}));ring.position.copy(anchor);model.add(ring);ring.visible=false;rings.push(ring);}
 let carry=false,loaded=false,loadAmount=0,carryAmount=0,time=0;
 return {
  setLoaded(value){loaded=value;},setCarry(value){carry=value;strap.ready=false;},
  update(dt,reduced){time+=dt;hologramTime.value=reduced?0:time;loadAmount=reduced?(loaded?1:0):T.MathUtils.damp(loadAmount,loaded?1:0,3.5,dt);carryAmount=reduced?(carry?1:0):T.MathUtils.damp(carryAmount,carry?1:0,4,dt);if(Math.abs(carryAmount-(carry?1:0))<.001)carryAmount=carry?1:0;
   bread.visible=loadAmount>.005;bread.position.y=3.2*(1-loadAmount);bread.position.z=-.083;
   person.visible=carryAmount>.005;person.scale.setScalar(Math.max(.001,carryAmount));rig.scale.setScalar(T.MathUtils.lerp(1,.44,carryAmount));holder.scale.setScalar(T.MathUtils.lerp(1,.65,carryAmount));holder.position.set(2.2*carryAmount,-2.6*carryAmount,1.9*carryAmount);holder.rotation.z=1.12*carryAmount;holder.rotation.y=carryAmount*(reduced?0:.025*Math.sin(time*1.1));
   rig.updateMatrixWorld(true);strap.mesh.visible=carryAmount>.98;rings.forEach(r=>r.visible=carryAmount>.98);if(strap.mesh.visible){const ends=anchors.map(a=>rig.worldToLocal(model.localToWorld(a.clone().add(V(0,5.5,0)))));if(!strap.ready){strap.reset(...ends);for(let i=0;i<120;i++)strap.update(1/60,...ends,time,true);}strap.update(dt,...ends,time,reduced);}
  },rig,bread,strap,anchors,holder,person
 };
}
