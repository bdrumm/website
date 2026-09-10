import {makeStation} from '../src/station-model.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {mkdir, writeFile} from 'node:fs/promises';

globalThis.FileReader=class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();});
  }
};

// Keep regular, smooth shell topology and every circular screen/bezel segment.
// Generic decimation turns the display outline into a polygon at this size.
const station=makeStation({shellSegments:360,shellStep:.04});
station.name='Station — navigation model';
station.userData={source:'Station project geometry',shellSegments:360,
  description:'Smooth navigation mesh with full-resolution display, bezel and exterior details.'};
const data=await new GLTFExporter().parseAsync(station,{binary:true,onlyVisible:true});
const folder=new URL('../assets/models/home/',import.meta.url);
await mkdir(folder,{recursive:true});
await writeFile(new URL('station.glb',folder),Buffer.from(data));
console.log(`Station navigation model: ${data.byteLength} bytes`);
