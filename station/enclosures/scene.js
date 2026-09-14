const T=window.THREE;
export const names={bezel:'Front rim',case:'Device case',holder:'Wall holder',display:'Screen + PCB',speaker:'Speaker',battery:'Battery',insulator:'Insulating film',camera:'Rear camera',usb0:'USB envelope 1',usb1:'USB envelope 2',bay:'10 mm shared bay',screws:'M2.5 screws · reference'};
export const colors={bezel:0xc3d0cd,case:0xe0e5e3,holder:0x528b90,glass:0x121e29,pcb:0x35735f,modules:0x8d9d9e,speaker:0x334454,battery:0xd9ad58,insulator:0xeee4bc,camera:0x26323c,usb0:0xd68e54,usb1:0xd68e54,bay:0x9cc6db,screws:0xa8b8c2};
export class CaseScene{
  constructor(stage){
    this.stage=stage;this.canvas=stage.querySelector('canvas');this.loading=stage.querySelector('#loading');
    this.renderer=new T.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputEncoding=T.sRGBEncoding;this.renderer.setClearColor(0,0);
    this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(34,1,1,1800);this.camera.up.set(0,1,0);
    this.controls=new T.OrbitControls(this.camera,this.canvas);this.controls.minDistance=40;this.controls.maxDistance=950;
    this.scene.add(new T.HemisphereLight(0xffffff,0x40505f,1.05));for(const [x,y,z,p] of [[-150,170,-240,.85],[160,70,150,.65],[0,-80,-120,.3]]){const l=new T.DirectionalLight(0xffffff,p);l.position.set(x,y,z);this.scene.add(l);}
    this.frame=new T.Group();this.frame.rotation.z=Math.PI/2;this.frame.position.x=70.7;this.scene.add(this.frame);
    this.controls.addEventListener('change',()=>this.render());this.cache=new Map();this.version=0;this.meshes={};this.hidden=new Set();this.view='installed';this.labels=true;this.xray=false;
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(stage);
  }
  async geometry(url){if(!this.cache.has(url))this.cache.set(url,new T.STLLoader().loadAsync(url));return this.cache.get(url);}
  async load(v){
    const version=++this.version;this.loading.hidden=false;this.loading.textContent='Loading '+v.revision+' CAD geometry…';
    const entries=await Promise.all(Object.entries(v.parts).map(async([name,url])=>[name,await this.geometry(url)]));
    if(version!==this.version)return false;
    this.clear();this.variant=v;this.frame.position.x=v.board?.glass[1]||70.7;this.hidden=new Set();this.device=new T.Group();this.display=new T.Group();this.device.add(this.display);this.frame.add(this.device);
    for(const [name,g] of entries){
      const material=new T.MeshStandardMaterial({color:colors[name],roughness:name==='glass'?.25:.62,metalness:name==='modules'?.25:0,side:T.DoubleSide,transparent:name==='bay',opacity:name==='bay'?.2:1,depthWrite:name!=='bay'});
      const mesh=new T.Mesh(g,material);this.meshes[name]=mesh;(name==='holder'?this.frame:['glass','pcb','modules'].includes(name)?this.display:this.device).add(mesh);
      if(['case','holder','bezel'].includes(name)){const edges=new T.LineSegments(new T.EdgesGeometry(g,40),new T.LineBasicMaterial({color:0x263c47,transparent:true,opacity:.13}));mesh.add(edges);}
    }
    const board=v.board||{glass:[126.9,70.7],active:[110.32,62.28],posts:[[4.8,6.85],[4.8,63.85],[116.8,6.85],[116.8,63.85]],postZ:11.6};
    this.active=new T.Mesh(new T.BoxGeometry(...board.active,.05),new T.MeshStandardMaterial({color:0x254456,roughness:.38,side:T.DoubleSide}));this.active.position.set(board.glass[0]/2,board.glass[1]/2,-.025);this.display.add(this.active);
    this.screws=new T.Group();for(const [x,y] of board.posts){const sh=new T.Mesh(new T.CylinderGeometry(1.25,1.25,board.measured?4:2.5,12),new T.MeshStandardMaterial({color:colors.screws,metalness:.45,roughness:.4}));sh.rotation.x=Math.PI/2;sh.position.set(x,y,board.postZ+(board.measured?.5:1.25));this.screws.add(sh);const hd=new T.Mesh(new T.CylinderGeometry(2.25,2.25,1.4,16),sh.material);hd.rotation.x=Math.PI/2;hd.position.set(x,y,board.postZ+3.2);this.screws.add(hd);}this.device.add(this.screws);
    this.labelEls={};for(const name of ['case','bezel','holder','speaker','battery','camera','display'])if(name==='display'||this.meshes[name]){const el=document.createElement('span');el.className='part-label';el.textContent=names[name];this.stage.appendChild(el);this.labelEls[name]=el;}
    this.releaseArrow=null;if(v.release){const u=v.release==='right'?board.glass[1]-6.1:v.release==='left'?6.1:board.glass[1]/2,cy=v.release==='top'?134:v.release==='bottom'?1:51;this.releaseArrow=new T.ArrowHelper(new T.Vector3(0,0,1),new T.Vector3(cy,board.glass[1]-u,v.rim-.4),10,0xffc676,3,2);this.releaseArrow.visible=false;this.frame.add(this.releaseArrow);}
    this.showView(this.view);this.loading.hidden=true;return true;
  }
  clear(){for(const el of Object.values(this.labelEls||{}))el.remove();for(const child of [...this.frame.children]){child.traverse(o=>{if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}if(o.type==='LineSegments')o.geometry.dispose();});this.frame.remove(child);}this.meshes={};}
  resetPose(){if(!this.device)return;this.device.position.set(0,0,0);this.device.rotation.set(0,0,0);this.display.position.set(0,0,0);this.display.rotation.set(0,0,0);this.screws.position.set(0,0,0);for(const m of Object.values(this.meshes)){m.position.set(0,0,0);m.rotation.set(0,0,0);}this.screws.visible=false;if(this.releaseArrow)this.releaseArrow.visible=false;}
  visibility(){
    if(!this.device)return;this.display.visible=!['inside','mount'].includes(this.view)&&!this.hidden.has('display');
    for(const [name,m] of Object.entries(this.meshes)){m.visible=!this.hidden.has(name)&&(['glass','pcb','modules'].includes(name)||this.view!=='mount'||name==='holder');if(name==='holder'&&['inside','rear'].includes(this.view))m.visible=false;if(name==='bezel'&&this.view==='inside')m.visible=false;if(name==='bay')m.visible=this.xray&&!this.hidden.has(name);}
    for(const name of ['case','holder','bezel'])if(this.meshes[name]){const m=this.meshes[name].material;m.transparent=this.xray;m.opacity=this.xray?.22:1;m.depthWrite=!this.xray;}
  }
  showView(view){this.view=view;this.resetPose();this.visibility();if(view==='exploded'&&this.device){this.display.position.z=-52;if(this.meshes.bezel)this.meshes.bezel.position.z=-80;for(const n of ['speaker','battery','camera','insulator'])if(this.meshes[n])this.meshes[n].position.z=-24;if(this.meshes.holder)this.meshes.holder.position.z=48;this.screws.position.z=25;this.screws.visible=true;}this.fit();this.render();}
  setPose(p){
    if(!this.device)return;this.resetPose();this.view='assembly';this.visibility();const angle=p.displayTilt||0,pivot=this.variant?.board?.glass[1]||65;this.display.rotation.x=angle;this.display.position.y=pivot*(1-Math.cos(angle))+(p.displayShift||0);this.display.position.z=p.display-pivot*Math.sin(angle);
    this.device.position.set(p.lift||0,0,p.device||0);
    if(p.tilt){this.device.rotation.y=p.tilt;const pivot=12;this.device.position.x+=pivot*(1-Math.cos(p.tilt));this.device.position.z+=pivot*Math.sin(p.tilt);}
    for(const name of ['battery','insulator','speaker','camera','bezel'])if(this.meshes[name])this.meshes[name].position.z=p[name]||0;
    if(this.meshes.holder){this.meshes.holder.visible=p.holderVisible&&!this.hidden.has('holder');this.meshes.holder.position.z=p.holder||0;}
    for(const n of ['usb0','usb1'])if(this.meshes[n]){this.meshes[n].visible=p.usbVisible&&!this.hidden.has(n);this.meshes[n].position.x=p.usb||0;}
    this.screws.visible=p.screwsVisible&&!this.hidden.has('screws');this.screws.position.z=p.screws||0;if(this.releaseArrow)this.releaseArrow.visible=p.release;this.render();
  }
  bounds(){this.frame.updateMatrixWorld(true);const b=new T.Box3();if(!this.device)return b.setFromCenterAndSize(new T.Vector3(35,60,0),new T.Vector3(75,145,30));this.frame.traverse(m=>{if(m.isMesh&&m.visible&&m.parent.visible&&(m.parent!==this.display||this.display.visible)&&m!==this.active)b.expandByObject(m);});return b;}
  fit(assembly=false){
    const b=this.bounds();if(b.isEmpty())return;
    if(assembly)b.set(new T.Vector3(-7,-20,-150),new T.Vector3(78,140,65));
    const target=b.getCenter(new T.Vector3());const dir=new T.Vector3(...({installed:[-.28,-.15,-1],inside:[-.1,.15,-1],rear:[.15,-.6,1],exploded:[-.7,.1,-1],mount:[-.25,.1,-1],side:[1,0,.06],assembly:[-.8,.15,-1]})[this.view]).normalize();
    const right=new T.Vector3().crossVectors(this.camera.up,dir).normalize(),up=new T.Vector3().crossVectors(dir,right).normalize();const tv=Math.tan(T.MathUtils.degToRad(this.camera.fov/2)),th=tv*this.camera.aspect;let d=50;
    for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new T.Vector3(x,y,z).sub(target);d=Math.max(d,Math.abs(p.dot(right))*1.2/th+p.dot(dir),Math.abs(p.dot(up))*1.15/tv+p.dot(dir));}
    this.controls.target.copy(target);this.camera.position.copy(target).addScaledVector(dir,d);this.controls.update();
  }
  resize(){const w=this.stage.clientWidth,h=this.stage.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.fit(this.view==='assembly');this.render();}
  render(){
    this.renderer.render(this.scene,this.camera);
    for(const [name,el] of Object.entries(this.labelEls||{})){const obj=name==='display'?this.display:this.meshes[name];const show=this.labels&&['inside','exploded','assembly','mount'].includes(this.view)&&obj.visible&&obj.parent.visible;el.hidden=!show;if(!show)continue;const b=new T.Box3().setFromObject(obj),point=b.getCenter(new T.Vector3()).project(this.camera);el.style.left=(point.x*.5+.5)*this.stage.clientWidth+'px';el.style.top=(-point.y*.5+.5)*this.stage.clientHeight+'px';el.hidden=Math.abs(point.x)>1||Math.abs(point.y)>1||point.z>1;}
  }
}
