import {makeStation} from '../src/station-model.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {writeFile} from 'node:fs/promises';
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();});}};
const model=makeStation();model.name='Station';model.userData={source:'Station promotion site device geometry',bodyDiameterMm:51,bodyThicknessMm:12.1,description:'Dimensioned visual reconstruction, not manufacturing CAD.'};
const glb=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});await writeFile('assets/models/station.glb',Buffer.from(glb));console.log('Station exported',glb.byteLength,'bytes');
