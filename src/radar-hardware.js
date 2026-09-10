// Hardware specifications are sourced; simulation parameters are independent
// educational assumptions, not a fit to any manufacturer's accuracy claim.
const radians=d=>d*Math.PI/180;
const noise=(range,azimuth=.7,elevation=.9)=>({range,azimuth:radians(azimuth),elevation:radians(elevation)});
function aim(s){const center={x:s.room?7.8:2.8,y:3,z:1.35};s.azimuth=Math.atan2(center.y-s.y,center.x-s.x);s.elevation=Math.atan2(center.z-s.z,Math.hypot(center.x-s.x,center.y-s.y));s.heading=s.azimuth*180/Math.PI;s.fov=s.hfov;return s;}
function pointSensors(rig,layout,family){const source=family==='optical'?rig.ranges:rig.cameras;return source.map((s,i)=>aim({...s,id:(family==='optical'?'D':'M')+(i+1),kind:'point',family,z:layout==='flat'?1.3:family==='optical'?[1.6,2.6,1.9,2.4][i%4]:[2.1,2.5][i%2],minRange:family==='optical'?.6:.15,range:family==='optical'?4:8,hfov:family==='optical'?87:120,vfov:family==='optical'?58:40}));}
export const HARDWARE_PRESETS=[
 {id:'csi',version:'V0',name:'ESP32 / CSI',tag:'ORIGINAL FOUNDATION',target:'Unlabeled radio disturbance',classLabel:'Room presence',
  summary:'Eight ESP32 radios reconstruct an X/Y disturbance field. This configuration has no direct height observation.',
  bill:'8 × ESP32 CSI nodes + Wi-Fi host running the existing Python pipeline.',
  spec:'The project documents two-node presence tests. Its multi-node localization results are synthetic. No measured centimeter-level or Z accuracy.',
  model:'Source-derived 2D RTI on a ~15 cm grid. No camera, range, or depth observations.',
  limits:'A quiet or stationary body may stop disturbing the motion window. Finer display pixels do not add spatial information.',
  integration:'Existing source architecture; more nodes and actual room localization still need installation testing.',cost:'Lowest hardware complexity',noise:noise(.25),
  sources:[['Project review','docs/csi-presence-review.md']],
  buildRig:rig=>({...rig,cameras:[],ranges:[],points:[]})},
 {id:'hybrid',version:'V1',name:'ESP32 / hybrid',tag:'GEOMETRY EXPERIMENT',target:'One associated synthetic centroid',classLabel:'Coarse sensor fusion',
  summary:'Four ESP32 camera views and eight LD2410 range constraints show how staggered mounts can help recover Z.',
  bill:'8 × ESP32 + LD2410 modules; 4 × ESP32-CAM or P4 camera nodes; surveyed mounts; host.',
  spec:'LD2410 reports range in centimeters; this is not centimeter accuracy. Its protocol offers 0.75 m / 0.2 m gate settings, subject to firmware support.',
  model:'Assumed range noise scale 25 cm; azimuth 0.7°; elevation 0.9°. Ideal single-target association and known sensor poses.',
  limits:'Real modules may select different reflections or people. Combining their ranges as one point is an unvalidated extension, especially at different heights.',
  integration:'Existing UART/camera ingest can be reused; cross-sensor association and this 3D solver are new host work.',cost:'Low hardware cost · substantial calibration work',noise:noise(.25),
  sources:[['Hi-Link LD2410 protocol','https://r0.hlktech.com/download/HLK-LD2410-24G/1/LD2410%20%E4%B8%B2%E5%8F%A3%E9%80%9A%E4%BF%A1%E5%8D%8F%E8%AE%AE%20V1.07.pdf']],
  buildRig:rig=>rig},
 {id:'radar',version:'V2',name:'3D mmWave',tag:'MARKERLESS / DARKNESS',target:'Associated radar track centroid',classLabel:'Decimeter reference',
  summary:'Four TI IWR6843-class radars provide XYZ tracks with range, azimuth and elevation. No worn tag is required.',
  bill:'4 × IWR6843ISK / ODS evaluation boards, two per room; USB or UART gateways; host track fusion.',
  spec:'TI’s TIDEP-01000 reference design reports ±10 cm people-location accuracy in its demonstration. Its 8.4 cm range resolution is a different metric.',
  model:'Each visible radar supplies an associated XYZ point with 12 cm noise scale per axis. Demonstration cones: 120° × 40°; capped at 8 m.',
  limits:'A moving radar centroid is not a fixed anatomical point. Reflections, sparse elevation data, interference and track association can dominate error.',
  integration:'Decode TI point-cloud/target TLVs, transform poses and synchronize tracks. The current LD2410 parser cannot ingest this data.',cost:'Development-kit hardware · custom host integration',noise:noise(.12),
  sources:[['TI people-tracking design guide','https://www.ti.com/lit/ug/tidue71d/tidue71d.pdf']],
  buildRig:(rig,layout)=>({...rig,cameras:[],ranges:[],points:pointSensors(rig,layout,'radar')})},
 {id:'uwb',version:'V3',name:'UWB / tagged',tag:'COOPERATIVE RF',target:'A worn or attached UWB tag',classLabel:'10–30 cm product class',
  summary:'Eight Qorvo UWB anchors at staggered heights range to one tag. This supplies a track identity and independent distance measurements.',
  bill:'8 × DWM3001C anchor nodes + 1 tag, mounting survey, anchor firmware and host bridge. Four anchors per room; one lost anchor may invalidate range-only height.',
  spec:'Qorvo lists <15 cm 2D and <30 cm 3D location accuracy for DWM3001C. That is not a room-wide 1 cm XYZ specification.',
  model:'Assumed 10 cm line-of-sight range noise; 1 mm numeric quantization. Four noncoplanar visible anchors are needed for range-only Z.',
  limits:'The tag position differs from body centroid. Wall-crossing ranges are discarded here; the model does not reproduce NLOS bias or body shadowing.',
  integration:'New UWB firmware and timestamped ranging adapter. DWM3001C includes an nRF52833; DWM3000 instead needs an external MCU.',cost:'Moderate RF hardware · a tag for each tracked subject',noise:noise(.10),quantum:.001,
  sources:[['Qorvo DWM3001C specifications','https://www.qorvo.com/products/p/DWM3001C'],['Qorvo DWM3000 module','https://www.qorvo.com/products/p/DWM3000']],
  buildRig:rig=>({...rig,cameras:[],ranges:rig.ranges.map((s,i)=>({...s,id:'U'+(i+1),range:15,hfov:360,vfov:180})),points:[]})},
 {id:'depth',version:'V4',name:'Depth + mmWave',tag:'MARKERLESS PROTOTYPE',target:'One matched visible keypoint',classLabel:'Centimeter-class test ROI',
  summary:'Eight calibrated RealSense D455 views, supported by four 3D radars, prioritize optical geometry while radar retains broader coverage.',
  bill:'8 × D455 (four per room), 4 × IWR6843 radars, powered USB3 distribution, synchronization, surveyed mounts and host.',
  spec:'D455 specifies <2% depth error at 4 m—roughly 8 cm axial error at that distance. It does not specify 1 cm person tracking throughout a room.',
  model:'Optical point noise scale = 10 mm + 4 mm × distance² (meters); optical range 0.6–4 m. Point noise is isotropic in this simplified model. Radar XYZ noise scale 12 cm.',
  limits:'This model assumes a correctly matched keypoint. Texture, occlusion, depth holes, calibration drift and body-pose inference are not reproduced.',
  integration:'New depth SDK adapter, extrinsic calibration, synchronized timestamps and keypoint association. Radar and optical targets must refer to the same point.',cost:'Higher sensor count · USB bandwidth and host compute',noise:noise(.12),
  sources:[['RealSense D455','https://www.realsenseai.com/products/real-sense-depth-camera-d455f/']],
  buildRig:(rig,layout)=>({...rig,cameras:[],ranges:[],points:[...pointSensors(rig,layout,'optical'),...pointSensors(rig,layout,'radar')]})},
 {id:'optical',version:'V5',name:'Optical / reference',tag:'HIGHEST PRECISION OPTION',target:'A reflective marker or rigid marker cluster',classLabel:'Sub-centimeter reference',
  summary:'Sixteen synchronized OptiTrack PrimeX 120W cameras triangulate cooperative IR markers. This is the strongest precision option researched here.',
  bill:'16 × PrimeX 120W, eight views per room at three heights; vendor-approved PoE++ Type 4 power/network, licensed Windows Motive host, calibration wand, floor reference and marker cluster.',
  spec:'OptiTrack lists typical ±0.10 mm 3D accuracy for a 9 × 9 m tracking area. That vendor example is not a guarantee for this two-room rig or an unmarked person.',
  model:'Assumed 0.02° azimuth/elevation noise; 2 mm camera residual floor; 8 m demo optical cutoff; 65° × 51° wide lenses.',
  limits:'Requires markers, calibrated overlapping sightlines and synchronization. Marker loss, correspondence, rig movement and global registration error can outweigh sensor noise.',
  integration:'Stream marker/rigid-body data via Motive/NatNet into the host. CSI remains a separate presence layer; it should not dilute a valid optical reference.',cost:'Specialist motion-capture system · vendor-designed coverage',noise:noise(.001,.02,.02),sigmaFloor:.002,persistentOptical:true,
  sources:[['OptiTrack PrimeX 120','https://optitrack.com/cameras/primex-120/']],
  buildRig:(rig,layout)=>({...rig,cameras:[
   [.3,.3,2.7],[5.25,.3,2.7],[.3,5.7,2.7],[5.25,5.7,2.7],[.3,2.1,1.7],[5.25,4.1,1.7],[2,.3,.9],[3.7,5.7,.9],
   [5.95,.3,2.7],[9.7,.3,2.7],[5.95,5.7,2.7],[9.7,5.7,2.7],[5.95,4.1,1.7],[9.7,2.1,1.7],[7,5.7,.9],[8.7,.3,.9]
  ].map((p,i)=>aim({id:'C'+(i+1),kind:'camera',x:p[0],y:p[1],z:layout==='flat'?1.3:p[2],room:i<8?0:1,range:8,hfov:65,vfov:51})),ranges:[],points:[]})}
];
export function hardwarePreset(id){const p=HARDWARE_PRESETS.find(p=>p.id===id);if(!p)throw Error('Unknown hardware preset');return p;}
export function formatError(m){if(m===null||!Number.isFinite(m))return 'Unresolved';return m<.01?(m*1000).toFixed(1)+' mm':m<1?(m*100).toFixed(1)+' cm':m.toFixed(2)+' m';}
