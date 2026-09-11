export const GARAGE_CAMERAS = ['overview', 'front', 'rear', 'top', 'hinge'];
export const GARAGE_DEFAULT_VIEW = Object.freeze({layout:'row',door:45,roof:0,explode:0,camera:'overview'});
export function parseGarageView(hash='') {
  const result={...GARAGE_DEFAULT_VIEW};
  try {
    const value=JSON.parse(new URLSearchParams(hash.replace(/^#/, '')).get('view') || '{}');
    if (!value || typeof value !== 'object') return result;
    if (['garage','row','stack'].includes(value.layout)) result.layout=value.layout;
    if (GARAGE_CAMERAS.includes(value.camera)) result.camera=value.camera;
    for (const key of ['door','roof','explode']) if (typeof value[key]==='number' && Number.isFinite(value[key])) result[key]=Math.max(0,Math.min(100,value[key]));
    if (result.layout==='stack') result.explode=0;
    const pose=value.cameraPose;
    if (pose && ['position','target'].every(key=>Array.isArray(pose[key])&&pose[key].length===3&&pose[key].every(v=>Number.isFinite(v)&&Math.abs(v)<10000)) && Math.hypot(...pose.position.map((v,i)=>v-pose.target[i]))>.001) result.cameraPose={position:pose.position.slice(),target:pose.target.slice()};
  } catch {}
  return result;
}
export function garageViewHash(state) {
  const view={...Object.fromEntries(Object.keys(GARAGE_DEFAULT_VIEW).map(key=>[key,state[key]])),cameraPose:state.cameraPose};
  return 'view='+encodeURIComponent(JSON.stringify(parseGarageView('view='+encodeURIComponent(JSON.stringify(view)))));
}
